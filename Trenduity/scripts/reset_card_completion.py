#!/usr/bin/env python3
"""Reset card completion for E2E testing"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# demo-user-50s의 completed_cards 삭제
user_id = 'demo-user-50s'
card_id = 'ee4148a8-6f5b-497f-8f44-40c537e19220'

print(f"🗑️  Deleting completion record for user={user_id}, card={card_id}")

result = client.table('completed_cards').delete().eq('user_id', user_id).eq('card_id', card_id).execute()

print(f"✅ Deleted {len(result.data)} records")
print(f"   Records: {result.data}")

# Gamification 포인트 초기화
print(f"\n🔄 Resetting gamification for user={user_id}")
gamif_result = client.table('gamification').update({
    'total_points': 0,
    'current_streak': 0,
    'longest_streak': 0,
    'last_activity_date': None
}).eq('user_id', user_id).execute()

print(f"✅ Reset gamification: {gamif_result.data}")
