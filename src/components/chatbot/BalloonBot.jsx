import { useState, useEffect, useRef, useCallback } from "react"
import "./BalloonBot.css"

/*
  BALLOONBOT · COTIZADOR GUIADO
  El cliente elige con botones y fotos; los precios salen del servidor (catalogo.py).
  Si escribe una pregunta o manda una foto, responde la IA (/chat en modo "guiado").
*/

// En producción, define VITE_API_URL (por ejemplo https://api.tudominio.com)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
const WHATSAPP = "34689929108"

const fotoCatalogo = (categoria, nombre) => `/assets/catalogo/${categoria}-${nombre}.webp`
const fotoElemento = (id) => `/assets/catalogo/elementos/${id}.webp`

const EVENTOS = [
  { id: "infantil", nombre: "Cumpleaños infantil", emoji: "🧸" },
  { id: "adulto", nombre: "Cumpleaños de adulto", emoji: "🥂" },
  { id: "babyshower", nombre: "Baby shower", emoji: "🍼" },
  { id: "comunion", nombre: "Comunión o bautizo", emoji: "🕊️" },
  { id: "boda", nombre: "Boda o aniversario", emoji: "💍" },
  { id: "empresa", nombre: "Evento de empresa", emoji: "🏢" },
  { id: "otro", nombre: "Otra celebración", emoji: "🎉" },
]

const ESPACIOS = ["Casa", "Salón de eventos", "Restaurante", "Jardín o exterior", "Oficina o local", "Otro"]
const HORAS = ["Mañana", "Mediodía", "Tarde", "Noche", "Aún no lo sé"]
const ZONAS = [
  { id: "madrid_capital", nombre: "Madrid capital" },
  { id: "comunidad_madrid", nombre: "Otro municipio de la Comunidad de Madrid" },
  { id: "fuera_comunidad", nombre: "Fuera de la Comunidad de Madrid" },
]

// Extras que se pueden marcar, con su foto del catálogo
const EXTRAS_VISIBLES = [
  { id: "logo_empresa", foto: "arreglo_empresa", soloPara: "empresa" },
  { id: "numeros", foto: "numeros" },
  { id: "centro_mesa", foto: "centro_mesa", cantidad: "mesas" },
  { id: "mesa_dulces", foto: "mesa_dulces" },
  { id: "totem", foto: "totem_halloween" },
  { id: "bouquet_globos", foto: "bouquet_globos" },
  { id: "rosas", foto: "ramo_rosas" },
  { id: "ramo_globos", foto: "ramo_con_globos" },
  { id: "neon", emoji: "💡" },
  { id: "catering", emoji: "🍽️", cantidad: "personas" },
]

const PASOS = ["nombre", "evento", "genero", "tamano", "tematica", "extras", "fecha", "lugar", "resumen", "detalles", "contacto", "fin"]
const PASO_DESCRIPCION = {
  nombre: "decirnos su nombre",
  evento: "elegir qué celebra",
  genero: "decir si es para niña o niño",
  tamano: "elegir el tamaño de la decoración",
  tematica: "elegir personaje/temática o solo colores",
  extras: "añadir extras (opcional)",
  fecha: "elegir la fecha",
  lugar: "decir dónde es el evento",
  resumen: "revisar su estimación",
  detalles: "añadir detalles de personalización",
  contacto: "dejar su teléfono para que Katherine le contacte",
  fin: "ya ha enviado su solicitud",
}

const TEXTO_PRIVACIDAD =
  "Ballonette Eventos (responsable: Katherine Gonzalez) usará tus datos solo para gestionar tu solicitud y contactarte sobre tu evento. No se comparten con terceros. Puedes pedir que se borren escribiendo a ballonette.eventos@gmail.com."

const TEXTO_DESCUENTO =
  "Entiendo perfectamente 😊. Podemos revisar si existe alguna alternativa que se adapte mejor a tu presupuesto. Katherine, nuestra responsable de eventos, valorará la propuesta y te confirmará si es posible ajustar el precio."

const SELECCION_INICIAL = {
  nombre: "", evento: null, genero: null, paquete: null, personaje: null, tematica: "", colores: "",
  extras: {}, fecha: "", hora: "", lugar: "", zona: null, espacio: "", homenajeado: "", edad: "",
  cartel: "", empresa: "", telefono: "", email: "", notas: "", descuento: "", pendientes: [], interes: "",
}

const euros = (n) => (n == null ? "a confirmar" : `${n.toLocaleString("es-ES")} €`)
const hoyISO = () => new Date().toISOString().slice(0, 10)
const fechaBonita = (iso) => {
  if (!iso) return ""
  const [a, m, d] = iso.split("-")
  return `${d}/${m}/${a}`
}

function categoriaDe(sel) {
  if (sel.evento === "infantil") return sel.genero === "nino" ? "cumple_nino" : sel.genero === "nina" ? "cumple_nina" : "elegante"
  if (sel.evento === "babyshower") return "babyshower"
  if (sel.evento === "empresa") return "corporativo"
  return "elegante"
}

function extrasParaServidor(sel) {
  const lista = Object.entries(sel.extras).map(([id, cantidad]) => ({ id, cantidad }))
  if (sel.personaje) lista.unshift({ id: "tematica_impresa", cantidad: 1 })
  return lista
}

// Cuál es el siguiente paso, saltando los que no aplican o ya están hechos
function pasoSiguiente(paso, sel) {
  let i = PASOS.indexOf(paso) + 1
  while (i < PASOS.length) {
    const p = PASOS[i]
    const saltar =
      (p === "genero" && sel.evento !== "infantil") ||
      (p === "tematica" && sel.paquete === "solo_adicionales")
    if (!saltar) return p
    i++
  }
  return "fin"
}

