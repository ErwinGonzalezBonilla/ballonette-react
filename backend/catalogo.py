"""
CATÁLOGO Y PRECIOS DE BALLONETTE EVENTOS
=========================================
Aquí se cambian los paquetes, extras y precios. Balloonbot usa SOLO estos datos:
la IA nunca calcula precios "de cabeza", siempre se calculan con este archivo.

Después de cambiar algo, reinicia el backend (Ctrl + C y luego: python app.py).
"""

# Pedido mínimo (sin contar el transporte)
PEDIDO_MINIMO = 300

# Transporte
TRANSPORTE_DENTRO = 10   # eventos en Madrid capital
TRANSPORTE_FUERA = 20    # eventos fuera de Madrid capital

# Paquetes principales (los mismos tres tamaños para todo tipo de evento)
PAQUETES = {
    "arco_medio": {
        "nombre": "Medio arco",
        "precio": 300,
        "medidas": "1,8 a 2,0 m de ancho y 2,0 a 2,2 m de alto",
        "incluye": "Medio arco de globos con fondo y cartel personalizado (por ejemplo, 'Feliz cumpleaños'), luces y pedestal para la tarta.",
        "ideal_para": "Espacios pequeños y celebraciones en casa.",
    },
    "arco_grande": {
        "nombre": "Arco completo",
        "precio": 400,
        "medidas": "2,5 a 3,0 m de ancho y 2,0 a 2,4 m de alto",
        "incluye": "Arco completo de globos alrededor del fondo, cartel personalizado, luces, pedestales para la tarta y detalles decorativos de la temática.",
        "ideal_para": "Decorar la mesa principal: el rincón de la tarta y las fotos.",
    },
    "doble_arco": {
        "nombre": "Doble arco / escenografía grande",
        "precio": 500,
        "medidas": "3,5 a 4,0 m de ancho y 2,4 a 2,8 m de alto",
        "incluye": "Escenografía completa con doble arco de globos, varios fondos, cartel personalizado, luces, pedestales y más elementos decorativos de la temática.",
        "ideal_para": "Eventos grandes y celebraciones que quieren impresionar.",
    },
}

# Estilos de foto que el bot puede enseñar (hay una imagen por estilo en public/assets/catalogo)
CATEGORIAS = {
    "babyshower": "Baby shower",
    "cumple_nina": "Cumpleaños infantil de niña",
    "cumple_nino": "Cumpleaños infantil de niño",
    "corporativo": "Evento de empresa (con el logo de la empresa)",
    "elegante": "Bodas, cumpleaños de adultos, aniversarios y celebraciones elegantes",
}

# Extras que se pueden añadir a cualquier paquete
EXTRAS = {
    "rosas": {"nombre": "Ramo o caja de rosas", "precio": 120, "por_persona": False},
    "neon": {"nombre": "Cartel de neón", "precio": 20, "por_persona": False},
    "catering": {"nombre": "Catering", "precio": 10, "por_persona": True},
}


def calcular_presupuesto(paquete_id=None, extras=None, en_madrid_capital=True,
                         fuera_comunidad=False, personas_catering=0):
    """Calcula el presupuesto con los precios del catálogo. Devuelve un diccionario."""
    lineas = []
    errores = []

    if paquete_id:
        paquete = PAQUETES.get(paquete_id)
        if not paquete:
            errores.append(f"Paquete desconocido: {paquete_id}")
        else:
            lineas.append({"concepto": paquete["nombre"], "importe": paquete["precio"]})

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
            lineas.append({
                "concepto": f"{info['nombre']} ({personas} personas × {info['precio']} €)",
                "importe": info["precio"] * personas,
            })
        else:
            cantidad = max(1, int(extra.get("cantidad") or 1))
            nombre = info["nombre"] if cantidad == 1 else f"{info['nombre']} × {cantidad}"
            lineas.append({"concepto": nombre, "importe": info["precio"] * cantidad})

    subtotal = sum(l["importe"] for l in lineas)

    transporte = TRANSPORTE_DENTRO if en_madrid_capital else TRANSPORTE_FUERA
    lineas.append({
        "concepto": "Transporte" + (" (a confirmar por Katherine)" if fuera_comunidad else ""),
        "importe": transporte,
    })

    resultado = {
        "lineas": lineas,
        "subtotal_sin_transporte": subtotal,
        "transporte": transporte,
        "total": subtotal + transporte,
        "cumple_minimo": subtotal >= PEDIDO_MINIMO,
        "pedido_minimo": PEDIDO_MINIMO,
        "errores": errores,
    }

    if not resultado["cumple_minimo"]:
        resultado["aviso"] = (
            f"El pedido mínimo es de {PEDIDO_MINIMO} € sin transporte. "
            f"Faltan {PEDIDO_MINIMO - subtotal} € para llegar al mínimo: "
            "propón un paquete o extras para completarlo. No muestres este total como válido."
        )

    return resultado


def texto_catalogo():
    """Resumen del catálogo para las instrucciones del bot."""
    partes = ["PAQUETES:"]
    for pid, p in PAQUETES.items():
        partes.append(
            f"- {pid}: {p['nombre']}, {p['precio']} €. Medidas: {p['medidas']}. "
            f"Incluye: {p['incluye']} Ideal para: {p['ideal_para']}"
        )
    partes.append("EXTRAS:")
    for eid, e in EXTRAS.items():
        unidad = " por persona" if e["por_persona"] else ""
        partes.append(f"- {eid}: {e['nombre']}, {e['precio']} €{unidad}")
    partes.append(
        f"TRANSPORTE: {TRANSPORTE_DENTRO} € en Madrid capital, {TRANSPORTE_FUERA} € fuera de Madrid capital. "
        f"PEDIDO MÍNIMO: {PEDIDO_MINIMO} € sin contar el transporte."
    )
    return "\n".join(partes)
