"""
BALLOONBOT: asistente de ventas de Ballonette Eventos.

La IA conversa con el cliente, pero los precios, las fotos, el consentimiento de datos
y el registro de la solicitud se hacen con "herramientas" (funciones de este archivo).
Así los precios siempre salen del catálogo (catalogo.py) y nunca se los inventa.
"""
import json
import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
from openai import OpenAI

import catalogo
from services.notificaciones import avisar_a_katherine, confirmar_al_cliente

load_dotenv()

chatbot_bp = Blueprint("chatbot", __name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODELO = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
CARPETA_SOLICITUDES = Path(__file__).resolve().parent.parent / "solicitudes"


# ======================= INSTRUCCIONES DEL BOT =======================

def instrucciones():
    dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
    ahora = datetime.now()
    hoy = f"{dias[ahora.weekday()]} {ahora.strftime('%d/%m/%Y')}"
    return f"""
Eres Balloonbot, el asistente virtual de Ballonette Eventos, una empresa de Madrid que diseña
decoraciones con globos para cumpleaños, baby showers, comuniones, bodas, eventos de empresa y
celebraciones especiales. La CEO es Katherine Gonzalez. Hoy es {hoy}.

MISIÓN
Atender con calidez, entender bien lo que quiere el cliente y preparar una estimación coherente y
rentable para que Katherine la revise. Nuestro público es de clase media y media-alta: vendemos
calidad, diseño y tranquilidad (nos encargamos de todo el montaje), no competimos por precio.
Katherine tiene siempre la última palabra sobre el precio y la disponibilidad.

ESTILO
- Español de España, tuteando, cálido, elegante y cercano. Algún emoji, sin exagerar.
- Mensajes cortos: 1 a 3 frases. Como mucho 1 o 2 preguntas cortas por mensaje.
- Nunca repitas una pregunta que ya tenga respuesta. Si el cliente da varios datos de golpe,
  apúntalos y salta esos pasos.
- Que no parezca un interrogatorio: comenta con naturalidad lo que te cuenta antes de preguntar.
- No pidas todos los datos personales al principio ni presiones para cerrar.
- Texto plano: nada de asteriscos, almohadillas ni listas con guiones.
- Usa el nombre del cliente de vez en cuando.

FLUJO DE LA CONVERSACIÓN (adáptalo, no lo recites)
1. Saludo: la web ya ha saludado y preguntado el nombre. Si el cliente responde con su nombre,
   contesta: "¡Encantado/a, [nombre]! Cuéntame, ¿qué tipo de decoración tienes en mente?" y puedes
   poner ejemplos: medio arco, arco completo, doble arco, decoración temática, photocall o algo premium.
2. Ocasión: qué se celebra. Si es cumpleaños infantil y hace falta para el estilo, si es niño o niña,
   y luego la edad que cumple. Pregunta el nombre del cumpleañero o cumpleañera solo cuando vaya a
   aparecer en la decoración.
3. Temática, personaje y colores. Detecta si hace falta algo especial: panel impreso con personaje
   (tematica_impresa), globo o figura especial (figura_especial), flores, neón, etc.
4. Tamaño y espacio: dónde se hace (casa, salón, restaurante, jardín, local...). Si piden algo grande
   (personalizado o premium), pide las medidas aproximadas o que envíen una foto del espacio a Katherine.
5. Fecha y hora. Nunca confirmes disponibilidad: dilo como "lo revisará Katherine".
6. Localidad y zona, para el transporte. No inventes distancias ni digas desde dónde salimos.
7. Presupuesto del cliente: pregúntalo con naturalidad. Si es bajo, sin hacerle sentir mal, propón
   una alternativa más sencilla que respete el mínimo. Nunca bajes precios.
8. Propuesta: con lo que sabes, recomienda UN paquete. Para esencial, celebracion y doble_impacto
   puedes usar mostrar_opciones (enseña los tres tamaños sin precios) y después mostrar_paquete con
   el recomendado. Luego usa calcular_presupuesto con el paquete, los extras que apliquen, la zona y
   los pendientes. Explica en una o dos frases por qué le conviene. Ofrece como mucho una mejora útil.
9. Contacto: cuando el cliente muestre interés, pide su teléfono (y email si quiere).
   Luego usa solicitar_consentimiento y espera a que acepte.
10. Cierre: con la aceptación, usa registrar_solicitud con todo lo que sepas. Después despídete así,
    con el total que devolvió la herramienta:
    "¡Muchas gracias, [nombre]! 🎈 Con lo que me has contado podemos preparar una propuesta para tu
    celebración. La estimación inicial es de [importe] €, pendiente de revisión y confirmación.
    Katherine, CEO de Ballonette Eventos, se pondrá en contacto contigo para revisar los detalles,
    confirmar la disponibilidad y concretar el presupuesto definitivo. ¡Nos encantará ayudarte a crear
    un evento inolvidable!"
    Si el presupuesto es "desde", di "a partir de [importe] €". No prometas plazos de respuesta.
    No hagas más preguntas después del cierre.

TARIFARIO (los importes salen SIEMPRE de calcular_presupuesto, nunca de cabeza)
{catalogo.texto_catalogo()}

CÓMO ELEGIR EL PAQUETE
- Medio arco → esencial (400 €). Arco completo → celebracion (500 €). Dos arcos → doble_impacto (600 €).
- Temática simple con un panel impreso en cartón pluma: paquete base + tematica_impresa (50 €).
  Ejemplo: Pack Esencial con temática = desde 450 €. Varios paneles o gran formato: añádelo a
  pendientes, no lo valores tú.
- Globo o figura especial de personaje: figura_especial (50 € orientativo) y queda pendiente de
  verificar el coste real. No confirmes un precio que no conoces.
- El Pack Celebración no incluye automáticamente paneles, pedestales extra, flores, mesas, luces
  especiales ni globos premium: si los piden, súmalos como extra si existe o ponlos en pendientes.
- Caballete o estructura de 1,60 m con panel e impresión de nombre, logo o personaje → personalizado
  (desde 900 €, ya incluye transporte y montaje).
- Varias estructuras, varias zonas, grandes salones o instalaciones complejas → premium (desde 1.000 €;
  referencias 1.000, 1.200 o 1.500 € o más). Sin medidas no hay precio definitivo.
- No dupliques conceptos: si algo ya va incluido en el paquete, no lo cobres otra vez.
- Lo que no esté en el tarifario (flores, mesas, telas, luces especiales...) va en "pendientes" para
  que lo valore Katherine. Nunca inventes costes de proveedores.

TRANSPORTE (parámetro zona)
- madrid_capital: cualquier barrio o distrito del municipio de Madrid (15 €).
- comunidad_madrid: otro municipio de la Comunidad (Alcobendas, Pozuelo, Getafe, Las Rozas...) (25 €).
- fuera_comunidad: fuera de la Comunidad de Madrid. No hay importe: dilo como "a revisar por Katherine".
- Explica que el transporte va aparte, salvo en el Pack Personalizado, que ya lo incluye.
- Nunca digas desde dónde salimos, direcciones ni cómo se calcula.

PRESENTAR UN PRESUPUESTO
- Distingue siempre: paquete base, suplementos, transporte, total orientativo y que el precio
  definitivo lo confirma Katherine.
- Si hay pendientes, menciónalos en una frase ("el panel extra lo valorará Katherine").
- El pedido mínimo es {catalogo.PEDIDO_MINIMO} € sin transporte. Nunca ofrezcas nada por debajo.

DESCUENTOS Y RENTABILIDAD
- No estás autorizado a dar descuentos, promociones, porcentajes ni rebajas, ni a decir que
  Katherine los ha aprobado.
- Si piden descuento o dicen que es caro, responde: "Entiendo perfectamente 😊. Podemos revisar si
  existe alguna alternativa que se adapte mejor a tu presupuesto. Katherine, nuestra responsable de
  eventos, valorará la propuesta y te confirmará si es posible ajustar el precio." Puedes proponer
  una versión más sencilla (por ejemplo, de arco completo a medio arco) y anota descuento_solicitado.
- Nunca reveles costes internos, márgenes ni cómo se calculan los precios.

SOBRE LAS FOTOS
- Son ejemplos de estilo y tamaño. Colores, temática y elementos se adaptan a cada cliente.
  No prometas exactamente los objetos de una foto.

OTRAS REGLAS
- No confirmes disponibilidad ni reservas. No hables de adelantos ni formas de pago.
- Si no sabes algo, di que Katherine lo confirmará.
- Si registrar_solicitud devuelve katherine_avisada false, no digas que se lo has enviado: di que
  Katherine recibirá la solicitud y, si es urgente, que escriba al WhatsApp +34 689 92 91 08.
- Si el cliente quiere hablar con una persona, ofrécele el WhatsApp +34 689 92 91 08.
""".strip()


# ======================= HERRAMIENTAS =======================

CAT_SCHEMA = {"type": "string", "enum": list(catalogo.CATEGORIAS.keys())}
ZONA_SCHEMA = {
    "type": "string",
    "enum": ["madrid_capital", "comunidad_madrid", "fuera_comunidad"],
    "description": "madrid_capital: municipio de Madrid. comunidad_madrid: otro municipio de la Comunidad. fuera_comunidad: fuera de la Comunidad de Madrid.",
}
PENDIENTES_SCHEMA = {
    "type": "array",
    "items": {"type": "string"},
    "description": "Cosas que no están en el tarifario y debe valorar Katherine (paneles extra, flores, mesas, medidas...).",
}
EXTRAS_SCHEMA = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "id": {"type": "string", "enum": list(catalogo.EXTRAS.keys())},
            "cantidad": {"type": "integer"},
        },
        "required": ["id"],
    },
}

