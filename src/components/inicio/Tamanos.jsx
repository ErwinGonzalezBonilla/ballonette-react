import { openBalloonBot } from "../../utils/balloonbot"

const TAMANOS = [
  { nombre: "Medio arco", meta: "Formato 1", medida: "1,8 – 2 m", texto: "Ideal para espacios pequeños y celebraciones en casa.", foto: "/assets/catalogo/elegante-arco_medio.webp" },
  { nombre: "Arco completo", meta: "El más pedido", medida: "2,5 – 3 m", texto: "Perfecto para la mesa principal: la tarta y las fotos.", foto: "/assets/catalogo/elegante-arco_grande.webp" },
  { nombre: "Doble arco", meta: "Formato 3", medida: "3,5 – 4 m", texto: "Escenografía completa para eventos grandes.", foto: "/assets/catalogo/elegante-doble_arco.webp" },
]

function Tamanos() {
  return (
    <section className="clara" id="tamanos">
      <div className="contenedor">
        <div className="cabecera">
          <div><span className="kicker">Elige tu formato</span><h2 className="h-xl">Tamaños</h2></div>
          <p>Tres formatos que adaptamos a tu temática y tus colores. Cuéntanos tu idea y te preparamos el presupuesto.</p>
        </div>
        <div className="tamanos">
          {TAMANOS.map((t) => (
            <article className="tamano" key={t.nombre}>
              <img src={t.foto} alt={`Ejemplo de ${t.nombre.toLowerCase()} de globos`} loading="lazy" />
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
