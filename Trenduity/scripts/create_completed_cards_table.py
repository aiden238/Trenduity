"""
Supabase에 completed_cards 테이블 생성 스크립트
"""
import os
import sys
from pathlib import Path

# 프로젝트 루트를 path에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "services" / "bff-fastapi"))

from dotenv import load_dotenv
from supabase import create_client, Client

# .env 로드
env_path = project_root / "services" / "bff-fastapi" / ".env"
load_dotenv(env_path)

def create_table():
    """completed_cards 테이블 생성"""
    
    # Supabase 클라이언트
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.")
        return False
    
    client: Client = create_client(supabase_url, supabase_key)
    
    print("📝 completed_cards 테이블 생성 중...")
    
    # SQL 쿼리 (여러 개로 분할하여 실행)
    queries = [
        """
        CREATE TABLE IF NOT EXISTS completed_cards (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id TEXT NOT NULL,
            card_id UUID NOT NULL,
            completed_at TIMESTAMPTZ DEFAULT NOW(),
            quiz_correct INT DEFAULT 0,
            quiz_total INT DEFAULT 0
        );
        """,
        """
        ALTER TABLE completed_cards 
        ADD CONSTRAINT completed_cards_user_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
        """,
        """
        ALTER TABLE completed_cards 
        ADD CONSTRAINT completed_cards_card_fkey 
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;
        """,
        """
        ALTER TABLE completed_cards 
        ADD CONSTRAINT completed_cards_unique 
        UNIQUE (user_id, card_id, DATE(completed_at));
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_completed_cards_user 
        ON completed_cards(user_id, completed_at DESC);
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_completed_cards_card 
        ON completed_cards(card_id);
        """
    ]
    
    # PostgREST를 통해서는 DDL 실행 불가
    # 대신 테이블 존재 여부만 확인하고 안내 메시지 출력
    try:
        result = client.table('completed_cards').select('id').limit(1).execute()
        print("✅ completed_cards 테이블이 이미 존재합니다.")
        print(f"   현재 레코드 수: {len(result.data)}")
        return True
    except Exception as e:
        if "Could not find the table" in str(e):
            print("\n❌ completed_cards 테이블이 존재하지 않습니다.")
            print("\n📋 Supabase Dashboard에서 다음 SQL을 실행하세요:")
            print("   https://supabase.com/dashboard/project/[your-project-id]/editor")
            print("\n" + "="*70)
            for query in queries:
                print(query.strip())
                print("-"*70)
            print("="*70 + "\n")
            
            print("💡 또는 아래 전체 SQL을 한 번에 실행:")
            print("\n" + "="*70)
            full_sql = "\n\n".join(q.strip() for q in queries)
            print(full_sql)
            print("="*70 + "\n")
            return False
        else:
            print(f"❌ 테이블 확인 중 오류: {e}")
            return False

if __name__ == "__main__":
    success = create_table()
    sys.exit(0 if success else 1)
