import { useState, useEffect, useRef } from "react";
import "./App.css";

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
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3003/api";

  useEffect(() => {
    carregarItens(page);
    // eslint-disable-next-line
  }, [page, mostrarInativos]);

  // fecha dropdown ao clicar fora
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // fecha modal com Esc (tanto sold quanto delete)
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (modalState.open) closeModal();
        if (deleteModal.open) closeDeleteModal();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalState.open, deleteModal.open]);

  // foco no input quando modal abre
  useEffect(() => {
    if (modalState.open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 80);
    }
  }, [modalState.open]);

  async function carregarItens(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", p);
      params.append("limit", limit);
      if (filtro) params.append("q", filtro);
      params.append("ativo", mostrarInativos ? "false" : "true");

      const res = await fetch(`${API}/items?${params.toString()}`);
      const data = await res.json();
      setItens(Array.isArray(data.items) ? data.items : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } catch (err) {
      console.error("Erro ao carregar itens:", err);
      setItens([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  async function handleBuscar(e) {
    e && e.preventDefault();
    setPage(1);
    carregarItens(1);
  }

  // criar novo ou salvar edição (converte tags string -> array)
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
    const payload = {
      nome: item.nome,
      categoria: item.categoria,
      valor_pago: Number(item.valor_pago || 0),
      valor_vendido: null,
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

  // filtrar localmente incluindo tags
  const lista = Array.isArray(itens) ? itens : [];
  const itensFiltrados = lista.filter((p) => {
    const f = filtro.trim().toLowerCase();
    if (!f) return true;
    const tagMatch = (p.tags || []).some((tag) =>
      tag.toLowerCase().includes(f)
    );
    return (
      (p.nome || "").toLowerCase().includes(f) ||
      (p.categoria || "").toLowerCase().includes(f) ||
      tagMatch
    );
  });

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
            onChange={(e) => setFiltro(e.target.value)}
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
              onChange={(e) => setMostrarInativos(e.target.checked)}
            />
            Mostrar inativos
          </label>
        </div>

        <section className="form-section">
          <h2>{editId ? "Editar produto" : "Adicionar produto"}</h2>
          <form onSubmit={salvarItem} className="produto-form">
            <input
              value={form.nome}
              onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
              placeholder="Nome"
              required
            />
            <input
              value={form.categoria}
              onChange={(e) =>
                setForm((s) => ({ ...s, categoria: e.target.value }))
              }
              placeholder="Categoria"
              required
            />
            <input
              value={form.valorPago}
              onChange={(e) =>
                setForm((s) => ({ ...s, valorPago: e.target.value }))
              }
              placeholder="Valor pago (R$)"
              type="number"
              step="0.01"
              required
            />
            <input
              value={form.valorVendido}
              onChange={(e) =>
                setForm((s) => ({ ...s, valorVendido: e.target.value }))
              }
              placeholder="Valor vendido (opcional)"
              type="number"
              step="0.01"
            />
            <input
              value={form.descricao}
              onChange={(e) =>
                setForm((s) => ({ ...s, descricao: e.target.value }))
              }
              placeholder="Descrição (opcional)"
            />
            <input
              value={form.tags}
              onChange={(e) => setForm((s) => ({ ...s, tags: e.target.value }))}
              placeholder="Tags (separadas por vírgula)"
            />
            <label className="checkboxRow">
              <input
                type="checkbox"
                checked={!form.ativo ? true : !form.ativo}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    ativo: !e.target.checked ? true : false
                  }))
                }
              />
              Produto ainda não chegou (criar como INATIVO)
            </label>

            <div className="formActions">
              <button className="btn primary" type="submit">
                {editId ? "Salvar" : "Adicionar"}
              </button>
              {editId && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setEditId(null);
                    setForm({
                      nome: "",
                      categoria: "",
                      valorPago: "",
                      valorVendido: "",
                      descricao: "",
                      tags: "",
                      ativo: true
                    });
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="lista">
          <h2>Produtos {loading && "(carregando...)"}</h2>
          <div className="cards">
            {itensFiltrados.length === 0 && (
              <div className="empty">Nenhum produto encontrado</div>
            )}
            {itensFiltrados.map((item) => {
              const valorPago = Number(item.valor_pago ?? 0);
              const valorVendido =
                item.valor_vendido !== null && item.valor_vendido !== undefined
                  ? Number(item.valor_vendido)
                  : null;
              const lucro =
                valorVendido !== null ? valorVendido - valorPago : null;
              const sold =
                valorVendido !== null || (!item.disponivel && item.ativo);
              const isAnimating = animatingId === item._id;

              return (
                <article
                  key={item._id}
                  className={`card ${sold ? "sold" : ""} ${
                    item.ativo ? "" : "inactive"
                  }`}
                >
                  <div className="cardTop">
                    <div>
                      <h3>{item.nome}</h3>
                      <div className="muted">{item.categoria}</div>
                    </div>

                    <div className="cardMenu" ref={menuRef}>
                      {/* botão '...' abre/fecha o dropdown */}
                      <div style={{ position: "relative" }}>
                        <button
                          className="btn small"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setOpenMenuId(
                              openMenuId === item._id ? null : item._id
                            );
                          }}
                          aria-expanded={openMenuId === item._id}
                          aria-haspopup="menu"
                        >
                          …
                        </button>

                        {openMenuId === item._id && (
                          <div
                            className="dropdownMenu"
                            role="menu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="dropdownItem"
                              onClick={() => abrirEdicao(item)}
                            >
                              Editar
                            </button>
                            <button
                              className="dropdownItem"
                              onClick={() => readicionar(item)}
                            >
                              Re-adicionar
                            </button>
                            <button
                              className="dropdownItem"
                              onClick={() => toggleActive(item._id)}
                            >
                              {item.ativo ? "Desativar" : "Ativar"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* excluir agora abre modal de delete */}
                      <button
                        className="btn danger small"
                        onClick={() => openDeleteModal(item)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="cardBody">
                    <div>
                      <strong>Pago:</strong> R$ {valorPago.toFixed(2)}
                    </div>
                    <div>
                      <strong>Vendido:</strong>{" "}
                      {valorVendido !== null
                        ? `R$ ${valorVendido.toFixed(2)}`
                        : "--"}
                    </div>
                    {lucro !== null && (
                      <div
                        className={`lucro ${
                          lucro >= 0 ? "positivo" : "negativo"
                        }`}
                      >
                        <strong>Lucro:</strong> {lucro >= 0 ? "+" : "-"} R${" "}
                        {Math.abs(lucro).toFixed(2)}
                      </div>
                    )}
                    <div>
                      <strong>Tags:</strong> {(item.tags || []).join(", ")}
                    </div>
                    <div className="muted">
                      Status: {item.disponivel ? "Disponível" : "Indisponível"}
                    </div>

                    <div className="cardActions">
                      {/* botão VENDIDO sempre visível (verde) */}
                      <button
                        className="btn vendido"
                        onClick={() => openVendidoModal(item)}
                      >
                        {sold ? "Vendido" : "Marcar Vendido"}
                      </button>

                      {/* ícone animado aparece quando a venda é confirmada */}
                      <div
                        className={`soldIcon ${isAnimating ? "animate" : ""}`}
                        aria-hidden
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="pagination">
            <button
              className="btn"
              onClick={() => setPage((s) => Math.max(1, s - 1))}
              disabled={page <= 1}
            >
              ◀ Anterior
            </button>
            <div className="muted">Página {page}</div>
            <button className="btn" onClick={() => setPage((s) => s + 1)}>
              Próxima ▶
            </button>
          </div>
        </section>
      </div>

      {/* Modal de Marcar Vendido */}
      {modalState.open && (
        <div
          className="modalBackdrop"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Marcar como vendido</h3>
            <p className="muted">
              Produto: <strong>{modalState.item?.nome}</strong>
            </p>
            <label className="label">Valor de venda (R$) — opcional</label>
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={modalState.inputVal}
              onChange={(e) =>
                setModalState((s) => ({
                  ...s,
                  inputVal: e.target.value,
                  error: null
                }))
              }
              placeholder="Ex: 45.00"
            />
            {modalState.error && (
              <div className="modalError">{modalState.error}</div>
            )}
            <div className="modalActions">
              <button className="btn" onClick={closeModal}>
                Cancelar
              </button>
              <button className="btn primary" onClick={confirmVendido}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação para HARD DELETE */}
      {deleteModal.open && (
        <div
          className="modalBackdrop"
          onClick={closeDeleteModal}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Excluir permanentemente</h3>
            <p className="muted">
              Você está prestes a excluir permanentemente o item:
            </p>
            <p style={{ marginTop: 8, marginBottom: 12 }}>
              <strong>{deleteModal.item?.nome}</strong>
            </p>
            <div
              style={{
                background: "#ff9021",
                padding: 10,
                borderRadius: 8,
                border: "1px solid rgba(220,38,38,0.08)",
                marginBottom: 12
              }}
            >
              <strong style={{ color: "red" }}>Aviso:</strong> Esta ação não
              pode ser desfeita.
            </div>
            {deleteModal.error && (
              <div className="modalError">{deleteModal.error}</div>
            )}
            <div className="modalActions">
              <button className="btn" onClick={closeDeleteModal}>
                Cancelar
              </button>
              <button className="btn danger" onClick={confirmDelete}>
                Excluir permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
