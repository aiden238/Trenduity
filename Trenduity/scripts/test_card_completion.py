#!/usr/bin/env python3
"""Direct test of card completion API"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = 'http://localhost:8002'
TOKEN = 'test-jwt-token-for-senior-user'
CARD_ID = 'ee4148a8-6f5b-497f-8f44-40c537e19220'

print("🧪 Testing card completion API directly...")
print(f"   Card ID: {CARD_ID}")
print(f"   Token: {TOKEN[:20]}...")

response = requests.post(
    f'{BASE_URL}/v1/cards/complete',
    json={'card_id': CARD_ID},
    headers={'Authorization': f'Bearer {TOKEN}'}
)

print(f"\n📊 Response:")
print(f"   Status: {response.status_code}")
print(f"   Headers: {dict(response.headers)}")
print(f"   Body: {response.text[:500]}")

if response.status_code == 500:
    print("\n❌ 500 Internal Server Error - Check detailed error above")
else:
    print(f"\n✅ Success - {response.json()}")
