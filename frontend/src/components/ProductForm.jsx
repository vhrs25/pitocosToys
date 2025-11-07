export default function ProdutoForm({
  form,
  setForm,
  onSubmit,
  editId,
  onCancel
}) {
  return (
    <section className="form-section">
      <h2>{editId ? "Editar produto" : "Adicionar produto"}</h2>
      <form onSubmit={onSubmit} className="produto-form">
        <input
          value={form.nome ?? ""}
          onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
          placeholder="Nome"
          required
        />
        <input
          value={form.categoria ?? ""}
          onChange={(e) =>
            setForm((s) => ({ ...s, categoria: e.target.value }))
          }
          placeholder="Categoria"
          required
        />
        <input
          value={form.valorPago ?? ""}
          onChange={(e) =>
            setForm((s) => ({ ...s, valorPago: e.target.value }))
          }
          placeholder="Valor pago (R$)"
          type="number"
          step="0.01"
          required
        />
        <input
          value={form.valorPedido ?? ""}
          onChange={(e) =>
            setForm((s) => ({ ...s, valorPedido: e.target.value }))
          }
          placeholder="Valor pedido (opcional)"
          type="number"
          step="0.01"
        />
        <input
          value={form.valorVendido ?? ""}
          onChange={(e) =>
            setForm((s) => ({ ...s, valorVendido: e.target.value }))
          }
          placeholder="Valor vendido (opcional)"
          type="number"
          step="0.01"
        />
        <input
          value={form.descricao ?? ""}
          onChange={(e) =>
            setForm((s) => ({ ...s, descricao: e.target.value }))
          }
          placeholder="Descrição (opcional)"
        />
        <input
          value={form.tags ?? ""}
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
            <button type="button" className="btn" onClick={onCancel}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
