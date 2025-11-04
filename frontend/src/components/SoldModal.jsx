export default function VendidoModal({
  open,
  onClose,
  onConfirm,
  item,
  inputVal,
  setInputVal,
  error
}) {
  if (!open) return null;
  return (
    <div
      className="modalBackdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Marcar como vendido</h3>
        <p className="muted">
          Produto: <strong>{item?.nome}</strong>
        </p>
        <label className="label">Valor de venda (R$) — opcional</label>
        <input
          type="text"
          inputMode="decimal"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ex: 45.00"
        />
        {error && <div className="modalError">{error}</div>}
        <div className="modalActions">
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn primary" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
