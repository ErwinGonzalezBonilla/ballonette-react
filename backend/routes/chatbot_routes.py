from flask import Blueprint, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv

import os

load_dotenv()

chatbot_bp = Blueprint("chatbot", __name__)

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

@chatbot_bp.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    user_message = data.get("message")

    history = data.get("history", [])

    # MENSAJES GPT
    messages = [

        {
            "role": "system",

            "content": """

            Eres BalloonBot, asistente premium de Balloonette Eventos en Madrid.

            Tu trabajo es ayudar clientes interesados en:

            - bodas
            - cumpleaños
            - baby shower
            - eventos corporativos
            - arreglos de globos
            - flores
            - chocolates
            - catering

            INFORMACIÓN IMPORTANTE:

            - presupuesto mínimo: 200€
            - transporte base: 15€
            - fuera de zona: +10€
            - dirección:
              Calle Grañón 22,
              Las Tablas,
              Madrid

            COMPORTAMIENTO:

            - Sé elegante y profesional
            - Sé breve y natural
            - Haz preguntas inteligentes
            - Mantén contexto conversación
            - Guía al cliente paso a paso
            - Intenta obtener:
                - tipo de evento
                - fecha
                - ubicación
                - presupuesto

            EJEMPLOS:

            Cliente:
            "quiero una boda"

            Respuesta:
            "✨ Qué emocionante. ¿Para qué fecha sería la boda?"

            Cliente:
            "quiero catering"

            Respuesta:
            "🍽️ Perfecto. ¿Para cuántas personas sería el catering?"

            Cliente:
            "cuánto cuesta"

            Respuesta:
            "💰 Nuestros servicios comienzan desde 200€ más transporte. ¿Qué tipo de evento deseas organizar?"

            Mantén siempre un tono elegante y cercano.
            """
        }
    ]

    # HISTORIAL CONVERSACIÓN
    for msg in history:

        role = "assistant" if msg["sender"] == "bot" else "user"

        messages.append({
            "role": role,
            "content": msg["text"]
        })

    # MENSAJE ACTUAL
    messages.append({
        "role": "user",
        "content": user_message
    })

    # OPENAI
    completion = client.chat.completions.create(

        model="gpt-4.1-mini",

        messages=messages
    )

    reply = completion.choices[0].message.content

    return jsonify({
        "reply": reply
    })