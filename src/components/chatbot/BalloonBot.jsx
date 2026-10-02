import { useState, useEffect, useRef, useCallback } from "react"
import "./BalloonBot.css"

import fotoArcoMedio from "../../assets/images/destacadas/arco-rojo-cumple.webp"
import fotoArcoGrande from "../../assets/images/destacadas/rosa-dorado-40.webp"
import fotoDobleArco from "../../assets/images/destacadas/babyshower-azul.webp"

// En producción, define VITE_API_URL en un archivo .env (por ejemplo https://api.tudominio.com)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"

// Fotos del catálogo por estilo: public/assets/catalogo/<estilo>-<paquete>.webp
const fotoCatalogo = (categoria, nombre) => `/assets/catalogo/${categoria}-${nombre}.webp`

// Foto de respaldo si el bot no indica el estilo
const FOTOS_PAQUETES = {
  arco_medio: fotoArcoMedio,
  arco_grande: fotoArcoGrande,
  doble_arco: fotoDobleArco,
}

const SALUDO = {
  sender: "bot",
  text: "¡Hola! Soy Balloonbot 🎈 Te ayudo a planificar tu evento en un par de minutos. ¿Qué estás celebrando y cómo te llamas?",
}

const SUGERENCIAS = ["Un cumpleaños", "Una boda", "Un baby shower", "Un evento de empresa"]

const TEXTO_PRIVACIDAD =
  "Ballonette Eventos (responsable: Katherine Gonzalez) usará tu nombre, teléfono y email solo para gestionar tu solicitud y contactarte sobre tu evento. No se comparten con terceros. Puedes pedir que se borren en cualquier momento escribiendo a katherinegonzalez32@gmail.com."

/* ---------- Tarjetas que el bot puede mostrar dentro del chat ---------- */

