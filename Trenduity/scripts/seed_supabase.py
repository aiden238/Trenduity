#!/usr/bin/env python3
"""
Supabase REST API를 사용한 시드 데이터 삽입
psycopg2 대신 Supabase 클라이언트 사용
"""

import os
import json
import sys
from pathlib import Path
from dotenv import load_dotenv

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ supabase-py not installed")
    print("Install with: pip install supabase")
    sys.exit(1)

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env")
    sys.exit(1)

# Path to seed data JSON
SCRIPT_DIR = Path(__file__).parent
SEED_DATA_PATH = SCRIPT_DIR / 'seed_data.json'

def main():
    print("=" * 60)
    print("🌱 Trenduity Seed Script (Supabase)")
    print("=" * 60)
    
    # Connect to Supabase
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    print("✅ Connected to Supabase")
    
    # Load seed data
    with open(SEED_DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"✅ Loaded seed data from {SEED_DATA_PATH}")
    
    # Seed cards
    if 'cards' in data:
        print(f"\n📝 Seeding {len(data['cards'])} cards...")
        for card in data['cards']:
            try:
                # Upsert card
                result = supabase.table('cards').upsert(card, on_conflict='title').execute()
                print(f"  ✓ {card['title'][:50]}...")
            except Exception as e:
                print(f"  ❌ Failed to insert card '{card['title']}': {e}")
        print(f"✅ Cards seeded")
    
    # Seed insights
    if 'insights' in data:
        print(f"\n💡 Seeding {len(data['insights'])} insights...")
        for insight in data['insights']:
            try:
                result = supabase.table('insights').upsert(insight, on_conflict='title').execute()
                print(f"  ✓ {insight['title'][:50]}...")
            except Exception as e:
                print(f"  ❌ Failed to insert insight '{insight['title']}': {e}")
        print(f"✅ Insights seeded")
    
    # Seed QnA posts
    if 'qna_posts' in data:
        print(f"\n❓ Seeding {len(data['qna_posts'])} QnA posts...")
        for post in data['qna_posts']:
            try:
                result = supabase.table('qna_posts').upsert(post, on_conflict='question').execute()
                print(f"  ✓ {post['question'][:50]}...")
            except Exception as e:
                print(f"  ❌ Failed to insert QnA '{post['question']}': {e}")
        print(f"✅ QnA posts seeded")
    
    print("\n" + "=" * 60)
    print("✅ Seed completed successfully!")
    print("=" * 60)

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ Seed failed: {e}")
        sys.exit(1)
