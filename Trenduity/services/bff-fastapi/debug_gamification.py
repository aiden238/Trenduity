"""
스트릭 버그 직접 디버깅

Supabase 동기 호출 문제를 확인하고 수정합니다.
"""
import os
from supabase import create_client
from app.services.gamification import GamificationService
from datetime import date
import asyncio

# 환경 변수 설정
os.environ["SUPABASE_URL"] = "https://onnthandrqutdmvwnilf.supabase.co"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubnRoYW5kcnF1dGRtdnduaWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQwMTgwMSwiZXhwIjoyMDc4OTc3ODAxfQ.-nw0DaxYu_MIRDsn3irLKUIfksTN-A1hoSP_3KOQZ6U"

async def test_gamification_direct():
    """게임화 서비스를 직접 호출하여 에러 확인"""
    print("=" * 60)
    print("게임화 서비스 직접 테스트")
    print("=" * 60)
    
    try:
        # Supabase 클라이언트 생성
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        print("\n✅ Supabase 클라이언트 생성 성공")
        
        # 게임화 서비스 인스턴스 생성
        gamif_service = GamificationService(supabase)
        print("✅ GamificationService 인스턴스 생성 성공")
        
        # 테스트 사용자 ID
        test_user_id = "demo-user-50s"
        
        # 카드 완료 호출
        print(f"\n테스트 사용자: {test_user_id}")
        print("카드 완료 시도...")
        
        result = await gamif_service.award_for_card_completion(
            user_id=test_user_id,
            num_correct=2,
            num_questions=3,
            completion_date=date.today().isoformat()
        )
        
        print("\n✅ 게임화 서비스 호출 성공!")
        print(f"결과: {result}")
        
    except Exception as e:
        print(f"\n❌ 에러 발생: {e}")
        import traceback
        traceback.print_exc()
        
        # 구체적인 에러 타입 확인
        print(f"\n에러 타입: {type(e).__name__}")
        print(f"에러 메시지: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_gamification_direct())
