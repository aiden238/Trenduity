#!/usr/bin/env python3
"""
seed_data.json을 SQL INSERT문으로 변환
"""

import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
SEED_DATA_PATH = SCRIPT_DIR / 'seed_data.json'
OUTPUT_PATH = SCRIPT_DIR / 'seed_data.sql'

def escape_sql_string(s):
    """SQL 문자열 이스케이프"""
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''").replace("\\", "\\\\") + "'"

def json_to_sql_string(obj):
    """JSON 객체를 PostgreSQL JSONB 문자열로 변환"""
    if obj is None:
        return 'NULL'
    return "'" + json.dumps(obj, ensure_ascii=False).replace("'", "''") + "'"

def generate_profiles_sql(profiles):
    """profiles INSERT문 생성"""
    sql_lines = []
    sql_lines.append("-- Profiles")
    sql_lines.append("INSERT INTO profiles (id, email, display_name, age_band, a11y_mode) VALUES")
    
    values = []
    for p in profiles:
        values.append(
            f"({escape_sql_string(p['id'])}, {escape_sql_string(p['email'])}, "
            f"{escape_sql_string(p['display_name'])}, {escape_sql_string(p['age_band'])}, "
            f"{escape_sql_string(p['a11y_mode'])})"
        )
    
    sql_lines.append(",\n".join(values))
    sql_lines.append("ON CONFLICT (id) DO UPDATE SET")
    sql_lines.append("  email = EXCLUDED.email,")
    sql_lines.append("  display_name = EXCLUDED.display_name,")
    sql_lines.append("  age_band = EXCLUDED.age_band,")
    sql_lines.append("  a11y_mode = EXCLUDED.a11y_mode,")
    sql_lines.append("  updated_at = NOW();")
    sql_lines.append("")
    
    return "\n".join(sql_lines)

def generate_gamification_sql(gamification):
    """gamification INSERT문 생성"""
    sql_lines = []
    sql_lines.append("-- Gamification")
    sql_lines.append("INSERT INTO gamification (user_id, total_points, current_streak, last_activity_date, badges) VALUES")
    
    values = []
    for g in gamification:
        values.append(
            f"({escape_sql_string(g['user_id'])}, {g['total_points']}, {g['current_streak']}, "
            f"CURRENT_DATE, {json_to_sql_string(g['badges'])})"
        )
    
    sql_lines.append(",\n".join(values))
    sql_lines.append("ON CONFLICT (user_id) DO UPDATE SET")
    sql_lines.append("  total_points = EXCLUDED.total_points,")
    sql_lines.append("  current_streak = EXCLUDED.current_streak,")
    sql_lines.append("  last_activity_date = EXCLUDED.last_activity_date,")
    sql_lines.append("  badges = EXCLUDED.badges,")
    sql_lines.append("  updated_at = NOW();")
    sql_lines.append("")
    
    return "\n".join(sql_lines)

def generate_family_links_sql(family_links):
    """family_links INSERT문 생성"""
    sql_lines = []
    sql_lines.append("-- Family Links")
    sql_lines.append("INSERT INTO family_links (guardian_id, user_id, perms) VALUES")
    
    values = []
    for f in family_links:
        values.append(
            f"({escape_sql_string(f['guardian_id'])}, {escape_sql_string(f['user_id'])}, "
            f"{json_to_sql_string(f['perms'])})"
        )
    
    sql_lines.append(",\n".join(values))
    sql_lines.append("ON CONFLICT (guardian_id, user_id) DO NOTHING;")
    sql_lines.append("")
    
    return "\n".join(sql_lines)

