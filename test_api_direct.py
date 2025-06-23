#!/usr/bin/env python3
"""
Direct API test using requests to verify platform validation
This will test against the running container or localhost API
"""

import requests
import json
import time

def test_api_validation(base_url="http://localhost:5001"):
    """Test the API validation directly"""
    print(f"🌐 Testing API Platform Validation at {base_url}")
    print("=" * 60)
    
    # Test data
    test_cases = [
        {
            "name": "Valid Creator",
            "data": {
                "display_name": "Valid Test Creator",
                "platforms": [
                    {"platform": "youtube", "handle": "validhandle"},
                    {"platform": "instagram", "handle": "anothergoodhandle"}
                ],
                "description": "A valid test creator",
                "categories": ["technology_gaming"],
                "verified": False
            },
            "should_succeed": True
        },
        {
            "name": "Invalid Handle with Spaces",
            "data": {
                "display_name": "Invalid Test Creator",
                "platforms": [
                    {"platform": "youtube", "handle": "test handle with spaces"}
                ],
                "description": "This should fail",
                "categories": ["technology_gaming"],
                "verified": False
            },
            "should_succeed": False
        },
        {
            "name": "Invalid Platform",
            "data": {
                "display_name": "Another Invalid Creator",
                "platforms": [
                    {"platform": "snapchat", "handle": "validhandle"}
                ],
                "description": "Unsupported platform",
                "categories": ["technology_gaming"],
                "verified": False
            },
            "should_succeed": False
        }
    ]
    
    # Check if API is running
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code != 200:
            print(f"❌ API health check failed: {response.status_code}")
            return False
        print(f"✅ API is running at {base_url}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to API at {base_url}: {e}")
        print(f"💡 Make sure the backend is running:")
        print(f"   cd /home/cdc/projects/boxiii/builder/backend")
        print(f"   python3 api_server.py")
        return False
    
    print()
    
    # Test each case
    for test_case in test_cases:
        print(f"🧪 Testing: {test_case['name']}")
        print(f"   Data: {json.dumps(test_case['data'], indent=6)}")
        
        try:
            response = requests.post(
                f"{base_url}/api/creators",
                json=test_case['data'],
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if test_case['should_succeed']:
                if response.status_code in [200, 201]:
                    print(f"   ✅ SUCCESS: Creator created (status {response.status_code})")
                    # Clean up - delete the created creator
                    try:
                        created_data = response.json()
                        creator_id = created_data.get('creator_id')
                        if creator_id:
                            delete_response = requests.delete(f"{base_url}/api/creators/{creator_id}")
                            print(f"   🗑️  Cleaned up test creator")
                    except:
                        pass
                else:
                    print(f"   ❌ FAILED: Expected success but got {response.status_code}")
                    print(f"      Response: {response.text}")
            else:
                if response.status_code == 422:
                    error_data = response.json()
                    print(f"   ✅ SUCCESS: Correctly rejected with 422 Unprocessable Entity")
                    print(f"      Error: {error_data.get('detail', 'No detail')}")
                else:
                    print(f"   ❌ FAILED: Expected 422 but got {response.status_code}")
                    print(f"      Response: {response.text}")
                    
        except requests.exceptions.RequestException as e:
            print(f"   ❌ ERROR: Request failed: {e}")
        
        print()
    
    return True

if __name__ == "__main__":
    # Try local API first, then container
    success = False
    
    # Check localhost first (if running locally)
    success = test_api_validation("http://localhost:5001")
    
    if not success:
        # Try container port
        print("\n" + "="*60)
        print("Trying container port...")
        success = test_api_validation("http://localhost:5001")
    
    if success:
        print("🎉 Platform validation testing completed!")
    else:
        print("⚠️  Could not test API validation - ensure backend is running")