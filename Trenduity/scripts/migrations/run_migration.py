#!/usr/bin/env python3
"""Run migration 002_verify_gamification_structure"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("❌ DATABASE_URL not found")
    exit(1)

# Read migration file
with open('002_verify_gamification_structure.sql', 'r', encoding='utf-8') as f:
    migration_sql = f.read()

# Execute migration
try:
    conn = psycopg2.connect(DATABASE_URL, client_encoding='utf8')
    cursor = conn.cursor()
    
    print("🚀 Executing migration 002_verify_gamification_structure...")
    cursor.execute(migration_sql)
    
    # Fetch result
    result = cursor.fetchone()
    if result:
        print(f"✅ {result[0]}")
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("✅ Migration completed successfully")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    if conn:
        conn.rollback()
    raise
