#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Supabase INSERT SQL 생성기
courses_seed_data.json을 읽어서 INSERT 문 생성
"""

import json
import sys
from pathlib import Path

# UTF-8 출력 설정
sys.stdout.reconfigure(encoding='utf-8')

SCRIPT_DIR = Path(__file__).parent
COURSES_SEED_PATH = SCRIPT_DIR / 'courses_seed_data.json'

def escape_sql(text):
    """SQL 문자열 이스케이프"""
    if text is None:
        return "NULL"
    return "'" + str(text).replace("'", "''") + "'"

def main():
    # JSON 로드
    with open(COURSES_SEED_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("-- ==========================================")
    print("-- 강좌 시스템 데이터 INSERT")
    if 'metadata' in data:
        print("-- 생성 시간:", data['metadata'].get('generated_at', 'N/A'))
    print("-- ==========================================\n")
    
    # Courses INSERT
    print("-- 강좌 테이블 삽입")
    for course in data['courses']:
        sql = f"""INSERT INTO courses (id, title, thumbnail, description, category, total_lectures)
VALUES (
  {escape_sql(course['id'])},
  {escape_sql(course['title'])},
  {escape_sql(course['thumbnail'])},
  {escape_sql(course['description'])},
  {escape_sql(course['category'])},
  {course['total_lectures']}
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  thumbnail = EXCLUDED.thumbnail,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  total_lectures = EXCLUDED.total_lectures,
  updated_at = NOW();
"""
        print(sql)
    
    print("\n-- 강의 테이블 삽입")
    for course in data['courses']:
        for lecture in course['lectures']:
            # panels를 JSON 문자열로 변환
            panels_json = json.dumps(lecture['panels'], ensure_ascii=False)
            panels_escaped = panels_json.replace("'", "''")
            
            sql = f"""INSERT INTO lectures (course_id, lecture_number, title, duration, script, panels)
VALUES (
  {escape_sql(course['id'])},
  {lecture['lecture_number']},
  {escape_sql(lecture['title'])},
  {lecture['duration']},
  {escape_sql(lecture['script'])},
  '{panels_escaped}'::jsonb
)
ON CONFLICT (course_id, lecture_number) DO UPDATE SET
  title = EXCLUDED.title,
  duration = EXCLUDED.duration,
  script = EXCLUDED.script,
  panels = EXCLUDED.panels;
"""
            print(sql)
    
    print("\n-- 완료!")
    print(f"-- Courses: {len(data['courses'])}개")
    total_lectures = sum(len(c['lectures']) for c in data['courses'])
    print(f"-- Lectures: {total_lectures}개")

if __name__ == '__main__':
    main()
