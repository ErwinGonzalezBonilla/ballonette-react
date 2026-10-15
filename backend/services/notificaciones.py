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
from email.mime.image import MIMEImage
import base64
import json
import urllib.request
from urllib.parse import quote


def _configurado():
    return bool(os.getenv("EMAIL_USER") and os.getenv("EMAIL_PASSWORD"))


def _enviar(destinatario, asunto, cuerpo_html, responder_a=None, imagen=None):
    if not _configurado():
        print(f"[email] Sin configurar. No se envía: {asunto} -> {destinatario}")
        return False

    usuario = os.getenv("EMAIL_USER")
    mensaje = MIMEMultipart("mixed")
    mensaje["Subject"] = asunto
    mensaje["From"] = f"Ballonette Eventos <{usuario}>"
    mensaje["To"] = destinatario
    if responder_a:
        mensaje["Reply-To"] = responder_a
    mensaje.attach(MIMEText(cuerpo_html, "html", "utf-8"))
    if imagen:
        try:
            cabecera, datos = imagen.split(",", 1)
            subtipo = cabecera.split("/")[1].split(";")[0]
            adjunto = MIMEImage(base64.b64decode(datos), _subtype=subtipo)
            adjunto.add_header("Content-Disposition", "attachment", filename=f"foto-referencia.{subtipo.replace('jpeg', 'jpg')}")
            mensaje.attach(adjunto)
        except Exception as error:
            print(f"[email] No se pudo adjuntar la foto: {error}")

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
        f"<td style='padding:6px 0;text-align:right'>{'a confirmar' if l['importe'] is None else str(l['importe']) + ' €'}</td></tr>"
        for l in presupuesto["lineas"]
    )
    desde = "desde " if presupuesto.get("desde") else ""
    pendientes = "".join(f"<li>{html.escape(p)}</li>" for p in presupuesto.get("pendientes") or [])
    bloque_pendientes = (
        f"<p style='font-size:13px;margin:12px 0 0'><strong>Pendiente de revisar:</strong></p><ul style='font-size:13px;margin:4px 0'>{pendientes}</ul>"
        if pendientes else ""
    )
    return (
        "<table style='width:100%;border-collapse:collapse;font-size:15px'>"
        f"{filas}"
        "<tr><td style='padding-top:10px;border-top:1px solid #eee'><strong>Total orientativo</strong></td>"
        f"<td style='padding-top:10px;border-top:1px solid #eee;text-align:right'><strong>{'a confirmar' if presupuesto['total'] is None else f"{desde}{presupuesto['total']} €"}</strong></td></tr>"
        "</table>"
        f"{bloque_pendientes}"
    )


def _marco(contenido):
    return (
        "<div style='font-family:Arial,sans-serif;background:#fdf1f3;padding:24px'>"
        "<div style='max-width:560px;margin:auto;background:#fff;border-radius:16px;padding:28px;color:#3b2a32'>"
        "<h2 style='margin:0 0 4px;color:#e91e63'>Ballonette Eventos</h2>"
        f"{contenido}"
        "</div></div>"
    )


