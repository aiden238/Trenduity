"""
게임화 로직 단위 테스트
"""
import pytest
from app.services.gamification import GamificationService
from supabase import create_client
import os
from datetime import date, timedelta

@pytest.fixture
def gamification_service():
    """게임화 서비스 인스턴스"""
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    )
    return GamificationService(supabase)

@pytest.fixture
def test_user_id():
    """테스트용 사용자 ID"""
    return "demo-user-50s"

class TestGamificationService:
    """게임화 서비스 테스트"""
    
    @pytest.mark.asyncio
    async def test_award_for_card_completion_base_points(self, gamification_service, test_user_id):
        """카드 완료 기본 포인트 부여"""
        result = await gamification_service.award_for_card_completion(
            user_id=test_user_id,
            num_correct=0,
            num_questions=0,
            completion_date=date.today().isoformat()
        )
        
        assert "points_added" in result
        assert result["points_added"] >= 5  # BASE_CARD_POINTS
        assert "total_points" in result
        assert result["total_points"] > 0
        assert "streak_days" in result
    
    @pytest.mark.asyncio
    async def test_award_for_card_completion_with_quiz(self, gamification_service, test_user_id):
        """퀴즈 정답 보너스 포인트"""
        result = await gamification_service.award_for_card_completion(
            user_id=test_user_id,
            num_correct=1,
            num_questions=1,
            completion_date=date.today().isoformat()
        )
        
        # BASE(5) + CORRECT(2) = 7점 이상
        assert result["points_added"] >= 7
    
    @pytest.mark.asyncio
    async def test_streak_calculation_consecutive_days(self, gamification_service, test_user_id):
        """연속 일수 스트릭 계산"""
        # 오늘 완료
        today_result = await gamification_service.award_for_card_completion(
            user_id=test_user_id,
            num_correct=0,
            num_questions=0,
            completion_date=date.today().isoformat()
        )
        
        # 스트릭이 1 이상이어야 함 (이전에도 완료했다면 증가)
        assert today_result["streak_days"] >= 1
    
    @pytest.mark.asyncio
    async def test_streak_bonus_points(self, gamification_service, test_user_id):
        """스트릭 유지 시 보너스 포인트"""
        result = await gamification_service.award_for_card_completion(
            user_id=test_user_id,
            num_correct=0,
            num_questions=0,
            completion_date=date.today().isoformat()
        )
        
        if result["streak_days"] > 0:
            # 스트릭 보너스(3) 포함
            assert result["points_added"] >= 8  # BASE(5) + STREAK(3)
    
    @pytest.mark.asyncio
    async def test_get_gamification_data(self, gamification_service, test_user_id):
        """게임화 데이터 조회"""
        # _get_or_create_gamification 메서드를 통해 데이터 조회
        gamif = await gamification_service._get_or_create_gamification(test_user_id)
        
        assert "total_points" in gamif
        assert "current_streak" in gamif
        assert "badges" in gamif
        assert isinstance(gamif["badges"], list)
    
    @pytest.mark.asyncio
    async def test_badge_award_check(self, gamification_service, test_user_id):
        """배지 부여 체크"""
        # 현재 게임화 데이터 조회
        gamif = await gamification_service._get_or_create_gamification(test_user_id)
        
        # badges가 리스트인지 확인
        assert isinstance(gamif["badges"], list)
        
        # 배지 체크 로직 테스트
        new_badges = await gamification_service._check_new_badges(
            test_user_id, 
            gamif["total_points"], 
            gamif["current_streak"]
        )
        assert isinstance(new_badges, list)
    
    @pytest.mark.asyncio
    async def test_award_for_tool_step_completion(self, gamification_service, test_user_id):
        """도구 실습 완료 포인트 부여"""
        # 메서드 시그니처: (user_id, tool, step)
        result = await gamification_service.award_for_tool_step_completion(
            user_id=test_user_id,
            tool="canva",
            step=1
        )
        
        assert "points_added" in result
        assert result["points_added"] >= 3  # TOOL_STEP_POINTS
        assert "total_points" in result
    
    @pytest.mark.asyncio
    async def test_award_for_med_check(self, gamification_service, test_user_id):
        """복약 체크 포인트 부여"""
        from datetime import date
        result = await gamification_service.award_for_med_check(
            user_id=test_user_id,
            date=date.today().isoformat()
        )
        
        assert "points_added" in result
        assert result["points_added"] >= 2  # MED_CHECK_POINTS
        assert "total_points" in result
