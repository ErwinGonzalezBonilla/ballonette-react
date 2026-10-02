// Abre Balloonbot desde cualquier parte de la web.
// Si se pasa un mensaje, el bot lo envía automáticamente al abrirse.
export function openBalloonBot(message) {
  window.dispatchEvent(
    new CustomEvent("balloonbot:open", { detail: { message } })
  )
}
