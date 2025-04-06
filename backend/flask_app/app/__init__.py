from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.routes import api_blueprint

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS with more specific settings
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Register blueprints
    app.register_blueprint(api_blueprint)

    return app