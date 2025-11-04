export default function DeleteModal({ open, onClose, onConfirm, item, error }) {
  if (!open) return null;
  return (
    <div
      className="modalBackdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Excluir permanentemente</h3>
        <p className="muted">
          Você está prestes a excluir permanentemente o item:
        </p>
        <p style={{ marginTop: 8, marginBottom: 12 }}>
          <strong>{item?.nome}</strong>
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
          <strong style={{ color: "red" }}>Aviso:</strong> Esta ação não pode
          ser desfeita.
        </div>
        {error && <div className="modalError">{error}</div>}
        <div className="modalActions">
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn danger" onClick={onConfirm}>
            Excluir permanentemente
          </button>
        </div>
      </div>
    </div>
  );
}
