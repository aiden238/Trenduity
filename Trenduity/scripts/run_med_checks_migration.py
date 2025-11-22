"""
Med Checks 테이블 마이그레이션 실행 스크립트
"""
import os
from pathlib import Path
from supabase import create_client, Client

# 환경 변수 로드
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env")
    exit(1)

# Supabase 클라이언트 생성 (service_role로 DDL 실행)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# SQL 파일 읽기
sql_file = Path(__file__).parent / 'migrations' / 'create_med_checks_table.sql'
with open(sql_file, 'r', encoding='utf-8') as f:
    sql = f.read()

print("=" * 60)
print("Med Checks 테이블 마이그레이션 실행")
print("=" * 60)

try:
    # SQL 실행 (Supabase Python 클라이언트는 rpc로 실행)
    print("\n📝 SQL 실행 중...")
    print(f"   파일: {sql_file.name}")
    print(f"   크기: {len(sql)} bytes\n")
    
    # Supabase Python SDK는 DDL 직접 실행 불가
    # 대신 안내 메시지 출력
    print("⚠️  Supabase Python SDK는 DDL(CREATE TABLE) 직접 실행을 지원하지 않습니다.")
    print("\n다음 방법 중 하나를 선택하세요:\n")
    
    print("방법 1: Supabase Dashboard (권장)")
    print("-" * 60)
    print(f"1. 브라우저에서 접속: {SUPABASE_URL.replace('https://', 'https://app.supabase.com/project/')}")
    print("2. 왼쪽 메뉴에서 'SQL Editor' 클릭")
    print("3. 'New Query' 클릭")
    print(f"4. 아래 SQL 복사 후 붙여넣기:")
    print("\n" + "─" * 60)
    print(sql)
    print("─" * 60 + "\n")
    print("5. 'RUN' 버튼 클릭\n")
    
    print("방법 2: psql CLI (고급)")
    print("-" * 60)
    print("# .env에서 DATABASE_URL 확인 후:")
    print("psql <DATABASE_URL>")
    print(f"\\i {sql_file.absolute()}\n")
    
    print("방법 3: SQL 파일 직접 확인")
    print("-" * 60)
    print(f"파일 위치: {sql_file.absolute()}\n")
    
    # 테이블 존재 여부 확인 (간접 확인)
    print("현재 med_checks 테이블 상태 확인 중...")
    try:
        result = supabase.table('med_checks').select('id').limit(1).execute()
        print("✅ med_checks 테이블이 이미 존재합니다!")
        print(f"   레코드 수: {len(result.data)}개")
    except Exception as e:
        if 'relation "public.med_checks" does not exist' in str(e):
            print("❌ med_checks 테이블이 아직 생성되지 않았습니다.")
            print("   위의 방법으로 마이그레이션을 실행해 주세요.")
        else:
            print(f"⚠️  확인 중 오류: {e}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

print("\n" + "=" * 60)
print("마이그레이션 가이드 완료")
print("=" * 60)
