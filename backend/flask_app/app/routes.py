import traceback
from flask import Blueprint, request, jsonify
import os
from app.utils import allowed_file
from app.config import Config
import io
from lighthouseweb3 import Lighthouse
import json

api_blueprint = Blueprint("api", __name__)

lh = Lighthouse(token="bd32e5dc.39c91daf02d1461da1b76f8f9a87f28d")

@api_blueprint.route("/api/datasets", methods=["POST"])
def upload_dataset():
    print(request,"oo")
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
        
        tag = {
            "file": file.filename,  # Use the file name instead of the object
            "name": name,
            "domain": domain,
            "license": license,
            "access": access
        }

        tag_string = json.dumps(tag)

        lh.upload(source=file_path) 
        
        print("File Upload with Tag Successful!")

        return jsonify({
            "message": "Dataset uploaded successfully",
            "file_name": file.filename,
            "name": name,
            "domain": domain,
            "license": license,
            "access": access
        }), 200

    except Exception as e:
        print("🚨 Error:", str(e))
        print(traceback.format_exc())  # Detailed error message
        return jsonify({"error": f"File upload failed: {str(e)}"}), 500