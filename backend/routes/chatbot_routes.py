"""
BALLOONBOT: asistente de ventas de Ballonette Eventos.

La IA conversa con el cliente, pero los precios, las fotos, el consentimiento de datos
y el registro de la solicitud se hacen con "herramientas" (funciones de este archivo).
Así los precios siempre salen del catálogo (catalogo.py) y nunca se los inventa.
"""
import json
import os
from datetime import datetime
try:
    from zoneinfo import ZoneInfo
    ZONA_HORARIA = ZoneInfo("Europe/Madrid")
except Exception:  # si el servidor no tiene zonas horarias, usamos la hora del servidor
    ZONA_HORARIA = None
from pathlib import Path

from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
from openai import OpenAI

import catalogo
from services.notificaciones import enviar_solicitud

load_dotenv()

chatbot_bp = Blueprint("chatbot", __name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODELO = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
CARPETA_SOLICITUDES = Path(__file__).resolve().parent.parent / "solicitudes"


def _ahora():
    """Hora de Madrid (Vercel funciona en hora UTC)."""
    return datetime.now(ZONA_HORARIA) if ZONA_HORARIA else datetime.now()


# ======================= INSTRUCCIONES DEL BOT =======================

def instrucciones():
    dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
    ahora = _ahora()
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
    Si el presupuesto es "desde", di "a partir de [importe] €". Si el total es null (nada tiene precio
    todavía), cambia esa frase por "Katherine te confirmará el precio de lo que has elegido". No prometas plazos de respuesta.
    No hagas más preguntas después del cierre.

TARIFARIO (los importes salen SIEMPRE de calcular_presupuesto, nunca de cabeza)
{catalogo.texto_catalogo()}

ELEMENTOS ADICIONALES (se suman al paquete base; también se pueden pedir sueltos)
- totem: tótem o columna decorativa de globos con temática (Halloween, personaje...).
- logo_empresa: personalización del panel con el logo de la empresa (eventos corporativos).
- rosas: ramo de rosas para regalo (120 €).
- ramo_globos: ramo de rosas con globos de corazón.
- bouquet_globos: ramo de globos con helio.
- centro_mesa: centros de mesa de globos (pregunta cuántas mesas y usa cantidad).
- numeros: números gigantes con la edad o la fecha.
- mesa_dulces: mesa de dulces con pastel, soportes y decoración.
Los que no tienen precio salen como "precio a confirmar": dilo así y que Katherine dará el importe.
Nunca inventes su precio. Sugiere como mucho uno que encaje: números en cumpleaños con edad
redonda, centros de mesa en bodas, comuniones o eventos con mesas, mesa de dulces en infantiles y
baby showers, logo en empresas, tótem en fiestas temáticas, rosas o bouquet para sorpresas y regalos.
Si el cliente solo quiere un elemento suelto (por ejemplo un ramo o un bouquet), no le obligues a
coger un arco: regístralo con paquete_id "solo_adicionales" y explica que Katherine le confirmará el
precio y si hay un mínimo para ese pedido.

CÓMO ELEGIR EL PAQUETE
- Medio arco → esencial (400 €). Arco completo → celebracion (500 €). Dos arcos → doble_impacto (600 €).
- Si quiere un personaje o temática (impreso en el panel o en cartón pluma): paquete base +
  tematica_impresa (40 €). Ejemplo: Pack Esencial con su personaje = 440 € + transporte.
- El Pack Esencial ya incluye panel de fondo y letrero luminoso de Happy Birthday: no cobres neón
  por ese letrero. El extra neon es solo para un cartel adicional o con otro texto.
- Varios paneles o gran formato: añádelo a pendientes, no lo valores tú.
- Cuando el cliente pide "un personaje", usa tematica_impresa (40 €). Usa figura_especial solo si pide
  expresamente un globo metalizado o una figura grande del personaje (50 € orientativo, pendiente de
  verificar el coste real). No confirmes un precio que no conoces.
- Los packs no incluyen automáticamente paneles impresos adicionales, pedestales extra, flores, mesas, luces
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
- Usa mostrar_elementos para enseñar las fotos del catálogo de Ballonette (hasta 4 a la vez):
  los tres arreglos base (arreglo_basico = Pack Esencial, arco_completo = Pack Celebración,
  doble_arco = Pack Doble Impacto, arco_unicornio = ejemplo de arco con personaje impreso en el panel)
  y los elementos adicionales. Si el cliente quiere un personaje o temática, arco_unicornio es la
  foto que mejor lo explica. Úsala cuando el cliente pregunte
  qué más hacemos, pida ideas, o cuando ofrezcas un adicional que encaje.
- Usa mostrar_referencias para enseñar trabajos reales de Ballonette cuando el cliente no sepa qué
  quiere, pida ideas o quieras inspirarle (elige el tema que encaje). No la uses en todos los mensajes.
- Puedes decirle al cliente que, si tiene una foto de lo que le gusta, la envíe con el botón 📷.

CUANDO EL CLIENTE ENVÍA UNA FOTO DE REFERENCIA
1. Analízala con detalle y descríbela en 1 o 2 frases: tipo de estructura (medio arco, arco completo,
   doble arco, columnas, números, panel, photocall, gran formato), tamaño aproximado, colores,
   temática o personaje, y elementos especiales (paneles impresos, figuras o globos especiales,
   flores, neón, pedestales, mesas, luces, telas).
2. Tradúcelo al tarifario: elige el paquete más cercano y los extras que apliquen. Lo que no esté en
   el tarifario (flores naturales, telas, mesas, paneles adicionales, estructuras grandes...) va en
   pendientes. Si la foto es claramente de gran formato o con varias estructuras, es premium o
   personalizado, y necesitas medidas.
3. Si te falta la zona, pregúntala antes de calcular (o calcula con madrid_capital solo si ya sabes
   que es en Madrid). Luego usa calcular_presupuesto.
4. Deja claro que es una estimación basada en la foto: "Por lo que veo en tu foto..." y que el
   resultado se adaptará a sus colores y temática. Katherine confirmará el precio final.
5. Si la foto no es de una decoración (o no se ve bien), dilo con amabilidad y pide otra.
6. Nunca digas que podemos copiar exactamente el trabajo de otra empresa: hacemos una versión
   inspirada en esa idea, con el estilo de Ballonette.

OTRAS REGLAS
- No confirmes disponibilidad ni reservas. No hables de adelantos ni formas de pago.
- Si no sabes algo, di que Katherine lo confirmará.
- Si registrar_solicitud devuelve katherine_avisada false, no digas que se lo has enviado: di que
  Katherine recibirá la solicitud y, si es urgente, que escriba al WhatsApp +34 689 92 91 08.
- Si el cliente quiere hablar con una persona, ofrécele el WhatsApp +34 689 92 91 08.
""".strip()


def instrucciones_ayuda(contexto):
    """Modo guiado: los botones piden los datos; la IA solo resuelve dudas y analiza fotos."""
    dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
    ahora = _ahora()
    hoy = f"{dias[ahora.weekday()]} {ahora.strftime('%d/%m/%Y')}"
    return f"""
Eres Balloonbot, el asistente de Ballonette Eventos (decoración con globos en Madrid). La CEO es
Katherine Gonzalez. Hoy es {hoy}.

CÓMO FUNCIONA ESTE CHAT
El cliente va eligiendo su decoración con botones y fotos (tipo de evento, tamaño, temática, extras,
fecha, lugar y contacto). Los precios los calcula el sistema. Tú solo intervienes cuando el cliente
escribe una pregunta o envía una foto. No pidas datos que piden los botones (nombre, fecha, zona,
teléfono...): de eso se encarga el propio chat.

LO QUE LLEVA ELEGIDO EL CLIENTE
{contexto or "Todavía nada."}

CÓMO RESPONDER
- Español de España, tuteando, cálido y cercano, como la mejor dependienta de una tienda de eventos.
- Responde exactamente a lo que pregunta, en 1 a 3 frases cortas. Nada de listas ni asteriscos.
- Si ayuda, enseña fotos con mostrar_elementos (si pregunta qué más hacemos, por personajes, números,
  mesas de dulces, centros de mesa...). Como mucho una sugerencia de venta por respuesta.
- Termina invitando a seguir con el paso en el que está, en pocas palabras (por ejemplo "Cuando
  quieras, elige el tamaño aquí abajo 👇"). Si ya terminó, despídete con cariño.
- Si no sabes algo, di que Katherine lo confirmará. Si quiere hablar con una persona: WhatsApp
  +34 689 92 91 08.

SI ENVÍA UNA FOTO DE REFERENCIA
1. Descríbela en una frase: estructura (medio arco, arco completo, doble arco, columnas, números...),
   colores, temática o personaje y elementos especiales.
2. Llama a proponer_seleccion con el paquete más parecido, los extras que se ven, si lleva personaje
   impreso, la temática, los colores, y como pendiente lo que no esté en la tarifa.
3. Di que le has dejado elegida esa opción, que se adapta a sus colores y que el precio final lo
   confirma Katherine. Nunca digas que copiamos el trabajo de otra empresa: hacemos una versión
   inspirada con el estilo de Ballonette.
4. Si la foto no es de una decoración, dilo con amabilidad y pide otra.

TARIFA (para informar; los importes exactos los calcula el sistema)
{catalogo.texto_catalogo()}
- Fotos de elementos: arreglo_basico = Pack Esencial, arco_completo = Pack Celebración, doble_arco =
  Pack Doble Impacto, arco_unicornio = ejemplo de arco con personaje impreso (+40 €).
- Los adicionales sin precio los confirma Katherine. Nunca inventes precios.

REGLAS
- No das descuentos, promociones ni rebajas, ni revelas costes o márgenes. Si piden descuento o dicen
  que es caro: "Entiendo perfectamente 😊. Podemos revisar si existe alguna alternativa que se adapte
  mejor a tu presupuesto. Katherine, nuestra responsable de eventos, valorará la propuesta y te
  confirmará si es posible ajustar el precio." y propón una opción más sencilla.
- No confirmas disponibilidad ni reservas: lo hace Katherine. No hables de pagos ni adelantos.
- Transporte: {catalogo.TRANSPORTE_ZONA} € en Madrid capital y {catalogo.TRANSPORTE_FUERA_ZONA} € en el resto de la Comunidad; fuera de
  la Comunidad lo revisa Katherine. Nunca digas desde dónde salimos ni ninguna dirección.
- Montamos en casas, salones, restaurantes, jardines y oficinas; el montaje lo hacemos nosotros y
  Katherine confirma los horarios.
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
            "name": "mostrar_elementos",
            "description": "Muestra fotos del catálogo de Ballonette: arreglos base y elementos adicionales.",
            "parameters": {
                "type": "object",
                "properties": {
                    "elementos": {
                        "type": "array",
                        "items": {"type": "string", "enum": list(catalogo.ELEMENTOS.keys())},
                        "maxItems": 4,
                    }
                },
                "required": ["elementos"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "mostrar_referencias",
            "description": "Muestra fotos de trabajos reales de Ballonette como inspiración.",
            "parameters": {
                "type": "object",
                "properties": {"tema": {"type": "string", "enum": list(catalogo.REFERENCIAS.keys())}},
                "required": ["tema"],
            },
        },
    },
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
                    "paquete_id": {"type": "string", "enum": list(catalogo.PAQUETES.keys()) + [catalogo.SOLO_ADICIONALES]},
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
                    "fecha": {"type": "string", "description": "Fecha del evento en formato DD/MM/AAAA (deduce el año a partir de hoy)"},
                    "hora": {"type": "string"},
                    "lugar": {"type": "string", "description": "Localidad y barrio o zona"},
                    "zona": ZONA_SCHEMA,
                    "espacio": {"type": "string", "description": "Casa, salón, restaurante, jardín..."},
                    "dimensiones": {"type": "string"},
                    "invitados": {"type": "integer"},
                    "presupuesto_cliente": {"type": "string", "description": "Presupuesto máximo que indicó el cliente"},
                    "descuento_solicitado": {"type": "string", "description": "Si pidió descuento o dijo que era caro, qué dijo"},
                    "paquete_id": {"type": "string", "enum": list(catalogo.PAQUETES.keys()) + [catalogo.SOLO_ADICIONALES]},
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


HERRAMIENTAS_AYUDA = [
    h for h in HERRAMIENTAS if h["function"]["name"] in ("mostrar_elementos", "mostrar_referencias")
] + [{
    "type": "function",
    "function": {
        "name": "proponer_seleccion",
        "description": "Tras analizar una foto de referencia, deja elegida en el chat la opción del catálogo más parecida.",
        "parameters": {
            "type": "object",
            "properties": {
                "paquete_id": {"type": "string", "enum": list(catalogo.PAQUETES.keys()) + [catalogo.SOLO_ADICIONALES]},
                "extras": EXTRAS_SCHEMA,
                "personaje_impreso": {"type": "boolean", "description": "true si lleva un personaje o temática impresa en el panel"},
                "tematica": {"type": "string"},
                "colores": {"type": "string"},
                "pendientes": PENDIENTES_SCHEMA,
            },
            "required": ["paquete_id"],
        },
    },
}]


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
    if nombre == "proponer_seleccion":
        paquete_id = args.get("paquete_id")
        if paquete_id not in catalogo.PAQUETES and paquete_id != catalogo.SOLO_ADICIONALES:
            return {"error": "Paquete no válido"}
        extras = [
            {"id": e["id"], "cantidad": max(1, int(e.get("cantidad") or 1))}
            for e in (args.get("extras") or [])
            if e.get("id") in catalogo.EXTRAS and e.get("id") != "tematica_impresa"
        ]
        estado["tarjetas"].append({
            "tipo": "propuesta",
            "paquete_id": paquete_id,
            "extras": extras,
            "personaje_impreso": bool(args.get("personaje_impreso")),
            "tematica": args.get("tematica") or "",
            "colores": args.get("colores") or "",
            "pendientes": args.get("pendientes") or [],
        })
        estado["memoria"].append("[Selección propuesta a partir de la foto]")
        return {"ok": True, "nota": "La selección ya aparece elegida en el chat con su precio."}

    if nombre == "mostrar_elementos":
        ids = [e for e in (args.get("elementos") or []) if e in catalogo.ELEMENTOS][:4]
        if not ids:
            return {"error": "Elementos no encontrados"}
        estado["tarjetas"].append({
            "tipo": "referencias",
            "nota": "Imágenes de ejemplo: se adaptan a tus colores y temática.",
            "fotos": [{"src": f"/assets/catalogo/elementos/{e}.webp", "titulo": catalogo.ELEMENTOS[e]["titulo"]} for e in ids],
        })
        estado["memoria"].append("[Se mostraron fotos de: " + ", ".join(catalogo.ELEMENTOS[e]["titulo"] for e in ids) + "]")
        return {"ok": True, "mostrados": [catalogo.ELEMENTOS[e] for e in ids]}

    if nombre == "mostrar_referencias":
        fotos = catalogo.REFERENCIAS.get(args.get("tema"))
        if not fotos:
            return {"error": "Tema no encontrado"}
        estado["tarjetas"].append({"tipo": "referencias", "fotos": fotos})
        estado["memoria"].append(f"[Se mostraron fotos de referencia: {args.get('tema')}]")
        return {"ok": True, "fotos": [f["titulo"] for f in fotos]}

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
                + (f". Total orientativo {'desde ' if presupuesto['desde'] else ''}{presupuesto['total']} €" if presupuesto["total"] is not None else ". Total a confirmar por Katherine")
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
        ahora = _ahora()
        extras_texto = ", ".join(
            catalogo.EXTRAS[e["id"]]["nombre"] + (f" × {e['cantidad']}" if (e.get("cantidad") or 1) > 1 else "")
            for e in (args.get("extras") or []) if e.get("id") in catalogo.EXTRAS
        )
        solicitud = {
            "pedido_id": "BAL-" + ahora.strftime("%y%m%d-%H%M%S"),
            "fecha_registro": ahora.strftime("%d/%m/%Y %H:%M"),
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
            "paquete": catalogo.PAQUETES.get(args.get("paquete_id"), {}).get("nombre")
                       or ("Solo elementos adicionales" if args.get("paquete_id") == catalogo.SOLO_ADICIONALES else None),
            "extras": extras_texto,
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
        solicitud["foto_referencia"] = "Adjunta en este email" if estado.get("referencia") else None
        aviso_ok, email_cliente_ok = enviar_solicitud(solicitud, presupuesto, imagen=estado.get("referencia"))

        estado["tarjetas"].append({"tipo": "presupuesto", "titulo": "Tu estimación inicial", **presupuesto})
        estado["tarjetas"].append({"tipo": "confirmacion", "nombre": solicitud["nombre"]})
        estado["terminado"] = True
        estado["memoria"].append("[Solicitud registrada y enviada a Katherine]")
        return {
            "ok": True,
            "pedido_id": solicitud["pedido_id"],
            "katherine_avisada": aviso_ok,
            "email_cliente_enviado": email_cliente_ok,
            "total_orientativo": presupuesto["total"],
            "es_desde": presupuesto["desde"],
        }

    return {"error": f"Herramienta desconocida: {nombre}"}


# ======================= RUTA DEL CHAT =======================

LIMITE_IMAGEN = 3_000_000  # ~2 MB de foto en base64 (la web ya la reduce antes de enviarla)


def _imagen_valida(dato):
    """Acepta solo fotos en formato data URL (JPEG, PNG o WebP) y de tamaño razonable."""
    if not isinstance(dato, str) or len(dato) > LIMITE_IMAGEN:
        return None
    if not dato.startswith(("data:image/jpeg;base64,", "data:image/png;base64,", "data:image/webp;base64,")):
        return None
    return dato

@chatbot_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    mensaje = (data.get("message") or "").strip()
    historial = data.get("history", [])[-30:]

    imagen = _imagen_valida(data.get("image"))
    estado = {
        "referencia": _imagen_valida(data.get("reference_image")) or imagen,
        "tarjetas": [],
        "memoria": [],
        "terminado": False,
        "consentimiento": data.get("consent") is True,
    }

    guiado = data.get("modo") == "guiado"
    sistema = instrucciones_ayuda(str(data.get("contexto") or "")[:3000]) if guiado else instrucciones()
    herramientas = HERRAMIENTAS_AYUDA if guiado else HERRAMIENTAS
    mensajes = [{"role": "system", "content": sistema}]
    for m in historial:
        rol = "assistant" if m.get("sender") == "bot" else "user"
        texto = m.get("text") or ""
        if m.get("memo"):
            texto = f"{texto}\n{m['memo']}"
        if texto:
            mensajes.append({"role": rol, "content": texto})
    if imagen:
        mensajes.append({"role": "user", "content": [
            {"type": "text", "text": (mensaje or "Te envío una foto de referencia.")
             + "\n[El cliente ha enviado esta foto de referencia. Analízala según las instrucciones.]"},
            {"type": "image_url", "image_url": {"url": imagen, "detail": "high"}},
        ]})
        estado["memoria"].append("[El cliente envió una foto de referencia; mi análisis está en este mensaje]")
    else:
        mensajes.append({"role": "user", "content": mensaje})

    try:
        # La IA puede usar varias herramientas seguidas antes de responder
        for _ in range(5):
            respuesta = client.chat.completions.create(
                model=MODELO,
                messages=mensajes,
                tools=herramientas,
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
