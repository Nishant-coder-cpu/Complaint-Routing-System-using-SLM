
import os
from transformers import AutoModelForCausalLM, AutoTokenizer
import shutil

MODEL_ID = "smolify/smolified-complaint-classification"
LOCAL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "local_model")

def download_model():
    print(f"Downloading model '{MODEL_ID}'...")
    print(f"Saving to: {LOCAL_DIR}")
    
    # Create directory if not exists
    os.makedirs(LOCAL_DIR, exist_ok=True)
    
    try:
        # Download Tokenizer
        print("Downloading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
        tokenizer.save_pretrained(LOCAL_DIR)
        
        # Download Model
        print("Downloading model weights...")
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            device_map="auto",
            torch_dtype="auto"
        )
        model.save_pretrained(LOCAL_DIR)
        
        print("\n✅ Model downloaded successfully!")
        print(f"Path: {LOCAL_DIR}")
        print("\nYou can now restart the API server to use the local model.")
        
    except Exception as e:
        print(f"\n❌ Error downloading model: {e}")
        # Cleanup partial download
        if os.path.exists(LOCAL_DIR):
            shutil.rmtree(LOCAL_DIR)
            print("Cleaned up partial download.")

if __name__ == "__main__":
    download_model()
