import { openBalloonBot } from "../utils/balloonbot"

import rosaDorado from "../assets/images/destacadas/rosa-dorado-40.webp"
import safari from "../assets/images/destacadas/babyshower-safari.webp"
import arcoRojo from "../assets/images/destacadas/arco-rojo-cumple.webp"
import babyAzul from "../assets/images/destacadas/babyshower-azul.webp"
import corazones from "../assets/images/destacadas/corazones-sorpresa.webp"
import corporativo from "../assets/images/destacadas/corporativo-azul.webp"

// Mosaico de fotos cuadradas: así se ven completas (no se recortan).
// "grande" ocupa el doble; "final" se hace grande solo en el móvil.
const fotos = [
  { src: rosaDorado, alt: "Arco de globos rosas y dorados para un 40 cumpleaños", etiqueta: "Cumpleaños 40", forma: "grande" },
  { src: arcoRojo, alt: "Aro de globos rojos con corazones y cartel luminoso Happy Birthday", etiqueta: "Cumpleaños" },
  { src: safari, alt: "Baby shower temático de safari con globos verdes, marrones y blancos", etiqueta: "Baby shower safari", pos: "center 60%" },
  { src: babyAzul, alt: "Baby shower en azul y blanco con osito gigante y caballito", etiqueta: "Baby shower" },
  { src: corazones, alt: "Sorpresa con globos de corazón rojos y ramo de rosas sobre un coche", etiqueta: "Sorpresas" },
  { src: corporativo, alt: "Muro de globos azules y plateados con el número 7 para un evento de empresa", etiqueta: "Eventos de empresa", forma: "final" },
]

function Destacadas() {
  return (
    <section className="destacadas" id="trabajos">
      <div className="destacadas-head">
        <h2>Decoraciones así de hermosas</h2>
        <p>
          Cada montaje lo diseñamos a medida: colores, temática y detalles
          pensados para tu celebración.
        </p>
      </div>

      <div className="mosaico">
        {fotos.map((foto) => (
          <figure key={foto.etiqueta} className={`mosaico-item ${foto.forma || ""}`}>
            <img
              src={foto.src}
              alt={foto.alt}
              loading="lazy"
              style={{ objectPosition: foto.pos || "center" }}
            />
            <figcaption>{foto.etiqueta}</figcaption>
          </figure>
        ))}
      </div>

      <div className="destacadas-cta">
        <p>¿Quieres una así para tu evento?</p>
        <button type="button" className="btn-primary" onClick={() => openBalloonBot()}>
          <span aria-hidden="true">🎈</span> Pídesela a Balloonbot
        </button>
      </div>
    </section>
  )
}

export default Destacadas