// Tras una foto de referencia: primer dato básico que aún falta
function primerPendiente(sel) {
  if (!sel.nombre) return "nombre"
  if (!sel.evento) return "evento"
  if (sel.evento === "infantil" && !sel.genero) return "genero"
  if (!sel.fecha) return "fecha"
  if (!sel.zona) return "lugar"
  return "resumen"
}

function textoPregunta(paso, sel) {
  switch (paso) {
    case "evento": return `¡Encantada, ${sel.nombre}! 😊 ¿Qué vamos a celebrar?`
    case "genero": return "¡Qué ilusión! ¿Es para una niña o para un niño? Así te enseño ideas en su estilo."
    case "tamano": return "Estos son nuestros tres formatos. Todos llevan panel de fondo, pedestal para la tarta, luces LED y el montaje. ¿Cuál encaja mejor con tu espacio?"
    case "tematica": return "¿Te gustaría un personaje o temática impresa en el panel (un unicornio, un superhéroe, su dibujo favorito...) o prefieres solo tus colores?"
    case "extras": return "¿Quieres añadir algún detalle? Puedes marcar varios o ninguno."
    case "fecha": return "¿Para qué fecha sería? 📅 Katherine confirmará la disponibilidad."
    case "lugar": return "¿Dónde será la celebración? Así calculo el transporte."
    case "resumen": return `¡Listo, ${sel.nombre}! Esta es tu estimación 👇`
    case "detalles": return "Unos detalles para personalizarlo (todo opcional):"
    case "contacto": return "¿Dónde te puede contactar Katherine para confirmarlo todo?"
    default: return ""
  }
}

function contextoParaIA(paso, sel, catalogo, presupuesto) {
  const paq = catalogo?.paquetes.find((p) => p.id === sel.paquete)
  const extras = Object.entries(sel.extras).map(([id, c]) => {
    const e = catalogo?.extras.find((x) => x.id === id)
    return `${e?.nombre || id}${c > 1 ? ` ×${c}` : ""}`
  })
  const partes = [
    `Paso actual: ${PASO_DESCRIPCION[paso]}.`,
    sel.nombre && `Nombre: ${sel.nombre}.`,
    sel.evento && `Evento: ${EVENTOS.find((e) => e.id === sel.evento)?.nombre}${sel.genero ? ` (${sel.genero === "nina" ? "niña" : "niño"})` : ""}.`,
    paq && `Paquete: ${paq.nombre}.`,
    sel.paquete === "solo_adicionales" && "Sin arco: solo elementos adicionales.",
    sel.personaje && `Con personaje/temática impresa: ${sel.tematica || "por definir"}.`,
    sel.colores && `Colores: ${sel.colores}.`,
    extras.length > 0 && `Extras: ${extras.join(", ")}.`,
    sel.fecha && `Fecha: ${fechaBonita(sel.fecha)} ${sel.hora}.`,
    sel.zona && `Zona: ${ZONAS.find((z) => z.id === sel.zona)?.nombre}${sel.lugar ? `, ${sel.lugar}` : ""}.`,
    presupuesto && `Estimación actual: ${presupuesto.desde ? "desde " : ""}${euros(presupuesto.total)}.`,
    sel.interes && `Llegó interesado en: ${sel.interes}.`,
  ]
  return partes.filter(Boolean).join(" ")
}

/* Reduce la foto del cliente (máx. 1280 px, JPEG) para enviarla rápido */
function comprimirImagen(archivo, maximo = 1280, calidad = 0.8) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo)
    const img = new Image()
    img.onload = () => {
      const escala = Math.min(1, maximo / Math.max(img.width, img.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * escala)
      canvas.height = Math.round(img.height * escala)
      const ctx = canvas.getContext("2d")
      ctx.fillStyle = "#fff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/jpeg", calidad))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("No se pudo leer la imagen"))
    }
    img.src = url
  })
}

/* ---------- Tarjetas que aparecen en la conversación ---------- */

function TarjetaPresupuesto({ tarjeta, titulo }) {
  return (
    <div className="bot-card presupuesto">
      <div className="bot-card-body">
        <strong className="presupuesto-titulo">{titulo || tarjeta.titulo || "Estimación orientativa"}</strong>
        {tarjeta.lineas.map((linea, i) => (
          <div key={i} className="presupuesto-linea">
            <span>{linea.concepto}</span>
            <span>{euros(linea.importe)}</span>
          </div>
        ))}
        <div className="presupuesto-linea total">
          <span>Total orientativo</span>
          <span>{tarjeta.total == null ? "a confirmar" : `${tarjeta.desde ? "desde " : ""}${euros(tarjeta.total)}`}</span>
        </div>
        {tarjeta.pendientes?.length > 0 && <small>Pendiente de revisar: {tarjeta.pendientes.join(" · ")}</small>}
        <small>Katherine confirmará la disponibilidad y el precio definitivo.</small>
      </div>
    </div>
  )
}

function TarjetaReferencias({ tarjeta }) {
  return (
    <div className="bot-card referencias">
      <div className="referencias-fila">
        {tarjeta.fotos.map((f) => (
          <a key={f.src} href={f.src} target="_blank" rel="noopener noreferrer" title="Ver en grande">
            <img src={f.src} alt={f.titulo} loading="lazy" />
            <small>{f.titulo}</small>
          </a>
        ))}
      </div>
      <div className="bot-card-body">
        <small>{tarjeta.nota || "Trabajos reales de Ballonette."} Toca una foto para verla en grande.</small>
      </div>
    </div>
  )
}

