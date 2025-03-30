import os

class Config:
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
    ALLOWED_EXTENSIONS = {"txt", "csv", "json", "xml"}

    # Ensure the upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