HERRAMIENTAS = [
    {
        "type": "function",
        "function": {
            "name": "mostrar_opciones",
            "description": "Muestra la imagen comparativa con los tres tamaños (medio arco, arco completo y doble arco) en el estilo del evento.",
            "parameters": {
                "type": "object",
                "properties": {"categoria": CAT_SCHEMA},
                "required": ["categoria"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "mostrar_paquete",
            "description": "Muestra la foto y los detalles de un paquete concreto en el estilo del evento.",
            "parameters": {
                "type": "object",
                "properties": {
                    "paquete_id": {"type": "string", "enum": list(catalogo.PAQUETES.keys())},
                    "categoria": CAT_SCHEMA,
                },
                "required": ["paquete_id", "categoria"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calcular_presupuesto",
            "description": "Calcula la estimación con el tarifario y se la muestra al cliente. Úsala siempre que des un precio.",
            "parameters": {
                "type": "object",
                "properties": {
                    "paquete_id": {"type": "string", "enum": list(catalogo.PAQUETES.keys())},
                    "extras": EXTRAS_SCHEMA,
                    "zona": ZONA_SCHEMA,
                    "personas_catering": {"type": "integer", "description": "Personas para el catering, si lo pide."},
                    "pendientes": PENDIENTES_SCHEMA,
                },
                "required": ["paquete_id", "zona"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "solicitar_consentimiento",
            "description": "Muestra al cliente la casilla para aceptar el uso de sus datos personales. Úsala antes de registrar la solicitud.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "registrar_solicitud",
            "description": "Guarda la solicitud y avisa a Katherine con el resumen interno. Solo cuando el cliente haya aceptado el uso de sus datos.",
            "parameters": {
                "type": "object",
                "properties": {
                    "nombre": {"type": "string", "description": "Nombre de la persona con quien hablas"},
                    "telefono": {"type": "string"},
                    "email": {"type": "string"},
                    "tipo_evento": {"type": "string"},
                    "tipo_decoracion": {"type": "string", "description": "Lo que pidió: medio arco, arco completo, temática, photocall..."},
                    "fecha": {"type": "string"},
                    "hora": {"type": "string"},
                    "lugar": {"type": "string", "description": "Localidad y barrio o zona"},
                    "zona": ZONA_SCHEMA,
                    "espacio": {"type": "string", "description": "Casa, salón, restaurante, jardín..."},
                    "dimensiones": {"type": "string"},
                    "invitados": {"type": "integer"},
                    "presupuesto_cliente": {"type": "string", "description": "Presupuesto máximo que indicó el cliente"},
                    "descuento_solicitado": {"type": "string", "description": "Si pidió descuento o dijo que era caro, qué dijo"},
                    "paquete_id": {"type": "string", "enum": list(catalogo.PAQUETES.keys())},
                    "extras": EXTRAS_SCHEMA,
                    "personas_catering": {"type": "integer"},
                    "pendientes": PENDIENTES_SCHEMA,
                    "categoria": CAT_SCHEMA,
                    "tematica": {"type": "string"},
                    "colores": {"type": "string"},
                    "nombre_homenajeado": {"type": "string", "description": "Nombre del cumpleañero/a, del bebé o de los novios, si va en la decoración"},
                    "edad": {"type": "string"},
                    "texto_cartel": {"type": "string"},
                    "empresa": {"type": "string"},
                    "notas": {"type": "string", "description": "Otras peticiones especiales"},
                },
                "required": ["nombre", "fecha", "lugar", "zona", "paquete_id"],
            },
        },
    },
]


def _presupuesto_desde(args):
    return catalogo.calcular_presupuesto(
        paquete_id=args.get("paquete_id"),
        extras=args.get("extras") or [],
        zona=args.get("zona") or "madrid_capital",
        personas_catering=args.get("personas_catering") or 0,
        pendientes=args.get("pendientes") or [],
    )


def _euros(importe):
    return "a confirmar" if importe is None else f"{importe} €"


def _guardar_solicitud(solicitud):
    """Guarda cada solicitud en un archivo (backend/solicitudes/solicitudes.jsonl).

    En Vercel no se pueden guardar archivos de forma permanente: ahí la solicitud
    llega por email a Katherine (y más adelante se guardará en Google Sheets).
    """
    try:
        CARPETA_SOLICITUDES.mkdir(exist_ok=True)
        with open(CARPETA_SOLICITUDES / "solicitudes.jsonl", "a", encoding="utf-8") as archivo:
            archivo.write(json.dumps(solicitud, ensure_ascii=False) + "\n")
    except OSError as error:
        print(f"[balloonbot] No se pudo guardar en archivo (normal en Vercel): {error}")
    print("[balloonbot] Nueva solicitud: " + json.dumps(solicitud, ensure_ascii=False))


def ejecutar_herramienta(nombre, args, estado):
    """Ejecuta una herramienta. Devuelve el resultado para la IA y añade tarjetas para la web."""
    if nombre == "mostrar_opciones":
        categoria = args.get("categoria")
        if categoria not in catalogo.CATEGORIAS:
            return {"error": "Categoría no encontrada"}
        estado["tarjetas"].append({
            "tipo": "opciones",
            "categoria": categoria,
            "paquetes": [
                {"id": pid, "nombre": catalogo.PAQUETES[pid]["nombre"], "medidas": catalogo.PAQUETES[pid]["medidas"]}
                for pid in catalogo.PAQUETES_COMPARATIVA
            ],
        })
        estado["memoria"].append(f"[Se mostraron las tres opciones de estilo {categoria}]")
        return {"ok": True, "nota": "El cliente ya ve los tres tamaños con foto. Recomienda uno."}

    if nombre == "mostrar_paquete":
        paquete = catalogo.PAQUETES.get(args.get("paquete_id"))
        if not paquete:
            return {"error": "Paquete no encontrado"}
        categoria = args.get("categoria") if args.get("categoria") in catalogo.CATEGORIAS else None
        estado["tarjetas"].append({"tipo": "paquete", "id": args["paquete_id"], "categoria": categoria, **paquete})
        estado["memoria"].append(f"[Se mostró el {paquete['nombre']}]")
        return {"ok": True, "mostrado": paquete}

    if nombre == "calcular_presupuesto":
        presupuesto = _presupuesto_desde(args)
        if presupuesto["cumple_minimo"] and not presupuesto["errores"]:
            estado["tarjetas"].append({"tipo": "presupuesto", **presupuesto})
            estado["memoria"].append(
                "[Presupuesto mostrado: "
                + ", ".join(f"{l['concepto']} {_euros(l['importe'])}" for l in presupuesto["lineas"])
                + f". Total orientativo {'desde ' if presupuesto['desde'] else ''}{presupuesto['total']} €"
                + (". Pendiente: " + "; ".join(presupuesto["pendientes"]) if presupuesto["pendientes"] else "")
                + "]"
            )
        return presupuesto

    if nombre == "solicitar_consentimiento":
        if estado["consentimiento"]:
            return {"ok": True, "ya_aceptado": True}
        estado["tarjetas"].append({"tipo": "consentimiento"})
        return {"ok": True, "nota": "Se ha mostrado la casilla. Pide al cliente que la acepte para continuar."}

    if nombre == "registrar_solicitud":
        if not estado["consentimiento"]:
            estado["tarjetas"].append({"tipo": "consentimiento"})
            return {"error": "El cliente todavía no ha aceptado el uso de sus datos. Pídele que marque la casilla."}

        # Comprobar que no falte nada importante antes de guardar
        faltan = [c for c in ("nombre", "fecha", "lugar") if not args.get(c)]
        if not args.get("telefono") and not args.get("email"):
            faltan.append("teléfono o email de contacto")
        if not args.get("paquete_id"):
            faltan.append("qué opción le interesa")
        if faltan:
            return {"error": "Antes de registrar, pregunta al cliente (máximo 2 cosas por mensaje): " + ", ".join(faltan)}

        presupuesto = _presupuesto_desde(args)
        solicitud = {
            "fecha_registro": datetime.now().isoformat(timespec="seconds"),
            "nombre": args.get("nombre"),
            "telefono": args.get("telefono"),
            "email": args.get("email"),
            "tipo_evento": args.get("tipo_evento"),
            "tipo_decoracion": args.get("tipo_decoracion"),
            "fecha": args.get("fecha"),
            "hora": args.get("hora"),
            "lugar": args.get("lugar"),
            "zona": {"madrid_capital": "Madrid capital", "comunidad_madrid": "Comunidad de Madrid",
                     "fuera_comunidad": "Fuera de la Comunidad"}.get(args.get("zona")),
            "espacio": args.get("espacio"),
            "dimensiones": args.get("dimensiones"),
            "invitados": args.get("invitados"),
            "presupuesto_cliente": args.get("presupuesto_cliente"),
            "descuento_solicitado": args.get("descuento_solicitado"),
            "paquete": catalogo.PAQUETES.get(args.get("paquete_id"), {}).get("nombre"),
            "estilo": catalogo.CATEGORIAS.get(args.get("categoria")),
            "tematica": args.get("tematica"),
            "colores": args.get("colores"),
            "nombre_homenajeado": args.get("nombre_homenajeado"),
            "edad": args.get("edad"),
            "texto_cartel": args.get("texto_cartel"),
            "empresa": args.get("empresa"),
            "notas": args.get("notas"),
            "total_estimado": presupuesto["total"],
            "total_desde": presupuesto["desde"],
            "pendientes": presupuesto["pendientes"],
            "consentimiento_datos": True,
        }

        _guardar_solicitud(solicitud)
        aviso_ok = avisar_a_katherine(solicitud, presupuesto)
        email_cliente_ok = confirmar_al_cliente(solicitud, presupuesto)

        estado["tarjetas"].append({"tipo": "presupuesto", "titulo": "Tu estimación inicial", **presupuesto})
        estado["tarjetas"].append({"tipo": "confirmacion", "nombre": solicitud["nombre"]})
        estado["terminado"] = True
        estado["memoria"].append("[Solicitud registrada y enviada a Katherine]")
        return {
            "ok": True,
            "katherine_avisada": aviso_ok,
            "email_cliente_enviado": email_cliente_ok,
            "total_orientativo": presupuesto["total"],
            "es_desde": presupuesto["desde"],
        }

    return {"error": f"Herramienta desconocida: {nombre}"}


# ======================= RUTA DEL CHAT =======================

@chatbot_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    mensaje = (data.get("message") or "").strip()
    historial = data.get("history", [])[-30:]

    estado = {
        "tarjetas": [],
        "memoria": [],
        "terminado": False,
        "consentimiento": data.get("consent") is True,
    }

    mensajes = [{"role": "system", "content": instrucciones()}]
    for m in historial:
        rol = "assistant" if m.get("sender") == "bot" else "user"
        texto = m.get("text") or ""
        if m.get("memo"):
            texto = f"{texto}\n{m['memo']}"
        if texto:
            mensajes.append({"role": rol, "content": texto})
    mensajes.append({"role": "user", "content": mensaje})

    try:
        # La IA puede usar varias herramientas seguidas antes de responder
        for _ in range(5):
            respuesta = client.chat.completions.create(
                model=MODELO,
                messages=mensajes,
                tools=HERRAMIENTAS,
                temperature=0.5,
            )
            msg = respuesta.choices[0].message

            if not msg.tool_calls:
                texto = (msg.content or "").replace("**", "").strip()
                break

            mensajes.append(msg.model_dump(exclude_none=True))
            for llamada in msg.tool_calls:
                try:
                    args = json.loads(llamada.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = {}
                resultado = ejecutar_herramienta(llamada.function.name, args, estado)
                mensajes.append({
                    "role": "tool",
                    "tool_call_id": llamada.id,
                    "content": json.dumps(resultado, ensure_ascii=False),
                })
        else:
            texto = "Perdona, me he liado un poco. ¿Me lo repites?"

    except Exception as error:
        print(f"[balloonbot] Error: {error}")
        return jsonify({"error": "No se pudo generar la respuesta"}), 500

    return jsonify({
        "reply": texto,
        "cards": estado["tarjetas"],
        "memo": " ".join(estado["memoria"]),
        "done": estado["terminado"],
    })
