const PASOS = [
  { titulo: "Cuéntale tu idea a Balloonbot", texto: "Qué celebras, la fecha, la zona y los invitados. Te enseña opciones con foto al momento." },
  { titulo: "Katherine te confirma", texto: "Revisa la disponibilidad de tu fecha y te escribe para cerrar los detalles." },
  { titulo: "Llegamos y lo montamos", texto: "El día del evento lo dejamos todo listo para que tú solo disfrutes." },
]

function ComoFunciona() {
  return (
    <section className="carbon" id="como-funciona">
      <div className="contenedor">
        <div className="cabecera">
          <div><span className="kicker">Sin complicaciones</span><h2 className="h-xl">Cómo funciona</h2></div>
        </div>
        <ol className="pasos">
          {PASOS.map((paso, i) => (
            <li className="paso" key={paso.titulo}>
              <div className="paso__num">0{i + 1}</div>
              <h3>{paso.titulo}</h3>
              <p>{paso.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default ComoFunciona
