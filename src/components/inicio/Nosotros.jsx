function Nosotros() {
  return (
    <section className="clara rosada" id="nosotros">
      <div className="contenedor bio">
        <img src="/assets/web/katherine.webp" alt="Katherine Gonzalez, fundadora de Ballonette Eventos" loading="lazy" />
        <div className="bio__txt">
          <span className="kicker">Quiénes somos</span>
          <h2 className="h-xl" style={{ marginBottom: "1.6rem" }}>Ballonette</h2>
          <p className="destacado">Cada arco lo diseñamos pensando en la foto que vas a guardar toda la vida.</p>
          <p>
            Ballonette es un estudio de decoración de eventos en Madrid especializado en globos de autor,
            diseño floral boutique y catering decorativo. Nos encargamos de todo el montaje para que tú solo
            te preocupes de celebrar.
          </p>
          <ul className="servicios-lista">
            <li>Globos de autor</li>
            <li>Ramos y diseño floral</li>
            <li>Catering decorativo</li>
          </ul>
          <p className="firma">Katherine Gonzalez<small>Fundadora de Ballonette Eventos</small></p>
        </div>
      </div>
    </section>
  )
}

export default Nosotros
