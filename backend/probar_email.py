"""
Probador de email de Balloonbot.
Uso (desde la carpeta backend, con el venv activado):  python probar_email.py
Envía un correo de prueba a EMAIL_AVISOS y muestra el resultado.
"""
from dotenv import load_dotenv
import os

load_dotenv()

from services.notificaciones import _enviar, _marco

destino = os.getenv("EMAIL_AVISOS") or os.getenv("EMAIL_USER")
print("Usuario:", os.getenv("EMAIL_USER"))
print("Contraseña configurada:", "sí" if os.getenv("EMAIL_PASSWORD") else "NO")
print("Enviando prueba a:", destino)

ok = _enviar(destino, "Prueba de Balloonbot 🎈", _marco("<p>Si lees esto, los emails funcionan. 🎉</p>"))
print("\nRESULTADO:", "✅ Enviado, revisa la bandeja (y spam)" if ok else "❌ No se pudo enviar (mira el mensaje de arriba)")
