import subprocess
import json

def verify_cid_retrievable(cid):
    try:
        result = subprocess.run(
            ["lassie", "fetch", "-o", "/dev/null", cid],
            capture_output=True,
            text=True,
            timeout=60  
        )
        
        if result.returncode == 0:
            print(f"✅ CID {cid} is retrievable")
            return True
        else:
            print(f"❌ Retrieval failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"⚠️ Error: {e}")
        return False

verify_cid_retrievable("bafybeielorzyhzg4x4newka4jqythmix5x7exotehzhzvqwldyzc5hn6ue")