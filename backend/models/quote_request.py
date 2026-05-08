from extensions import db
from datetime import datetime

class QuoteRequest(db.Model):
    __tablename__ = "quote_requests"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120))
    event_type = db.Column(db.String(100), nullable=False)
    service_type = db.Column(db.String(100), nullable=False)
    event_date = db.Column(db.String(50))
    guest_count = db.Column(db.Integer)
    budget = db.Column(db.String(50))
    message = db.Column(db.Text)
    status = db.Column(db.String(50), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)