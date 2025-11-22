#!/usr/bin/env python3
"""
Supabase Schema 실행 스크립트
스키마 파일을 읽어 Supabase에 실행합니다.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# 환경 변수 로드
script_dir = Path(__file__).parent
root_dir = script_dir.parent
env_path = root_dir / ".env"
load_dotenv(env_path)

# Supabase 연결
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ 오류: .env 파일에 SUPABASE_URL 및 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def execute_schema():
    """스키마 SQL 파일을 읽고 실행"""
    schema_path = script_dir / "supabase_schema.sql"
    
    if not schema_path.exists():
        print(f"❌ 오류: {schema_path} 파일을 찾을 수 없습니다.")
        sys.exit(1)
    
    print("📖 스키마 파일 읽기 중...")
    with open(schema_path, "r", encoding="utf-8") as f:
        sql_content = f.read()
    
    # SQL 문을 개별적으로 분리하여 실행
    # Supabase의 REST API는 직접 SQL 실행을 지원하지 않으므로
    # psycopg2를 사용하여 PostgreSQL에 직접 연결합니다.
    print("\n⚠️  주의: Supabase Python 클라이언트는 직접 SQL 실행을 지원하지 않습니다.")
    print("다음 두 가지 방법 중 하나를 선택하세요:\n")
    print("방법 1 (권장): Supabase Dashboard 사용")
    print("  1. https://supabase.com/dashboard 접속")
    print("  2. 프로젝트 선택 → SQL Editor")
    print("  3. 'New query' 클릭")
    print(f"  4. {schema_path} 파일 내용 복사하여 붙여넣기")
    print("  5. 'Run' 버튼 클릭\n")
    
    print("방법 2: psycopg2 사용 (로컬 PostgreSQL 또는 Connection Pooler)")
    print("  필요 패키지: pip install psycopg2-binary")
    print("  연결 문자열 필요: DATABASE_URL 환경변수\n")
    
    # 사용자 선택 대기
    choice = input("psycopg2로 직접 실행하시겠습니까? (y/N): ").strip().lower()
    
    if choice == 'y':
        try:
            import psycopg2
            from psycopg2 import sql as pg_sql
        except ImportError:
            print("❌ psycopg2가 설치되지 않았습니다. 설치하려면:")
            print("   pip install psycopg2-binary")
            sys.exit(1)
        
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL 환경변수가 설정되지 않았습니다.")
            print("   Supabase 연결 문자열 형식:")
            print("   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres")
            sys.exit(1)
        
        print(f"\n🔌 PostgreSQL 연결 중: {database_url.split('@')[1] if '@' in database_url else 'localhost'}...")
        
        try:
            conn = psycopg2.connect(database_url)
            cursor = conn.cursor()
            
            print("✅ 연결 성공!")
            print("\n🚀 스키마 실행 중...\n")
            
            # SQL 실행
            cursor.execute(sql_content)
            conn.commit()
            
            print("✅ 스키마 실행 완료!\n")
            
            # 생성된 테이블 확인
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
            print("📊 생성된 테이블 목록:")
            for idx, (table_name,) in enumerate(tables, 1):
                print(f"  {idx}. {table_name}")
            
            print(f"\n✨ 총 {len(tables)}개 테이블 생성 완료!")
            
            cursor.close()
            conn.close()
            
        except psycopg2.Error as e:
            print(f"❌ PostgreSQL 오류: {e}")
            sys.exit(1)
    else:
        print("\n📋 스키마 SQL을 복사하려면:")
        print(f"   cat {schema_path}")
        print(f"   또는 VS Code에서 {schema_path} 파일을 열어 전체 선택 후 복사하세요.")

if __name__ == "__main__":
    print("=" * 60)
    print("Trenduity - Supabase Schema 실행")
    print("=" * 60)
    execute_schema()
