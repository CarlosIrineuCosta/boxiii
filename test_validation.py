#!/usr/bin/env python3
"""
Test script for platform validation without external dependencies
Tests the validation logic that was moved to the API layer
"""

import json
import sys
sys.path.append('/home/cdc/projects/boxiii/builder/backend')

def validate_handle_characters(v: str) -> str:
    """Platform handle validation logic from api_server.py"""
    if not v or not v.strip():
        raise ValueError("Platform handle cannot be empty")
        
    forbidden_chars = [' ', '\t', '\n', '@', '#', '&', '?', '=', '+', '%']
    for char in forbidden_chars:
        if char in v:
            raise ValueError(f"Platform handle '{v}' is invalid! Handles cannot contain spaces or special characters like: {', '.join(forbidden_chars)}")
    return v.strip()

def validate_supported_platform(v: str) -> str:
    """Platform validation logic from api_server.py"""
    valid_platforms = ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'website', 'facebook', 'twitch']
    v_lower = v.lower().strip()
    if v_lower not in valid_platforms:
        raise ValueError(f"Platform '{v}' is not supported. Valid platforms: {', '.join(valid_platforms)}")
    return v_lower

def test_platform_validation():
    """Test platform validation with various inputs"""
    print("🧪 Testing Platform Validation Logic")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        # Valid cases
        ("youtube", "validhandle", True, "Valid YouTube handle"),
        ("INSTAGRAM", "myhandle123", True, "Valid Instagram handle with mixed case"),
        ("website", "my-website.com", True, "Valid website handle with dash and dot"),
        
        # Invalid handles
        ("youtube", "test handle", False, "Handle with space"),
        ("instagram", "test@handle", False, "Handle with @ symbol"), 
        ("twitter", "test#hashtag", False, "Handle with # symbol"),
        ("linkedin", "test?query", False, "Handle with ? symbol"),
        ("youtube", "", False, "Empty handle"),
        ("facebook", "   ", False, "Whitespace only handle"),
        
        # Invalid platforms
        ("invalidplatform", "testhandle", False, "Unsupported platform"),
        ("snapchat", "myhandle", False, "Snapchat not in supported list"),
    ]
    
    passed = 0
    failed = 0
    
    for platform, handle, should_pass, description in test_cases:
        try:
            # Test platform validation
            validated_platform = validate_supported_platform(platform)
            # Test handle validation  
            validated_handle = validate_handle_characters(handle)
            
            if should_pass:
                print(f"✅ PASS: {description}")
                print(f"   Platform: '{platform}' → '{validated_platform}'")
                print(f"   Handle: '{handle}' → '{validated_handle}'")
                passed += 1
            else:
                print(f"❌ FAIL: {description} (should have been rejected)")
                failed += 1
                
        except ValueError as e:
            if not should_pass:
                print(f"✅ PASS: {description}")
                print(f"   Correctly rejected: {e}")
                passed += 1
            else:
                print(f"❌ FAIL: {description} (should have been accepted)")
                print(f"   Error: {e}")
                failed += 1
        except Exception as e:
            print(f"❌ ERROR: {description}")
            print(f"   Unexpected error: {e}")
            failed += 1
        
        print()  # Empty line for readability
    
    print("=" * 50)
    print(f"📊 Test Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All tests passed! Platform validation is working correctly.")
        return True
    else:
        print("⚠️  Some tests failed. Check the validation logic.")
        return False

def simulate_api_request():
    """Simulate what happens when frontend sends a request"""
    print("\n🌐 Simulating API Request Flow")
    print("=" * 50)
    
    # Simulate frontend form data
    creator_data = {
        "display_name": "Test Creator",
        "platforms": [
            {"platform": "youtube", "handle": "validhandle"},
            {"platform": "instagram", "handle": "test handle with spaces"}  # This should fail
        ],
        "description": "A test creator",
        "categories": ["technology_gaming"],
        "verified": False
    }
    
    print("Frontend sends creator data:")
    print(json.dumps(creator_data, indent=2))
    print()
    
    # Simulate Pydantic validation
    print("🔍 API Layer (Pydantic) Validation:")
    try:
        for i, platform_data in enumerate(creator_data["platforms"]):
            platform = platform_data["platform"] 
            handle = platform_data["handle"]
            
            print(f"  Platform {i+1}: {platform}/{handle}")
            
            # This is what Pydantic would do
            validated_platform = validate_supported_platform(platform)
            validated_handle = validate_handle_characters(handle)
            
            print(f"    ✅ Validated: {validated_platform}/{validated_handle}")
        
        print("\n✅ All platforms valid - would proceed to database")
        
    except ValueError as e:
        print(f"\n❌ Validation Error (HTTP 422 would be returned):")
        print(f"    {e}")
        print(f"\n📱 Frontend would display this error in the modal")
        print(f"🚫 No database operation would occur")

if __name__ == "__main__":
    # Run validation tests
    success = test_platform_validation()
    
    # Simulate API flow
    simulate_api_request()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)