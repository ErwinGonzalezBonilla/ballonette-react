from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate

from config import Config
from extensions import db, jwt

from routes.quote_routes import quote_bp
from routes.chatbot_routes import chatbot_bp

from models.quote_request import QuoteRequest


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    # EXTENSIONS
    db.init_app(app)
    jwt.init_app(app)
    Migrate(app, db)

    # BLUEPRINTS
    app.register_blueprint(quote_bp)
    app.register_blueprint(chatbot_bp)

    # HOME
    @app.route("/")
    def home():
        return {
            "message": "Ballonette API running 🚀"
        }

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)