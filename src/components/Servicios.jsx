import { useEffect } from "react"
import { Link } from "react-router-dom"

function Servicios({ titulo, subtitulo, data, id }) {
  useEffect(() => {
    const cards = document.querySelectorAll(`#${id} .card`)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show")
        })
      },
      { threshold: 0.15 }
    )
    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [id])

  return (
    <section className="servicios" id={id}>
      <div className="section-head">
        <h2 className="section-title">{titulo}</h2>
        {subtitulo && <p className="section-sub">{subtitulo}</p>}
      </div>

      <div className="servicios-grid">
        {data.map((item) => (
          <Link
            to={`/galeria/${item.slug}`}
            className="card"
            key={item.slug}
          >
            <img
              src={item.imagen}
              alt={item.alt}
              loading="lazy"
              style={{ objectPosition: item.posicion || "center" }}
            />
            <div className="card-content">
              <h3>{item.titulo}</h3>
              <p>{item.descripcion}</p>
              <span className="card-link">Ver galería</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Servicios
