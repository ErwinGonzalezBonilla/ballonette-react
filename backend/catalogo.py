"""
CATÁLOGO Y PRECIOS DE BALLONETTE EVENTOS
=========================================
Aquí se cambian los paquetes, suplementos, transporte y precios.
Balloonbot usa SOLO estos datos: la IA nunca calcula precios "de cabeza".

Después de cambiar algo, súbelo a GitHub (git add, commit, push) y Vercel lo publica.
"""

# Pedido mínimo sin transporte: ningún presupuesto baja de aquí
PEDIDO_MINIMO = 400

# Transporte
TRANSPORTE_ZONA = 15         # zona habitual: Madrid capital
TRANSPORTE_FUERA_ZONA = 25   # resto de la Comunidad de Madrid (15 + 10)
# Fuera de la Comunidad de Madrid: no hay importe, lo revisa Katherine.

# Paquetes. "desde" = precio de partida, el final depende del proyecto.
# "foto" = qué foto del catálogo se enseña (arco_medio, arco_grande o doble_arco).
PAQUETES = {
    "esencial": {
        "nombre": "Pack Esencial",
        "precio": 400,
        "desde": False,
        "foto": "arco_medio",
        "medidas": "Medio arco de 1,8 a 2 m de ancho",
        "incluye": "Medio arco de globos, un pedestal para la tarta, una luz LED en el suelo, diseño, preparación y montaje.",
        "ideal_para": "Espacios pequeños y celebraciones en casa.",
    },
    "celebracion": {
        "nombre": "Pack Celebración",
        "precio": 500,
        "desde": False,
        "foto": "arco_grande",
        "medidas": "Arco completo de 2,5 a 3 m de ancho",
        "incluye": "Arco completo de globos con los elementos, dimensiones y montaje definidos por Ballonette.",
        "ideal_para": "Decorar la mesa principal y la zona de fotos.",
    },
    "doble_impacto": {
        "nombre": "Pack Doble Impacto",
        "precio": 600,
        "desde": False,
        "foto": "doble_arco",
        "medidas": "Dos arcos, de 3,5 a 4 m de ancho en total",
        "incluye": "Decoración con dos arcos de globos y los elementos adicionales del paquete.",
        "ideal_para": "Celebraciones con muchos invitados que quieren impresionar.",
    },
    "personalizado": {
        "nombre": "Pack Personalizado",
        "precio": 900,
        "desde": True,
        "foto": "doble_arco",
        "transporte_incluido": True,
        "medidas": "A medida",
        "incluye": "Diseño a medida: caballete o estructura de unos 1,60 m, panel decorativo, impresión con nombre, logo o imagen, arreglo de globos, pedestales, luces, transporte de material y montaje.",
        "ideal_para": "Proyectos con panel o estructura personalizada.",
    },
    "premium": {
        "nombre": "Pack Premium",
        "precio": 1000,
        "desde": True,
        "foto": None,
        "medidas": "Gran formato",
        "incluye": "Montajes de gran formato: varias estructuras, varias zonas, fondos personalizados e instalaciones complejas. Referencias: 1.000, 1.200 o 1.500 euros según el alcance.",
        "ideal_para": "Grandes salones, bodas grandes y eventos de empresa.",
    },
}

# Paquetes que se enseñan con la imagen comparativa (los tres con foto propia)
PAQUETES_COMPARATIVA = ["esencial", "celebracion", "doble_impacto"]

# Estilos de foto que el bot puede enseñar (hay una imagen por estilo en public/assets/catalogo)
CATEGORIAS = {
    "babyshower": "Baby shower",
    "cumple_nina": "Cumpleaños infantil de niña",
    "cumple_nino": "Cumpleaños infantil de niño",
    "corporativo": "Evento de empresa (con el logo de la empresa)",
    "elegante": "Bodas, cumpleaños de adultos, aniversarios, comuniones y celebraciones elegantes",
}

# Fotos de referencia que el bot puede enseñar (trabajos reales, en public/assets/web).
# Para añadir una: sube la foto a public/assets/web y añádela aquí en el tema que encaje.
REFERENCIAS = {
    "baby_shower": [
        {"src": "/assets/web/babyshower-rosa.webp", "titulo": "Baby shower con medio arco y neón"},
    ],
    "infantil_tematico": [
        {"src": "/assets/web/cumple-tematico.webp", "titulo": "Cumpleaños temático de videojuego"},
        {"src": "/assets/web/babyshower-rosa.webp", "titulo": "Medio arco con letras y peluche"},
    ],
    "adultos_elegante": [
        {"src": "/assets/web/cumple-28.webp", "titulo": "Números gigantes y globos de helio"},
        {"src": "/assets/web/portada.webp", "titulo": "Arco con flores en rosa y dorado"},
    ],
    "numeros_helio": [
        {"src": "/assets/web/cumple-28.webp", "titulo": "Números gigantes y globos de helio"},
    ],
    "empresa_marca": [
        {"src": "/assets/web/marcas.webp", "titulo": "Columnas de globos para marca"},
    ],
    "fiestas_tematicas": [
        {"src": "/assets/web/halloween.webp", "titulo": "Columna temática de Halloween"},
        {"src": "/assets/web/cumple-tematico.webp", "titulo": "Decoración temática de personaje"},
    ],
    "rosas": [
        {"src": "/assets/web/ramo-rosas-rojas.webp", "titulo": "Ramo de rosas rojas"},
    ],
}

