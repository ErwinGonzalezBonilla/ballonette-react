import { WHATSAPP } from "./datos"
import { openBalloonBot } from "../../utils/balloonbot"

function Contacto() {
  return (
    <section id="contacto">
      <div className="contenedor contacto">
        <div>
          <span className="kicker">Reserva tu fecha</span>
          <h2 className="h-xl">¿Hablamos de tu evento?</h2>
          <p>
            Balloonbot te pregunta lo justo y te enseña opciones con foto. Después, Katherine te confirma la
            disponibilidad y cierra contigo los detalles.
          </p>
          <div className="contacto__acciones">
            <button type="button" className="btn btn--rosa" onClick={() => openBalloonBot()}>🎈 Hablar con Balloonbot</button>
            <a className="btn btn--borde" href={WHATSAPP} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>
          </div>
        </div>

        {/* Vista previa decorativa del chat */}
        <div className="chat-vista" aria-hidden="true">
          <div className="chat-vista__cab"><span>🎈</span>Balloonbot</div>
          <div className="msg b">¡Hola! Soy Balloonbot 🎈 ¿Qué estás celebrando y cómo te llamas?</div>
          <div className="chips"><span>Cumpleaños</span><span>Baby shower</span><span>Boda</span><span>Empresa</span></div>
          <div className="msg u">El cumple de mi hija Lucía, soy Ana</div>
          <div className="msg b">¡Qué ilusión, Ana! ¿Para qué fecha sería, en qué zona y cuántos invitados?</div>
        </div>
      </div>
    </section>
  )
}

export default Contacto
