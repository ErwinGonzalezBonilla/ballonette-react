import { useState } from "react"
import logo from "../assets/logo.png"
import videoBg from "../assets/VideoBallonette.mp4"

function EnConstruccion({ onEntrar }) {
  const [abierto, setAbierto] = useState(false)
  const [clave, setClave] = useState("")
  const [error, setError] = useState(false)
  const [comprobando, setComprobando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setComprobando(true)
    const ok = await onEntrar(clave)
    setComprobando(false)
    if (!ok) {
      setError(true)
      setClave("")
    }
  }

  return (
    <main className="construccion">
      <video className="video-bg" autoPlay muted loop playsInline aria-hidden="true">
        <source src={videoBg} type="video/mp4" />
      </video>

      <div className="construccion-card">
        <img src={logo} alt="Ballonette Eventos" className="construccion-logo" />
        <h1>Estamos preparando algo precioso</h1>
        <p>
          Nuestra nueva web estará lista muy pronto. Mientras tanto, cuéntanos tu
          evento por WhatsApp o síguenos en Instagram.
        </p>

        <div className="construccion-acciones">
          <a
            className="btn-primary"
            href="https://wa.me/34689929108?text=Hola%20quiero%20informaci%C3%B3n%20para%20mi%20evento"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-whatsapp" aria-hidden="true"></i> Escríbenos por WhatsApp
          </a>
          <a
            className="btn-ghost"
            href="https://www.instagram.com/ballonette_eventos/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-instagram" aria-hidden="true"></i> Instagram
          </a>
        </div>

        {!abierto ? (
          <button type="button" className="construccion-equipo" onClick={() => setAbierto(true)}>
            Acceso equipo
          </button>
        ) : (
          <form className="construccion-form" onSubmit={enviar}>
            <input
              type="password"
              placeholder="Clave del equipo"
              value={clave}
              onChange={(e) => {
                setClave(e.target.value)
                setError(false)
              }}
              autoFocus
              aria-label="Clave del equipo"
            />
            <button type="submit" disabled={!clave || comprobando}>
              Entrar
            </button>
            {error && <p className="construccion-error">Clave incorrecta</p>}
          </form>
        )}
      </div>
    </main>
  )
}

export default EnConstruccion
