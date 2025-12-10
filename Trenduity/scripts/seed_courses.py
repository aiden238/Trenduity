#!/usr/bin/env python3
"""
강좌 시드 스크립트 - EBSI 스타일 학습 시스템
60-70대를 위한 AI 활용 강좌 데이터 로딩

Usage:
    python scripts/seed_courses.py
"""

import os
import json
import sys
from pathlib import Path
from datetime import datetime

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor, Json
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
    sys.exit(1)

# Path to seed data JSON
SCRIPT_DIR = Path(__file__).parent
COURSES_SEED_PATH = SCRIPT_DIR / 'courses_seed_data.json'

# ============================================================
# Database Functions
# ============================================================

def get_connection():
    """PostgreSQL 연결"""
    try:
        conn = psycopg2.connect(DATABASE_URL, client_encoding='utf8')
        print("✅ Database connected")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise

def check_schema_exists(conn):
    """강좌 테이블이 존재하는지 확인"""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'courses'
                );
            """)
            exists = cur.fetchone()[0]
            return exists
    except Exception as e:
        print(f"❌ Schema check failed: {e}")
        return False

def drop_existing_tables(conn):
    """기존 강좌 테이블 삭제 (스키마 변경 시)"""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                DROP TABLE IF EXISTS user_course_progress CASCADE;
                DROP TABLE IF EXISTS lectures CASCADE;
                DROP TABLE IF EXISTS courses CASCADE;
            """)
        conn.commit()
        print("✅ Existing tables dropped")
        return True
    except Exception as e:
        print(f"❌ Drop tables failed: {e}")
        conn.rollback()
        return False

def apply_schema(conn):
    """courses_schema.sql 적용"""
    schema_path = SCRIPT_DIR / 'courses_schema.sql'
    if not schema_path.exists():
        print(f"❌ Schema file not found: {schema_path}")
        return False
    
    try:
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        with conn.cursor() as cur:
            cur.execute(schema_sql)
        conn.commit()
        print("✅ Schema applied successfully")
        return True
    except Exception as e:
        print(f"❌ Schema application failed: {e}")
        conn.rollback()
        return False

# ============================================================
# Seed Functions
# ============================================================

def seed_courses(conn, courses_data):
    """강좌 및 강의 데이터 삽입"""
    if not courses_data:
        print("⚠️ No course data to seed")
        return
    
    courses_inserted = 0
    courses_updated = 0
    lectures_inserted = 0
    lectures_updated = 0
    
    try:
        with conn.cursor() as cur:
            for course in courses_data:
                # 강좌 upsert
                cur.execute("""
                    INSERT INTO courses (
                        id, title, thumbnail, description, 
                        category, total_lectures, created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        thumbnail = EXCLUDED.thumbnail,
                        description = EXCLUDED.description,
                        category = EXCLUDED.category,
                        total_lectures = EXCLUDED.total_lectures,
                        updated_at = NOW()
                    RETURNING (xmax = 0) AS inserted;
                """, (
                    course['id'],
                    course['title'],
                    course['thumbnail'],
                    course['description'],
                    course['category'],
                    course['total_lectures']
                ))
                
                result = cur.fetchone()
                if result and result[0]:
                    courses_inserted += 1
                else:
                    courses_updated += 1
                
                # 강의 삽입
                for lecture in course.get('lectures', []):
                    # panels를 JSON으로 변환
                    panels_json = Json(lecture.get('panels', []))
                    
                    cur.execute("""
                        INSERT INTO lectures (
                            course_id, lecture_number, title, duration, 
                            script, panels, created_at
                        ) VALUES (%s, %s, %s, %s, %s, %s, NOW())
                        ON CONFLICT (course_id, lecture_number) DO UPDATE SET
                            title = EXCLUDED.title,
                            duration = EXCLUDED.duration,
                            script = EXCLUDED.script,
                            panels = EXCLUDED.panels
                        RETURNING (xmax = 0) AS inserted;
                    """, (
                        course['id'],
                        lecture['lecture_number'],
                        lecture['title'],
                        lecture['duration'],
                        lecture['script'],
                        panels_json
                    ))
                    
                    result = cur.fetchone()
                    if result and result[0]:
                        lectures_inserted += 1
                    else:
                        lectures_updated += 1
        
        conn.commit()
        print(f"✅ Courses: {courses_inserted} inserted, {courses_updated} updated")
        print(f"✅ Lectures: {lectures_inserted} inserted, {lectures_updated} updated")
        
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        conn.rollback()
        raise

# ============================================================
# Main
# ============================================================

def main():
    print("=" * 60)
    print("📚 강좌 시드 스크립트 시작")
    print("=" * 60)
    
    # Load seed data
    if not COURSES_SEED_PATH.exists():
        print(f"❌ Seed data not found: {COURSES_SEED_PATH}")
        sys.exit(1)
    
    with open(COURSES_SEED_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    courses = data.get('courses', [])
    print(f"📖 Loaded {len(courses)} courses from {COURSES_SEED_PATH.name}")
    
    # Connect to database
    conn = get_connection()
    
    try:
        # Drop existing tables to recreate with new schema
        print("🗑️ Dropping existing tables for schema update...")
        drop_existing_tables(conn)
        
        # Apply new schema
        print("⚙️ Applying new schema...")
        if not apply_schema(conn):
            print("❌ Failed to apply schema")
            sys.exit(1)
        
        # Seed courses
        print("\n📚 Seeding courses...")
        seed_courses(conn, courses)
        
        print("\n" + "=" * 60)
        print("✅ 강좌 시드 완료!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == '__main__':
    main()
