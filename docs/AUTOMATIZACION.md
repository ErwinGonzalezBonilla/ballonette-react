# Automatización de pedidos de Ballonette Eventos

Puesta en marcha: 21/10/2026.

Cada solicitud que un cliente deja en Balloonbot (www.ballonette.com) se registra en una hoja de Google, avisa a Katherine por correo y envía una confirmación al cliente. Cada mañana llega un resumen con los pedidos pendientes.

## Cómo fluye un pedido

```
Cliente en Balloonbot (web)
        │  POST /solicitud
        ▼
ballonette-api (Vercel, Flask)
  - calcula el presupuesto con catalogo.py
  - prepara los correos y la fila de la hoja
        │  POST + cabecera X-Ballonette-Token
        ▼
n8n · "Ballonette 1 - Pedidos del bot"
  1. Añade la fila en Google Sheets (Ballonette-Pedidos › Pedidos)
  2. Aviso a Katherine por Gmail (con la foto de referencia si la hay)
  3. Confirmación al cliente por Gmail (si dejó email)
  4. Responde {"ok": true} a la API
```

Si n8n no responde, la API intenta enviar los correos directamente por Gmail SMTP (necesita `EMAIL_PASSWORD`, hoy sin configurar).

## Piezas

### Google Sheets: Ballonette-Pedidos
- Cuenta: ballonette.eventos@gmail.com. Hoja nativa de Google (no .xlsx).
- **Pedidos:** 34 columnas. Las rellena n8n, salvo Precio final, Señal pagada y Notas de Katherine.
- **Resumen:** fórmulas por estado, facturación y tasa de cierre.
- **Cómo usar:** instrucciones y una fila de ejemplo.
- Estados: Nuevo → Contactado → Presupuesto enviado → Reservado → Realizado / Perdido.
- No cambiar los nombres de las columnas ni de la pestaña "Pedidos": n8n los usa para rellenarla.
- Plantilla original: generada desde `backend/services/notificaciones.py` (`fila_hoja`).

### n8n Cloud
- Instancia: `erwingonzalezbonilla.app.n8n.cloud` (prueba de 14 días hasta aprox. el 04/11/2026).
- Flujos importados desde `n8n/`:

| Flujo | Archivo | Disparador | Qué hace |
|---|---|---|---|
| Ballonette 1 - Pedidos del bot | `ballonette-1-solicitudes.json` | Webhook POST `/webhook/ballonette-solicitud` (Header Auth) | Fila en la hoja, aviso a Katherine, confirmación al cliente |
| Ballonette 2 - Resumen diario | `ballonette-2-resumen-diario.json` | Todos los días a las 9:00 (Europe/Madrid) | Correo con pedidos en "Nuevo", reservados de los próximos 7 días y presupuestos por seguir |
| Ballonette 3 - Aviso de errores | `ballonette-3-aviso-errores.json` | Error Trigger | Correo si falla otro flujo, con enlace a la ejecución |

- El flujo 1 tiene el flujo 3 como *Error Workflow*. Los tres están publicados.
- Credenciales (en n8n, no en el repositorio):
  - `Gmail account`: OAuth2 de ballonette.eventos@gmail.com.
  - `Google Sheets account`: OAuth2, misma cuenta.
  - `Header Auth account`: cabecera `X-Ballonette-Token`.

### Vercel: proyecto `ballonette-api`
Variables de entorno (Production). Los valores secretos no se guardan en el repositorio.

| Variable | Uso |
|---|---|
| `OPENAI_API_KEY` | IA de Balloonbot |
| `EMAIL_USER` | ballonette.eventos@gmail.com (destino de avisos y respaldo SMTP) |
| `N8N_WEBHOOK_URL` | `https://erwingonzalezbonilla.app.n8n.cloud/webhook/ballonette-solicitud` |
| `N8N_TOKEN` | Secreto compartido con el Header Auth de n8n |

Después de cambiar una variable hay que redesplegar: Deployments → ⋯ → Redeploy.

## Comprobar que todo funciona (PowerShell)

```powershell
$api = "https://ballonette-react-qm5y.vercel.app"
Invoke-RestMethod "$api/catalogo" | Select-Object pedido_minimo
$body = @{consent=$true; nombre="PRUEBA Sistema"; telefono="600000000"; email="ballonette.eventos@gmail.com"; fecha="30/11/2026"; hora="Tarde"; lugar="Chamberi"; zona="madrid_capital"; espacio="Casa"; paquete_id="esencial"; tipo_evento="Prueba de la automatizacion"; extras=@(@{id="tematica_impresa"; cantidad=1})} | ConvertTo-Json -Depth 5
$r = Invoke-RestMethod "$api/solicitud" -Method Post -ContentType "application/json; charset=utf-8" -Body $body
"Pedido: " + $r.pedido_id + " | Katherine avisada: " + $r.katherine_avisada + " | Total: " + $r.total_orientativo
```

Resultado esperado: `Katherine avisada: True | Total: 455`, dos correos en ballonette.eventos@gmail.com y una fila nueva en la hoja. Después, borrar la fila de prueba.

## Problemas encontrados y solución

| Síntoma | Causa | Solución |
|---|---|---|
| "Aquí no hay ningún caso" al abrir n8n | La instancia antigua no existía | Crear una instancia nueva |
| Flujos mezclados en el mismo lienzo | Se importó un archivo dentro de un flujo ya abierto | Importar siempre en un flujo nuevo y vacío |
| Error Workflow en gris | El flujo de errores no estaba publicado | Publicar el flujo 3 |
| No deja publicar el flujo 1 | Faltaban la credencial Header Auth y la pestaña de la hoja | Crear la credencial y elegir Sheet → Pedidos |
| Llegan los correos pero no la fila ("At least one value has to be added under 'Values to Send'") | Mapping Column Mode pasó solo a manual al cambiar la pestaña | Poner **Map Automatically** y volver a publicar |

## Pendiente
- Antes del ~04/11/2026: pasar n8n a plan de pago (Starter) o migrar los flujos a Google Apps Script (gratis).
- Completar en `backend/catalogo.py` los precios de los adicionales que aparecen como "a consultar".
- Hacer una prueba de punta a punta desde el bot de la web.
