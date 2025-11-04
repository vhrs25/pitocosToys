export default function SearchBar({
  filtro,
  setFiltro,
  handleBuscar,
  mostrarInativos,
  setMostrarInativos
}) {
  return (
    <>
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
          />{" "}
          Mostrar inativos
        </label>
      </div>
    </>
  );
}
