from extensions import db
from datetime import datetime


class QuoteRequest(db.Model):
    __tablename__ = "quote_requests"

    id = db.Column(db.Integer, primary_key=True)

    # Datos del cliente
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120))

    # Datos del evento
    event_type = db.Column(db.String(100), nullable=False)
    service_type = db.Column(db.String(100), nullable=False)
    event_date = db.Column(db.String(50))
    event_location = db.Column(db.String(255))
    guest_count = db.Column(db.Integer)

    # Detalles de la decoración
    colors_theme = db.Column(db.String(255))
    decoration_details = db.Column(db.Text)

    # Presupuesto y desplazamiento
    budget = db.Column(db.String(50))
    travel_fee = db.Column(db.String(50))

    # Información adicional
    message = db.Column(db.Text)
    reference_url = db.Column(db.String(500))

    # Seguimiento del lead
    source = db.Column(db.String(50), default="website")
    status = db.Column(db.String(50), default="pending")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)