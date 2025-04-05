import requests
from flask import jsonify

API_KEY = "2d3854c9.ab6f995639714927b8e730c97352e5d0"

def get_uploads(last_key=None):
    """
    Fetch all file uploads from Lighthouse API using Bearer token.
    
    :param last_key: The ID of the last object from the previous response (optional).
    :return: JSON response with uploaded file details.
    """
    url = "https://api.lighthouse.storage/api/user/files_uploaded"
    headers = {
        "Authorization": f"Bearer {API_KEY}"  # Use Bearer token in headers
    }
    
    params = {"lastKey": last_key} if last_key else {}

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()  # Raise an error for bad responses (4xx, 5xx)
        return response.json()  # Return the JSON response

    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching uploads: {e}")
        return {"error": "Failed to fetch uploads", "details": str(e)}