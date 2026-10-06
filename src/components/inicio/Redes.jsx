import { INSTAGRAM, TIKTOK, WHATSAPP } from "./datos"
import { IconoInstagram, IconoTiktok, IconoWhatsapp } from "./Iconos"

// Iconos redondos de redes sociales
function Redes({ className = "redes" }) {
  return (
    <div className={className}>
      <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconoInstagram /></a>
      {TIKTOK && (
        <a href={TIKTOK} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><IconoTiktok /></a>
      )}
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><IconoWhatsapp /></a>
    </div>
  )
}

export default Redes
