import { useState, useEffect, useRef, useCallback } from "react"
import "./BalloonBot.css"

// En producción, define VITE_API_URL en un archivo .env (por ejemplo https://api.tudominio.com)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"

const SALUDO = {
  sender: "bot",
  text: "¡Hola! Soy Balloonbot 🎈 Te ayudo a planificar tu evento. ¿Qué estás celebrando?",
}

const SUGERENCIAS = ["Un cumpleaños", "Una boda", "Un baby shower", "Un evento de empresa"]

function BalloonBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([SALUDO])
  const [showTeaser, setShowTeaser] = useState(false)

  const messagesRef = useRef(messages)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Mostrar la burbuja de invitación unos segundos después de cargar
  useEffect(() => {
    const t = setTimeout(() => setShowTeaser(true), 3500)
    return () => clearTimeout(t)
  }, [])

  // Bajar automáticamente al último mensaje
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages, loading, isOpen])

  // Enfocar el campo de texto al abrir
  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const sendMessage = useCallback(async (text) => {
    const clean = text.trim()
    if (clean === "") return

    const history = messagesRef.current
    setMessages((prev) => [...prev, { sender: "user", text: clean }])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, history }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()

      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }])
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

  // Permite abrir el bot desde otros botones de la web (utils/balloonbot.js)
  useEffect(() => {
    const handleOpen = (e) => {
      setIsOpen(true)
      setShowTeaser(false)
      const msg = e.detail?.message
      if (msg) sendMessage(msg)
    }
    window.addEventListener("balloonbot:open", handleOpen)
    return () => window.removeEventListener("balloonbot:open", handleOpen)
  }, [sendMessage])

  const toggleChat = () => {
    setIsOpen((open) => !open)
    setShowTeaser(false)
  }

  const soloSaludo = messages.length === 1

  return (
    <>
      {/* BURBUJA DE INVITACIÓN */}
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

      {/* BOTÓN FLOTANTE */}
      <button
        type="button"
        className={`chat-toggle ${isOpen ? "open" : ""}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Cerrar Balloonbot" : "Abrir Balloonbot"}
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "🎈"}
      </button>

      {/* VENTANA DEL CHAT */}
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
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                {message.text}
              </div>
            ))}

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

          <p className="chat-legal">
            Katherine te confirmará la disponibilidad personalmente.
          </p>
        </div>
      )}
    </>
  )
}

export default BalloonBot
