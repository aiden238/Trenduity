#!/usr/bin/env python3
"""Check gamification table structure"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

cursor.execute("""
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'gamification'
    ORDER BY ordinal_position;
""")

print("📊 Gamification table structure:")
print(f"{'Column':<20} {'Type':<20} {'Default':<30} {'Nullable':<10}")
print("-" * 80)
for row in cursor.fetchall():
    print(f"{row[0]:<20} {row[1]:<20} {str(row[2])[:28]:<30} {row[3]:<10}")

cursor.close()
conn.close()
