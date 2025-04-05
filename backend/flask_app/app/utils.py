from app.config import Config
import random
import string
import requests
import os
from typing import Optional, Dict, Union, BinaryIO
from pathlib import Path

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def generate_random_string(length=12):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))




class AkaveClient:
    def __init__(self, base_url: str = "http://localhost:8000", api_key: Optional[str] = None):
        """
        Initialize the Akave API client.
        
        Args:
            base_url: Base URL of the Akave Link API (default: http://localhost:8000)
            api_key: Optional API key for authentication
        """
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({'Authorization': f'Bearer {api_key}'})
    
    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Union[Dict, BinaryIO]] = None,
        params: Optional[Dict] = None,
        files: Optional[Dict] = None
    ) -> Dict:
        """
        Internal method to make API requests.
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            data: JSON payload for POST/PUT requests
            params: Query parameters for GET requests
            files: Files to upload for multipart requests
            
        Returns:
            Dictionary containing the API response
            
        Raises:
            requests.exceptions.RequestException: If the request fails
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data if data and not files else None,
                params=params,
                files=files
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            error_msg = e.response.json().get('error', str(e)) if hasattr(e, 'response') else str(e)
            raise requests.exceptions.RequestException(f"Akave API error: {error_msg}") from e

    # Bucket Operations
    
    def create_bucket(self, bucket_name: str) -> Dict:
        """
        Create a new storage bucket.
        
        Args:
            bucket_name: Name of the bucket to create
            
        Returns:
            Dictionary containing the API response
        """
        return self._request('POST', '/buckets', data={'bucketName': bucket_name})
    
    def list_buckets(self) -> Dict:
        """
        List all existing buckets.
        
        Returns:
            Dictionary containing the list of buckets
        """
        return self._request('GET', '/buckets')
    
    def get_bucket(self, bucket_name: str) -> Dict:
        """
        Get details of a specific bucket.
        
        Args:
            bucket_name: Name of the bucket to retrieve
            
        Returns:
            Dictionary containing bucket details
        """
        return self._request('GET', f'/buckets/{bucket_name}')
    
    # File Operations
    
    def list_files(self, bucket_name: str) -> Dict:
        """
        List all files in a bucket.
        
        Args:
            bucket_name: Name of the bucket
            
        Returns:
            Dictionary containing the list of files
        """
        return self._request('GET', f'/buckets/{bucket_name}/files')
    
    def get_file_info(self, bucket_name: str, file_name: str) -> Dict:
        """
        Get metadata about a specific file.
        
        Args:
            bucket_name: Name of the bucket
            file_name: Name of the file
            
        Returns:
            Dictionary containing file metadata
        """
        return self._request('GET', f'/buckets/{bucket_name}/files/{file_name}')
    
    def upload_file(
        self,
        bucket_name: str,
        file_path: Union[str, Path],
        file_name: Optional[str] = None
    ) -> Dict:
        """
        Upload a file to a bucket.
        
        Args:
            bucket_name: Name of the bucket
            file_path: Path to the file to upload
            file_name: Optional custom name for the uploaded file
            
        Returns:
            Dictionary containing upload result
            
        Note:
            Minimum file size is 127 bytes. Max size for testing is 100MB.
        """
        file_path = Path(file_path)
        if not file_path.is_file():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if file_path.stat().st_size < 127:
            raise ValueError("File size must be at least 127 bytes")
            
        file_name = file_name or file_path.name
        
        with open(file_path, 'rb') as f:
            files = {'file': (file_name, f)}
            return self._request(
                'POST',
                f'/buckets/{bucket_name}/files',
                files=files
            )
    
    def download_file(
        self,
        bucket_name: str,
        file_name: str,
        output_dir: Union[str, Path] = ".",
        output_name: Optional[str] = None
    ) -> str:
        """
        Download a file from a bucket.
        
        Args:
            bucket_name: Name of the bucket
            file_name: Name of the file to download
            output_dir: Directory to save the downloaded file (default: current directory)
            output_name: Optional custom name for the downloaded file
            
        Returns:
            Path to the downloaded file
            
        Note:
            The output file extension will match the original file.
        """
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_name = output_name or file_name
        output_path = output_dir / output_name
        
        download_url = f"{self.base_url}/buckets/{bucket_name}/files/{file_name}/download"
        
        try:
            response = self.session.get(download_url, stream=True)
            response.raise_for_status()
            
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            return str(output_path)
        except requests.exceptions.RequestException as e:
            if os.path.exists(output_path):
                os.remove(output_path)
            raise requests.exceptions.RequestException(f"Download failed: {str(e)}") from e
    
    def get_download_url(self, bucket_name: str, file_name: str) -> str:
        """
        Get a direct download URL for a file.
        
        Args:
            bucket_name: Name of the bucket
            file_name: Name of the file
            
        Returns:
            Direct download URL
        """
        return f"{self.base_url}/buckets/{bucket_name}/files/{file_name}/download"