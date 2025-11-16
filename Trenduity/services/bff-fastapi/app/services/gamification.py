from datetime import date, timedelta
from typing import Dict, List
from supabase import Client


class GamificationService:
    """
    게임화 서비스: 포인트, 스트릭, 배지 관리
    
    규칙:
    - BASE_CARD_POINTS = 5 (카드 완료 기본 포인트)
    - CORRECT_ANSWER_POINTS = 2 (퀴즈 정답당 포인트)
    - DAILY_STREAK_BONUS = 3 (연속 학습 보너스)
    - 스트릭: 연속 일수 계산 (어제 다음날 +1, 아니면 리셋)
    - 배지: 첫걸음(5p), 일주일 연속(7일), 포인트 100(100p)
    """
    
    BASE_CARD_POINTS = 5
    CORRECT_ANSWER_POINTS = 2
    DAILY_STREAK_BONUS = 3
    
    def __init__(self, db: Client):
        self.db = db
    
    async def award_for_card_completion(
        self,
        user_id: str,
        num_correct: int,
        num_questions: int,
        completion_date: str
    ) -> Dict:
        """
        카드 완료 시 포인트/스트릭 업데이트
        
        Args:
            user_id: 사용자 UUID
            num_correct: 정답 수
            num_questions: 총 퀴즈 수
            completion_date: 완료 날짜 (ISO format YYYY-MM-DD)
        
        Returns:
            {
                "points_added": 13,
                "total_points": 150,
                "streak_days": 7,
                "new_badges": ["일주일 연속"]
            }
        """
        # 1. 포인트 계산
        points = self.BASE_CARD_POINTS + (num_correct * self.CORRECT_ANSWER_POINTS)
        
        # 2. 게임화 레코드 조회/생성
        gamif = await self._get_or_create_gamification(user_id)
        
        # 3. 스트릭 업데이트
        streak_days = await self._update_streak(gamif, completion_date)
        
        if streak_days > 0:
            points += self.DAILY_STREAK_BONUS
        
        # 4. 포인트 추가
        new_total = gamif['points'] + points
        
        self.db.table('gamification').update({
            'points': new_total,
            'streak_days': streak_days,
            'last_activity_date': completion_date
        }).eq('user_id', user_id).execute()
        
        # 5. 배지 확인
        new_badges = await self._check_new_badges(user_id, new_total, streak_days)
        
        return {
            "points_added": points,
            "total_points": new_total,
            "streak_days": streak_days,
            "new_badges": new_badges
        }
    
    async def _get_or_create_gamification(self, user_id: str) -> Dict:
        """
        게임화 레코드 조회 또는 생성
        """
        result = self.db.table('gamification').select('*').eq('user_id', user_id).execute()
        
        if not result.data or len(result.data) == 0:
            # 신규 사용자
            new_gamif = {
                'user_id': user_id,
                'points': 0,
                'streak_days': 0,
                'badges': []
            }
            result = self.db.table('gamification').insert(new_gamif).execute()
            return result.data[0]
        
        return result.data[0]
    
    async def _update_streak(self, gamif: Dict, current_date: str) -> int:
        """
        스트릭 계산: 연속 일수
        
        Rules:
        - 오늘이 어제 다음날이면 streak +1
        - 오늘이 어제보다 2일 이상 차이나면 streak 리셋
        - 같은 날이면 현재 streak 유지
        """
        last_date_str = gamif.get('last_activity_date')
        
        if not last_date_str:
            return 1  # 첫 활동
        
        last_date = date.fromisoformat(last_date_str)
        current = date.fromisoformat(current_date)
        
        diff = (current - last_date).days
        
        if diff == 1:
            # 연속
            return gamif['streak_days'] + 1
        elif diff == 0:
            # 같은 날 (중복 완료 시)
            return gamif['streak_days']
        else:
            # 끊김
            return 1
    
    async def _check_new_badges(self, user_id: str, total_points: int, streak_days: int) -> List[str]:
        """
        새로운 배지 확인
        
        Badges:
        - "첫걸음": 첫 카드 완료 (5 포인트)
        - "일주일 연속": 7일 스트릭
        - "포인트 100": 100 포인트 달성
        """
        gamif_result = self.db.table('gamification').select('badges').eq('user_id', user_id).single().execute()
        existing_badges = gamif_result.data.get('badges', []) if gamif_result.data else []
        
        new_badges = []
        
        # 첫걸음
        if "첫걸음" not in existing_badges and total_points >= 5:
            new_badges.append("첫걸음")
        
        # 일주일 연속
        if "일주일 연속" not in existing_badges and streak_days >= 7:
            new_badges.append("일주일 연속")
        
        # 포인트 100
        if "포인트 100" not in existing_badges and total_points >= 100:
            new_badges.append("포인트 100")
        
        if new_badges:
            updated_badges = existing_badges + new_badges
            self.db.table('gamification').update({'badges': updated_badges}).eq('user_id', user_id).execute()
        
        return new_badges

    TOOL_STEP_POINTS = 3

    async def award_for_tool_step_completion(
        self, user_id: str, tool: str, step: int
    ) -> Dict:
        """
        도구 단계 완료 시 포인트 부여

        Args:
            user_id: 사용자 UUID
            tool: 도구 이름 (canva, miri, sora)
            step: 완료한 단계 번호

        Returns:
            {
                "points_added": 3,
                "total_points": 153
            }
        """
        points = self.TOOL_STEP_POINTS

        # 포인트 추가
        gamif = await self._get_or_create_gamification(user_id)
        new_total = gamif["points"] + points

        self.db.table("gamification").update({"points": new_total}).eq(
            "user_id", user_id
        ).execute()

        return {"points_added": points, "total_points": new_total}

    MED_CHECK_POINTS = 2

    async def award_for_med_check(self, user_id: str, date: str) -> Dict:
        """
        복약 체크 시 포인트 부여

        Args:
            user_id: 사용자 UUID
            date: 복약 체크 날짜 (ISO format YYYY-MM-DD)

        Returns:
            {
                "points_added": 2,
                "total_points": 155
            }
        """
        points = self.MED_CHECK_POINTS

        # 포인트 추가
        gamif = await self._get_or_create_gamification(user_id)
        new_total = gamif["points"] + points

        self.db.table("gamification").update({"points": new_total}).eq(
            "user_id", user_id
        ).execute()

        return {"points_added": points, "total_points": new_total}