def email_katherine(solicitud, presupuesto):
    """Devuelve (asunto, html) del aviso a Katherine con todos los datos del pedido."""
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
        f"<p style='margin-top:0'>🎈 <strong>Nueva solicitud desde Balloonbot</strong> · {s['pedido_id']}</p>"
        f"<p><strong>Cliente:</strong> {s['nombre']}<br>📞 {s['telefono']}<br>✉️ {s['email']}</p>"
        f"<p><strong>Evento:</strong> {s['tipo_evento']}<br>"
        f"<strong>Fecha:</strong> {s['fecha']} · <strong>Hora:</strong> {s['hora']}<br>"
        f"<strong>Lugar:</strong> {s['lugar']} ({s['zona']})<br>"
        f"<strong>Espacio:</strong> {s['espacio']} · <strong>Medidas:</strong> {s['dimensiones']}<br>"
        f"<strong>Invitados:</strong> {s['invitados']}</p>"
        f"<p><strong>Presupuesto máximo del cliente:</strong> {s['presupuesto_cliente']}<br>"
        f"<strong>Pidió descuento:</strong> {s['descuento_solicitado']}</p>"
        "<p><strong>Diseño</strong><br>"
        f"Lo que pidió: {s['tipo_decoracion']}<br>"
        f"Paquete base: {s['paquete']} · Estilo: {s['estilo']}<br>"
        f"Extras: {s['extras']}<br>"
        f"Temática: {s['tematica']} · Colores: {s['colores']}<br>"
        f"Cumpleañero/a, bebé o novios: {s['nombre_homenajeado']} · Edad: {s['edad']}<br>"
        f"Texto del cartel: {s['texto_cartel']}<br>"
        f"Empresa: {s['empresa']}</p>"
        f"<p><strong>Notas:</strong> {s['notas']}<br>"
        f"<strong>Foto de referencia:</strong> {s['foto_referencia']}</p>"
        f"{_tabla_presupuesto(presupuesto)}"
        f"{boton_wa}"
        "<p style='font-size:13px;color:#8a7680'>Estimación orientativa del bot. Revisa costes pendientes, disponibilidad y precio definitivo antes de confirmar.</p>"
    )
    asunto = (f"🎈 Nueva solicitud {solicitud.get('pedido_id') or ''}: "
              f"{solicitud.get('tipo_evento') or 'evento'} – {solicitud.get('nombre') or ''} – {solicitud.get('fecha') or ''}")
    return asunto, _marco(contenido)


def avisar_a_katherine(solicitud, presupuesto, imagen=None):
    destino = os.getenv("EMAIL_AVISOS") or os.getenv("EMAIL_USER")
    if not destino:
        print("[email] Sin configurar. No se avisa a Katherine (la solicitud queda guardada).")
        return False
    asunto, cuerpo = email_katherine(solicitud, presupuesto)
    return _enviar(destino, asunto, cuerpo, responder_a=solicitud.get("email") or None, imagen=imagen)


def email_cliente(solicitud, presupuesto):
    """Devuelve (asunto, html) de la confirmación al cliente."""
    nombre = html.escape(solicitud.get("nombre") or "")
    contenido = (
        f"<p style='margin-top:0'>¡Hola {nombre}! 💖</p>"
        "<p>Hemos recibido tu solicitud y <strong>Katherine ya está al tanto</strong>. "
        "Te responderá en breve para revisar los detalles contigo. Gracias por confiar en nosotros "
        "para tu celebración.</p>"
        f"<p><strong>Evento:</strong> {html.escape(solicitud.get('tipo_evento') or '')}<br>"
        f"<strong>Fecha:</strong> {html.escape(solicitud.get('fecha') or '')}<br>"
        f"<strong>Lugar:</strong> {html.escape(solicitud.get('lugar') or '')}</p>"
        f"{_tabla_presupuesto(presupuesto)}"
        "<p style='font-size:13px;color:#8a7680'>Esta estimación es orientativa: Katherine confirmará "
        "la disponibilidad y el presupuesto definitivo.</p>"
        "<p>¿Tienes alguna duda? Escríbenos por WhatsApp al +34 689 92 91 08.</p>"
        "<p style='margin-bottom:0'>Con cariño,<br><strong>Ballonette Eventos</strong></p>"
    )
    return f"Hemos recibido tu solicitud {solicitud.get('pedido_id') or ''} 🎈 Ballonette Eventos", _marco(contenido)


def confirmar_al_cliente(solicitud, presupuesto):
    email = solicitud.get("email")
    if not email:
        return False
    asunto, cuerpo = email_cliente(solicitud, presupuesto)
    return _enviar(email, asunto, cuerpo, responder_a=os.getenv("EMAIL_AVISOS") or os.getenv("EMAIL_USER"))


# ======================= n8n =======================

ESTADO_INICIAL = "Nuevo"


