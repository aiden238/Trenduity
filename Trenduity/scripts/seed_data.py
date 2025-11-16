#!/usr/bin/env python3
"""
Seed script for 50-70대 AI 학습 앱 MVP
Inserts cards, insights, qna_posts into Supabase/Postgres

Usage:
    python scripts/seed_data.py
"""

import os
import json
import sys
from pathlib import Path
from datetime import datetime

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    from dotenv import load_dotenv
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("Install with: pip install psycopg2-binary python-dotenv")
    sys.exit(1)

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("❌ DATABASE_URL not found in .env file")
    print("Example: DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres")
    sys.exit(1)

# Path to seed data JSON
SCRIPT_DIR = Path(__file__).parent
SEED_DATA_PATH = SCRIPT_DIR / 'seed_data.json'

# ============================================================
# Database Functions
# ============================================================

def get_connection():
    """PostgreSQL 연결 (UTF-8 인코딩)"""
    try:
        conn = psycopg2.connect(DATABASE_URL, client_encoding='utf8')
        print("✅ Database connected")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise

def load_seed_data():
    """seed_data.json 파일 로드"""
    try:
        with open(SEED_DATA_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ Loaded seed data from {SEED_DATA_PATH}")
        return data
    except FileNotFoundError:
        print(f"❌ Seed data file not found: {SEED_DATA_PATH}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in seed data: {e}")
        sys.exit(1)

def seed_cards(conn, cards):
    """cards 테이블에 시드 데이터 삽입 (Idempotent)"""
    cursor = conn.cursor()
    inserted = 0
    updated = 0
    
    print(f"\n📝 Seeding {len(cards)} cards...")
    
    for card in cards:
        try:
            # ON CONFLICT를 사용한 upsert
            cursor.execute("""
                INSERT INTO cards (type, title, tldr, body, impact, quiz, estimated_read_minutes)
                VALUES (%(type)s, %(title)s, %(tldr)s, %(body)s, %(impact)s, %(quiz)s, %(estimated_read_minutes)s)
                ON CONFLICT (title)
                DO UPDATE SET
                    type = EXCLUDED.type,
                    tldr = EXCLUDED.tldr,
                    body = EXCLUDED.body,
                    impact = EXCLUDED.impact,
                    quiz = EXCLUDED.quiz,
                    estimated_read_minutes = EXCLUDED.estimated_read_minutes,
                    updated_at = NOW()
                RETURNING (xmax = 0) AS inserted
            """, {
                'type': card['type'],
                'title': card['title'],
                'tldr': card['tldr'],
                'body': card['body'],
                'impact': card['impact'],
                'quiz': json.dumps(card['quiz'], ensure_ascii=False),  # JSON 직렬화
                'estimated_read_minutes': card['estimated_read_minutes']
            })
            
            result = cursor.fetchone()
            if result and result[0]:
                inserted += 1
                print(f"  ✅ Inserted: {card['title']}")
            else:
                updated += 1
                print(f"  🔄 Updated: {card['title']}")
                
        except Exception as e:
            print(f"  ❌ Failed to insert card '{card['title']}': {e}")
            conn.rollback()
            raise
    
    conn.commit()
    print(f"\n✅ Cards: {inserted} inserted, {updated} updated")
    return inserted, updated

def seed_insights(conn, insights):
    """insights 테이블에 시드 데이터 삽입 (Idempotent)"""
    cursor = conn.cursor()
    inserted = 0
    updated = 0
    
    print(f"\n💡 Seeding {len(insights)} insights...")
    
    for insight in insights:
        try:
            cursor.execute("""
                INSERT INTO insights (topic, title, summary, body, read_time_minutes, is_following)
                VALUES (%(topic)s, %(title)s, %(summary)s, %(body)s, %(read_time_minutes)s, %(is_following)s)
                ON CONFLICT (title)
                DO UPDATE SET
                    topic = EXCLUDED.topic,
                    summary = EXCLUDED.summary,
                    body = EXCLUDED.body,
                    read_time_minutes = EXCLUDED.read_time_minutes,
                    updated_at = NOW()
                RETURNING (xmax = 0) AS inserted
            """, {
                'topic': insight['topic'],
                'title': insight['title'],
                'summary': insight['summary'],
                'body': insight['body'],
                'read_time_minutes': insight['read_time_minutes'],
                'is_following': insight.get('is_following', False)
            })
            
            result = cursor.fetchone()
            if result and result[0]:
                inserted += 1
                print(f"  ✅ Inserted: {insight['title']}")
            else:
                updated += 1
                print(f"  🔄 Updated: {insight['title']}")
                
        except Exception as e:
            print(f"  ❌ Failed to insert insight '{insight['title']}': {e}")
            conn.rollback()
            raise
    
    conn.commit()
    print(f"\n✅ Insights: {inserted} inserted, {updated} updated")
    return inserted, updated

def seed_profiles(conn, profiles):
    """profiles 테이블에 데모 사용자 삽입"""
    cursor = conn.cursor()
    inserted = 0
    updated = 0
    
    print(f"\n👤 Seeding {len(profiles)} profiles...")
    
    for profile in profiles:
        try:
            cursor.execute("""
                INSERT INTO profiles (
                    id, 
                    email, 
                    display_name, 
                    age_band, 
                    a11y_mode,
                    created_at
                )
                VALUES (
                    %(id)s, 
                    %(email)s, 
                    %(display_name)s, 
                    %(age_band)s, 
                    %(a11y_mode)s,
                    NOW()
                )
                ON CONFLICT (id) 
                DO UPDATE SET
                    email = EXCLUDED.email,
                    display_name = EXCLUDED.display_name,
                    age_band = EXCLUDED.age_band,
                    a11y_mode = EXCLUDED.a11y_mode,
                    updated_at = NOW()
                RETURNING (xmax = 0) AS inserted
            """, profile)
            
            result = cursor.fetchone()
            if result and result[0]:
                inserted += 1
                print(f"  ✅ Inserted: {profile['display_name']}")
            else:
                updated += 1
                print(f"  🔄 Updated: {profile['display_name']}")
                
        except Exception as e:
            print(f"  ❌ Failed to insert profile '{profile['display_name']}': {e}")
            conn.rollback()
            raise
    
    conn.commit()
    print(f"\n✅ Profiles: {inserted} inserted, {updated} updated")
    return inserted, updated

def seed_gamification(conn, gamification_data):
    """gamification 테이블에 포인트/스트릭 데이터 삽입"""
    cursor = conn.cursor()
    inserted = 0
    updated = 0
    
    print(f"\n🎮 Seeding {len(gamification_data)} gamification records...")
    
    for gami in gamification_data:
        try:
            cursor.execute("""
                INSERT INTO gamification (
                    user_id, 
                    total_points, 
                    current_streak,
                    last_activity_date,
                    badges
                )
                VALUES (
                    %(user_id)s, 
                    %(total_points)s, 
                    %(current_streak)s,
                    CURRENT_DATE,
                    %(badges)s
                )
                ON CONFLICT (user_id) 
                DO UPDATE SET
                    total_points = EXCLUDED.total_points,
                    current_streak = EXCLUDED.current_streak,
                    last_activity_date = EXCLUDED.last_activity_date,
                    badges = EXCLUDED.badges,
                    updated_at = NOW()
                RETURNING (xmax = 0) AS inserted
            """, {
                'user_id': gami['user_id'],
                'total_points': gami['total_points'],
                'current_streak': gami['current_streak'],
                'badges': json.dumps(gami['badges'], ensure_ascii=False)
            })
            
            result = cursor.fetchone()
            if result and result[0]:
                inserted += 1
                print(f"  ✅ Inserted: {gami['user_id']} ({gami['total_points']} pts)")
            else:
                updated += 1
                print(f"  🔄 Updated: {gami['user_id']} ({gami['total_points']} pts)")
                
        except Exception as e:
            print(f"  ❌ Failed to insert gamification for '{gami['user_id']}': {e}")
            conn.rollback()
            raise
    
    conn.commit()
    print(f"\n✅ Gamification: {inserted} inserted, {updated} updated")
    return inserted, updated

def seed_family_links(conn, family_links):
    """family_links 테이블에 가족 연동 데이터 삽입"""
    cursor = conn.cursor()
    inserted = 0
    skipped = 0
    
    print(f"\n👨‍👩‍👧 Seeding {len(family_links)} family links...")
    
    for link in family_links:
        try:
            cursor.execute("""
                INSERT INTO family_links (
                    guardian_id, 
                    user_id, 
                    perms,
                    created_at
                )
                VALUES (
                    %(guardian_id)s, 
                    %(user_id)s, 
                    %(perms)s,
                    NOW()
                )
                ON CONFLICT (guardian_id, user_id) DO NOTHING
                RETURNING id
            """, {
                'guardian_id': link['guardian_id'],
                'user_id': link['user_id'],
                'perms': json.dumps(link['perms'], ensure_ascii=False)
            })
            
            result = cursor.fetchone()
            if result:
                inserted += 1
                print(f"  ✅ Linked: {link['guardian_id']} → {link['user_id']}")
            else:
                skipped += 1
                print(f"  ⏭️  Skipped (duplicate): {link['guardian_id']} → {link['user_id']}")
                
        except Exception as e:
            print(f"  ❌ Failed to insert family link: {e}")
            conn.rollback()
            raise
    
    conn.commit()
    print(f"\n✅ Family Links: {inserted} inserted, {skipped} skipped")
    return inserted, skipped

def seed_qna_posts(conn, qna_posts):
    """qna_posts 테이블에 시드 데이터 삽입"""
    cursor = conn.cursor()
    inserted = 0
    skipped = 0
    
    print(f"\n💬 Seeding {len(qna_posts)} Q&A posts...")
    
    # Demo user 생성 (없으면 생성) - 이미 profiles에서 생성됨
    
    for post in qna_posts:
        try:
            # author_nickname이 있으면 사용, 없으면 null
            author_nickname = post.get('author_nickname')
            
            cursor.execute("""
                INSERT INTO qna_posts (
                    author_id, 
                    topic, 
                    question, 
                    body, 
                    is_anon, 
                    author_nickname,
                    ai_summary,
                    answer_count,
                    vote_count,
                    created_at
                )
                VALUES (
                    'demo-user-seed', 
                    %(topic)s, 
                    %(question)s, 
                    %(body)s, 
                    %(is_anon)s,
                    %(author_nickname)s,
                    %(ai_summary)s,
                    %(answer_count)s,
                    %(vote_count)s,
                    NOW()
                )
                ON CONFLICT (question) DO NOTHING
                RETURNING id
            """, {
                'topic': post['topic'],
                'question': post['question'],
                'body': post.get('body'),
                'is_anon': post['is_anon'],
                'author_nickname': author_nickname,
                'ai_summary': post.get('ai_summary'),
                'answer_count': post.get('answer_count', 0),
                'vote_count': post.get('vote_count', 0)
            })
            
            result = cursor.fetchone()
            if result:
                inserted += 1
                anon_label = "(익명)" if post['is_anon'] else f"({author_nickname})"
                print(f"  ✅ Inserted: {post['question'][:40]}... {anon_label}")
            else:
                skipped += 1
                print(f"  ⏭️  Skipped (duplicate): {post['question'][:40]}...")
                
        except Exception as e:
            print(f"  ❌ Failed to insert Q&A '{post['question']}': {e}")
            conn.rollback()
            raise
    
    conn.commit()
    print(f"\n✅ Q&A Posts: {inserted} inserted, {skipped} skipped")
    return inserted, skipped

# ============================================================
# Main
# ============================================================

def main():
    print("=" * 60)
    print("🌱 Trenduity Seed Script")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Load seed data
        seed_data = load_seed_data()
        
        # Connect to database
        conn = get_connection()
        
        # Seed tables (profiles first for foreign key dependencies)
        profiles_inserted, profiles_updated = seed_profiles(conn, seed_data['profiles'])
        gamification_inserted, gamification_updated = seed_gamification(conn, seed_data['gamification'])
        family_links_inserted, family_links_skipped = seed_family_links(conn, seed_data['family_links'])
        cards_inserted, cards_updated = seed_cards(conn, seed_data['cards'])
        insights_inserted, insights_updated = seed_insights(conn, seed_data['insights'])
        qna_inserted, qna_skipped = seed_qna_posts(conn, seed_data['qna_posts'])
        
        # Close connection
        conn.close()
        
        # Summary
        print("\n" + "=" * 60)
        print("🎉 Seed completed successfully!")
        print("=" * 60)
        print(f"Profiles:      {profiles_inserted} inserted, {profiles_updated} updated")
        print(f"Gamification:  {gamification_inserted} inserted, {gamification_updated} updated")
        print(f"Family Links:  {family_links_inserted} inserted, {family_links_skipped} skipped")
        print(f"Cards:         {cards_inserted} inserted, {cards_updated} updated")
        print(f"Insights:      {insights_inserted} inserted, {insights_updated} updated")
        print(f"Q&A Posts:     {qna_inserted} inserted, {qna_skipped} skipped")
        print(f"Finished at:   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Seed failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
