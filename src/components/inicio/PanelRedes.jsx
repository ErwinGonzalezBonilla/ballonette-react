import { INSTAGRAM, INSTAGRAM_USUARIO, TIKTOK, WHATSAPP, WHATSAPP_TEXTO } from "./datos"
import { IconoGlobo, IconoInstagram, IconoTiktok, IconoWhatsapp } from "./Iconos"
import { openBalloonBot } from "../../utils/balloonbot"

function PanelRedes() {
  return (
    <section className="redes-panel" aria-label="Redes sociales">
      <div className={`contenedor ${TIKTOK ? "con-tiktok" : ""}`}>
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"><IconoInstagram /><strong>Instagram</strong><span>{INSTAGRAM_USUARIO}</span></a>
        {TIKTOK && (
          <a href={TIKTOK} target="_blank" rel="noopener noreferrer"><IconoTiktok /><strong>TikTok</strong><span>Montajes en vídeo</span></a>
        )}
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"><IconoWhatsapp /><strong>WhatsApp</strong><span>{WHATSAPP_TEXTO}</span></a>
        <button type="button" onClick={() => openBalloonBot()}><IconoGlobo /><strong>Balloonbot</strong><span>Tu presupuesto en 2 minutos</span></button>
      </div>
    </section>
  )
}

export default PanelRedes
