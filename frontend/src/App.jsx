// src/App.jsx
import { useState, useEffect, useRef } from "react";
import "./App.css";
import ProductForm from "./components/ProductForm";
import ProductCard from "./components/ProductCard";
import SoldModal from "./components/SoldModal";
import DeleteModal from "./components/DeleteModal";

export default function App() {
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
    valorPedido: "",
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
  const inputRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3003/api";

  // carrega itens quando pagina ou filtro de inativos mudam
  useEffect(() => {
    carregarItens(page);
    // eslint-disable-next-line
  }, [page, mostrarInativos]);

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenuId(null);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        modalState.open && closeModal();
        deleteModal.open && closeDeleteModal();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalState.open, deleteModal.open]);

  useEffect(() => {
    if (modalState.open && inputRef.current)
      setTimeout(() => inputRef.current.focus(), 80);
  }, [modalState.open]);

  // carregar itens do servidor (usa q para buscar no DB)
  async function carregarItens(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", p);
      params.append("limit", limit);
      if (filtro) params.append("q", filtro);
      // ativo: se mostrarInativos true -> buscar ambos (omitimos),
      // se false -> enviar ativo=true para filtrar apenas ativos
      if (mostrarInativos)
        params.append("ativo", mostrarInativos ? "false" : "true");

      const res = await fetch(`${API}/items?${params.toString()}`);
      const data = await res.json();
      // servidor deve retornar { items, total, page, limit }
      setItens(Array.isArray(data.items) ? data.items : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
      setPage(typeof data.page === "number" ? data.page : p);
    } catch (err) {
      console.error(err);
      setItens([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  // buscar: usa debounce no onChange para UX; botão Buscar força imediata
  function handleBuscar(e) {
    e?.preventDefault();
    setPage(1);
    carregarItens(1);
  }

  // debounce helper: chamar quando o campo de busca mudar
  function onFiltroChange(v) {
    setFiltro(v);
    // limpa debounce anterior
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    // debounce de 700ms
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      carregarItens(1);
    }, 700);
  }

  function resetForm() {
    setEditId(null);
    setForm({
      nome: "",
      categoria: "",
      valorPago: "",
      valorVendido: "",
      valorPedido: "",
      descricao: "",
      tags: "",
      ativo: true
    });
  }

  /* ---------------------
     Funções CRUD (mantive seu comportamento)
     --------------------- */

  async function salvarItem(e) {
    e.preventDefault();
    const payload = {
      nome: form.nome,
      categoria: form.categoria,
      valor_pago: Number(form.valorPago || 0),
      valor_vendido: form.valorVendido ? Number(form.valorVendido) : null,
      valor_pedido: form.valorPedido ? Number(form.valorPedido) : null,
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
        const res = await fetch(`${API}/items/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Erro ao atualizar");
        setEditId(null);
      } else {
        const res = await fetch(`${API}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Erro ao criar");
      }
      resetForm();
      // recarrega página 1 pra refletir nova busca/inserção
      carregarItens(1);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar (veja console)");
    }
  }

  async function readicionar(item) {
    const payload = {
      nome: item.nome,
      categoria: item.categoria,
      valor_pago: Number(item.valor_pago || 0),
      valor_vendido: null,
      valor_pedido: item.valor_pedido ? Number(item.valor_pedido) : null,
      descricao: item.descricao,
      tags: item.tags || [],
      ativo: true,
      disponivel: true
    };
    try {
      const res = await fetch(`${API}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Erro ao readicionar");
      carregarItens(page);
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao readicionar (veja console)");
    }
  }

  async function toggleActive(id) {
    try {
      const res = await fetch(`${API}/items/${id}/toggle-active`, {
        method: "PATCH"
      });
      if (!res.ok) throw new Error("Erro ao alternar ativo");
      carregarItens(page);
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao alternar ativo (veja console)");
    }
  }

  // abre modal de confirmação para hard delete
  function openDeleteModal(item) {
    setDeleteModal({ open: true, item, error: null });
    setOpenMenuId(null);
  }

  function closeDeleteModal() {
    setDeleteModal({ open: false, item: null, error: null });
  }

  // efetua exclusão hard (chamada real ao backend)
  async function confirmDelete() {
    const { item } = deleteModal;
    if (!item) return closeDeleteModal();
    try {
      const res = await fetch(`${API}/items/${item._id}`, { method: "DELETE" });
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
      valorPedido: item.valor_pedido ?? "",
      descricao: item.descricao ?? "",
      tags: (item.tags || []).join(", "),
      ativo: !!item.ativo
    });
    setOpenMenuId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Abre modal para marcar vendido
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

  // Confirmar venda do modal
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
      const res = await fetch(`${API}/items/${item._id}/mark-sold`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Erro ao marcar vendido");
      // animação do check
      setAnimatingId(item._id);
      setTimeout(() => setAnimatingId(null), 1100); // duração alinhada ao CSS
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

  // ---- frontend: não filtrar localmente por busca; servidor já retorna os itens filtrados ----
  const itensFiltrados = itens || [];

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>PitocosToys</h1>
          <div className="header-sub">Controle de Estoque</div>
        </header>

        <form className="searchRow" onSubmit={handleBuscar}>
          <input
            value={filtro}
            onChange={(e) => onFiltroChange(e.target.value)}
            placeholder="Buscar nome, categoria ou tags..."
          />
          <button className="btn small" type="submit">
            Buscar
          </button>
        </form>

        <div className="toggles">
          <label className="toggle">
            <input
              type="checkbox"
              checked={mostrarInativos}
              onChange={(e) => {
                setMostrarInativos(e.target.checked);
                // ao alternar, resetar página e recarregar a página 1
                setPage(1);
                carregarItens(1);
              }}
            />
            Mostrar inativos
          </label>
        </div>

        <ProductForm
          form={form}
          setForm={setForm}
          onSubmit={salvarItem}
          editId={editId}
          onCancel={resetForm}
        />

        <section className="lista">
          <h2>
            Produtos {loading && "(carregando...)"}{" "}
            <span className="muted" style={{ fontSize: 13, marginLeft: 8 }}>
              {total ? `— ${total} encontrados` : ""}
            </span>
          </h2>

          <div className="cards">
            {itensFiltrados.length === 0 && !loading && (
              <div className="empty">Nenhum produto encontrado</div>
            )}
            {itensFiltrados.map((item) => (
              <ProductCard
                key={item._id}
                item={item}
                animatingId={animatingId}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                abrirEdicao={abrirEdicao}
                readicionar={readicionar}
                toggleActive={toggleActive}
                openVendidoModal={openVendidoModal}
                openDeleteModal={openDeleteModal}
              />
            ))}
          </div>

          <div className="pagination">
            <button
              className="btn"
              onClick={() => {
                const prev = Math.max(1, page - 1);
                setPage(prev);
              }}
              disabled={page <= 1}
            >
              ◀ Anterior
            </button>
            <div className="muted">Página {page}</div>
            <button
              className="btn"
              onClick={() => {
                // next — apenas incrementa; a chamada de useEffect fetchará a próxima página
                setPage((s) => s + 1);
              }}
            >
              Próxima ▶
            </button>
          </div>
        </section>
      </div>

      <SoldModal
        open={modalState.open}
        onClose={closeModal}
        onConfirm={confirmVendido}
        item={modalState.item}
        inputVal={modalState.inputVal}
        setInputVal={(val) =>
          setModalState((s) => ({ ...s, inputVal: val, error: null }))
        }
        error={modalState.error}
      />

      <DeleteModal
        open={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        item={deleteModal.item}
        error={deleteModal.error}
      />
    </div>
  );
}
