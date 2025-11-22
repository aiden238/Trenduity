#!/usr/bin/env python3
"""Check cards in Supabase"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

result = client.table('cards').select('id, title').limit(10).execute()

print('📝 Cards in database:')
for card in result.data:
    print(f"  {card['id']} - {card['title']}")

print(f"\nTotal cards found: {len(result.data)}")
