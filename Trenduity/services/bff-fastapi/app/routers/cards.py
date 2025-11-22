from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Optional
from datetime import date, datetime
from supabase import Client
from redis import Redis
from app.core.deps import (
    get_current_user_optional, 
    get_supabase, 
    get_gamification_service,
    get_redis_client
)
from app.schemas.card import CardCompleteRequest
from app.services.gamification import GamificationService
from app.utils.error_translator import translate_db_error, is_db_error
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def _get_completion_key(user_id: str, card_id: str) -> str:
    """오늘 날짜 기준 완료 키 생성 (Redis용)"""
    today = datetime.now().date().isoformat()
    return f"completed:{user_id}:{card_id}:{today}"

def _is_card_completed_today(redis: Optional[Redis], db: Optional[Client], user_id: str, card_id: str) -> bool:
    """Redis 또는 DB에서 오늘 완료 여부 확인 (동기 함수)"""
    # 1. Redis 우선 확인 (빠름)
    if redis:
        key = _get_completion_key(user_id, card_id)
        try:
            if redis.exists(key) > 0:
                logger.info(f"Redis에서 중복 감지: {key}")
                return True
        except Exception as e:
            logger.error(f"Redis 완료 확인 실패: {e}")
    
    # 2. Redis 없거나 실패 시 DB에서 확인
    if db:
        try:
            today = datetime.now().date().isoformat()
            # completed_date 컬럼 사용 (날짜만 저장, 정확한 비교)
            result = db.table('completed_cards').select('id').eq('user_id', user_id).eq('card_id', card_id).eq('completed_date', today).limit(1).execute()
            if result.data and len(result.data) > 0:
                logger.info(f"DB에서 중복 감지: user={user_id}, card={card_id}, date={today}")
                return True
        except Exception as e:
            logger.error(f"DB 완료 확인 실패: {e}")
    
    return False

def _mark_card_completed(redis: Optional[Redis], db: Optional[Client], user_id: str, card_id: str, quiz_correct: int = 0, quiz_total: int = 0):
    """Redis와 DB에 완료 기록 (동기 함수)"""
    # 1. Redis에 기록 (빠른 중복 체크용, 24시간 TTL)
    if redis:
        key = _get_completion_key(user_id, card_id)
        try:
            redis.setex(key, 86400, "1")
            logger.info(f"Redis 완료 기록: {key}")
        except Exception as e:
            logger.error(f"Redis 완료 기록 실패: {e}")
    
    # 2. DB에 영구 기록
    if db:
        try:
            today = datetime.now().date().isoformat()
            db.table('completed_cards').insert({
                'user_id': user_id,
                'card_id': card_id,
                'completed_date': today,
                'quiz_correct': quiz_correct,
                'quiz_total': quiz_total
            }).execute()
            logger.info(f"DB 완료 기록: user={user_id}, card={card_id}, date={today}")
        except Exception as e:
            # 중복 키 에러 감지 및 전파
            error_str = str(e).lower()
            logger.warning(f"DB INSERT 에러: {e}, type={type(e).__name__}, str={error_str[:200]}")
            if 'duplicate key' in error_str or '23505' in error_str or 'unique constraint' in error_str or 'already exists' in error_str:
                logger.info(f"DB 중복 완료 감지: user={user_id}, card={card_id}")
                raise ValueError("ALREADY_COMPLETED")  # 중복 에러를 명시적으로 전파
            else:
                logger.error(f"DB 완료 기록 실패: {e}")
                raise  # 중복이 아닌 다른 에러는 전파


class QuizSubmitRequest(BaseModel):
    answer: str


