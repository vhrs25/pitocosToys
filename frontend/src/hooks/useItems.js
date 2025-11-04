// frontend/src/hooks/useItems.js
import { useState, useEffect, useRef } from "react";
import * as api from "../api/items";

/**
 * useItems - hook que centraliza estado e lógica do app
 * Substitua o arquivo existente por este.
 */
export default function useItems() {
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [filtro, setFiltro] = useState("");
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    categoria: "",
    valorPago: "",
    valorVendido: "",
    descricao: "",
    tags: "",
    ativo: true
  });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [modalState, setModalState] = useState({
    open: false,
    item: null,
    inputVal: "",
    error: null
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    item: null,
    error: null
  });
  const [animatingId, setAnimatingId] = useState(null);
  const menuRef = useRef(null);

  // carrega itens quando pagina ou filtro de inativos mudam
  useEffect(() => {
    carregarItens(page);
    // eslint-disable-next-line
  }, [page, mostrarInativos]);

  async function carregarItens(p = 1) {
    setLoading(true);
    try {
      const params = { page: p, limit };

      if (filtro) params.q = filtro;

      // Se mostrarInativos for true, não filtra por ativo (mostra todos)
      // Se false, filtra somente ativos
      if (!mostrarInativos) params.ativo = "true";

      const data = await api.fetchItems(params);
      setItens(Array.isArray(data.items) ? data.items : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } catch (err) {
      console.error(err);
      setItens([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  async function handleBuscar(e) {
    if (e) e.preventDefault();
    setPage(1);
    carregarItens(1);
  }

  async function salvarItem(e) {
    e.preventDefault();
    const payload = {
      nome: form.nome,
      categoria: form.categoria,
      valor_pago: Number(form.valorPago || 0),
      valor_vendido: form.valorVendido ? Number(form.valorVendido) : null,
      descricao: form.descricao,
      tags:
        typeof form.tags === "string"
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : form.tags || [],
      ativo: !!form.ativo,
      disponivel: !!form.ativo
    };
    try {
      if (editId) {
        await api.patchItem(editId, payload);
        setEditId(null);
      } else {
        await api.createItem(payload);
      }
      setForm({
        nome: "",
        categoria: "",
        valorPago: "",
        valorVendido: "",
        descricao: "",
        tags: "",
        ativo: true
      });
      carregarItens(1);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar (veja console)");
    }
  }

  async function readicionar(item) {
    try {
      await api.createItem({
        nome: item.nome,
        categoria: item.categoria,
        valor_pago: Number(item.valor_pago || 0),
        valor_vendido: null,
        descricao: item.descricao,
        tags: item.tags || [],
        ativo: true,
        disponivel: true
      });
      carregarItens(page);
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao readicionar (veja console)");
    }
  }

  async function toggleActive(id) {
    try {
      await api.toggleActiveApi(id);
      carregarItens(page);
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao alternar ativo (veja console)");
    }
  }

  function openDeleteModal(item) {
    setDeleteModal({ open: true, item, error: null });
    setOpenMenuId(null);
  }
  function closeDeleteModal() {
    setDeleteModal({ open: false, item: null, error: null });
  }

  async function confirmDelete() {
    const { item } = deleteModal;
    if (!item) return closeDeleteModal();
    try {
      const res = await api.deleteItem(item._id);
      if (res.status !== 204 && !res.ok) throw new Error("Erro ao excluir");
      closeDeleteModal();
      carregarItens(page);
    } catch (err) {
      console.error(err);
      setDeleteModal((s) => ({
        ...s,
        error: "Erro ao excluir (veja console)"
      }));
    }
  }

  function abrirEdicao(item) {
    setEditId(item._id);
    setForm({
      nome: item.nome,
      categoria: item.categoria,
      valorPago: item.valor_pago ?? "",
      valorVendido: item.valor_vendido ?? "",
      descricao: item.descricao ?? "",
      tags: (item.tags || []).join(", "),
      ativo: !!item.ativo
    });
    setOpenMenuId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openVendidoModal(item) {
    const defaultVal =
      item.valor_vendido !== null && item.valor_vendido !== undefined
        ? String(item.valor_vendido)
        : "";
    setModalState({ open: true, item, inputVal: defaultVal, error: null });
  }
  function closeModal() {
    setModalState({ open: false, item: null, inputVal: "", error: null });
  }

  async function confirmVendido() {
    const { item, inputVal } = modalState;
    if (!item) return closeModal();
    const trimmed = (inputVal ?? "").toString().trim();
    if (trimmed !== "" && isNaN(Number(trimmed))) {
      setModalState((s) => ({
        ...s,
        error: "Informe um número válido ou deixe em branco."
      }));
      return;
    }
    const valor = trimmed === "" ? undefined : Number(trimmed);
    const payload = {};
    if (typeof valor !== "undefined") payload.valor_vendido = valor;
    payload.data_venda = new Date().toISOString();
    try {
      await api.markSold(item._id, payload);
      setAnimatingId(item._id);
      setTimeout(() => setAnimatingId(null), 1100);
      closeModal();
      carregarItens(page);
    } catch (err) {
      console.error(err);
      setModalState((s) => ({
        ...s,
        error: "Erro ao marcar vendido (veja console)"
      }));
    }
  }

  return {
    itens,
    total,
    page,
    limit,
    loading,
    filtro,
    setFiltro,
    mostrarInativos,
    setMostrarInativos,
    form,
    setForm,
    editId,
    setEditId,
    modalState,
    setModalState,
    deleteModal,
    setDeleteModal,
    animatingId,
    carregarItens,
    handleBuscar,
    salvarItem,
    abrirEdicao,
    readicionar,
    toggleActive,
    openVendidoModal,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    confirmVendido,
    menuRef
  };
}
