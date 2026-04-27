import videoBg from "../assets/VideoBallonette.mp4";

function Hero() {
  return (
    <main id="inicio">

      {/* VIDEO BACKGROUND */}
      <video className="video-bg" autoPlay muted loop playsInline>
        <source src={videoBg} type="video/mp4" />
      </video>

      <div className="balloon-bg"></div>

      {/* HERO */}
      <section className="hero">

        <div className="hero-glass">
          <h1>Hacemos de tu evento una experiencia inolvidable</h1>

          <p>
            Diseño de eventos exclusivos con globos de autor, flores y catering decorativo.
          </p>

          <a
            href="https://wa.me/34689929108?text=Hola%20quiero%20reservar%20mi%20evento"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            Reserva tu experiencia
          </a>
        </div>

      </section>

    </main>
  )
}

export default Hero