import traceback
from flask import Blueprint, request, jsonify
import os
from app.utils import allowed_file, generate_random_string, AkaveClient
from app.config import Config
import io
from lighthouseweb3 import Lighthouse
import json
from app.service import get_uploads
from datetime import datetime

api_blueprint = Blueprint("api", __name__)

client = AkaveClient(base_url='https://akavelink-latest-nqpn.onrender.com')

@api_blueprint.route("/api/datasets", methods=["POST"])
def upload_dataset():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        file_path = os.path.join(Config.UPLOAD_FOLDER, file.filename)
        
        unique_tag = f"datasetdsrferfrwii"
        
        create_bucket = client.create_bucket(unique_tag)
        
        saved_file = client.upload_file(create_bucket["data"]["Name"], file_path)
                
        print(saved_file,"File Upload with Tag Successful!")

        return jsonify({
            "message": "Dataset uploaded successfully",
            "success": True,
            "cid": saved_file["data"]["RootCID"]
            
        }), 200

    except Exception as e:
        print("🚨 Error:", str(e))
        print(traceback.format_exc())  # Detailed error message
        return jsonify({"message": f"File upload failed: {str(e)}", "success": False}), 500
    
@api_blueprint.route("/api/datasets", methods=["GET"])
def get_all_dataset():
    buckets = client.list_files("dataset")
    return buckets