@router.get("/today")
async def get_today_card(
    user_id: Optional[str] = Depends(get_current_user_optional),
    db: Optional[Client] = Depends(get_supabase)
) -> Dict:
    """
    오늘의 카드 조회
    
    Returns:
        { "ok": true, "data": { "card": {...} } }
    """
    # 개발 모드: DB 없으면 더미 카드 반환
    if not db:
        return {
            "ok": True,
            "data": {
                "card": {
                    "id": "dummy-card-1",
                    "title": "AI란 무엇인가요?",
                    "tldr": "인공지능(AI)의 기초 개념을 쉽게 알아봅니다",
                    "body": "AI는 컴퓨터가 사람처럼 생각하고 배울 수 있는 기술입니다.\n\n오늘날 스마트폰의 음성 비서, 얼굴 인식 등이 모두 AI 기술입니다.",
                    "type": "ai_tips",
                    "estimated_read_minutes": 3
                }
            }
        }
    
    today = date.today().isoformat()
    
    # 1. 오늘 카드 조회 (사용자가 완료하지 않은 카드 중 선택)
    try:
        # 사용자가 있으면 완료하지 않은 카드 찾기
        if user_id:
            # 완료한 카드 ID 목록 조회
            completed_result = db.table('completed_cards') \
                .select('card_id') \
                .eq('user_id', user_id) \
                .execute()
            
            completed_card_ids = [row['card_id'] for row in completed_result.data] if completed_result.data else []
            
            # 완료하지 않은 카드 조회
            if completed_card_ids:
                result = db.table('cards') \
                    .select('*') \
                    .not_.in_('id', completed_card_ids) \
                    .limit(1) \
                    .execute()
            else:
                # 완료한 카드가 없으면 첫 번째 카드
                result = db.table('cards') \
                    .select('*') \
                    .limit(1) \
                    .execute()
        else:
            # 비로그인 사용자는 첫 번째 카드
            result = db.table('cards') \
                .select('*') \
                .limit(1) \
                .execute()
        
        if not result.data or len(result.data) == 0:
            # 2. 카드가 없거나 모두 완료했으면 메시지 반환
            return {
                "ok": True,
                "data": {
                    "card": None,
                    "message": "모든 카드를 완료하셨어요! 내일 새로운 카드가 추가됩니다."
                }
            }
        else:
            card = result.data[0]
        
        return {
            "ok": True,
            "data": {"card": card}
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "DB_ERROR",
                    "message": "카드를 불러오는데 문제가 생겼어요. 잠시 후 다시 시도해 주세요."
                }
            }
        )


async def _create_fallback_card(db: Client, user_id: str, date_str: str) -> Dict:
    """
    임시 fallback 카드 생성
    
    실제로는 pre-generated pool에서 선택하거나 LLM으로 생성
    """
    fallback_payload = {
        "title": "오늘의 AI 꿀팁",
        "tldr": "AI를 활용한 간단한 팁을 알려드려요.",
        "body": "챗GPT를 사용하면 다양한 질문에 답을 얻을 수 있어요.\n\n1. 챗GPT 앱을 열어요\n2. 궁금한 것을 물어봐요\n3. 답변을 받아요",
        "impact": "일상이 더 편리해져요.",
        "quiz": [
            {
                "id": "q1",
                "question": "챗GPT로 무엇을 할 수 있나요?",
                "options": ["날씨만 알려줘요", "질문에 답해줘요", "음악을 들려줘요"],
                "correctIndex": 1,
                "explanation": "챗GPT는 다양한 질문에 답해주는 AI예요."
            }
        ]
    }
    
    new_card = {
        "user_id": user_id,
        "date": date_str,
        "type": "ai_tools",
        "payload": fallback_payload,
        "status": "pending"
    }
    
    result = db.table('cards').insert(new_card).execute()
    return result.data[0]


