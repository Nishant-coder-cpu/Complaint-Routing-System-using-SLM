"""
Test script for the Grievance Classification API
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_single_classification():
    """Test /classify endpoint"""
    print("=== Testing /classify endpoint ===")
    
    payload = {
        "complaint": "My supervisor keeps making comments about my body and asking me to stay late alone with him. I'm scared to report this because he controls my appraisal."
    }
    
    response = requests.post(f"{BASE_URL}/classify", json=payload)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()

def test_batch_classification():
    """Test /classify/batch endpoint"""
    print("=== Testing /classify/batch endpoint ===")
    
    payload = {
        "complaints": [
            "The lab equipment is faulty and yesterday there was a small fire. Nobody is taking this seriously.",
            "wifi in hostel not working since 15 days. exam hai aur padhai nahi ho rahi.",
            "I am being asked to pay 50000 rupees to get my transfer approved. This is pure corruption."
        ]
    }
    
    response = requests.post(f"{BASE_URL}/classify/batch", json=payload)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()

def test_health_check():
    """Test /health endpoint"""
    print("=== Testing /health endpoint ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()

def test_explain():
    """Test /explain endpoint"""
    print("=== Testing /explain endpoint ===")
    
    payload = {
        "complaint": "My supervisor keeps making comments about my body and asking me to stay late alone with him. I'm scared to report this because he controls my appraisal."
    }
    
    response = requests.post(f"{BASE_URL}/explain", json=payload)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()

if __name__ == "__main__":
    try:
        test_health_check()
        test_single_classification()
        test_batch_classification()
        test_explain()
    except requests.exceptions.ConnectionError:
        print("Error: API server is not running!")
        print("Start the server first: uvicorn api:app --reload")
