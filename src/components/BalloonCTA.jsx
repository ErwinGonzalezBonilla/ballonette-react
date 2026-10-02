import { openBalloonBot } from "../utils/balloonbot"

const opciones = ["Un cumpleaños", "Una boda", "Un baby shower", "Un evento de empresa"]

// Sección final: sustituye al antiguo formulario e invita a usar Balloonbot.
function BalloonCTA() {
  return (
    <section className="bot-cta" id="presupuesto">
      <div className="bot-cta-inner">
        <div className="bot-cta-text">
          <h2>¿Qué estás celebrando?</h2>
          <p>
            Cuéntaselo a Balloonbot, nuestro asistente. Te hará unas pocas
            preguntas sobre la fecha, el lugar, los invitados y tu presupuesto.
            Después, Katherine te escribe para confirmar la disponibilidad y
            preparar tu propuesta.
          </p>

          <div className="bot-cta-chips">
            {opciones.map((op) => (
              <button
                key={op}
                type="button"
                className="chip"
                onClick={() => openBalloonBot(`Quiero organizar ${op.toLowerCase()}`)}
              >
                {op}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => openBalloonBot()}
          >
            <span aria-hidden="true">🎈</span> Hablar con Balloonbot
          </button>
        </div>

        {/* Vista previa decorativa de una conversación */}
        <div className="bot-cta-preview" aria-hidden="true">
          <div className="preview-header">
            <span className="preview-avatar">🎈</span>
            <div>
              <strong>Balloonbot</strong>
              <small>Ballonette Eventos</small>
            </div>
          </div>
          <div className="preview-body">
            <div className="bubble bot">¡Hola! ¿Qué celebras? 🎉</div>
            <div className="bubble user">El cumpleaños de mi hija, cumple 5</div>
            <div className="bubble bot">¡Qué bonito! ¿Para qué fecha sería y en qué zona?</div>
            <div className="bubble user">El 14 de noviembre, en Madrid</div>
            <div className="bubble bot typing"><span></span><span></span><span></span></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BalloonCTA