@router.post("/{card_id}/quiz")
async def submit_quiz(
    card_id: str,
    body: QuizSubmitRequest,
    user_id: Optional[str] = Depends(get_current_user_optional),
    db: Optional[Client] = Depends(get_supabase)
) -> Dict:
    """
    퀴즈 답변 제출 및 채점
    
    Args:
        card_id: 카드 ID
        body.answer: 사용자 답변 (선택지 텍스트)
    
    Returns:
        {
          "ok": true,
          "data": {
            "is_correct": true,
            "explanation": "정답입니다!",
            "correct_answer": "모두 가능해요"
          }
        }
    """
    try:
        answer = body.answer
        # 1. 카드 조회
        card_result = db.table('cards').select('*').eq('id', card_id).execute()
        
        if not card_result.data or len(card_result.data) == 0:
            raise HTTPException(
                status_code=404,
                detail={
                    "ok": False,
                    "error": {
                        "code": "CARD_NOT_FOUND",
                        "message": "카드를 찾을 수 없어요."
                    }
                }
            )
        
        card = card_result.data[0]
        quiz_list = card.get('quiz', [])
        
        if not quiz_list:
            raise HTTPException(
                status_code=400,
                detail={
                    "ok": False,
                    "error": {
                        "code": "NO_QUIZ",
                        "message": "이 카드에는 퀴즈가 없어요."
                    }
                }
            )
        
        # 첫 번째 퀴즈 사용
        quiz = quiz_list[0]
        correct_index = quiz['correctIndex']
        options = quiz['options']
        
        # 인코딩 문제 해결: latin1로 읽힌 데이터를 UTF-8로 재해석
        def fix_encoding(text: str) -> str:
            try:
                # 잘못된 인코딩(latin1로 읽힌 UTF-8)을 복구
                return text.encode('latin1').decode('utf-8')
            except (UnicodeDecodeError, UnicodeEncodeError):
                # 이미 올바른 인코딩이면 그대로 반환
                return text
        
        # 옵션들의 인코딩 수정
        options_fixed = [fix_encoding(opt) for opt in options]
        correct_answer = options_fixed[correct_index]
        
        # 답변 확인 (문자열 정규화)
        answer_normalized = answer.strip()
        correct_normalized = correct_answer.strip()
        is_correct = (answer_normalized == correct_normalized)
        
        # 디버깅
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"🔥 Quiz check: answer='{answer_normalized!r}' vs correct='{correct_normalized!r}', match={is_correct}")
        logger.warning(f"🔥 Answer bytes: {answer_normalized.encode('utf-8').hex()}")
        logger.warning(f"🔥 Correct bytes: {correct_normalized.encode('utf-8').hex()}")
        logger.warning(f"🔥 Options fixed: {options_fixed}")
        
        return {
            "ok": True,
            "data": {
                "is_correct": is_correct,
                "explanation": quiz.get('explanation', ''),
                "correct_answer": correct_answer
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "QUIZ_SUBMIT_FAILED",
                    "message": f"퀴즈 제출에 실패했습니다: {str(e)}"
                }
            }
        )