def generate_cards_sql(cards):
    """cards INSERT문 생성 - 배치 처리"""
    sql_lines = []
    sql_lines.append("-- Cards")
    sql_lines.append("INSERT INTO cards (type, title, tldr, body, impact, quiz, estimated_read_minutes) VALUES")
    
    values = []
    for c in cards:
        values.append(
            f"({escape_sql_string(c['type'])}, {escape_sql_string(c['title'])}, "
            f"{escape_sql_string(c['tldr'])}, {escape_sql_string(c['body'])}, "
            f"{escape_sql_string(c['impact'])}, {json_to_sql_string(c['quiz'])}, "
            f"{c['estimated_read_minutes']})"
        )
    
    sql_lines.append(",\n".join(values))
    sql_lines.append("ON CONFLICT (title) DO UPDATE SET")
    sql_lines.append("  type = EXCLUDED.type,")
    sql_lines.append("  tldr = EXCLUDED.tldr,")
    sql_lines.append("  body = EXCLUDED.body,")
    sql_lines.append("  impact = EXCLUDED.impact,")
    sql_lines.append("  quiz = EXCLUDED.quiz,")
    sql_lines.append("  estimated_read_minutes = EXCLUDED.estimated_read_minutes;")
    sql_lines.append("")
    
    return "\n".join(sql_lines)

def generate_insights_sql(insights):
    """insights INSERT문 생성 - 배치 처리"""
    sql_lines = []
    sql_lines.append("-- Insights")
    sql_lines.append("INSERT INTO insights (topic, title, summary, body, read_time_minutes, is_following) VALUES")
    
    values = []
    for i in insights:
        values.append(
            f"({escape_sql_string(i['topic'])}, {escape_sql_string(i['title'])}, "
            f"{escape_sql_string(i['summary'])}, {escape_sql_string(i['body'])}, "
            f"{i['read_time_minutes']}, {str(i['is_following']).lower()})"
        )
    
    sql_lines.append(",\n".join(values))
    sql_lines.append("ON CONFLICT (title) DO UPDATE SET")
    sql_lines.append("  topic = EXCLUDED.topic,")
    sql_lines.append("  summary = EXCLUDED.summary,")
    sql_lines.append("  body = EXCLUDED.body,")
    sql_lines.append("  read_time_minutes = EXCLUDED.read_time_minutes;")
    sql_lines.append("")
    
    return "\n".join(sql_lines)

def generate_qna_sql(qna_posts):
    """qna_posts INSERT문 생성"""
    sql_lines = []
    sql_lines.append("-- Q&A Posts")
    sql_lines.append("INSERT INTO qna_posts (author_id, topic, title, body, is_anon, ai_summary) VALUES")
    
    values = []
    for q in qna_posts:
        author_id = 'NULL' if q.get('is_anon', False) else escape_sql_string('demo-user-50s')
        values.append(
            f"({author_id}, {escape_sql_string(q['topic'])}, {escape_sql_string(q['title'])}, "
            f"{escape_sql_string(q.get('body', ''))}, {str(q.get('is_anon', False)).lower()}, "
            f"{escape_sql_string(q.get('ai_summary'))})"
        )
    
    sql_lines.append(",\n".join(values))
    sql_lines.append("ON CONFLICT (title) DO NOTHING;")
    sql_lines.append("")
    
    return "\n".join(sql_lines)

def main():
    print("🔄 Converting seed_data.json to SQL...")
    
    # Load JSON
    with open(SEED_DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Generate SQL
    sql_parts = []
    sql_parts.append("-- ==================================================")
    sql_parts.append("-- Trenduity Seed Data - Generated from seed_data.json")
    sql_parts.append("-- ==================================================")
    sql_parts.append("")
    
    sql_parts.append(generate_profiles_sql(data['profiles']))
    sql_parts.append(generate_gamification_sql(data['gamification']))
    sql_parts.append(generate_family_links_sql(data['family_links']))
    sql_parts.append(generate_cards_sql(data['cards']))
    sql_parts.append(generate_insights_sql(data['insights']))
    sql_parts.append(generate_qna_sql(data['qna_posts']))
    
    sql_parts.append("-- Success message")
    sql_parts.append("SELECT '✅ Seed data inserted successfully!' AS status;")
    
    # Write to file
    sql_content = "\n".join(sql_parts)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f"✅ SQL file generated: {OUTPUT_PATH}")
    print(f"📊 Total size: {len(sql_content):,} characters")

if __name__ == "__main__":
    main()
