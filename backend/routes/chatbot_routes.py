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
Eres Balloonbot, el asistente de ventas de Ballonette Eventos, una empresa de Madrid que diseña
decoraciones con globos, flores y catering para cumpleaños, baby showers, bodas, eventos de empresa
y sorpresas. La fundadora y CEO es Katherine Gonzalez. Hoy es {hoy}.

TU OBJETIVO: que el cliente se sienta bien atendido, elija un paquete y deje sus datos para que
Katherine le confirme la disponibilidad y cierre la reserva.

ESTILO
- Español de España, tuteando, cálido, elegante y cercano. Algún emoji, sin exagerar.
- Mensajes cortos: 1 a 3 frases. UNA sola pregunta por mensaje.
- Texto plano: nada de asteriscos, almohadillas ni listas con guiones.
- Cuando sepas el nombre del cliente, úsalo de vez en cuando.

CONVERSACIÓN (en este orden, de forma natural)
1. Qué celebra. En cuanto puedas, pregunta el nombre de la persona con la que hablas
   ("¿Cómo te llamas?"): es la persona responsable de la reserva.
2. Averigua el estilo de evento: si es un cumpleaños, pregunta si es infantil o de adulto; si es
   infantil, si es para un niño o una niña.
3. Fecha, hora aproximada, lugar (municipio o barrio) y número de invitados. De una en una.
4. Pregunta si tiene un presupuesto en mente.
5. Enseña los tres tamaños con la herramienta mostrar_opciones usando la categoría que encaje
   (babyshower, cumple_nina, cumple_nino, corporativo o elegante para bodas, cumpleaños de adultos
   y demás celebraciones). Luego recomienda UNO y muéstralo con mostrar_paquete (misma categoría).
   Explica por qué le conviene: tamaño para su espacio y sus invitados, el efecto en las fotos, que
   nos encargamos de todo el montaje. Puedes decir que es de los montajes más pedidos.
6. Ofrece una mejora o un extra que tenga sentido (pasar al arco completo o al doble arco si hay
   muchos invitados, rosas para regalar, cartel de neón, catering si hay muchos invitados).
   Máximo dos ofertas en toda la conversación y sin presionar.
7. Da el precio SIEMPRE con la herramienta calcular_presupuesto. Nunca hagas cuentas tú.
8. Cuando el cliente se interese por un paquete, personaliza (de una en una y solo lo que aplique):
   temática y colores; en CUALQUIER cumpleaños pregunta SIEMPRE cómo se llama el cumpleañero o
   la cumpleañera y cuántos años cumple (no lo confundas con el nombre de la persona responsable:
   son dos preguntas distintas, aunque a veces sea la misma persona);
   en baby shower, si es niño, niña o sorpresa y el nombre del bebé si ya lo saben; en bodas, los
   nombres de los novios; en eventos de empresa, el nombre de la empresa (el logo lo enviarán a
   Katherine); y el texto que quiere en el cartel.
9. Después pide su teléfono y luego su email (uno cada vez).
10. Antes de guardar sus datos, usa la herramienta solicitar_consentimiento y espera a que acepte.
11. Con la aceptación, usa registrar_solicitud con todo lo que sepas. Se le mostrará al cliente
    el resumen de su presupuesto. Despídete con una frase breve diciendo que Katherine revisará la
    disponibilidad y le escribirá muy pronto.
    Ahí termina la conversación: no hagas más preguntas de venta.

SOBRE LAS FOTOS
- Las fotos son ejemplos del estilo y del tamaño de cada opción. Los colores, la temática y los
  elementos decorativos (peluches, figuras, carteles) se adaptan a cada cliente y Katherine los
  confirma. No prometas exactamente los objetos que salen en una foto.

PRECIOS Y REGLAS (OBLIGATORIAS)
{catalogo.texto_catalogo()}
- El pedido mínimo es de {catalogo.PEDIDO_MINIMO} € SIN contar el transporte. El transporte siempre se suma aparte.
- Nunca bajes un precio, nunca inventes descuentos ni ajustes un paquete para que "cuadre" con el
  presupuesto del cliente. Si su presupuesto es menor, explícale con amabilidad el mínimo y ofrécele
  el arco medio como la opción más accesible.
