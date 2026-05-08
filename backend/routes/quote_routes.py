from flask import Blueprint, request, jsonify
from extensions import db
from models.quote_request import QuoteRequest

quote_bp = Blueprint("quote_bp", __name__)

@quote_bp.route("/api/quote-requests", methods=["POST"])
def create_quote_request():
    data = request.get_json()

    new_quote = QuoteRequest(
        name=data.get("name"),
        phone=data.get("phone"),
        email=data.get("email"),
        event_type=data.get("event_type"),
        service_type=data.get("service_type"),
        event_date=data.get("event_date"),
        guest_count=data.get("guest_count"),
        budget=data.get("budget"),
        message=data.get("message")
    )

    db.session.add(new_quote)
    db.session.commit()

    return jsonify({
        "message": "Quote request created successfully"
    }), 201