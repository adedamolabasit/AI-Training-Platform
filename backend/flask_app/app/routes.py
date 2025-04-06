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
import random

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

        # Generate unique filename with timestamp and random number
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_suffix = random.randint(1000, 9999)
        unique_filename = f"{timestamp}_{random_suffix}_{file.filename}"
        file_path = os.path.join(Config.UPLOAD_FOLDER, unique_filename)

        # Save the file locally
        file.save(file_path)
        print(file_path, "File saved locally.")

        # Upload the file to Akave bucket
        saved_file = client.upload_file("onchainset", file_path)
        print(saved_file, "File Upload with Tag Successful!")

        # Delete the local file after successful upload
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted local file: {file_path}")

        return jsonify({
            "message": "Dataset uploaded successfully",
            "success": True,
            "cid": saved_file["data"]["RootCID"],
            "fileName": saved_file["data"]["Name"],
            "fileSize": saved_file["data"]["EncodedSize"],
        }), 200

    except Exception as e:
        print("🚨 Error:", str(e))
        print(traceback.format_exc())
        return jsonify({"message": f"File upload failed: {str(e)}", "success": False}), 500

    
@api_blueprint.route("/api/datasets", methods=["GET"])
def get_all_dataset():
    buckets = client.list_files("dataset")
    return buckets