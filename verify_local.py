#!/usr/bin/env python3
"""
Quick verification script to test basic functionality of the RAG Chatbot
"""
import asyncio
import requests
import time
import sys
from typing import Dict, Any

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check: {data.get('status', 'unknown')}")
            checks = data.get('checks', {})
            for service, status in checks.items():
                print(f"  {service}: {'✅' if status else '❌'}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_basic_chat():
    """Test basic chat functionality"""
    print("\nTesting basic chat functionality...")
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/chat",
            json={"query": "What is this system?"},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            required_fields = ["response", "session_id", "citations", "query_id", "response_id", "token_count", "retrieved_chunks"]
            missing_fields = [field for field in required_fields if field not in data]

            if missing_fields:
                print(f"❌ Missing fields in response: {missing_fields}")
                return False

            print(f"✅ Chat endpoint working")
            print(f"  Response length: {len(data.get('response', ''))} chars")
            print(f"  Citations: {len(data.get('citations', []))}")
            print(f"  Token count: {data.get('token_count', 0)}")
            print(f"  Retrieved chunks: {data.get('retrieved_chunks', 0)}")
            return True
        else:
            print(f"❌ Chat test failed with status {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Chat test error: {e}")
        return False

def test_selected_text():
    """Test selected text functionality"""
    print("\nTesting selected text functionality...")
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/chat",
            json={
                "query": "Summarize this text",
                "selected_text": "Humanoid robots are robots with physical features resembling the human body."
            },
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            response_text = data.get('response', '')
            print(f"✅ Selected text endpoint working")
            print(f"  Response length: {len(response_text)} chars")
            return True
        else:
            print(f"❌ Selected text test failed with status {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Selected text test error: {e}")
        return False

def test_session_continuity():
    """Test session continuity"""
    print("\nTesting session continuity...")
    try:
        session_id = f"test_session_{int(time.time())}"

        # First query
        response1 = requests.post(
            "http://localhost:8000/api/v1/chat",
            json={
                "query": "What is ROS 2?",
                "session_id": session_id
            },
            timeout=30
        )

        # Second query with same session
        response2 = requests.post(
            "http://localhost:8000/api/v1/chat",
            json={
                "query": "How do nodes communicate?",
                "session_id": session_id
            },
            timeout=30
        )

        if response1.status_code == 200 and response2.status_code == 200:
            data1 = response1.json()
            data2 = response2.json()

            same_session = data1.get('session_id') == data2.get('session_id')
            print(f"✅ Session continuity working: {same_session}")
            print(f"  Session ID: {data1.get('session_id')}")
            return same_session
        else:
            print(f"❌ Session test failed - Status codes: {response1.status_code}, {response2.status_code}")
            return False
    except Exception as e:
        print(f"❌ Session test error: {e}")
        return False

def main():
    print("RAG Chatbot Local Verification Script")
    print("=" * 50)

    # Check if server is running
    print("Checking if server is running at http://localhost:8000...")
    try:
        requests.get("http://localhost:8000/", timeout=5)
        print("✅ Server is running")
    except:
        print("❌ Server is not running. Please start the server with:")
        print("   uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload")
        print("   Or run: ./start_server.sh")
        return 1

    # Run all tests
    tests = [
        ("Health Check", test_health),
        ("Basic Chat", test_basic_chat),
        ("Selected Text", test_selected_text),
        ("Session Continuity", test_session_continuity),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}")
        print("-" * 30)
        result = test_func()
        results.append((test_name, result))

    # Summary
    print("\n" + "=" * 50)
    print("VERIFICATION SUMMARY")
    print("=" * 50)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")

    print(f"\nOverall: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! The system is ready for deployment.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the output above and resolve issues before deployment.")
        return 1

if __name__ == "__main__":
    sys.exit(main())