@router.post("/complete")
async def complete_card(
    body: CardCompleteRequest,
    user_id: Optional[str] = Depends(get_current_user_optional),
    db: Optional[Client] = Depends(get_supabase),
    redis: Optional[Redis] = Depends(get_redis_client),
    gamification: GamificationService = Depends(get_gamification_service)
) -> Dict:
    """
    카드 완료 + 퀴즈 채점 + 게임화 업데이트
    
    Returns:
        {
          "ok": true,
          "data": {
            "points_added": 11,
            "total_points": 150,
            "streak_days": 7,
            "quiz_result": { "correct": 2, "total": 3 }
          }
        }
    """
    try:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"🔥 Complete card called: card_id={body.card_id}, user_id={user_id}")
        
        # 1. 카드 조회
        card_result = db.table('cards').select('*').eq('id', body.card_id).execute()
        
        if not card_result.data or len(card_result.data) == 0:
            raise HTTPException(
                status_code=404,
                detail={
                    "ok": False,
                    "error": {
                        "code": "CARD_NOT_FOUND",
                        "message": "카드를 찾을 수 없어요."
                    }
                }
            )
        
        logger.warning(f"🔥 Card found: {card_result.data[0].keys()}")
        
        card = card_result.data[0]
        
        # 2. 권한 확인 (user_id가 있는 경우에만)
        if card.get('user_id') and card['user_id'] != user_id:
            raise HTTPException(
                status_code=403,
                detail={
                    "ok": False,
                    "error": {
                        "code": "FORBIDDEN",
                        "message": "이 카드에 접근할 권한이 없어요."
                    }
                }
            )
        
        # 3. 중복 완료 방지 (Redis 또는 DB 기반 - 1차 체크)
        is_completed = _is_card_completed_today(redis, db, user_id, body.card_id)
        if is_completed:
            logger.info(f"중복 완료 차단 (1차 체크): user={user_id}, card={body.card_id}")
            raise HTTPException(
                status_code=400,
                detail={
                    "ok": False,
                    "error": {
                        "code": "ALREADY_COMPLETED",
                        "message": "이미 완료한 카드예요."
                    }
                }
            )
        
        # 카드 테이블 status 필드 체크 (있으면)
        if card.get('status') == 'completed':
            raise HTTPException(
                status_code=400,
                detail={
                    "ok": False,
                    "error": {
                        "code": "ALREADY_COMPLETED",
                        "message": "이미 완료한 카드예요."
                    }
                }
            )
        
        # 4. 퀴즈 채점 (optional)
        quiz_result = None
        if hasattr(body, 'quiz_answers') and body.quiz_answers:
            quiz_payload = card.get('payload', {}).get('quiz', [])
            if quiz_payload:
                quiz_result = _grade_quiz(quiz_payload, body.quiz_answers)
        
        # 5. 게임화 업데이트 (사용자 진행 기록은 별도 테이블에 저장)
        from datetime import date as date_type
        # created_at은 timestamp이므로 날짜만 추출
        completion_date_str = card.get('date')
        if not completion_date_str:
            created_at = card.get('created_at', '')
            if created_at:
                # YYYY-MM-DDTHH:MM:SS... 형식에서 날짜 부분만 추출
                completion_date_str = created_at.split('T')[0]
            else:
                completion_date_str = date_type.today().isoformat()
        logger.warning(f"🔥 Calling gamification: completion_date={completion_date_str}, quiz_result={quiz_result}")
        
        gamification_result = await gamification.award_for_card_completion(
            user_id=user_id,
            num_correct=quiz_result['correct'] if quiz_result else 0,
            num_questions=quiz_result['total'] if quiz_result else 0,
            completion_date=completion_date_str
        )
        
        logger.warning(f"🔥 Gamification result: {gamification_result}")
        
        # 2차 중복 체크 (게임화 후 DB 기록 전 - 경쟁 조건 최종 방어)
        try:
            is_completed_final = _is_card_completed_today(redis, db, user_id, body.card_id)
            if is_completed_final:
                logger.warning(f"중복 완료 차단 (2차 - DB 기록 직전): user={user_id}, card={body.card_id}")
                raise HTTPException(
                    status_code=400,
                    detail={
                        "ok": False,
                        "error": {
                            "code": "ALREADY_COMPLETED",
                            "message": "이미 완료한 카드예요."
                        }
                    }
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"2차 중복 체크 실패 (계속 진행): {e}")
        
        # 완료 기록 추가 (Redis + DB)
        try:
            _mark_card_completed(
                redis, db, user_id, body.card_id,
                quiz_correct=quiz_result['correct'] if quiz_result else 0,
                quiz_total=quiz_result['total'] if quiz_result else 0
            )
            logger.warning(f"🔥 Card completion recorded")
        except ValueError as e:
            # 중복 완료 에러 (DB UNIQUE 제약 위반)
            if "ALREADY_COMPLETED" in str(e):
                logger.info(f"중복 완료 차단 (DB INSERT 실패): user={user_id}, card={body.card_id}")
                raise HTTPException(
                    status_code=400,
                    detail={
                        "ok": False,
                        "error": {
                            "code": "ALREADY_COMPLETED",
                            "message": "이미 완료한 카드예요."
                        }
                    }
                )
            raise
        
        return {
            "ok": True,
            "data": {
                **gamification_result,
                "quiz_result": quiz_result
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"🔥 Complete card error: {e}")
        logger.error(f"🔥 Traceback: {traceback.format_exc()}")
        
        # DB 에러인 경우 한국어 번역 적용
        if is_db_error(e):
            error_info = translate_db_error(e)
            raise HTTPException(
                status_code=500,
                detail={
                    "ok": False,
                    "error": error_info
                }
            )
        
        # 일반 에러
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "CARD_COMPLETION_ERROR",
                    "message": "완료 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요."
                }
            }
        )


def _grade_quiz(quiz: list, answers: Dict[str, int]) -> Dict:
    """
    퀴즈 채점
    
    Args:
        quiz: [{ "id": "q1", "correctIndex": 1 }, ...]
        answers: { "q1": 1, "q2": 0 }
    
    Returns:
        { "correct": 2, "total": 3, "details": [...] }
    """
    correct = 0
    details = []
    
    for q in quiz:
        user_answer = answers.get(q['id'])
        is_correct = user_answer == q['correctIndex']
        
        if is_correct:
            correct += 1
        
        details.append({
            "question_id": q['id'],
            "is_correct": is_correct,
            "explanation": q['explanation']
        })
    
    return {
        "correct": correct,
        "total": len(quiz),
        "details": details
    }