- Para el transporte solo necesitas saber si el evento es en Madrid capital o fuera. Nunca digas
  desde dónde salimos, ni direcciones, ni cómo se calcula la distancia.
- No confirmes disponibilidad ni reservas: eso lo hace siempre Katherine.
- No hables de adelantos ni formas de pago: Katherine lo explica al confirmar.
- Si te preguntan algo que no sabes, di que Katherine lo confirmará.
- Si el cliente quiere hablar con una persona, ofrécele el WhatsApp +34 689 92 91 08.
""".strip()


# ======================= HERRAMIENTAS =======================

CAT_SCHEMA = {"type": "string", "enum": list(catalogo.CATEGORIAS.keys())}

HERRAMIENTAS = [
    {
        "type": "function",
        "function": {
            "name": "mostrar_opciones",
            "description": "Muestra la imagen comparativa con los tres tamaños (medio arco, arco completo y doble arco) en el estilo del evento, con sus precios.",
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
            "description": "Calcula el precio exacto con el catálogo y se lo muestra al cliente. Úsala siempre que des un precio.",
            "parameters": {
                "type": "object",
                "properties": {
                    "paquete_id": {"type": "string", "enum": list(catalogo.PAQUETES.keys())},
                    "extras": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {"type": "string", "enum": list(catalogo.EXTRAS.keys())},
                                "cantidad": {"type": "integer"},
                            },
                            "required": ["id"],
                        },
                    },
                    "en_madrid_capital": {
                        "type": "boolean",
                        "description": "true si el evento es en el municipio de Madrid (cualquier barrio o distrito de Madrid capital). false si es en otro municipio (Alcobendas, Pozuelo, Getafe...).",
                    },
                    "fuera_comunidad": {
                        "type": "boolean",
                        "description": "true si el evento es fuera de la Comunidad de Madrid.",
                    },
                    "personas_catering": {"type": "integer", "description": "Personas para el catering, si lo pide."},
                },
                "required": ["en_madrid_capital"],
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
            "description": "Guarda la solicitud y avisa a Katherine. Solo cuando el cliente haya aceptado el uso de sus datos y tengas nombre y teléfono.",
            "parameters": {
                "type": "object",
                "properties": {
                    "nombre": {"type": "string", "description": "Nombre de la persona responsable (con quien hablas)"},
                    "telefono": {"type": "string"},
                    "email": {"type": "string"},
                    "tipo_evento": {"type": "string"},
                    "fecha": {"type": "string"},
                    "hora": {"type": "string"},
                    "lugar": {"type": "string", "description": "Municipio o barrio del evento"},
                    "invitados": {"type": "integer"},
                    "presupuesto_cliente": {"type": "string"},
                    "paquete_id": {"type": "string", "enum": list(catalogo.PAQUETES.keys())},
                    "extras": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {"type": "string", "enum": list(catalogo.EXTRAS.keys())},
                                "cantidad": {"type": "integer"},
                            },
                            "required": ["id"],
                        },
                    },
                    "en_madrid_capital": {"type": "boolean"},
                    "fuera_comunidad": {"type": "boolean"},
                    "personas_catering": {"type": "integer"},
                    "categoria": CAT_SCHEMA,
                    "tematica": {"type": "string"},
                    "colores": {"type": "string"},
                    "nombre_homenajeado": {"type": "string", "description": "Nombre del cumpleañero/a, del bebé o de los novios (NO el de la persona responsable, salvo que sea la misma)"},
                    "edad": {"type": "string", "description": "Edad que cumple, si es un cumpleaños"},
                    "texto_cartel": {"type": "string"},
                    "empresa": {"type": "string", "description": "Nombre de la empresa, si es un evento corporativo"},
                    "notas": {"type": "string", "description": "Otras peticiones especiales"},
                },
                "required": ["nombre", "telefono", "tipo_evento", "fecha", "lugar", "en_madrid_capital"],
            },
        },
    },
]


def _presupuesto_desde(args):
    return catalogo.calcular_presupuesto(
        paquete_id=args.get("paquete_id"),
        extras=args.get("extras") or [],
        en_madrid_capital=args.get("en_madrid_capital", True),
        fuera_comunidad=args.get("fuera_comunidad", False),
        personas_catering=args.get("personas_catering") or 0,
    )


def _guardar_solicitud(solicitud):
    """Guarda cada solicitud en un archivo (backend/solicitudes/solicitudes.jsonl)."""
    CARPETA_SOLICITUDES.mkdir(exist_ok=True)
    with open(CARPETA_SOLICITUDES / "solicitudes.jsonl", "a", encoding="utf-8") as archivo:
        archivo.write(json.dumps(solicitud, ensure_ascii=False) + "\n")


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
                {"id": pid, "nombre": p["nombre"], "precio": p["precio"], "medidas": p["medidas"]}
                for pid, p in catalogo.PAQUETES.items()
            ],
        })
        estado["memoria"].append(f"[Se mostraron las tres opciones de estilo {categoria}]")
        return {"ok": True, "nota": "El cliente ya ve las tres opciones con foto y precio. Recomienda una."}

    if nombre == "mostrar_paquete":
        paquete = catalogo.PAQUETES.get(args.get("paquete_id"))
        if not paquete:
            return {"error": "Paquete no encontrado"}
        categoria = args.get("categoria") if args.get("categoria") in catalogo.CATEGORIAS else None
        estado["tarjetas"].append({"tipo": "paquete", "id": args["paquete_id"], "categoria": categoria, **paquete})
        estado["memoria"].append(f"[Se mostró el paquete {paquete['nombre']} ({paquete['precio']} €)]")
        return {"ok": True, "mostrado": paquete}

    if nombre == "calcular_presupuesto":
        presupuesto = _presupuesto_desde(args)
        if presupuesto["cumple_minimo"] and not presupuesto["errores"]:
            estado["tarjetas"].append({"tipo": "presupuesto", **presupuesto})
            estado["memoria"].append(
                "[Presupuesto mostrado: "
                + ", ".join(f"{l['concepto']} {l['importe']} €" for l in presupuesto["lineas"])
                + f". Total {presupuesto['total']} €]"
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
        faltan = [c for c in ("nombre", "telefono", "fecha", "lugar") if not args.get(c)]
        es_cumple = "cumple" in (args.get("tipo_evento") or "").lower() or args.get("categoria") in ("cumple_nina", "cumple_nino")
        if es_cumple and not args.get("nombre_homenajeado"):
            faltan.append("nombre del cumpleañero o cumpleañera")
        if args.get("categoria") in ("cumple_nina", "cumple_nino") and not args.get("edad"):
            faltan.append("edad que cumple")
        if not args.get("paquete_id"):
            faltan.append("paquete elegido")
        if faltan:
            return {"error": "Antes de registrar, pregunta al cliente (de una en una): " + ", ".join(faltan)}

        presupuesto = _presupuesto_desde(args)
        solicitud = {
            "fecha_registro": datetime.now().isoformat(timespec="seconds"),
            "nombre": args.get("nombre"),
            "telefono": args.get("telefono"),
            "email": args.get("email"),
            "tipo_evento": args.get("tipo_evento"),
            "fecha": args.get("fecha"),
            "hora": args.get("hora"),
            "lugar": args.get("lugar"),
            "invitados": args.get("invitados"),
            "presupuesto_cliente": args.get("presupuesto_cliente"),
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
            "consentimiento_datos": True,
        }

        _guardar_solicitud(solicitud)
        aviso_ok = avisar_a_katherine(solicitud, presupuesto)
        email_cliente_ok = confirmar_al_cliente(solicitud, presupuesto)

        estado["tarjetas"].append({"tipo": "presupuesto", "titulo": "Resumen de tu presupuesto", **presupuesto})
        estado["tarjetas"].append({"tipo": "confirmacion", "nombre": solicitud["nombre"]})
        estado["terminado"] = True
        estado["memoria"].append("[Solicitud registrada y enviada a Katherine]")
        return {
            "ok": True,
            "katherine_avisada": aviso_ok,
            "email_cliente_enviado": email_cliente_ok,
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
