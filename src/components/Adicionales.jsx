import { Link } from "react-router-dom"

function Adicionales({ data }) {
  return (
    <section className="adicionales" id="adicionales">
      <div className="section-head">
        <h2 className="section-title">Servicios adicionales</h2>
        <p className="section-sub">
          Complementa tu decoración con flores y una mesa que también se luce.
        </p>
      </div>

      <div className="adicionales-grid">
        {data.map((item) => (
          <article className="adicional" key={item.slug}>
            <div className="adicional-img">
              <img src={item.imagen} alt={item.alt} loading="lazy" />
            </div>
            <div className="adicional-text">
              <h3>{item.titulo}</h3>
              <p>{item.descripcion}</p>
              <Link to={`/galeria/${item.slug}`} className="btn-outline">
                Ver galería
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Adicionales
