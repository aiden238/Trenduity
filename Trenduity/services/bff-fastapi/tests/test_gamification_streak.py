"""
게임화 서비스 스트릭 계산 단위 테스트
"""
import pytest
from datetime import date, timedelta
from app.services.gamification import GamificationService
from unittest.mock import Mock


class TestStreakCalculation:
    """스트릭 계산 로직 테스트"""
    
    @pytest.fixture
    def gamification_service(self):
        """GamificationService 인스턴스 생성 (DB 의존성 Mock)"""
        # Mock Supabase client (DB 호출 없이 로직만 테스트)
        mock_db = Mock()
        return GamificationService(mock_db)
    
    @pytest.mark.asyncio
    async def test_first_activity_streak(self, gamification_service):
        """첫 활동 시 스트릭 = 1"""
        gamif = {
            'user_id': 'test-user',
            'total_points': 0,
            'current_streak': 0,
            'last_activity_date': None
        }
        
        today = date.today().isoformat()
        streak = await gamification_service._update_streak(gamif, today)
        
        assert streak == 1
    
    @pytest.mark.asyncio
    async def test_consecutive_day_streak_increment(self, gamification_service):
        """연속 일자 활동 시 스트릭 +1"""
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        today = date.today().isoformat()
        
        gamif = {
            'user_id': 'test-user',
            'total_points': 10,
            'current_streak': 3,
            'last_activity_date': yesterday
        }
        
        streak = await gamification_service._update_streak(gamif, today)
        
        assert streak == 4  # 3 + 1
    
    @pytest.mark.asyncio
    async def test_same_day_activity_maintains_streak(self, gamification_service):
        """같은 날 재활동 시 스트릭 유지"""
        today = date.today().isoformat()
        
        gamif = {
            'user_id': 'test-user',
            'total_points': 10,
            'current_streak': 5,
            'last_activity_date': today
        }
        
        streak = await gamification_service._update_streak(gamif, today)
        
        assert streak == 5  # 유지
    
    @pytest.mark.asyncio
    async def test_broken_streak_resets_to_one(self, gamification_service):
        """2일 이상 간격 시 스트릭 리셋"""
        three_days_ago = (date.today() - timedelta(days=3)).isoformat()
        today = date.today().isoformat()
        
        gamif = {
            'user_id': 'test-user',
            'total_points': 50,
            'current_streak': 7,
            'last_activity_date': three_days_ago
        }
        
        streak = await gamification_service._update_streak(gamif, today)
        
        assert streak == 1  # 리셋
    
    @pytest.mark.asyncio
    async def test_none_current_streak_handled(self, gamification_service):
        """current_streak가 None일 때 안전하게 처리"""
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        today = date.today().isoformat()
        
        gamif = {
            'user_id': 'test-user',
            'total_points': 10,
            'current_streak': None,  # None 케이스
            'last_activity_date': yesterday
        }
        
        streak = await gamification_service._update_streak(gamif, today)
        
        # None이 0으로 처리되므로 0 + 1 = 1
        assert streak == 1
    
    @pytest.mark.asyncio
    async def test_invalid_date_format_returns_one(self, gamification_service):
        """잘못된 날짜 형식 시 안전하게 1 반환"""
        gamif = {
            'user_id': 'test-user',
            'total_points': 10,
            'current_streak': 5,
            'last_activity_date': 'invalid-date'
        }
        
        today = date.today().isoformat()
        streak = await gamification_service._update_streak(gamif, today)
        
        assert streak == 1  # 에러 시 안전하게 1 반환
    
    @pytest.mark.asyncio
    async def test_past_date_maintains_streak(self, gamification_service):
        """과거 날짜로 완료 시도 시 스트릭 유지 (diff < 0)"""
        today = date.today().isoformat()
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        
        gamif = {
            'user_id': 'test-user',
            'total_points': 10,
            'current_streak': 5,
            'last_activity_date': today  # 마지막 활동이 오늘
        }
        
        # 어제 날짜로 완료 시도 (과거)
        streak = await gamification_service._update_streak(gamif, yesterday)
        
        assert streak == 5  # 과거 날짜는 영향 없음, 현재 streak 유지
    
    @pytest.mark.asyncio
    async def test_one_week_streak(self, gamification_service):
        """7일 연속 활동 시뮬레이션"""
        current_date = date.today()
        
        gamif = {
            'user_id': 'test-user',
            'total_points': 0,
            'current_streak': 0,
            'last_activity_date': None
        }
        
        # 7일 연속 시뮬레이션
        for day in range(7):
            activity_date = (current_date - timedelta(days=6-day)).isoformat()
            streak = await gamification_service._update_streak(gamif, activity_date)
            
            # 다음 반복을 위해 gamif 업데이트
            gamif['current_streak'] = streak
            gamif['last_activity_date'] = activity_date
        
        assert gamif['current_streak'] == 7
    
    @pytest.mark.asyncio
    async def test_streak_with_weekend_gap(self, gamification_service):
        """주말 간격 후 리셋 확인"""
        friday = (date.today() - timedelta(days=4)).isoformat()
        monday = date.today().isoformat()
        
        gamif = {
            'user_id': 'test-user',
            'total_points': 30,
            'current_streak': 5,
            'last_activity_date': friday  # 금요일에 마지막 활동
        }
        
        # 월요일에 활동 (토, 일 건너뜀 = 3일 간격)
        streak = await gamification_service._update_streak(gamif, monday)
        
        assert streak == 1  # 리셋
