import { useEffect } from "react"
import { openBalloonBot } from "../utils/balloonbot"

const pasos = [
  {
    titulo: "Cuéntale tu idea a Balloonbot",
    texto: "Tipo de evento, fecha, lugar y presupuesto. Te lleva un par de minutos.",
  },
  {
    titulo: "Te confirmamos disponibilidad",
    texto: "Katherine revisa tu solicitud y te contacta con una propuesta personalizada.",
  },
  {
    titulo: "Disfruta de tu evento",
    texto: "Llegamos, montamos la decoración y tú solo te ocupas de celebrar.",
  },
]

function Pasos() {
  useEffect(() => {
    const elementos = document.querySelectorAll(".paso-item")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show")
        })
      },
      { threshold: 0.2 }
    )
    elementos.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="pasos-pro" id="como-funciona">
      <div className="pasos-wrapper">
        <h2 className="section-title">Así de fácil</h2>

        <ol className="pasos-grid">
          {pasos.map((paso, index) => (
            <li key={index} className="paso-item">
              <span className="paso-numero" aria-hidden="true">{index + 1}</span>
              <h3>{paso.titulo}</h3>
              <p>{paso.texto}</p>
            </li>
          ))}
        </ol>

        <div className="cta-container">
          <h2>¿Te apuntas?</h2>
          <button
            type="button"
            className="btn-primary"
            onClick={() => openBalloonBot()}
          >
            <span aria-hidden="true">🎈</span> Empezar con Balloonbot
          </button>
        </div>
      </div>
    </section>
  )
}

export default Pasos
