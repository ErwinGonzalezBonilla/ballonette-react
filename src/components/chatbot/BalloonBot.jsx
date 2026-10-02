import { useState } from "react";
import "./BalloonBot.css";

function BalloonBot() {

  // CHAT ABIERTO / CERRADO
  const [isOpen, setIsOpen] = useState(false);

  // INPUT USUARIO
  const [input, setInput] = useState("");

  // MENSAJES CHAT
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hola, soy BalloonBot. ¿Qué servicio te interesa?"
    }
  ]);

  // ABRIR / CERRAR CHAT
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // ENVIAR MENSAJE
  const handleSendMessage = async () => {

    // EVITAR MENSAJES VACÍOS
    if (input.trim() === "") return;

    // GUARDAR INPUT ACTUAL
    const currentInput = input;

    // MENSAJE USUARIO
    const userMessage = {
      sender: "user",
      text: currentInput
    };

    // AGREGAR MENSAJE USUARIO
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage
    ]);

    // LIMPIAR INPUT
    setInput("");

    try {

      // REQUEST BACKEND
      const response = await fetch(
        "http://127.0.0.1:5000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
  message: currentInput,
  history: messages
})
        }
      );

      // RESPUESTA JSON
      const data = await response.json();

      // MENSAJE BOT
      const botMessage = {
        sender: "bot",
        text: data.reply
      };

      // AGREGAR RESPUESTA BOT
      setMessages((prevMessages) => [
        ...prevMessages,
        botMessage
      ]);

    } catch (error) {

      console.error(error);

      // MENSAJE ERROR
      const errorMessage = {
        sender: "bot",
        text: "❌ Error conectando con BalloonBot IA."
      };

      setMessages((prevMessages) => [
        ...prevMessages,
        errorMessage
      ]);
    }
  };

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        className="chat-toggle"
        onClick={toggleChat}
      >
        🎈
      </button>

      {/* CHAT */}
      {isOpen && (
        <div className="chat-container">

          {/* HEADER */}
          <div className="chat-header">

            <div>
              <h3>BalloonBot</h3>
              <span>Balloonette Eventos</span>
            </div>

            <button onClick={toggleChat}>
              ✕
            </button>

          </div>

          {/* BODY */}
          <div className="chat-body">

            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender}`}
              >
                {message.text}
              </div>
            ))}

          </div>

          {/* FOOTER */}
          <div className="chat-footer">

            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />

            <button onClick={handleSendMessage}>
              Enviar
            </button>

          </div>

        </div>
      )}
    </>
  );
}

export default BalloonBot;
