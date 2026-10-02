import videoBg from "../assets/VideoBallonette.mp4"
import { openBalloonBot } from "../utils/balloonbot"

function Hero() {
  return (
    <main id="inicio">
      {/* VIDEO DE FONDO (tenue, ver .video-bg en styles.css) */}
      <video className="video-bg" autoPlay muted loop playsInline aria-hidden="true">
        <source src={videoBg} type="video/mp4" />
      </video>

      <section className="hero">
        <div className="hero-glass">
          <h1>Hacemos de tu evento una experiencia inolvidable</h1>

          <p>
            Globos de autor, flores y catering decorativo para cumpleaños,
            bodas, baby showers y eventos de empresa.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => openBalloonBot()}
            >
              <span aria-hidden="true">🎈</span> Planifica tu evento con Balloonbot
            </button>

            <a
              href="https://wa.me/34689929108?text=Hola%20quiero%20reservar%20mi%20evento"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <i className="bi bi-whatsapp" aria-hidden="true"></i> Escríbenos por WhatsApp
            </a>
          </div>

          <p className="hero-note">
            Balloonbot te pregunta fecha, lugar y presupuesto, y Katherine te
            confirma la disponibilidad.
          </p>
        </div>
      </section>
    </main>
  )
}

export default Hero
