export default function CardMenu({
  item,
  openMenuId,
  setOpenMenuId,
  abrirEdicao,
  readicionar,
  toggleActive,
  openDeleteModal
}) {
  return (
    <div className="cardMenu">
      <div style={{ position: "relative" }}>
        <button
          className="btn small"
          onClick={(ev) => {
            ev.stopPropagation();
            setOpenMenuId(openMenuId === item._id ? null : item._id);
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
            <button className="dropdownItem" onClick={() => abrirEdicao(item)}>
              Editar
            </button>
            <button className="dropdownItem" onClick={() => readicionar(item)}>
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

      <button
        className="btn danger small"
        onClick={() => openDeleteModal(item)}
      >
        Excluir
      </button>
    </div>
  );
}
