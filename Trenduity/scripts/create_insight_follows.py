"""
insight_follows 테이블 생성 스크립트
"""
from supabase import create_client, Client
import os

SUPABASE_URL = "https://onnthandrqutdmvwnilf.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubnRoYW5kcnF1dGRtdnduaWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQwMTgwMSwiZXhwIjoyMDc4OTc3ODAxfQ.-nw0DaxYu_MIRDsn3irLKUIfksTN-A1hoSP_3KOQZ6U"

def create_insight_follows_table():
    """insight_follows 테이블 생성 (Supabase SQL API 사용)"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    sql = """
    -- insight_follows 테이블 생성
    CREATE TABLE IF NOT EXISTS insight_follows (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      topic TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      
      UNIQUE(user_id, topic)
    );

    -- 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_insight_follows_user ON insight_follows(user_id);
    CREATE INDEX IF NOT EXISTS idx_insight_follows_topic ON insight_follows(topic);

    -- RLS 설정
    ALTER TABLE insight_follows ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own follows" ON insight_follows;
    CREATE POLICY "Users can view own follows" 
      ON insight_follows FOR SELECT 
      USING (user_id = current_setting('app.current_user_id', true));
    """
    
    try:
        # Supabase REST API는 SQL 실행을 지원하지 않으므로
        # 대신 테이블 존재 여부를 확인하고 데이터 삽입 가능 여부를 테스트합니다
        print("📝 insight_follows 테이블 확인 중...")
        
        # 테이블 조회 시도
        result = supabase.table('insight_follows').select('*').limit(1).execute()
        print("✅ insight_follows 테이블이 이미 존재합니다.")
        
    except Exception as e:
        error_msg = str(e)
        if "relation" in error_msg and "does not exist" in error_msg:
            print("❌ insight_follows 테이블이 없습니다.")
            print("⚠️ Supabase SQL Editor에서 아래 SQL을 수동으로 실행해주세요:")
            print("\n" + "="*60)
            print(sql)
            print("="*60 + "\n")
        else:
            print(f"❌ 에러: {e}")

if __name__ == "__main__":
    create_insight_follows_table()
