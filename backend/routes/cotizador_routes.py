"""
COTIZADOR GUIADO DE BALLOONBOT
==============================
El chat de la web va pidiendo los datos con botones y fotos. Estas rutas le dan:
  GET  /catalogo     -> paquetes, extras y fotos para pintar los botones
  POST /presupuesto  -> el presupuesto calculado con catalogo.py (nunca lo calcula la IA)
  POST /solicitud    -> registra la solicitud y avisa a Katherine (email / n8n / hoja)
Las preguntas libres y las fotos de referencia siguen yendo a /chat (modo "guiado").
"""
from flask import Blueprint, jsonify, request

import catalogo
from routes.chatbot_routes import _imagen_valida, _presupuesto_desde, ejecutar_herramienta

cotizador_bp = Blueprint("cotizador", __name__)

CAMPOS_SOLICITUD = (
    "nombre", "telefono", "email", "tipo_evento", "tipo_decoracion", "fecha", "hora", "lugar",
    "zona", "espacio", "dimensiones", "invitados", "presupuesto_cliente", "descuento_solicitado",
    "paquete_id", "extras", "personas_catering", "pendientes", "categoria", "tematica", "colores",
    "nombre_homenajeado", "edad", "texto_cartel", "empresa", "notas",
)


@cotizador_bp.route("/catalogo", methods=["GET"])
def ver_catalogo():
    return jsonify({
        "paquetes": [{"id": pid, **p} for pid, p in catalogo.PAQUETES.items()],
        "comparativa": catalogo.PAQUETES_COMPARATIVA,
        "extras": [{"id": eid, **e} for eid, e in catalogo.EXTRAS.items()],
        "elementos": [{"id": eid, **e} for eid, e in catalogo.ELEMENTOS.items()],
        "pedido_minimo": catalogo.PEDIDO_MINIMO,
        "transporte": {
            "madrid_capital": catalogo.TRANSPORTE_ZONA,
            "comunidad_madrid": catalogo.TRANSPORTE_FUERA_ZONA,
        },
    })


@cotizador_bp.route("/presupuesto", methods=["POST"])
def ver_presupuesto():
    return jsonify(_presupuesto_desde(request.get_json() or {}))


@cotizador_bp.route("/solicitud", methods=["POST"])
def enviar_solicitud_guiada():
    data = request.get_json() or {}
    if data.get("consent") is not True:
        return jsonify({"ok": False, "error": "Falta aceptar el uso de los datos."}), 400

    estado = {
        "referencia": _imagen_valida(data.get("reference_image")),
        "tarjetas": [],
        "memoria": [],
        "terminado": False,
        "consentimiento": True,
    }
    args = {c: data.get(c) for c in CAMPOS_SOLICITUD if data.get(c) not in (None, "", [])}
    resultado = ejecutar_herramienta("registrar_solicitud", args, estado)
    if not resultado.get("ok"):
        return jsonify({"ok": False, "error": resultado.get("error")}), 400

    presupuesto = next((t for t in estado["tarjetas"] if t.get("tipo") == "presupuesto"), None)
    return jsonify({**resultado, "presupuesto": presupuesto})
