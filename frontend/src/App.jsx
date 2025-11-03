import { useState, useEffect } from "react";
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
    ativo: true
  });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3003/api";

  useEffect(() => {
    carregarItens(page);
    // eslint-disable-next-line
  }, [page, mostrarInativos]);

  async function carregarItens(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", p);
      params.append("limit", limit);
      if (filtro) params.append("q", filtro);
      // ativo: se mostrarInativos true -> buscar ambos? vamos buscar especificamente
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

  // criar novo ou salvar edição
  async function salvarItem(e) {
    e.preventDefault();
    const payload = {
      nome: form.nome,
      categoria: form.categoria,
      valor_pago: Number(form.valorPago || 0),
      valor_vendido: form.valorVendido ? Number(form.valorVendido) : null,
      descricao: form.descricao,
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
    } catch (err) {
      console.error(err);
      alert("Erro ao alternar ativo (veja console)");
    }
  }

  async function excluirHard(id) {
    if (
      !confirm(
        "Excluir permanentemente este item? Esta ação NÃO pode ser desfeita."
      )
    )
      return;
    try {
      const res = await fetch(`${API}/items/${id}`, { method: "DELETE" });
      if (res.status !== 204 && !res.ok) throw new Error("Erro ao excluir");
      carregarItens(page);
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir (veja console)");
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
      ativo: !!item.ativo
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // filtrar localmente se necessário
  const lista = Array.isArray(itens) ? itens : [];
  const itensFiltrados = lista.filter((p) => {
    const f = filtro.trim().toLowerCase();
    if (!f) return true;
    return (
      (p.nome || "").toLowerCase().includes(f) ||
      (p.categoria || "").toLowerCase().includes(f)
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
            placeholder="Buscar nome ou categoria..."
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
            {itensFiltrados.map((item) => (
              <article
                key={item._id}
                className={`card ${item.disponivel ? "" : "notAvailable"} ${
                  item.ativo ? "" : "inactive"
                }`}
              >
                <div className="cardTop">
                  <div>
                    <h3>{item.nome}</h3>
                    <div className="muted">{item.categoria}</div>
                  </div>

                  <div className="cardMenu">
                    <button
                      className="btn small"
                      onClick={() => abrirEdicao(item)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn small"
                      onClick={() => readicionar(item)}
                    >
                      Re-adicionar
                    </button>
                    <button
                      className="btn small"
                      onClick={() => toggleActive(item._id)}
                    >
                      {item.ativo ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      className="btn danger small"
                      onClick={() => excluirHard(item._id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                <div className="cardBody">
                  <div>
                    <strong>Pago:</strong> R${" "}
                    {Number(item.valor_pago ?? 0).toFixed(2)}
                  </div>
                  <div>
                    <strong>Vendido:</strong>{" "}
                    {item.valor_vendido
                      ? `R$ ${Number(item.valor_vendido).toFixed(2)}`
                      : "--"}
                  </div>
                  <div className="muted">
                    Status: {item.disponivel ? "Disponível" : "Indisponível"}
                  </div>
                </div>
              </article>
            ))}
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
    </div>
  );
}
