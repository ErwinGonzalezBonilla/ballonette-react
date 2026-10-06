import { useState } from "react"
import { WHATSAPP, INSTAGRAM } from "./inicio/datos"

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
      <div className="construccion__foto">
        <img src="/assets/web/portada.webp" alt="Arco de globos rosas y dorados con el logo de Ballonette Eventos" />
      </div>

      <div className="construccion__txt">
        <span className="kicker">Muy pronto</span>
        <h1>Nueva web<span>estamos preparando algo precioso</span></h1>
        <p>
          Mientras tanto, cuéntanos tu evento por WhatsApp o mira nuestros montajes en Instagram.
        </p>

        <div className="construccion__acciones">
          <a className="btn btn--rosa" href={WHATSAPP} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a>
          <a className="btn btn--borde" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>

        {!abierto ? (
          <button type="button" className="construccion__equipo" onClick={() => setAbierto(true)}>
            Acceso equipo
          </button>
        ) : (
          <form className="construccion__form" onSubmit={enviar}>
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
            <button type="submit" className="btn btn--rosa" disabled={!clave || comprobando}>Entrar</button>
            {error && <p className="construccion__error">Clave incorrecta</p>}
          </form>
        )}
      </div>
    </main>
  )
}

export default EnConstruccion