function TarjetaConfirmacion({ nombre, pedido }) {
  return (
    <div className="bot-card confirmacion">
      <div className="bot-card-body">
        <strong>🎉 ¡Solicitud enviada{nombre ? `, ${nombre}` : ""}!</strong>
        {pedido && <small>Número de solicitud: {pedido}</small>}
        <a className="bb-whatsapp" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
          ¿Tienes prisa? Escríbenos por WhatsApp
        </a>
      </div>
    </div>
  )
}

/* ---------- Pasos con botones ---------- */

function Botones({ opciones, onElegir }) {
  return (
    <div className="bb-botones">
      {opciones.map((o) => (
        <button key={o.valor} type="button" className={o.activo ? "activo" : ""} onClick={() => onElegir(o)}>
          {o.emoji && <span aria-hidden="true">{o.emoji}</span>} {o.texto}
        </button>
      ))}
    </div>
  )
}

function PasoTamano({ catalogo, sel, onElegir }) {
  const categoria = categoriaDe(sel)
  const comparativa = catalogo.comparativa.map((id) => catalogo.paquetes.find((p) => p.id === id)).filter(Boolean)
  const grandes = catalogo.paquetes.filter((p) => !catalogo.comparativa.includes(p.id))
  return (
    <div className="bb-paso">
      <div className="bb-carrusel">
        {comparativa.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`bb-tamano ${sel.paquete === p.id ? "activo" : ""}`}
            onClick={() => onElegir(p.id, p.nombre)}
          >
            <img src={fotoCatalogo(categoria, p.foto)} alt={p.nombre} loading="lazy" />
            <strong>{p.nombre}</strong>
            <span className="bb-precio">{p.desde ? "desde " : ""}{euros(p.precio)}</span>
            <small>{p.medidas}</small>
            <span className="bb-elegir">Elegir</span>
          </button>
        ))}
      </div>
      <small className="bb-nota">Desliza para ver los tres → · + transporte según la zona</small>
      <div className="bb-botones">
        {grandes.map((p) => (
          <button key={p.id} type="button" className={sel.paquete === p.id ? "activo" : ""} onClick={() => onElegir(p.id, p.nombre)}>
            ✨ {p.nombre} · desde {euros(p.precio)}
          </button>
        ))}
        <button type="button" className={sel.paquete === "solo_adicionales" ? "activo" : ""} onClick={() => onElegir("solo_adicionales", "Solo quiero un detalle, sin arco")}>
          🎁 Solo un detalle (ramo, bouquet, números...)
        </button>
      </div>
    </div>
  )
}

function PasoTematica({ sel, onListo }) {
  const [personaje, setPersonaje] = useState(sel.personaje)
  const [tematica, setTematica] = useState(sel.tematica)
  const [colores, setColores] = useState(sel.colores)
  return (
    <div className="bb-paso">
      <div className="bb-botones">
        <button type="button" className={personaje === true ? "activo" : ""} onClick={() => setPersonaje(true)}>
          🦄 Con personaje o temática (+40 €)
        </button>
        <button type="button" className={personaje === false ? "activo" : ""} onClick={() => setPersonaje(false)}>
          🎨 Solo mis colores
        </button>
      </div>
      {personaje !== null && (
        <div className="bb-campos">
          {personaje && (
            <input value={tematica} onChange={(e) => setTematica(e.target.value)} placeholder="¿Qué personaje o temática? (ej. Frozen)" />
          )}
          <input value={colores} onChange={(e) => setColores(e.target.value)} placeholder="Colores (ej. rosa y dorado) · opcional" />
          <button type="button" className="bb-continuar" onClick={() => onListo({ personaje, tematica: tematica.trim(), colores: colores.trim() })}>
            Continuar
          </button>
        </div>
      )}
    </div>
  )
}

function PasoExtras({ catalogo, sel, onListo }) {
  const [elegidos, setElegidos] = useState(sel.extras)
  const lista = EXTRAS_VISIBLES.filter((x) => !x.soloPara || x.soloPara === sel.evento)
    .map((x) => ({ ...x, info: catalogo.extras.find((e) => e.id === x.id) }))
    .filter((x) => x.info)

  const alternar = (x) =>
    setElegidos((prev) => {
      const nuevo = { ...prev }
      if (nuevo[x.id]) delete nuevo[x.id]
      else nuevo[x.id] = x.cantidad === "personas" ? 20 : x.cantidad ? 5 : 1
      return nuevo
    })
  const cambiarCantidad = (id, valor) =>
    setElegidos((prev) => ({ ...prev, [id]: Math.max(1, Math.min(500, Number(valor) || 1)) }))

  const n = Object.keys(elegidos).length
  return (
    <div className="bb-paso">
      <div className="bb-extras">
        {lista.map((x) => {
          const activo = Boolean(elegidos[x.id])
          const precio = x.info.precio == null ? "Precio a consultar" : `${euros(x.info.precio)}${x.info.por_persona ? " / persona" : ""}`
          return (
            <div key={x.id} className={`bb-extra ${activo ? "activo" : ""}`}>
              <button type="button" onClick={() => alternar(x)} aria-pressed={activo}>
                {x.foto ? <img src={fotoElemento(x.foto)} alt="" loading="lazy" /> : <span className="bb-extra-emoji">{x.emoji}</span>}
                <strong>{x.info.nombre}</strong>
                <small>{precio}</small>
                <span className="bb-check" aria-hidden="true">{activo ? "✓" : "+"}</span>
              </button>
              {activo && x.cantidad && (
                <label className="bb-cantidad">
                  <input type="number" min="1" value={elegidos[x.id]} onChange={(e) => cambiarCantidad(x.id, e.target.value)} />
                  {x.cantidad}
                </label>
              )}
            </div>
          )
        })}
      </div>
      <button type="button" className="bb-continuar" onClick={() => onListo(elegidos)}>
        {n === 0 ? "Sin extras, continuar" : `Continuar con ${n} extra${n > 1 ? "s" : ""}`}
      </button>
    </div>
  )
}

