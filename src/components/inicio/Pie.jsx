import { useLocation, useNavigate } from "react-router-dom"
import { INSTAGRAM, SECCIONES, TIKTOK, WHATSAPP } from "./datos"
import { irASeccion } from "./irASeccion"
import { openBalloonBot } from "../../utils/balloonbot"

function Pie() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const ir = (id) => irASeccion(id, navigate, pathname)

  return (
    <footer className="pie">
      <div className="contenedor">
        <div className="pie__grid">
          <div>
            <img className="pie__logo" src="/assets/web/logo-claro.png" alt="Ballonette Eventos" />
            <p className="pie__eslogan">Creamos momentos que se quedan <span>en el corazón.</span></p>
          </div>
          <div>
            <h4>Explora</h4>
            <ul>
              {SECCIONES.map((s) => (
                <li key={s.id}><button type="button" onClick={() => ir(s.id)}>{s.nombre}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul>
              <li><button type="button" onClick={() => openBalloonBot()}>Balloonbot</button></li>
              <li><a href={WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Instagram</a></li>
              {TIKTOK && <li><a href={TIKTOK} target="_blank" rel="noopener noreferrer">TikTok</a></li>}
            </ul>
          </div>
        </div>
        <div className="pie__base">
          <span>© {new Date().getFullYear()} Ballonette Eventos · Madrid</span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Volver arriba ↑</button>
        </div>
      </div>
    </footer>
  )
}

export default Pie
