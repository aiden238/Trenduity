from datetime import date, timedelta
from typing import Dict, List, Optional
from supabase import Client
from redis import Redis
import json
import logging

logger = logging.getLogger(__name__)


class GamificationService:
    """
    게임화 서비스: 포인트, 스트릭, 배지, 레벨 관리
    
    규칙:
    - BASE_CARD_POINTS = 5 (카드 완료 기본 포인트)
    - CORRECT_ANSWER_POINTS = 2 (퀴즈 정답당 포인트)
    - DAILY_STREAK_BONUS = 3 (연속 학습 보너스)
    - 스트릭: 연속 일수 계산 (어제 다음날 +1, 아니면 리셋)
    - 배지: 첫걸음(5p), 일주일 연속(7일), 포인트 100(100p) 등 10개
    - 레벨: 레벨 1 = 0~99p, 레벨 2 = 100~299p, 레벨 3 = 300~599p, 레벨 4 = 600~999p, 레벨 5 = 1000p+
    
    Redis 캐싱:
    - 게임화 데이터: TTL 600초 (10분)
    - 배지 목록: TTL 3600초 (1시간)
    """
    
    BASE_CARD_POINTS = 5
    CORRECT_ANSWER_POINTS = 2
    DAILY_STREAK_BONUS = 3
    CACHE_TTL_GAMIFICATION = 600  # 10분
    CACHE_TTL_BADGES = 3600  # 1시간
    
    # 레벨 임계값 (포인트)
    LEVEL_THRESHOLDS = {
        1: 0,      # 0~99 포인트
        2: 100,    # 100~299 포인트
        3: 300,    # 300~599 포인트
        4: 600,    # 600~999 포인트
        5: 1000,   # 1000+ 포인트
    }
    
    def __init__(self, db: Client, redis: Optional[Redis] = None):
        self.db = db
        self.redis = redis
    
    def _invalidate_user_cache(self, user_id: str):
        """
        사용자 게임화 데이터 캐시 무효화
        
        포인트/배지/레벨 변경 시 호출하여 Redis 캐시를 삭제합니다.
        """
        if not self.redis:
            return
        
        try:
            keys = [
                f"gamification:stats:{user_id}",
                f"gamification:level:{user_id}",
                f"gamification:badges:{user_id}"
            ]
            deleted = self.redis.delete(*keys)
            logger.info(f"캐시 무효화: user={user_id}, deleted={deleted} keys")
        except Exception as e:
            logger.warning(f"캐시 무효화 실패 (계속 진행): {e}")
    
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
        
        # 4. 포인트 추가 및 레벨 계산
        old_total = gamif['total_points']
        new_total = old_total + points
        old_level = self._calculate_level(old_total)
        new_level = self._calculate_level(new_total)
        level_up = new_level > old_level
        
        # longest_streak 업데이트
        longest_streak = gamif.get('longest_streak', 0)
        if streak_days > longest_streak:
            longest_streak = streak_days
        
        self.db.table('gamification').update({
            'total_points': new_total,
            'current_streak': streak_days,
            'longest_streak': longest_streak,
            'last_activity_date': completion_date
        }).eq('user_id', user_id).execute()
        
        # 4-1. Redis 캐시 무효화 (개선된 버전)
        self._invalidate_user_cache(user_id)
        
        # 5. 배지 확인
        new_badges = await self._check_new_badges(user_id, new_total, streak_days)
        
        result = {
            "points_added": points,
            "total_points": new_total,
            "streak_days": streak_days,
            "new_badges": new_badges,
            "level": new_level
        }
        
        # 레벨업 메시지 추가
        if level_up:
            result["level_up"] = True
            result["level_up_message"] = f"축하합니다! 레벨 {new_level}에 도달했어요! 🎉"
            logger.info(f"Level up! user={user_id}, {old_level} → {new_level}")
        
        return result
    
    async def _get_or_create_gamification(self, user_id: str) -> Dict:
        """
        게임화 레코드 조회 또는 생성 (Redis 캐싱)
        """
        cache_key = f"gamification:{user_id}"
        
        # 1. Redis 캐시 확인
        if self.redis:
            try:
                cached = self.redis.get(cache_key)
                if cached:
                    logger.debug(f"Redis cache hit: {cache_key}")
                    return json.loads(cached)
            except Exception as e:
                logger.error(f"Redis get error: {e}")
        
        # 2. DB에서 조회
        result = self.db.table('gamification').select('*').eq('user_id', user_id).execute()
        
        if not result.data or len(result.data) == 0:
            # 신규 사용자
            new_gamif = {
                'user_id': user_id,
                'total_points': 0,
                'current_streak': 0,
                'longest_streak': 0,
                'badges': []
            }
            result = self.db.table('gamification').insert(new_gamif).execute()
            gamif_data = result.data[0]
        else:
            gamif_data = result.data[0]
        
        # 3. Redis 캐시 저장
        if self.redis:
            try:
                self.redis.setex(
                    cache_key,
                    self.CACHE_TTL_GAMIFICATION,
                    json.dumps(gamif_data)
                )
                logger.debug(f"Redis cache set: {cache_key}")
            except Exception as e:
                logger.error(f"Redis set error: {e}")
        
        return gamif_data
    
    def _calculate_level(self, total_points: int) -> int:
        """
        포인트 기반 레벨 계산
        
        Args:
            total_points: 총 포인트
        
        Returns:
            레벨 (1~5)
        """
        if total_points >= self.LEVEL_THRESHOLDS[5]:
            return 5
        elif total_points >= self.LEVEL_THRESHOLDS[4]:
            return 4
        elif total_points >= self.LEVEL_THRESHOLDS[3]:
            return 3
        elif total_points >= self.LEVEL_THRESHOLDS[2]:
            return 2
        else:
            return 1
    
    async def _update_streak(self, gamif: Dict, current_date: str) -> int:
        """
        스트릭 계산: 연속 일수
        
        Rules:
        - 오늘이 어제 다음날이면 streak +1
        - 오늘이 어제보다 2일 이상 차이나면 streak 리셋
        - 같은 날이면 현재 streak 유지
        """
        try:
            last_date_str = gamif.get('last_activity_date')
            current_streak = gamif.get('current_streak', 0)
            
            # None 체크: current_streak가 None이면 0으로 초기화
            if current_streak is None:
                current_streak = 0
                logger.warning(f"current_streak was None for user, resetting to 0")
            
            if not last_date_str:
                logger.info(f"First activity detected, starting streak at 1")
                return 1  # 첫 활동
            
            # 날짜 파싱 with 에러 처리
            try:
                last_date = date.fromisoformat(last_date_str)
                current = date.fromisoformat(current_date)
            except (ValueError, TypeError) as e:
                logger.error(f"Date parsing error: last_date={last_date_str}, current_date={current_date}, error={e}")
                # 파싱 실패 시 첫 활동으로 취급
                return 1
            
            diff = (current - last_date).days
            logger.info(f"Streak calculation: last_date={last_date}, current={current}, diff={diff}, current_streak={current_streak}")
            
            if diff == 1:
                # 연속: 어제 다음날 활동
                new_streak = current_streak + 1
                logger.info(f"Streak continued: {current_streak} → {new_streak}")
                return new_streak
            elif diff == 0:
                # 같은 날 (중복 완료 시): streak 유지
                logger.info(f"Same day activity, maintaining streak: {current_streak}")
                return current_streak
            else:
                # 끊김: 2일 이상 차이 또는 과거 날짜
                if diff < 0:
                    logger.warning(f"Past date detected (diff={diff}), maintaining current streak: {current_streak}")
                    return current_streak  # 과거 날짜는 streak에 영향 없음
                else:
                    logger.info(f"Streak broken (diff={diff}), resetting to 1")
                    return 1
                    
        except Exception as e:
            logger.error(f"Unexpected error in _update_streak: {e}", exc_info=True)
            # 예외 발생 시 안전하게 1 반환 (새 스트릭 시작)
            return 1
    
    async def _check_new_badges(self, user_id: str, total_points: int, streak_days: int) -> List[str]:
        """
        새로운 배지 확인
        
        Badges:
        - "첫걸음": 첫 카드 완료 (5 포인트)
        - "일주일 연속": 7일 스트릭
        - "포인트 100": 100 포인트 달성
        - "포인트 500": 500 포인트 달성
        - "포인트 1000": 1000 포인트 달성
        - "한 달 연속": 30일 스트릭
        - "퀴즈 마스터": 퀴즈 50개 정답 (누적)
        - "사기 파수꾼": 사기 검사 10회
        - "안전 지킴이": 복약 체크 30회
        - "커뮤니티 스타": Q&A 좋아요 10개
        """
        gamif_result = self.db.table('gamification').select('badges').eq('user_id', user_id).single().execute()
        existing_badges = gamif_result.data.get('badges', []) if gamif_result.data else []
        
        new_badges = []
        
        # 포인트 기반 배지
        if "첫걸음" not in existing_badges and total_points >= 5:
            new_badges.append("첫걸음")
        
        if "포인트 100" not in existing_badges and total_points >= 100:
            new_badges.append("포인트 100")
        
        if "포인트 500" not in existing_badges and total_points >= 500:
            new_badges.append("포인트 500")
        
        if "포인트 1000" not in existing_badges and total_points >= 1000:
            new_badges.append("포인트 1000")
        
        # 스트릭 기반 배지
        if "일주일 연속" not in existing_badges and streak_days >= 7:
            new_badges.append("일주일 연속")
        
        if "한 달 연속" not in existing_badges and streak_days >= 30:
            new_badges.append("한 달 연속")
        
        # 활동 기반 배지 (추가 쿼리 필요)
        # 퀴즈 마스터: completed_cards 테이블에서 quiz_correct 합산 (50개 정답)
        if "퀴즈 마스터" not in existing_badges:
            try:
                # completed_cards 테이블에서 quiz_correct 총합 계산
                completed_result = self.db.table('completed_cards').select('quiz_correct').eq('user_id', user_id).execute()
                if completed_result.data:
                    total_correct = sum(card.get('quiz_correct', 0) for card in completed_result.data)
                    logger.info(f"Quiz master check: user={user_id}, total_correct={total_correct}")
                    if total_correct >= 50:
                        new_badges.append("퀴즈 마스터")
            except Exception as e:
                logger.error(f"Failed to check 퀴즈 마스터 badge: {e}")
        
        # 사기 파수꾼: scam_checks 테이블에서 카운트 (10회)
        if "사기 파수꾼" not in existing_badges:
            try:
                scam_result = self.db.table('scam_checks').select('id', count='exact').eq('user_id', user_id).execute()
                scam_count = scam_result.count if scam_result.count else 0
                logger.info(f"사기 파수꾼 check: user={user_id}, scam_checks={scam_count}")
                if scam_count >= 10:
                    new_badges.append("사기 파수꾼")
            except Exception as e:
                logger.error(f"Failed to check 사기 파수꾼 badge: {e}")
        
        # 안전 지킴이: med_checks 테이블에서 카운트 (30회)
        if "안전 지킴이" not in existing_badges:
            try:
                med_result = self.db.table('med_checks').select('id', count='exact').eq('user_id', user_id).execute()
                med_count = med_result.count if med_result.count else 0
                logger.info(f"안전 지킴이 check: user={user_id}, med_checks={med_count}")
                if med_count >= 30:
                    new_badges.append("안전 지킴이")
            except Exception as e:
                logger.error(f"Failed to check 안전 지킴이 badge: {e}")
        
        # 커뮤니티 스타: 본인 게시물에 받은 좋아요 10개
        if "커뮤니티 스타" not in existing_badges:
            try:
                # qna_posts의 author_id가 본인인 게시물에 달린 리액션 카운트
                posts_result = self.db.table('qna_posts').select('id').eq('author_id', user_id).execute()
                if posts_result.data:
                    post_ids = [p['id'] for p in posts_result.data]
                    if post_ids:
                        reactions_result = self.db.table('reactions').select('id', count='exact').in_('target_id', post_ids).eq('target_type', 'qna_post').execute()
                        reaction_count = reactions_result.count if reactions_result.count else 0
                        logger.info(f"커뮤니티 스타 check: user={user_id}, reactions={reaction_count}")
                        if reaction_count >= 10:
                            new_badges.append("커뮤니티 스타")
            except Exception as e:
                logger.error(f"Failed to check 커뮤니티 스타 badge: {e}")
        
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
        new_total = gamif["total_points"] + points

        self.db.table("gamification").update({"total_points": new_total}).eq(
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
        new_total = gamif["total_points"] + points

        self.db.table("gamification").update({"total_points": new_total}).eq(
            "user_id", user_id
        ).execute()

        return {"points_added": points, "total_points": new_total}

    QNA_POST_POINTS = 1
    QNA_HELPFUL_VOTE_POINTS = 1

    async def award_for_qna_post(self, user_id: str) -> Dict:
        """
        Q&A 질문 작성 시 포인트 부여

        Args:
            user_id: 사용자 UUID

        Returns:
            {
                "points_added": 1,
                "total_points": 156
            }
        """
        points = self.QNA_POST_POINTS

        # 포인트 추가
        gamif = await self._get_or_create_gamification(user_id)
        new_total = gamif["total_points"] + points

        self.db.table("gamification").update({"total_points": new_total}).eq(
            "user_id", user_id
        ).execute()

        # Redis 캐시 무효화 (개선된 버전)
        self._invalidate_user_cache(user_id)

        return {"points_added": points, "total_points": new_total}

    async def award_for_qna_helpful_vote(self, voter_id: str) -> Dict:
        """
        Q&A '도움됐어요' 투표 시 포인트 부여 (투표자에게)

        Args:
            voter_id: 투표한 사용자 UUID

        Returns:
            {
                "points_added": 1,
                "total_points": 157
            }
        """
        points = self.QNA_HELPFUL_VOTE_POINTS

        # 포인트 추가
        gamif = await self._get_or_create_gamification(voter_id)
        new_total = gamif["total_points"] + points

        self.db.table("gamification").update({"total_points": new_total}).eq(
            "user_id", voter_id
        ).execute()

        # Redis 캐시 무효화 (개선된 버전)
        self._invalidate_user_cache(voter_id)

        return {"points_added": points, "total_points": new_total}

    async def get_user_stats(self, user_id: str) -> Dict:
        """
        사용자 게임화 통계 조회

        Args:
            user_id: 사용자 UUID

        Returns:
            {
                "total_points": 157,
                "level": 2,
                "current_streak": 7,
                "badges": ["첫걸음", "일주일 연속"],
                "cards_completed": 15,
                "quizzes_correct": 25
            }
        """
        # 게임화 데이터 조회 (캐싱 적용)
        gamif = await self._get_or_create_gamification(user_id)

        # 완료한 카드 수 조회
        cards_result = self.db.table("completed_cards").select("id", count="exact").eq("user_id", user_id).execute()
        cards_completed = cards_result.count if cards_result.count else 0

        # 퀴즈 정답 수 조회
        quiz_result = self.db.table("completed_cards").select("quiz_correct").eq("user_id", user_id).execute()
        quizzes_correct = sum(card.get("quiz_correct", 0) for card in quiz_result.data) if quiz_result.data else 0

        total_points = gamif.get("total_points", 0)
        level = self._calculate_level(total_points)

        return {
            "total_points": total_points,
            "level": level,
            "current_streak": gamif.get("current_streak", 0),
            "badges": gamif.get("badges", []),
            "cards_completed": cards_completed,
            "quizzes_correct": quizzes_correct,
        }

    async def calculate_level_progress(self, user_id: str) -> Dict:
        """
        현재 레벨 진행률 계산

        Args:
            user_id: 사용자 UUID

        Returns:
            {
                "current_level": 2,
                "current_points": 150,
                "next_level": 3,
                "next_level_threshold": 300,
                "progress_percentage": 50,
                "points_needed": 150
            }
        """
        gamif = await self._get_or_create_gamification(user_id)
        total_points = gamif.get("total_points", 0)
        current_level = self._calculate_level(total_points)

        # 다음 레벨 임계값 찾기
        if current_level >= 5:
            # 최고 레벨
            return {
                "current_level": current_level,
                "current_points": total_points,
                "next_level": None,
                "next_level_threshold": None,
                "progress_percentage": 100,
                "points_needed": 0,
            }

        next_level = current_level + 1
        next_threshold = self.LEVEL_THRESHOLDS[next_level]
        current_threshold = self.LEVEL_THRESHOLDS[current_level]

        progress = total_points - current_threshold
        required = next_threshold - current_threshold
        progress_percentage = int((progress / required) * 100)
        points_needed = next_threshold - total_points

        return {
            "current_level": current_level,
            "current_points": total_points,
            "next_level": next_level,
            "next_level_threshold": next_threshold,
            "progress_percentage": progress_percentage,
            "points_needed": points_needed,
        }

    async def check_streak_bonus(self, user_id: str) -> Dict:
        """
        7일 연속 스트릭 보너스 확인 및 지급

        Args:
            user_id: 사용자 UUID

        Returns:
            {
                "bonus_awarded": True,
                "bonus_points": 10,
                "total_points": 167,
                "current_streak": 7
            }
        """
        gamif = await self._get_or_create_gamification(user_id)
        current_streak = gamif.get("current_streak", 0)

        # 7일 연속 달성 시 보너스
        if current_streak >= 7 and current_streak % 7 == 0:
            bonus_points = 10
            new_total = gamif["total_points"] + bonus_points

            self.db.table("gamification").update({"total_points": new_total}).eq(
                "user_id", user_id
            ).execute()

            # Redis 캐시 무효화
            if self.redis:
                try:
                    cache_key = f"gamification:{user_id}"
                    self.redis.delete(cache_key)
                except Exception as e:
                    logger.error(f"Redis delete error: {e}")

            logger.info(f"Streak bonus awarded: user={user_id}, streak={current_streak}, bonus={bonus_points}")

            return {
                "bonus_awarded": True,
                "bonus_points": bonus_points,
                "total_points": new_total,
                "current_streak": current_streak,
            }

        return {
            "bonus_awarded": False,
            "bonus_points": 0,
            "total_points": gamif["total_points"],
            "current_streak": current_streak,
        }

    async def get_streak_status(self, user_id: str) -> Dict:
        """
        스트릭 상태 조회

        Args:
            user_id: 사용자 UUID

        Returns:
            {
                "current_streak": 7,
                "longest_streak": 15,
                "last_activity_date": "2025-11-20"
            }
        """
        gamif = await self._get_or_create_gamification(user_id)

        return {
            "current_streak": gamif.get("current_streak", 0),
            "longest_streak": gamif.get("longest_streak", 0),
            "last_activity_date": gamif.get("last_activity_date"),
        }
