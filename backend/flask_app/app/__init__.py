from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.routes import api_blueprint

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(api_blueprint)

    return app
