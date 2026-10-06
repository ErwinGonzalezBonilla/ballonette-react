import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { SECCIONES, WHATSAPP } from "./datos"
import { IconoWhatsapp } from "./Iconos"
import Redes from "./Redes"
import { irASeccion } from "./irASeccion"
import { openBalloonBot } from "../../utils/balloonbot"

// Barra superior negra + menú oscuro fijo
function Cabecera() {
  const [abierto, setAbierto] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const ir = (id) => {
    setAbierto(false)
    irASeccion(id, navigate, pathname)
  }

  return (
    <>
      <div className="barra">
        <div className="contenedor">
          <span className="barra__aviso"><b>Madrid y alrededores</b> · Montaje incluido en todos nuestros eventos</span>
          <div className="barra__der">
            <Redes />
            <a className="whatsapp" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              <IconoWhatsapp />WhatsApp
            </a>
          </div>
        </div>
      </div>

      <nav className="nav" aria-label="Principal">
        <div className="contenedor nav__in">
          <button type="button" className="nav__logo" onClick={() => ir("inicio")} aria-label="Ir al inicio">
            <img src="/assets/web/logo-claro.png" alt="Ballonette Eventos" />
          </button>

          <ul className={`nav__links ${abierto ? "abierto" : ""}`}>
            {SECCIONES.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => ir(s.id)}>{s.nombre}</button>
              </li>
            ))}
          </ul>

          <button type="button" className="btn btn--oro nav__cta" onClick={() => openBalloonBot()}>
            Pide presupuesto
          </button>

          <button
            type="button"
            className="nav__burger"
            onClick={() => setAbierto((a) => !a)}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={abierto}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default Cabecera