def _enlace_whatsapp(solicitud):
    telefono = re.sub(r"\D", "", solicitud.get("telefono") or "")
    if telefono and not telefono.startswith("34") and len(telefono) == 9:
        telefono = "34" + telefono
    return f"https://wa.me/{telefono}" if telefono else ""


def fila_hoja(solicitud, presupuesto):
    """Fila para la hoja "Pedidos" de Google Sheets. Los nombres = cabeceras de la hoja."""
    def t(clave):
        valor = solicitud.get(clave)
        return "" if valor is None else str(valor)

    return {
        "ID": t("pedido_id"),
        "Fecha registro": t("fecha_registro"),
        "Estado": ESTADO_INICIAL,
        "Cliente": t("nombre"),
        "Teléfono": t("telefono"),
        "Email": t("email"),
        "WhatsApp": _enlace_whatsapp(solicitud),
        "Tipo de evento": t("tipo_evento"),
        "Fecha evento": t("fecha"),
        "Hora": t("hora"),
        "Lugar": t("lugar"),
        "Zona": t("zona"),
        "Espacio": t("espacio"),
        "Medidas": t("dimensiones"),
        "Invitados": t("invitados"),
        "Lo que pidió": t("tipo_decoracion"),
        "Paquete": t("paquete"),
        "Extras": t("extras"),
        "Temática": t("tematica"),
        "Colores": t("colores"),
        "Homenajeado": t("nombre_homenajeado"),
        "Edad": t("edad"),
        "Texto cartel": t("texto_cartel"),
        "Empresa": t("empresa"),
        "Total orientativo (€)": presupuesto.get("total"),
        "Precio desde": "Sí" if presupuesto.get("desde") else "No",
        "Pendiente de revisar": "; ".join(presupuesto.get("pendientes") or []),
        "Presupuesto del cliente": t("presupuesto_cliente"),
        "Pidió descuento": t("descuento_solicitado"),
        "Foto de referencia": "Sí (en el email)" if solicitud.get("foto_referencia") else "No",
        "Notas del cliente": t("notas"),
    }

def _enviar_a_n8n(solicitud, presupuesto, imagen):
    """Manda la solicitud al flujo de n8n, que envía los dos emails.

    Devuelve (katherine_avisada, cliente_avisado) o None si n8n no respondió bien.
    """
    asunto_k, html_k = email_katherine(solicitud, presupuesto)
    asunto_c, html_c = email_cliente(solicitud, presupuesto)
    datos = {
        "solicitud": solicitud,
        "presupuesto": presupuesto,
        "email_katherine": os.getenv("EMAIL_AVISOS") or "katherinegonzalez32@gmail.com",
        "asunto_katherine": asunto_k,
        "html_katherine": html_k,
        "email_cliente": solicitud.get("email") or "",
        "asunto_cliente": asunto_c,
        "html_cliente": html_c,
        "foto_referencia": imagen or "",
        "fila": fila_hoja(solicitud, presupuesto),
    }
    peticion = urllib.request.Request(
        os.getenv("N8N_WEBHOOK_URL"),
        data=json.dumps(datos, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "X-Ballonette-Token": os.getenv("N8N_TOKEN", ""),
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(peticion, timeout=25) as respuesta:
            cuerpo = json.loads(respuesta.read().decode("utf-8") or "{}")
        print(f"[n8n] Solicitud enviada: {cuerpo}")
        return True, bool(solicitud.get("email"))
    except Exception as error:
        print(f"[n8n] Error enviando la solicitud: {error}")
        return None


def enviar_solicitud(solicitud, presupuesto, imagen=None):
    """Avisa a Katherine y confirma al cliente.

    Si N8N_WEBHOOK_URL está configurado lo hace n8n; si falla o no está, se usa Gmail directo.
    Devuelve (katherine_avisada, cliente_avisado).
    """
    if os.getenv("N8N_WEBHOOK_URL"):
        resultado = _enviar_a_n8n(solicitud, presupuesto, imagen)
        if resultado:
            return resultado
    return (
        avisar_a_katherine(solicitud, presupuesto, imagen=imagen),
        confirmar_al_cliente(solicitud, presupuesto),
    )
