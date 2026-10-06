import safari from "../../assets/images/destacadas/babyshower-safari.webp"
import corporativo from "../../assets/images/destacadas/corporativo-azul.webp"
import { openBalloonBot } from "../../utils/balloonbot"

const SERVICIOS = [
  { nombre: "Cumpleaños", sub: "Infantiles y adultos", texto: "Arcos y fondos de globos con cartel personalizado y luces.", foto: "/assets/images/servicios/cumpleanos.webp", alt: "Arco de globos plateados con cartel Happy Birthday", mensaje: "Quiero organizar un cumpleaños" },
  { nombre: "Baby shower", sub: "Niño, niña o sorpresa", texto: "Decoraciones tiernas y temáticas para dar la bienvenida.", foto: safari, alt: "Baby shower de safari", posicion: "center 60%", mensaje: "Quiero organizar un baby shower" },
  { nombre: "Bodas", sub: "Y aniversarios", texto: "Globos y flores en armonía para vuestro gran día.", foto: "/assets/images/servicios/bodas.webp", alt: "Arco de globos y flores para una boda", mensaje: "Quiero decorar una boda" },
  { nombre: "Empresas", sub: "Con tu logo", texto: "Decoración con la imagen de tu marca para tus eventos.", foto: corporativo, alt: "Muro de globos azules para evento de empresa", mensaje: "Quiero decorar un evento de empresa" },
]

function ServiciosInicio() {
  return (
    <section id="servicios">
      <div className="contenedor">
        <div className="cabecera">
          <div><span className="kicker">Lo que hacemos</span><h2 className="h-xl">Servicios</h2></div>
          <p>Diseñamos cada decoración a medida: colores, temática y cartel pensados para tu celebración.</p>
        </div>
        <div className="servicios">
          {SERVICIOS.map((s) => (
            <button type="button" className="servicio" key={s.nombre} onClick={() => openBalloonBot(s.mensaje)}>
              <div className="servicio__foto">
                <img src={s.foto} alt={s.alt} loading="lazy" style={{ objectPosition: s.posicion || "center" }} />
              </div>
              <div className="servicio__txt">
                <small>{s.sub}</small>
                <h3>{s.nombre}</h3>
                <p>{s.texto}</p>
                <span className="flecha">Pedir presupuesto →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServiciosInicio
