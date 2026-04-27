import { useEffect } from 'react'
import { Link } from "react-router-dom"

function Servicios({ titulo, data, id }) {

  useEffect(() => {
    const cards = document.querySelectorAll(`#${id} .card`)

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show")
        }
      })
    }, { threshold: 0.15 })

    cards.forEach(card => observer.observe(card))

    return () => observer.disconnect()
  }, [id])

  return (
    <section className="servicios" id={id}>

      <h2 className="section-title">{titulo}</h2>

      <div className="servicios-grid">

        {data.map((item, index) => (
          <article className="card" key={index}>
            <img src={item.imagen} alt={item.titulo} />

            <div className="card-content">
              
              {/* 🔥 TÍTULO BONITO */}
              <h3 style={{ textTransform: "capitalize" }}>
                {item.titulo}
              </h3>

              {/* 🔥 LINK DINÁMICO CORRECTO */}
              <Link 
                to={`/galeria/${item.titulo.toLowerCase()}`} 
                className="btn-card"
              >
                Ver galería
              </Link>

            </div>
          </article>
        ))}

      </div>
    </section>
  )
}

export default Servicios