import CardMenu from "./CardMenu";

export default function ProdutoCard({
  item,
  animatingId,
  openMenuId,
  setOpenMenuId,
  abrirEdicao,
  readicionar,
  toggleActive,
  openVendidoModal,
  openDeleteModal
}) {
  const valorPago = Number(item.valor_pago ?? 0);
  const valorVendido =
    item.valor_vendido !== null && item.valor_vendido !== undefined
      ? Number(item.valor_vendido)
      : null;
  const lucro = valorVendido !== null ? valorVendido - valorPago : null;
  const sold = valorVendido !== null || (!item.disponivel && item.ativo);
  const isAnimating = animatingId === item._id;

  return (
    <article
      className={`card ${sold ? "sold" : ""} ${item.ativo ? "" : "inactive"}`}
    >
      <div className="cardTop">
        <div>
          <h3>{item.nome}</h3>
          <div className="muted">{item.categoria}</div>
        </div>

        <CardMenu
          item={item}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          abrirEdicao={abrirEdicao}
          readicionar={readicionar}
          toggleActive={toggleActive}
          openDeleteModal={openDeleteModal}
        />
      </div>

      <div className="cardBody">
        <div>
          <strong>Pago:</strong> R$ {valorPago.toFixed(2)}
        </div>
        <div>
          <strong>Vendido:</strong>{" "}
          {valorVendido !== null ? `R$ ${valorVendido.toFixed(2)}` : "--"}
        </div>
        {lucro !== null && (
          <div className={`lucro ${lucro >= 0 ? "positivo" : "negativo"}`}>
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
          <button
            className="btn vendido"
            onClick={() => openVendidoModal(item)}
          >
            {sold ? "Vendido" : "Marcar Vendido"}
          </button>

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
}
