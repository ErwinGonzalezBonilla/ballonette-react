import { openBalloonBot } from "../../utils/balloonbot"

const ADICIONALES = [
  { nombre: "Catering", sub: "Mesas decoradas", texto: "Mesas de picoteo y dulces montadas con el mismo estilo que tu decoración.", foto: "/assets/images/servicios/catering.webp", alt: "Mesa de catering con embutidos, canapés y decoración", mensaje: "Me interesa el catering para mi evento" },
  { nombre: "Ramos", sub: "También para regalar", texto: "Ramos y cajas de rosas con detalles boutique para sorprender.", foto: "/assets/images/servicios/flores.webp", alt: "Caja de rosas rosadas con bombones", mensaje: "Me interesa un ramo de rosas" },
]

function AdicionalesInicio() {
  return (
    <section className="carbon" id="adicionales">
      <div className="contenedor">
        <div className="cabecera">
          <div><span className="kicker">Complementa tu evento</span><h2 className="h-xl">Servicios adicionales</h2></div>
          <p>Súmale a tu decoración un detalle que también se lleva todas las miradas.</p>
        </div>
        <div className="adicionales">
          {ADICIONALES.map((a) => (
            <button type="button" className="adicional" key={a.nombre} onClick={() => openBalloonBot(a.mensaje)}>
              <div className="adicional__foto"><img src={a.foto} alt={a.alt} loading="lazy" /></div>
              <div className="adicional__txt">
                <small>{a.sub}</small>
                <h3>{a.nombre}</h3>
                <p>{a.texto}</p>
                <span className="flecha">Pedir presupuesto →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AdicionalesInicio
