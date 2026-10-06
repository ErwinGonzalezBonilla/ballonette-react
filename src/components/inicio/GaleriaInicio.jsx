import rosaDorado from "../../assets/images/destacadas/rosa-dorado-40.webp"
import babyAzul from "../../assets/images/destacadas/babyshower-azul.webp"
import arcoRojo from "../../assets/images/destacadas/arco-rojo-cumple.webp"
import corazones from "../../assets/images/destacadas/corazones-sorpresa.webp"

// Tres columnas con fotos completas (sin recortes).
// El orden está pensado para que las columnas terminen a la misma altura.
const COLUMNAS = [
  [
    { src: "/assets/web/babyshower-rosa.webp", alt: "Baby shower en rosa, azul y blanco con osito y cubos BABY", etiqueta: "Baby shower" },
    { src: rosaDorado, alt: "Arco rosa y dorado para un 40 cumpleaños", etiqueta: "Cumpleaños 40" },
    { src: corazones, alt: "Globos de corazón rojos y ramo de rosas sobre un coche", etiqueta: "Sorpresas" },
  ],
  [
    { src: "/assets/web/cumple-tematico.webp", alt: "Cumpleaños temático de videojuegos con globos azules, verdes y negros", etiqueta: "Cumpleaños temático" },
    { src: "/assets/web/marcas.webp", alt: "Columnas de globos rojos y dorados con regalo de marca y tarta", etiqueta: "Marcas" },
  ],
  [
    { src: "/assets/web/halloween.webp", alt: "Columna de globos de Halloween con calabazas y arañas en una recepción", etiqueta: "Halloween" },
    { src: babyAzul, alt: "Baby shower azul con osito gigante y caballito", etiqueta: "Baby shower" },
    { src: arcoRojo, alt: "Aro de globos rojos con cartel Happy Birthday", etiqueta: "Cumpleaños" },
  ],
]

function GaleriaInicio() {
  return (
    <section id="galeria">
      <div className="contenedor">
        <div className="cabecera">
          <div><span className="kicker">Nuestros montajes</span><h2 className="h-xl">Galería</h2></div>
          <p>Decoraciones así de hermosas, montadas por nuestro equipo en Madrid.</p>
        </div>
        <div className="mosaico">
          {COLUMNAS.map((columna, i) => (
            <div className="mosaico__col" key={i}>
              {columna.map((foto) => (
                <figure key={foto.alt}>
                  <img src={foto.src} alt={foto.alt} loading="lazy" />
                  <figcaption>{foto.etiqueta}</figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GaleriaInicio
