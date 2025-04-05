import traceback
from flask import Blueprint, request, jsonify
import os
from app.utils import allowed_file, generate_random_string, AkaveClient
from app.config import Config
import io
from lighthouseweb3 import Lighthouse
import json
from app.service import get_uploads
# from app.akave import AkaveClient

api_blueprint = Blueprint("api", __name__)

client = AkaveClient(base_url='https://akavelink-latest-nqpn.onrender.com')

@api_blueprint.route("/api/datasets", methods=["POST"])
def upload_dataset():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files["file"]
        name = request.form.get("name")
        domain = request.form.get("domain")
        license = request.form.get("license")
        access = request.form.get("access")

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        file_path = os.path.join(Config.UPLOAD_FOLDER, file.filename)
        
        file.save(file_path)
        
        meta_data = {
            "file": file.filename,  # Use the file name instead of the object
            "name": name,
            "domain": domain,
            "license": license,
            "access": access
        }
        
        metadata_json = json.dumps(meta_data)
        
        # b = client.create_bucket(bucket_name='dataset111')
        
        
        akave_file = client.upload_file('dataset', file_path)
        
        
        print(akave_file,"File Upload with Tag Successful!")

        return jsonify({
            "message": "Dataset uploaded successfully",
            # "file_name": file.filename,
            # "name": name,
            # "domain": domain,
            # "license": license,
            # "access": access
        }), 200

    except Exception as e:
        print("🚨 Error:", str(e))
        print(traceback.format_exc())  # Detailed error message
        return jsonify({"error": f"File upload failed: {str(e)}"}), 500
    
@api_blueprint.route("/api/datasets", methods=["GET"])
def get_all_dataset():
    files = get_uploads()
    return files