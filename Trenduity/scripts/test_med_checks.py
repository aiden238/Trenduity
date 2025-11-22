"""Med Checks 테이블 테스트"""
from supabase import create_client
import os
from datetime import date
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

print("=" * 60)
print("Med Checks 테이블 테스트")
print("=" * 60)

# 1. INSERT 테스트
print("\n1. INSERT 테스트")
try:
    result = supabase.table('med_checks').insert({
        'user_id': 'demo-user-50s',
        'date': date.today().isoformat(),
        'time_slot': 'afternoon',  # morning은 이미 있을 수 있음
        'medication_name': '테스트약'
    }).execute()
    
    print(f"✅ INSERT 성공: {result.data[0]['id']}")
except Exception as e:
    print(f"❌ INSERT 실패: {e}")

# 2. SELECT 테스트
print("\n2. SELECT 테스트")
try:
    result = supabase.table('med_checks') \
        .select('*') \
        .eq('user_id', 'demo-user-50s') \
        .limit(5) \
        .execute()
    
    print(f"✅ SELECT 성공: {len(result.data)}건")
    for item in result.data:
        print(f"   - {item['date']} {item['time_slot']}: {item.get('medication_name', 'N/A')}")
except Exception as e:
    print(f"❌ SELECT 실패: {e}")

print("\n" + "=" * 60)