function PasoFecha({ sel, onListo }) {
  const [fecha, setFecha] = useState(sel.fecha)
  const [hora, setHora] = useState(sel.hora)
  return (
    <div className="bb-paso">
      <div className="bb-campos">
        <input type="date" min={hoyISO()} value={fecha} onChange={(e) => setFecha(e.target.value)} aria-label="Fecha del evento" />
      </div>
      <div className="bb-botones bb-botones-fila">
        {HORAS.map((h) => (
          <button key={h} type="button" className={hora === h ? "activo" : ""} onClick={() => setHora(h)}>{h}</button>
        ))}
      </div>
      <button type="button" className="bb-continuar" disabled={!fecha} onClick={() => onListo({ fecha, hora })}>
        Continuar
      </button>
    </div>
  )
}

function PasoLugar({ sel, onListo }) {
  const [zona, setZona] = useState(sel.zona)
  const [lugar, setLugar] = useState(sel.lugar)
  const [espacio, setEspacio] = useState(sel.espacio)
  return (
    <div className="bb-paso">
      <div className="bb-botones">
        {ZONAS.map((z) => (
          <button key={z.id} type="button" className={zona === z.id ? "activo" : ""} onClick={() => setZona(z.id)}>📍 {z.nombre}</button>
        ))}
      </div>
      {zona && (
        <>
          <div className="bb-campos">
            <input value={lugar} onChange={(e) => setLugar(e.target.value)} placeholder={zona === "madrid_capital" ? "Barrio (ej. Chamberí)" : "Municipio (ej. Pozuelo)"} />
          </div>
          <small className="bb-nota">¿En qué tipo de espacio?</small>
          <div className="bb-botones bb-botones-fila">
            {ESPACIOS.map((e) => (
              <button key={e} type="button" className={espacio === e ? "activo" : ""} onClick={() => setEspacio(e)}>{e}</button>
            ))}
          </div>
          <button type="button" className="bb-continuar" disabled={!lugar.trim()} onClick={() => onListo({ zona, lugar: lugar.trim(), espacio })}>
            Ver mi estimación
          </button>
        </>
      )}
    </div>
  )
}

function PasoResumen({ catalogo, sel, presupuesto, onAccion }) {
  const [cambiar, setCambiar] = useState(false)
  const [caro, setCaro] = useState(false)
  const orden = ["esencial", "celebracion", "doble_impacto"]
  const i = orden.indexOf(sel.paquete)
  const masSencillo = i > 0 ? catalogo.paquetes.find((p) => p.id === orden[i - 1]) : null
  return (
    <div className="bb-paso">
      {presupuesto ? <TarjetaPresupuesto tarjeta={presupuesto} titulo="Tu estimación" /> : <small className="bb-nota">Calculando...</small>}
      {!cambiar ? (
        <div className="bb-botones">
          <button type="button" className="principal" onClick={() => onAccion("continuar")}>✅ Me encaja, quiero reservar</button>
          <button type="button" onClick={() => setCambiar(true)}>✏️ Cambiar algo</button>
          {caro && masSencillo ? (
            <button type="button" onClick={() => onAccion("bajar", masSencillo)}>
              ⬇️ Cambiar a {masSencillo.nombre} ({euros(masSencillo.precio)})
            </button>
          ) : (
            !caro && (
              <button type="button" onClick={() => { setCaro(true); onAccion("caro", masSencillo) }}>💸 Se me va de presupuesto</button>
            )
          )}
        </div>
      ) : (
        <div className="bb-botones bb-botones-fila">
          {[
            ["tamano", "Tamaño"], ["tematica", "Temática"], ["extras", "Extras"], ["fecha", "Fecha"], ["lugar", "Lugar"],
          ].map(([paso, texto]) => (
            <button key={paso} type="button" onClick={() => onAccion("editar", paso)}>{texto}</button>
          ))}
        </div>
      )}
    </div>
  )
}

function PasoDetalles({ sel, onListo }) {
  const [d, setD] = useState({ homenajeado: sel.homenajeado, edad: sel.edad, cartel: sel.cartel, empresa: sel.empresa, notas: sel.notas })
  const campo = (clave) => ({ value: d[clave], onChange: (e) => setD({ ...d, [clave]: e.target.value }) })
  const cumple = sel.evento === "infantil" || sel.evento === "adulto"
  return (
    <div className="bb-paso">
      <div className="bb-campos">
        {cumple && <input {...campo("homenajeado")} placeholder="Nombre del cumpleañero/a" />}
        {cumple && <input {...campo("edad")} inputMode="numeric" placeholder="Años que cumple" />}
        {sel.evento === "babyshower" && <input {...campo("homenajeado")} placeholder="Nombre del bebé (si ya lo sabéis)" />}
        {sel.evento === "boda" && <input {...campo("homenajeado")} placeholder="Nombres de los novios" />}
        {sel.evento === "comunion" && <input {...campo("homenajeado")} placeholder="Nombre del niño o la niña" />}
        {sel.evento === "empresa" && <input {...campo("empresa")} placeholder="Nombre de la empresa" />}
        <input {...campo("cartel")} placeholder="Texto para el cartel (ej. Feliz 5 cumple, Lucía)" />
        <textarea {...campo("notas")} rows={2} placeholder="¿Algo más que debamos saber?" />
      </div>
      <button type="button" className="bb-continuar" onClick={() => onListo(d)}>Continuar</button>
    </div>
  )
}

