"""카드 완료 두 번 연속 호출 테스트 (중복 방지 검증)"""
import requests
import time

BASE_URL = "http://localhost:8002"
CARD_ID = "ee4148a8-6f5b-497f-8f44-40c537e19220"
TOKEN = "test-jwt-token-for-senior-user"

def test_double_completion():
    print("🧪 Testing double card completion...")
    print(f"   Card ID: {CARD_ID}")
    print(f"   Token: {TOKEN[:20]}...")
    print()
    
    # 첫 번째 완료
    print("📤 First completion attempt...")
    response1 = requests.post(
        f"{BASE_URL}/v1/cards/complete",
        headers={"Authorization": f"Bearer {TOKEN}"},
        json={"card_id": CARD_ID}
    )
    print(f"   Status: {response1.status_code}")
    if response1.status_code == 200:
        print(f"   ✅ First completion success: {response1.json()}")
    else:
        print(f"   ❌ First completion failed: {response1.text}")
        return
    
    print()
    print("⏳ Waiting 1 second...")
    time.sleep(1)
    print()
    
    # 두 번째 완료 (중복)
    print("📤 Second completion attempt (duplicate)...")
    response2 = requests.post(
        f"{BASE_URL}/v1/cards/complete",
        headers={"Authorization": f"Bearer {TOKEN}"},
        json={"card_id": CARD_ID}
    )
    print(f"   Status: {response2.status_code}")
    if response2.status_code == 400:
        print(f"   ✅ Duplicate blocked (expected): {response2.json()}")
    elif response2.status_code == 500:
        print(f"   ❌ Server error (500): {response2.text}")
    else:
        print(f"   ⚠️  Unexpected status: {response2.text}")

if __name__ == "__main__":
    test_double_completion()