# Suplementos y extras.
# "orientativo": True = importe provisional que Katherine debe confirmar (coste real desconocido).
EXTRAS = {
    "tematica_impresa": {"nombre": "Temática impresa (personaje o imagen en cartón pluma)", "precio": 50, "por_persona": False, "orientativo": False},
    "figura_especial": {"nombre": "Globo o figura especial (personaje, número especial)", "precio": 50, "por_persona": False, "orientativo": True},
    "rosas": {"nombre": "Ramo o caja de rosas", "precio": 120, "por_persona": False, "orientativo": False},
    "neon": {"nombre": "Cartel de neón", "precio": 20, "por_persona": False, "orientativo": False},
    "catering": {"nombre": "Catering", "precio": 10, "por_persona": True, "orientativo": False},
}


def calcular_presupuesto(paquete_id=None, extras=None, zona="madrid_capital",
                         personas_catering=0, pendientes=None):
    """Calcula el presupuesto orientativo con los precios del catálogo.

    zona: "madrid_capital", "comunidad_madrid" o "fuera_comunidad".
    pendientes: lista de cosas que el bot no puede valorar (paneles grandes, flores, etc.).
    """
    lineas = []
    errores = []
    a_revisar = list(pendientes or [])
    desde = False

    paquete = PAQUETES.get(paquete_id) if paquete_id else None
    if paquete_id and not paquete:
        errores.append(f"Paquete desconocido: {paquete_id}")
    if paquete:
        lineas.append({"concepto": paquete["nombre"] + (" (desde)" if paquete["desde"] else ""), "importe": paquete["precio"]})
        if paquete["desde"]:
            desde = True
            a_revisar.append(f"Alcance exacto del {paquete['nombre']}: dimensiones, materiales y montaje")

    for extra in extras or []:
        info = EXTRAS.get(extra.get("id"))
        if not info:
            errores.append(f"Extra desconocido: {extra.get('id')}")
            continue
        if info["por_persona"]:
            personas = int(personas_catering or extra.get("cantidad") or 0)
            if personas <= 0:
                errores.append("Falta el número de personas para el catering.")
                continue
            lineas.append({"concepto": f"{info['nombre']} ({personas} personas × {info['precio']} €)", "importe": info["precio"] * personas})
        else:
            cantidad = max(1, int(extra.get("cantidad") or 1))
            nombre = info["nombre"] if cantidad == 1 else f"{info['nombre']} × {cantidad}"
            if info["orientativo"]:
                nombre += " (orientativo)"
                a_revisar.append(f"Coste real de: {info['nombre']}")
            lineas.append({"concepto": nombre, "importe": info["precio"] * cantidad})

    subtotal = sum(l["importe"] for l in lineas)

    if paquete and paquete.get("transporte_incluido") and zona != "fuera_comunidad":
        transporte = 0
        lineas.append({"concepto": "Transporte (incluido en el paquete)", "importe": 0})
    elif zona == "fuera_comunidad":
        transporte = None
        lineas.append({"concepto": "Transporte (fuera de la Comunidad de Madrid, a confirmar)", "importe": None})
        a_revisar.append("Transporte y cobertura fuera de la Comunidad de Madrid")
    else:
        transporte = TRANSPORTE_ZONA if zona == "madrid_capital" else TRANSPORTE_FUERA_ZONA
        lineas.append({"concepto": "Transporte", "importe": transporte})

    total = subtotal + (transporte or 0)

    resultado = {
        "lineas": lineas,
        "subtotal_sin_transporte": subtotal,
        "transporte": transporte,
        "total": total,
        "desde": desde or transporte is None,
        "pendientes": a_revisar,
        "cumple_minimo": subtotal >= PEDIDO_MINIMO,
        "pedido_minimo": PEDIDO_MINIMO,
        "errores": errores,
    }
    if not resultado["cumple_minimo"]:
        resultado["aviso"] = (
            f"El pedido mínimo es de {PEDIDO_MINIMO} € sin transporte. Propón el Pack Esencial "
            "como opción más sencilla. No muestres este total como válido."
        )
    return resultado


def texto_catalogo():
    """Resumen del catálogo para las instrucciones del bot."""
    partes = ["PAQUETES (precio base, sin transporte):"]
    for pid, p in PAQUETES.items():
        precio = f"desde {p['precio']} €" if p["desde"] else f"{p['precio']} €"
        partes.append(f"- {pid}: {p['nombre']}, {precio}. {p['medidas']}. Incluye: {p['incluye']} Ideal para: {p['ideal_para']}")
    partes.append("SUPLEMENTOS Y EXTRAS:")
    for eid, e in EXTRAS.items():
        unidad = " por persona" if e["por_persona"] else ""
        nota = " (orientativo, pendiente de confirmar el coste real)" if e["orientativo"] else ""
        partes.append(f"- {eid}: {e['nombre']}, {e['precio']} €{unidad}{nota}")
    partes.append(
        f"TRANSPORTE: {TRANSPORTE_ZONA} € en Madrid capital; {TRANSPORTE_FUERA_ZONA} € en el resto de la "
        "Comunidad de Madrid; fuera de la Comunidad, sin importe: lo revisa Katherine. "
        f"PEDIDO MÍNIMO: {PEDIDO_MINIMO} € sin transporte."
    )
    return "\n".join(partes)
