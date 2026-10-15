import { useState } from "react"
import { openBalloonBot } from "../../utils/balloonbot"

const TAMANOS = [
  { nombre: "Medio arco", meta: "Compacto", medida: "2,5 × 2 m", foto: "arco_medio", texto: "Ideal para espacios pequeños y celebraciones en casa." },
  { nombre: "Arco completo", meta: "El más pedido", medida: "3 × 2,5 m", foto: "arco_grande", texto: "Perfecto para la mesa principal: la tarta y las fotos." },
  { nombre: "Doble arco", meta: "Gran impacto", medida: "3,5 × 3 m", foto: "doble_arco", texto: "Escenografía completa para eventos grandes." },
]

// Mismos tamaños en dos combinaciones de color (fotos en public/assets/catalogo)
const ESTILOS = [
  { id: "cumple_nina", nombre: "Rosa y dorado" },
  { id: "cumple_nino", nombre: "Azul y verde" },
]

function Tamanos() {
  const [estilo, setEstilo] = useState(ESTILOS[0].id)

  return (
    <section className="clara" id="tamanos">
      <div className="contenedor">
        <div className="cabecera">
          <div><span className="kicker">Elige tu formato</span><h2 className="h-xl">Tamaños</h2></div>
          <p>Tres formatos con panel de fondo, pedestal para la tarta y luces LED. Los adaptamos a tu temática y tus colores.</p>
        </div>
        <div className="tamanos-estilos" role="group" aria-label="Ver colores de ejemplo">
          {ESTILOS.map((e) => (
            <button
              key={e.id}
              type="button"
              className={estilo === e.id ? "activo" : ""}
              aria-pressed={estilo === e.id}
              onClick={() => setEstilo(e.id)}
            >
              {e.nombre}
            </button>
          ))}
        </div>
        <div className="tamanos">
          {TAMANOS.map((t) => (
            <article className="tamano" key={t.nombre}>
              <a href={`/assets/catalogo/${estilo}-${t.foto}.webp`} target="_blank" rel="noopener noreferrer" title="Ver en grande">
                <img src={`/assets/catalogo/${estilo}-${t.foto}.webp`} alt={`Ejemplo de ${t.nombre.toLowerCase()} de globos con medidas`} loading="lazy" />
              </a>
              <div className="tamano__meta"><span>{t.meta}</span><span>{t.medida}</span></div>
              <h3>{t.nombre}</h3>
              <p>{t.texto}</p>
              <button type="button" className="flecha" onClick={() => openBalloonBot(`Me interesa el ${t.nombre.toLowerCase()}`)}>
                Pedir presupuesto →
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Tamanos