function TarjetaOpciones({ tarjeta, onElegir, deshabilitado }) {
  const imagen = fotoCatalogo(tarjeta.categoria, "comparativa")
  return (
    <div className="bot-card opciones">
      <a href={imagen} target="_blank" rel="noopener noreferrer" title="Ver en grande">
        <img src={imagen} alt="Comparativa de medio arco, arco completo y doble arco" />
      </a>
      <div className="bot-card-body">
        <small>Toca la imagen para verla en grande</small>
        {tarjeta.paquetes.map((p) => (
          <button
            key={p.id}
            type="button"
            className="opcion"
            disabled={deshabilitado}
            onClick={() => onElegir(`Me interesa el ${p.nombre.toLowerCase()}`)}
          >
            <span>
              <strong>{p.nombre}</strong>
              <small>{p.medidas}</small>
            </span>
            <span className="opcion-precio">{p.precio} €</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function TarjetaPaquete({ tarjeta }) {
  const foto = tarjeta.categoria
    ? fotoCatalogo(tarjeta.categoria, tarjeta.id)
    : FOTOS_PAQUETES[tarjeta.id]
  return (
    <div className={`bot-card paquete ${tarjeta.categoria ? "catalogo" : ""}`}>
      {foto && <img src={foto} alt={tarjeta.nombre} />}
      <div className="bot-card-body">
        <div className="bot-card-title">
          <strong>{tarjeta.nombre}</strong>
          <span>{tarjeta.precio} €</span>
        </div>
        <p>{tarjeta.incluye}</p>
        {tarjeta.medidas && <small>Medidas: {tarjeta.medidas}</small>}
        <small>+ transporte · La decoración se adapta a tu temática y colores.</small>
      </div>
    </div>
  )
}

function TarjetaPresupuesto({ tarjeta }) {
  return (
    <div className="bot-card presupuesto">
      <div className="bot-card-body">
        <strong className="presupuesto-titulo">{tarjeta.titulo || "Tu presupuesto"}</strong>
        {tarjeta.lineas.map((linea, i) => (
          <div key={i} className="presupuesto-linea">
            <span>{linea.concepto}</span>
            <span>{linea.importe} €</span>
          </div>
        ))}
        <div className="presupuesto-linea total">
          <span>Total estimado</span>
          <span>{tarjeta.total} €</span>
        </div>
        <small>Katherine confirmará la disponibilidad para tu fecha.</small>
      </div>
    </div>
  )
}

function TarjetaConsentimiento({ aceptado, onAceptar, deshabilitado }) {
  const [marcado, setMarcado] = useState(false)
  if (aceptado) {
    return <div className="bot-card consentimiento ok">✅ Has aceptado el uso de tus datos.</div>
  }
  return (
    <div className="bot-card consentimiento">
      <div className="bot-card-body">
        <strong>Protección de datos</strong>
        <p>{TEXTO_PRIVACIDAD}</p>
        <label>
          <input
            type="checkbox"
            checked={marcado}
            onChange={(e) => setMarcado(e.target.checked)}
          />
          Acepto que Ballonette Eventos use mis datos para gestionar mi solicitud.
        </label>
        <button type="button" disabled={!marcado || deshabilitado} onClick={onAceptar}>
          Aceptar y continuar
        </button>
      </div>
    </div>
  )
}

function TarjetaConfirmacion({ tarjeta }) {
  return (
    <div className="bot-card confirmacion">
      <div className="bot-card-body">
        <strong>🎉 ¡Solicitud enviada{tarjeta.nombre ? `, ${tarjeta.nombre}` : ""}!</strong>
        <p>Katherine revisará la disponibilidad y te escribirá muy pronto.</p>
      </div>
    </div>
  )
}

/* ---------- Componente principal ---------- */

function BalloonBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([SALUDO])
  const [showTeaser, setShowTeaser] = useState(false)
  const [consentimiento, setConsentimiento] = useState(false)
  const [terminado, setTerminado] = useState(false)

  const messagesRef = useRef(messages)
  const consentRef = useRef(consentimiento)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    consentRef.current = consentimiento
  }, [consentimiento])

  // Burbuja de invitación unos segundos después de cargar
  useEffect(() => {
    const t = setTimeout(() => setShowTeaser(true), 3500)
    return () => clearTimeout(t)
  }, [])

  // Bajar al último mensaje
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages, loading, isOpen])

  // Dejar el cursor en el campo de texto al abrir y después de cada respuesta,
  // para poder seguir escribiendo sin tocar otra vez
  useEffect(() => {
    if (isOpen && !terminado && !loading) inputRef.current?.focus()
  }, [isOpen, terminado, loading])

  const sendMessage = useCallback(async (text, opciones = {}) => {
    const clean = text.trim()
    if (clean === "") return

    // Solo se envía el texto (y la memoria de precios) al servidor
    const history = messagesRef.current
      .filter((m) => m.text)
      .map((m) => ({ sender: m.sender, text: m.text, memo: m.memo }))

    setMessages((prev) => [...prev, { sender: "user", text: clean }])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          history,
          consent: opciones.consent ?? consentRef.current,
        }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        ...(data.reply ? [{ sender: "bot", text: data.reply, memo: data.memo }] : []),
        ...(data.cards || []).map((card) => ({ sender: "bot", card })),
      ])

      if (data.done) setTerminado(true)
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Ahora mismo no puedo responder. Escríbenos por WhatsApp al +34 689 92 91 08 y te atendemos enseguida.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  // Abrir el bot desde otros botones de la web (utils/balloonbot.js)
  useEffect(() => {
    const handleOpen = (e) => {
      setIsOpen(true)
      setShowTeaser(false)
      const msg = e.detail?.message
      if (msg && messagesRef.current.length === 1) sendMessage(msg)
    }
    window.addEventListener("balloonbot:open", handleOpen)
    return () => window.removeEventListener("balloonbot:open", handleOpen)
  }, [sendMessage])

  const aceptarConsentimiento = () => {
    setConsentimiento(true)
    sendMessage("He aceptado el uso de mis datos ✅", { consent: true })
  }

  const toggleChat = () => {
    setIsOpen((open) => !open)
    setShowTeaser(false)
  }

  const reiniciar = () => {
    setMessages([SALUDO])
    setConsentimiento(false)
    setTerminado(false)
  }

  const soloSaludo = messages.length === 1

  const renderMensaje = (message, index) => {
    if (message.card) {
      const { card } = message
      if (card.tipo === "opciones") {
        return (
          <TarjetaOpciones
            key={index}
            tarjeta={card}
            onElegir={(texto) => sendMessage(texto)}
            deshabilitado={loading || terminado}
          />
        )
      }
      if (card.tipo === "paquete") return <TarjetaPaquete key={index} tarjeta={card} />
      if (card.tipo === "presupuesto") return <TarjetaPresupuesto key={index} tarjeta={card} />
      if (card.tipo === "confirmacion") return <TarjetaConfirmacion key={index} tarjeta={card} />
      if (card.tipo === "consentimiento") {
        return (
          <TarjetaConsentimiento
            key={index}
            aceptado={consentimiento}
            onAceptar={aceptarConsentimiento}
            deshabilitado={loading}
          />
        )
      }
      return null
    }
    return (
      <div key={index} className={`message ${message.sender}`}>
        {message.text}
      </div>
    )
  }

  return (
    <>
      {showTeaser && !isOpen && (
        <div className="chat-teaser" role="status">
          <button type="button" className="chat-teaser-text" onClick={toggleChat}>
            ¿Planeamos tu evento? Pregúntame 🎈
          </button>
          <button
            type="button"
            className="chat-teaser-close"
            onClick={() => setShowTeaser(false)}
            aria-label="Cerrar aviso"
          >
            ✕
          </button>
        </div>
      )}

      <button
        type="button"
        className={`chat-toggle ${isOpen ? "open" : ""}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Cerrar Balloonbot" : "Abrir Balloonbot"}
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "🎈"}
      </button>

      {isOpen && (
        <div className="chat-container" role="dialog" aria-label="Chat con Balloonbot">
          <div className="chat-header">
            <span className="chat-avatar" aria-hidden="true">🎈</span>
            <div className="chat-title">
              <h3>Balloonbot</h3>
              <span>Asistente de Ballonette Eventos</span>
            </div>
            <button type="button" onClick={toggleChat} aria-label="Cerrar chat">
              ✕
            </button>
          </div>

          <div className="chat-body" ref={bodyRef} aria-live="polite">
            {messages.map(renderMensaje)}

            {soloSaludo && !loading && (
              <div className="chat-suggestions">
                {SUGERENCIAS.map((s) => (
                  <button key={s} type="button" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="message bot typing" aria-label="Balloonbot está escribiendo">
                <span></span><span></span><span></span>
              </div>
            )}
          </div>

          {terminado ? (
            <div className="chat-footer chat-footer-fin">
              <button type="button" onClick={reiniciar}>
                Empezar una nueva consulta
              </button>
            </div>
          ) : (
            <form
              className="chat-footer"
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(input)
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Escribe tu mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                aria-label="Tu mensaje"
              />
              <button type="submit" disabled={loading || input.trim() === ""}>
                Enviar
              </button>
            </form>
          )}

          <p className="chat-legal">
            Katherine te confirmará la disponibilidad personalmente.
          </p>
        </div>
      )}
    </>
  )
}

export default BalloonBot