function PasoContacto({ sel, enviando, onEnviar }) {
  const [telefono, setTelefono] = useState(sel.telefono)
  const [email, setEmail] = useState(sel.email)
  const [acepto, setAcepto] = useState(false)
  const telOk = telefono.replace(/\D/g, "").length >= 9
  const emailOk = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  return (
    <div className="bb-paso">
      <div className="bb-campos">
        <input type="tel" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono / WhatsApp" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (opcional, para enviarte el resumen)" />
        {!emailOk && <small className="bb-error">Revisa el email.</small>}
      </div>
      <label className="bb-consentimiento">
        <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
        <span>Acepto que Ballonette Eventos use mis datos para gestionar mi solicitud. <small>{TEXTO_PRIVACIDAD}</small></span>
      </label>
      <button
        type="button"
        className="bb-continuar"
        disabled={!telOk || !emailOk || !acepto || enviando}
        onClick={() => onEnviar({ telefono: telefono.trim(), email: email.trim() })}
      >
        {enviando ? "Enviando..." : "Enviar a Katherine 🎈"}
      </button>
    </div>
  )
}

/* ---------- Componente principal ---------- */

function BalloonBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTeaser, setShowTeaser] = useState(false)
  const [catalogo, setCatalogo] = useState(null)
  const [errorCatalogo, setErrorCatalogo] = useState(false)
  const [mensajes, setMensajes] = useState([])
  const [paso, setPaso] = useState("nombre")
  const [historial, setHistorial] = useState([])
  const [sel, setSel] = useState(SELECCION_INICIAL)
  const [presupuesto, setPresupuesto] = useState(null)
  const [input, setInput] = useState("")
  const [pensando, setPensando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [editando, setEditando] = useState(false)

  const selRef = useRef(sel)
  const pasoRef = useRef(paso)
  const mensajesRef = useRef(mensajes)
  const presupuestoRef = useRef(presupuesto)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const fileRef = useRef(null)
  const referenciaRef = useRef(null)
  const iniciado = useRef(false)

  useEffect(() => { selRef.current = sel }, [sel])
  useEffect(() => { pasoRef.current = paso }, [paso])
  useEffect(() => { mensajesRef.current = mensajes }, [mensajes])
  useEffect(() => { presupuestoRef.current = presupuesto }, [presupuesto])

  const decir = useCallback((...nuevos) => setMensajes((prev) => [...prev, ...nuevos]), [])

  // Saludo inicial
  useEffect(() => {
    if (iniciado.current) return
    iniciado.current = true
    setMensajes([{ sender: "bot", text: "¡Hola! 🎈 Bienvenido/a a Ballonette Eventos. Será un placer ayudarte a crear una decoración especial para tu celebración. ¿Cómo te llamas?" }])
  }, [])

  // Catálogo (precios y fotos) desde el servidor
  const cargarCatalogo = useCallback(() => {
    setErrorCatalogo(false)
    fetch(`${API_URL}/catalogo`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setCatalogo)
      .catch(() => setErrorCatalogo(true))
  }, [])
  useEffect(() => {
    if (isOpen && !catalogo) cargarCatalogo()
  }, [isOpen, catalogo, cargarCatalogo])

  // Presupuesto en vivo cada vez que cambia la selección
  useEffect(() => {
    if (!sel.paquete) {
      setPresupuesto(null)
      return
    }
    const control = new AbortController()
    fetch(`${API_URL}/presupuesto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paquete_id: sel.paquete,
        extras: extrasParaServidor(sel),
        zona: sel.zona || "madrid_capital",
        personas_catering: sel.extras.catering || 0,
        pendientes: sel.pendientes,
      }),
      signal: control.signal,
    })
      .then((r) => r.json())
      .then(setPresupuesto)
      .catch(() => {})
    return () => control.abort()
  }, [sel])

  // Invitación y scroll
  useEffect(() => {
    const t = setTimeout(() => setShowTeaser(true), 3500)
    return () => clearTimeout(t)
  }, [])
  // Al llegar mensajes nuevos, se muestra el primero del bot (la pregunta) arriba, con los botones debajo
  const vistos = useRef(0)
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const desde = vistos.current
    vistos.current = mensajes.length
    requestAnimationFrame(() => {
      const nuevo = [...el.querySelectorAll("[data-i]")].find(
        (n) => Number(n.dataset.i) >= desde && n.dataset.bot === "1",
      )
      if (nuevo && !pensando) {
        el.scrollTo({ top: Math.max(0, nuevo.offsetTop - el.offsetTop - 12), behavior: "smooth" })
      } else {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
      }
    })
  }, [mensajes, pensando, isOpen])

  /* ----- Navegación entre pasos ----- */

  const irA = useCallback((nuevoPaso, selActual) => {
    const s = selActual || selRef.current
    setHistorial((h) => [...h, pasoRef.current])
    setPaso(nuevoPaso)
    const texto = textoPregunta(nuevoPaso, s)
    if (texto) decir({ sender: "bot", text: texto })
  }, [decir])

  // Guarda la respuesta y avanza (o vuelve al resumen si estaba editando)
  const responder = useCallback((cambios, textoUsuario) => {
    const nueva = { ...selRef.current, ...cambios }
    setSel(nueva)
    selRef.current = nueva
    if (textoUsuario) decir({ sender: "user", text: textoUsuario })
    if (editando && PASOS.indexOf(pasoRef.current) < PASOS.indexOf("resumen")) {
      setEditando(false)
      irA("resumen", nueva)
    } else {
      irA(pasoSiguiente(pasoRef.current, nueva), nueva)
    }
  }, [decir, irA, editando])

  const atras = () => {
    const previo = historial[historial.length - 1]
    if (!previo) return
    setHistorial((h) => h.slice(0, -1))
    setPaso(previo)
    decir({ sender: "bot", text: textoPregunta(previo, selRef.current) || "Vale, volvemos atrás." })
  }

  /* ----- Preguntas libres y fotos: responde la IA ----- */

  const preguntarIA = useCallback(async (texto, imagen) => {
    setPensando(true)
    const history = mensajesRef.current
      .filter((m) => m.text)
      .slice(-12)
      .map((m) => ({ sender: m.sender, text: m.text, memo: m.memo }))
    try {
      const r = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: "guiado",
          message: texto,
          history,
          contexto: contextoParaIA(pasoRef.current, selRef.current, catalogo, presupuestoRef.current),
          image: imagen || null,
          reference_image: referenciaRef.current,
        }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      const cards = data.cards || []
      decir(
        ...(data.reply ? [{ sender: "bot", text: data.reply, memo: data.memo }] : []),
        ...cards.filter((c) => c.tipo === "referencias").map((card) => ({ sender: "bot", card })),
      )
      const propuesta = cards.find((c) => c.tipo === "propuesta")
      if (propuesta) aplicarPropuesta(propuesta)
    } catch (error) {
      console.error(error)
      decir({ sender: "bot", text: "Ahora mismo no puedo responder a eso 😕 Puedes seguir con los botones o escribirnos por WhatsApp al +34 689 92 91 08." })
    } finally {
      setPensando(false)
    }
    // aplicarPropuesta se define abajo y solo usa refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogo, decir])

  const aplicarPropuesta = (p) => {
    const extras = {}
    for (const e of p.extras || []) extras[e.id] = e.cantidad || 1
    const nueva = {
      ...selRef.current,
      paquete: p.paquete_id,
      personaje: p.personaje_impreso,
      tematica: p.tematica || selRef.current.tematica,
      colores: p.colores || selRef.current.colores,
      extras,
      pendientes: p.pendientes || [],
    }
    setSel(nueva)
    selRef.current = nueva
    const siguiente = primerPendiente(nueva)
    if (siguiente !== pasoRef.current) irA(siguiente, nueva)
  }

  const enviarTexto = (e) => {
    e.preventDefault()
    const texto = input.trim()
    if (!texto || pensando) return
    setInput("")
    // En el primer paso, lo que escribe es su nombre (salvo que sea una pregunta)
    if (paso === "nombre" && !texto.includes("?") && texto.split(/\s+/).length <= 4) {
      const nombre = texto.replace(/^(me llamo|soy|mi nombre es)\s+/i, "").replace(/[.!]+$/, "")
      const bonito = nombre.charAt(0).toUpperCase() + nombre.slice(1)
      responder({ nombre: bonito }, texto)
      return
    }
    decir({ sender: "user", text: texto })
    preguntarIA(texto)
  }

  const enviarFoto = async (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = ""
    if (!archivo || !archivo.type.startsWith("image/")) return
    try {
      const imagen = await comprimirImagen(archivo)
      referenciaRef.current = imagen
      const texto = input.trim() || "Te envío una foto de lo que me gustaría."
      setInput("")
      decir({ sender: "user", text: texto, imagen })
      preguntarIA(texto, imagen)
    } catch {
      decir({ sender: "bot", text: "No he podido abrir esa foto 😕 ¿Puedes probar con otra (JPG o PNG)?" })
    }
  }

  /* ----- Envío final ----- */

  const enviarSolicitud = async (contacto) => {
    const s = { ...selRef.current, ...contacto }
    setSel(s)
    setEnviando(true)
    const evento = EVENTOS.find((x) => x.id === s.evento)
    const paq = catalogo.paquetes.find((p) => p.id === s.paquete)
    try {
      const r = await fetch(`${API_URL}/solicitud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent: true,
          nombre: s.nombre,
          telefono: s.telefono,
          email: s.email,
          tipo_evento: evento ? `${evento.nombre}${s.genero ? ` (${s.genero === "nina" ? "niña" : "niño"})` : ""}` : "",
          tipo_decoracion: paq ? paq.nombre : "Solo elementos adicionales",
          fecha: fechaBonita(s.fecha),
          hora: s.hora,
          lugar: s.lugar,
          zona: s.zona,
          espacio: s.espacio,
          descuento_solicitado: s.descuento,
          paquete_id: s.paquete,
          extras: extrasParaServidor(s),
          personas_catering: s.extras.catering || 0,
          pendientes: s.pendientes,
          categoria: categoriaDe(s),
          tematica: s.personaje ? s.tematica || "Personaje por definir" : "",
          colores: s.colores,
          nombre_homenajeado: s.homenajeado,
          edad: s.edad,
          texto_cartel: s.cartel,
          empresa: s.empresa,
          notas: [s.notas, s.interes && `Llegó interesado en: ${s.interes}`].filter(Boolean).join(" · "),
          reference_image: referenciaRef.current,
        }),
      })
      const data = await r.json()
      if (!r.ok || !data.ok) throw new Error(data.error || `HTTP ${r.status}`)
      const total = data.presupuesto?.total
      const importe = total == null
        ? "Katherine te confirmará el precio de lo que has elegido"
        : `La estimación inicial es de ${data.presupuesto.desde ? "desde " : ""}${euros(total)}, pendiente de revisión y confirmación`
      setPaso("fin")
      decir(
        { sender: "bot", card: { tipo: "confirmacion", pedido: data.pedido_id } },
        {
          sender: "bot",
          text: `¡Muchas gracias, ${s.nombre}! 🎈 Con lo que me has contado podemos preparar una propuesta para tu celebración. ${importe}. Katherine, CEO de Ballonette Eventos, se pondrá en contacto contigo para revisar los detalles, confirmar la disponibilidad y concretar el presupuesto definitivo. ¡Nos encantará ayudarte a crear un evento inolvidable!`,
        },
      )
    } catch (error) {
      console.error(error)
      decir({ sender: "bot", text: "No he podido enviar tu solicitud 😕 Vuelve a intentarlo en un momento o escríbenos por WhatsApp al +34 689 92 91 08 y te atendemos enseguida." })
    } finally {
      setEnviando(false)
    }
  }

  const reiniciar = () => {
    setSel(SELECCION_INICIAL)
    selRef.current = SELECCION_INICIAL
    setPresupuesto(null)
    setHistorial([])
    setEditando(false)
    referenciaRef.current = null
    setPaso("nombre")
    setMensajes([{ sender: "bot", text: "¡Empezamos de nuevo! 🎈 ¿Cómo te llamas?" }])
  }

  // Abrir desde otros botones de la web (utils/balloonbot.js)
  useEffect(() => {
    const abrir = (e) => {
      setIsOpen(true)
      setShowTeaser(false)
      const msg = e.detail?.message
      if (!msg || selRef.current.interes) return
      const texto = msg.toLowerCase()
      const paquete = texto.includes("doble") ? "doble_impacto" : texto.includes("medio") ? "esencial" : texto.includes("completo") ? "celebracion" : null
      setSel((s) => ({ ...s, interes: msg, ...(paquete ? { paquete } : {}) }))
      decir({ sender: "user", text: msg })
      decir({ sender: "bot", text: "¡Genial! Lo tengo en cuenta 😊 Para prepararte la propuesta, ¿cómo te llamas?" })
    }
    window.addEventListener("balloonbot:open", abrir)
    return () => window.removeEventListener("balloonbot:open", abrir)
  }, [decir])

  /* ----- Pintar el paso actual ----- */

  const pasoActual = () => {
    if (pensando || paso === "nombre" || paso === "fin") return null
    if (!catalogo) {
      return errorCatalogo ? (
        <div className="bb-paso">
          <small className="bb-nota">No he podido cargar las opciones.</small>
          <button type="button" className="bb-continuar" onClick={cargarCatalogo}>Reintentar</button>
        </div>
      ) : <small className="bb-nota">Cargando opciones...</small>
    }
    switch (paso) {
      case "evento":
        return (
          <Botones
            opciones={EVENTOS.map((e) => ({ valor: e.id, texto: e.nombre, emoji: e.emoji, activo: sel.evento === e.id }))}
            onElegir={(o) => responder({ evento: o.valor, genero: o.valor === "infantil" ? sel.genero : null }, `${o.emoji} ${o.texto}`)}
          />
        )
      case "genero":
        return (
          <Botones
            opciones={[
              { valor: "nina", texto: "Niña", emoji: "👧" },
              { valor: "nino", texto: "Niño", emoji: "👦" },
              { valor: "otro", texto: "Otro estilo", emoji: "✨" },
            ]}
            onElegir={(o) => responder({ genero: o.valor }, `${o.emoji} ${o.texto}`)}
          />
        )
      case "tamano":
        return <PasoTamano catalogo={catalogo} sel={sel} onElegir={(id, nombre) => responder({ paquete: id, ...(id === "solo_adicionales" ? { personaje: null } : {}) }, nombre)} />
      case "tematica":
        return (
          <PasoTematica
            sel={sel}
            onListo={(v) => responder(v, v.personaje ? `Con ${v.tematica || "personaje"}${v.colores ? `, en ${v.colores}` : ""}` : `Solo colores${v.colores ? `: ${v.colores}` : ""}`)}
          />
        )
      case "extras":
        return (
          <PasoExtras
            catalogo={catalogo}
            sel={sel}
            onListo={(extras) => {
              const nombres = Object.keys(extras).map((id) => catalogo.extras.find((e) => e.id === id)?.nombre).filter(Boolean)
              responder({ extras }, nombres.length ? `Añadir: ${nombres.join(", ")}` : "Sin extras")
            }}
          />
        )
      case "fecha":
        return <PasoFecha sel={sel} onListo={(v) => responder(v, `📅 ${fechaBonita(v.fecha)}${v.hora ? ` · ${v.hora}` : ""}`)} />
      case "lugar":
        return <PasoLugar sel={sel} onListo={(v) => responder(v, `📍 ${v.lugar}${v.espacio ? ` · ${v.espacio}` : ""}`)} />
      case "resumen":
        return (
          <PasoResumen
            catalogo={catalogo}
            sel={sel}
            presupuesto={presupuesto}
            onAccion={(accion, extra) => {
              if (accion === "continuar") responder({}, "✅ Me encaja")
              else if (accion === "editar") {
                setEditando(true)
                irA(extra)
              } else if (accion === "caro") {
                setSel((s) => ({ ...s, descuento: "Dijo que se le iba de presupuesto" }))
                decir({ sender: "user", text: "💸 Se me va de presupuesto" }, { sender: "bot", text: TEXTO_DESCUENTO })
                if (extra) {
                  decir({ sender: "bot", text: `Si quieres, también puedo cambiarlo al ${extra.nombre} (${euros(extra.precio)}), que es una opción más sencilla 👇` })
                }
              } else if (accion === "bajar") {
                const nueva = { ...selRef.current, paquete: extra.id }
                setSel(nueva)
                selRef.current = nueva
                decir({ sender: "user", text: `Cambiar a ${extra.nombre}` }, { sender: "bot", text: "¡Hecho! Te he actualizado la estimación 👇" })
              }
            }}
          />
        )
      case "detalles":
        return (
          <PasoDetalles
            sel={sel}
            onListo={(d) => responder(d, [d.homenajeado, d.edad && `${d.edad} años`, d.cartel && `"${d.cartel}"`].filter(Boolean).join(" · ") || "Sin detalles extra")}
          />
        )
      case "contacto":
        return <PasoContacto sel={sel} enviando={enviando} onEnviar={enviarSolicitud} />
      default:
        return null
    }
  }

  const renderMensaje = (m, i) => {
    const marca = { "data-i": i, "data-bot": m.sender === "bot" ? "1" : "0" }
    if (m.card?.tipo === "referencias") return <div key={i} {...marca} className="bb-envoltura"><TarjetaReferencias tarjeta={m.card} /></div>
    if (m.card?.tipo === "confirmacion") return <div key={i} {...marca} className="bb-envoltura"><TarjetaConfirmacion nombre={sel.nombre} pedido={m.card.pedido} /></div>
    return (
      <div key={i} {...marca} className={`message ${m.sender} ${m.imagen ? "con-foto" : ""}`}>
        {m.imagen && <img className="foto-cliente" src={m.imagen} alt="Foto de referencia" />}
        {m.text}
      </div>
    )
  }

  const mostrarBarra = presupuesto && paso !== "resumen" && paso !== "fin"
  const placeholder = paso === "nombre" ? "Escribe tu nombre..." : "¿Tienes alguna duda? Escríbeme o envía una foto 📷"

  return (
    <>
      {showTeaser && !isOpen && (
        <div className="chat-teaser" role="status">
          <button type="button" className="chat-teaser-text" onClick={() => { setIsOpen(true); setShowTeaser(false) }}>
            ¿Te preparo un presupuesto en 2 minutos? 🎈
          </button>
          <button type="button" className="chat-teaser-close" onClick={() => setShowTeaser(false)} aria-label="Cerrar aviso">✕</button>
        </div>
      )}

      <button
        type="button"
        className={`chat-toggle ${isOpen ? "open" : ""}`}
        onClick={() => { setIsOpen((o) => !o); setShowTeaser(false) }}
        aria-label={isOpen ? "Cerrar Balloonbot" : "Abrir Balloonbot"}
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "🎈"}
      </button>

      {isOpen && (
        <div className="chat-container bb-guiado" role="dialog" aria-label="Chat con Balloonbot">
          <div className="chat-header">
            <span className="chat-avatar" aria-hidden="true">🎈</span>
            <div className="chat-title">
              <h3>Balloonbot</h3>
              <span>Tu presupuesto en 2 minutos</span>
            </div>
            <button type="button" onClick={reiniciar} aria-label="Empezar de nuevo" title="Empezar de nuevo">↺</button>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar chat">✕</button>
          </div>

          {mostrarBarra && (
            <div className="bb-barra">
              <span>Tu estimación</span>
              <strong>
                {presupuesto.total == null
                  ? "a confirmar"
                  : sel.zona
                    ? `${presupuesto.desde ? "desde " : ""}${euros(presupuesto.total)}`
                    : `${presupuesto.desde ? "desde " : ""}${euros(presupuesto.subtotal_sin_transporte)} + transporte`}
              </strong>
            </div>
          )}

          <div className="chat-body" ref={bodyRef} aria-live="polite">
            {mensajes.map(renderMensaje)}
            {pensando && (
              <div className="message bot typing" aria-label="Balloonbot está escribiendo">
                <span></span><span></span><span></span>
              </div>
            )}
            {!pensando && paso !== "nombre" && paso !== "fin" && (
              <div className="bb-ancla">
                {pasoActual()}
                {historial.length > 1 && paso !== "contacto" && (
                  <button type="button" className="bb-atras" onClick={atras}>← Atrás</button>
                )}
              </div>
            )}
          </div>

          {paso === "fin" ? (
            <div className="chat-footer chat-footer-fin">
              <button type="button" onClick={reiniciar}>Empezar una nueva consulta</button>
            </div>
          ) : (
            <form className="chat-footer" onSubmit={enviarTexto}>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={enviarFoto} />
              <button
                type="button"
                className="chat-foto"
                onClick={() => fileRef.current?.click()}
                disabled={pensando}
                aria-label="Enviar una foto de referencia"
                title="Enviar una foto de lo que te gusta"
              >
                📷
              </button>
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={pensando}
                aria-label="Tu mensaje"
              />
              <button type="submit" disabled={pensando || input.trim() === ""}>Enviar</button>
            </form>
          )}
        </div>
      )}
    </>
  )
}

export default BalloonBot
