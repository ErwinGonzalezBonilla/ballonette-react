import { useEffect } from 'react'

function Pasos() {

  const pasos = [
    " Cuéntanos tu idea y te ayudamos a hacerla realidad.",
    " Diseñamos una propuesta personalizada para tu evento.",
    " Creamos una experiencia única que no olvidarás."
  ]

  useEffect(() => {
    const elementos = document.querySelectorAll(".paso-text")

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show")
        }
      })
    }, { threshold: 0.2 })

    elementos.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section className="pasos-pro">

      <div className="pasos-wrapper">

        <div className="pasos-grid">
          {pasos.map((texto, index) => (
  <div key={index} className="paso-item">

    <span className="paso-numero">
      {index + 1}
    </span>

    <p className="paso-text">
      {texto}
    </p>

  </div>
))}
        </div>

        <div className="cta-container">
          <h2>¿Te apuntas?</h2>

          <a
            href="https://wa.me/34689929108"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta"
          >
            CONTACTO
          </a>
        </div>

      </div>

    </section>
  )
}

export default Pasos