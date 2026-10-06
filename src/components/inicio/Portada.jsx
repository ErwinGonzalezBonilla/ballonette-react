import { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Redes from "./Redes"
import { irASeccion } from "./irASeccion"
import { openBalloonBot } from "../../utils/balloonbot"

function Portada() {
  const fotoRef = useRef(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // La foto se va desvaneciendo al bajar por la página
  useEffect(() => {
    const foto = fotoRef.current
    if (!foto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let pendiente = false
    const actualizar = () => {
      pendiente = false
      const alto = foto.offsetHeight || 1
      const p = Math.min(Math.max(window.scrollY / (alto * 0.9), 0), 1)
      foto.style.opacity = String(1 - p)
      foto.style.transform = `translateY(${p * 60}px) scale(${1 - p * 0.06})`
    }
    const alHacerScroll = () => {
      if (!pendiente) {
        pendiente = true
        requestAnimationFrame(actualizar)
      }
    }
    window.addEventListener("scroll", alHacerScroll, { passive: true })
    actualizar()
    return () => window.removeEventListener("scroll", alHacerScroll)
  }, [])

  return (
    <section className="hero" id="inicio" aria-label="Ballonette Eventos">
      <div className="contenedor hero__in">
        <div className="hero__foto" ref={fotoRef}>
          <img
            src="/assets/web/portada.webp"
            alt="Katherine Gonzalez junto a un arco de globos rosas y dorados con el logo de Ballonette Eventos"
            fetchPriority="high"
          />
        </div>

        <div className="hero__txt">
          <button type="button" className="hero__nuevo" onClick={() => openBalloonBot()}>
            <b>Nuevo</b> Tu presupuesto con Balloonbot →
          </button>
          <p className="hero__pre">Decoración de eventos en Madrid</p>
          <h1>Creamos<br />momentos</h1>
          <p className="hero__eslogan">que se quedan <span>en el corazón.</span></p>
          <div className="hero__acciones">
            <button type="button" className="btn btn--rosa" onClick={() => openBalloonBot()}>🎈 Planifica tu evento</button>
            <button type="button" className="btn btn--borde" onClick={() => irASeccion("galeria", navigate, pathname)}>Ver galería</button>
          </div>
          <div className="hero__redes">
            Síguenos
            <Redes />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Portada
