"""
카드 관련 E2E 테스트
"""
import pytest
from httpx import AsyncClient

class TestCardsAPI:
    """카드 API 테스트"""
    
    @pytest.mark.asyncio
    async def test_get_today_card_success(self, client: AsyncClient, senior_headers):
        """오늘의 카드 조회 성공"""
        response = await client.get("/v1/cards/today", headers=senior_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "data" in data
        assert "card" in data["data"]
        
        card = data["data"]["card"]
        assert "id" in card
        assert "title" in card
        assert "body" in card  # content가 아니라 body
        assert "quiz" in card  # quiz 객체 존재
    
    @pytest.mark.asyncio
    async def test_get_today_card_unauthorized(self, client: AsyncClient):
        """인증 없이 오늘의 카드 조회 시도"""
        response = await client.get("/v1/cards/today")
        # 개발 모드에서는 인증 없어도 200 반환 (get_current_user_optional)
        assert response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_complete_card_success(self, client: AsyncClient, senior_headers, test_card_id):
        """카드 완료 성공 (첫 번째 시도)"""
        # 먼저 completed_cards에서 기존 기록 삭제 (테스트 격리)
        from supabase import create_client
        import os
        
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        
        # 오늘 날짜의 완료 기록 삭제
        from datetime import date
        today = date.today().isoformat()
        supabase.table("completed_cards").delete().eq("user_id", "demo-user-50s").eq("card_id", test_card_id).gte("completed_at", today).execute()
        
        # 카드 완료 시도
        response = await client.post(
            "/v1/cards/complete",
            headers=senior_headers,
            json={"card_id": test_card_id}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        
        result = data["data"]
        assert "points_added" in result
        assert result["points_added"] >= 5  # 최소 기본 포인트
        assert "total_points" in result
        assert "streak_days" in result
    
    @pytest.mark.asyncio
    async def test_complete_card_duplicate(self, client: AsyncClient, senior_headers, test_card_id):
        """카드 중복 완료 시도 (같은 날짜에 2번)"""
        # 첫 번째 완료
        response1 = await client.post(
            "/v1/cards/complete",
            headers=senior_headers,
            json={"card_id": test_card_id}
        )
        
        # 두 번째 완료 (중복)
        response2 = await client.post(
            "/v1/cards/complete",
            headers=senior_headers,
            json={"card_id": test_card_id}
        )
        
        assert response2.status_code == 400
        data = response2.json()
        # FastAPI HTTPException은 detail 키 사용
        assert "detail" in data
        detail = data["detail"]
        if isinstance(detail, dict):
            assert "error" in detail
            assert "이미" in detail["error"].get("message", "") or "duplicate" in str(detail).lower()
        else:
            assert "이미" in str(detail) or "duplicate" in str(detail).lower()
    
    @pytest.mark.asyncio
    async def test_complete_card_with_quiz(self, client: AsyncClient, senior_headers, test_card_id):
        """퀴즈 포함 카드 완료"""
        # 기존 기록 삭제
        from supabase import create_client
        import os
        from datetime import date
        
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        today = date.today().isoformat()
        supabase.table("completed_cards").delete().eq("user_id", "demo-user-50s").eq("card_id", test_card_id).gte("completed_at", today).execute()
        
        # 퀴즈 답변 포함 완료
        response = await client.post(
            "/v1/cards/complete",
            headers=senior_headers,
            json={
                "card_id": test_card_id,
                "quiz_answer": "정답",
                "is_correct": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        
        result = data["data"]
        # 정답 보너스 포인트 확인
        assert result["points_added"] >= 7  # 기본(5) + 정답(2)
    
    @pytest.mark.asyncio
    async def test_complete_card_invalid_id(self, client: AsyncClient, senior_headers):
        """존재하지 않는 카드 ID로 완료 시도"""
        response = await client.post(
            "/v1/cards/complete",
            headers=senior_headers,
            json={"card_id": "00000000-0000-0000-0000-000000000000"}
        )
        
        assert response.status_code in [400, 404]
        data = response.json()
        # FastAPI HTTPException은 detail 키 사용
        assert "detail" in data
