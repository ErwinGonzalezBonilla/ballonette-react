"""
Envío de emails cuando Balloonbot registra una solicitud.

Usa Gmail. Necesita en backend/.env:
  EMAIL_USER=katherinegonzalez32@gmail.com
  EMAIL_PASSWORD=contraseña de aplicación de Gmail (16 letras)
  EMAIL_AVISOS=katherinegonzalez32@gmail.com   (a quién llegan los avisos)

Si no están configurados, no se envía nada pero la solicitud se guarda igualmente.
"""
import os
import re
import smtplib
import html
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from urllib.parse import quote


def _configurado():
    return bool(os.getenv("EMAIL_USER") and os.getenv("EMAIL_PASSWORD"))


def _enviar(destinatario, asunto, cuerpo_html, responder_a=None):
    if not _configurado():
        print(f"[email] Sin configurar. No se envía: {asunto} -> {destinatario}")
        return False

    usuario = os.getenv("EMAIL_USER")
    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = asunto
    mensaje["From"] = f"Ballonette Eventos <{usuario}>"
    mensaje["To"] = destinatario
    if responder_a:
        mensaje["Reply-To"] = responder_a
    mensaje.attach(MIMEText(cuerpo_html, "html", "utf-8"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=20) as servidor:
            servidor.login(usuario, os.getenv("EMAIL_PASSWORD"))
            servidor.send_message(mensaje)
        print(f"[email] Enviado: {asunto} -> {destinatario}")
        return True
    except Exception as error:
        print(f"[email] Error enviando a {destinatario}: {error}")
        return False


def _tabla_presupuesto(presupuesto):
    filas = "".join(
        f"<tr><td style='padding:6px 0'>{html.escape(l['concepto'])}</td>"
        f"<td style='padding:6px 0;text-align:right'>{l['importe']} €</td></tr>"
        for l in presupuesto["lineas"]
    )
    return (
        "<table style='width:100%;border-collapse:collapse;font-size:15px'>"
        f"{filas}"
        "<tr><td style='padding-top:10px;border-top:1px solid #eee'><strong>Total estimado</strong></td>"
        f"<td style='padding-top:10px;border-top:1px solid #eee;text-align:right'><strong>{presupuesto['total']} €</strong></td></tr>"
        "</table>"
    )


def _marco(contenido):
    return (
        "<div style='font-family:Arial,sans-serif;background:#fdf1f3;padding:24px'>"
        "<div style='max-width:560px;margin:auto;background:#fff;border-radius:16px;padding:28px;color:#3b2a32'>"
        "<h2 style='margin:0 0 4px;color:#e91e63'>Ballonette Eventos</h2>"
        f"{contenido}"
        "</div></div>"
    )


def avisar_a_katherine(solicitud, presupuesto):
    destino = os.getenv("EMAIL_AVISOS") or os.getenv("EMAIL_USER")
    if not destino:
        print("[email] Sin configurar. No se avisa a Katherine (la solicitud queda guardada).")
        return False

    class _Datos(dict):
        def __missing__(self, clave):
            return "—"

    s = _Datos({k: html.escape(str(v or "—")) for k, v in solicitud.items()})
    telefono = re.sub(r"\D", "", solicitud.get("telefono") or "")
    if telefono and not telefono.startswith("34") and len(telefono) == 9:
        telefono = "34" + telefono
    texto_wa = quote(
        f"Hola {solicitud.get('nombre', '')}, soy Katherine de Ballonette Eventos. "
        f"Recibí tu solicitud para el {solicitud.get('fecha', '')}. "
    )
    boton_wa = (
        f"<p><a href='https://wa.me/{telefono}?text={texto_wa}' "
        "style='display:inline-block;background:#25d366;color:#fff;padding:12px 20px;"
        "border-radius:999px;text-decoration:none;font-weight:bold'>Responder por WhatsApp</a></p>"
        if telefono else ""
    )

    contenido = (
        "<p style='margin-top:0'>🎈 <strong>Nueva solicitud desde Balloonbot</strong></p>"
        f"<p><strong>Responsable:</strong> {s['nombre']}<br>📞 {s['telefono']}<br>✉️ {s['email']}</p>"
        f"<p><strong>Evento:</strong> {s['tipo_evento']}<br>"
        f"<strong>Fecha:</strong> {s['fecha']} · <strong>Hora:</strong> {s['hora']}<br>"
        f"<strong>Lugar:</strong> {s['lugar']}<br>"
        f"<strong>Invitados:</strong> {s['invitados']}<br>"
        f"<strong>Presupuesto del cliente:</strong> {s['presupuesto_cliente']}</p>"
        "<p><strong>Personalización</strong><br>"
        f"Paquete: {s['paquete']} · Estilo: {s['estilo']}<br>"
        f"Temática: {s['tematica']} · Colores: {s['colores']}<br>"
        f"Cumpleañero/a, bebé o novios: {s['nombre_homenajeado']} · Edad: {s['edad']}<br>"
        f"Texto del cartel: {s['texto_cartel']}<br>"
        f"Empresa: {s['empresa']}</p>"
        f"<p><strong>Notas:</strong> {s['notas']}</p>"
        f"{_tabla_presupuesto(presupuesto)}"
        f"{boton_wa}"
        "<p style='font-size:13px;color:#8a7680'>Recuerda confirmar la disponibilidad con el cliente.</p>"
    )
    return _enviar(
        destino,
        f"🎈 Nueva solicitud: {solicitud.get('tipo_evento', '')} – {solicitud.get('nombre', '')}",
        _marco(contenido),
        responder_a=solicitud.get("email") or None,
    )


def confirmar_al_cliente(solicitud, presupuesto):
    email = solicitud.get("email")
    if not email:
        return False

    nombre = html.escape(solicitud.get("nombre") or "")
    contenido = (
        f"<p style='margin-top:0'>¡Hola {nombre}! 💖</p>"
        "<p>Hemos recibido tu solicitud. Gracias por confiar en nosotros para tu celebración.</p>"
        f"<p><strong>Evento:</strong> {html.escape(solicitud.get('tipo_evento') or '')}<br>"
        f"<strong>Fecha:</strong> {html.escape(solicitud.get('fecha') or '')}<br>"
        f"<strong>Lugar:</strong> {html.escape(solicitud.get('lugar') or '')}</p>"
        f"{_tabla_presupuesto(presupuesto)}"
        "<p>Katherine revisará la disponibilidad para tu fecha y te escribirá muy pronto "
        "para confirmar los detalles. Este presupuesto es orientativo hasta su confirmación.</p>"
        "<p>¿Tienes alguna duda? Escríbenos por WhatsApp al +34 689 92 91 08.</p>"
        "<p style='margin-bottom:0'>Con cariño,<br><strong>Ballonette Eventos</strong></p>"
    )
    return _enviar(
        email,
        "Hemos recibido tu solicitud 🎈 Ballonette Eventos",
        _marco(contenido),
        responder_a=os.getenv("EMAIL_AVISOS") or os.getenv("EMAIL_USER"),
    )
