from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from datetime import date
from supabase import Client
from app.core.deps import get_current_user, get_supabase, get_gamification_service
from app.schemas.card import CardCompleteRequest
from app.services.gamification import GamificationService

router = APIRouter()


@router.get("/today")
async def get_today_card(
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase)
) -> Dict:
    """
    오늘의 카드 조회
    
    Returns:
        { "ok": true, "data": { "card": {...} } }
    """
    today = date.today().isoformat()
    
    # 1. 오늘 카드 조회
    try:
        result = db.table('cards') \
            .select('*') \
            .eq('user_id', user_id) \
            .eq('date', today) \
            .limit(1) \
            .execute()
        
        if not result.data or len(result.data) == 0:
            # 2. 카드가 없으면 fallback 생성
            card = await _create_fallback_card(db, user_id, today)
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


@router.post("/complete")
async def complete_card(
    body: CardCompleteRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
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
        
        card = card_result.data[0]
        
        # 2. 권한 확인
        if card['user_id'] != user_id:
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
        
        # 3. 중복 완료 방지
        if card['status'] == 'completed':
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
        
        # 4. 퀴즈 채점
        quiz_result = None
        if body.quiz_answers:
            quiz_payload = card['payload'].get('quiz', [])
            quiz_result = _grade_quiz(quiz_payload, body.quiz_answers)
        
        # 5. 카드 상태 업데이트
        db.table('cards').update({'status': 'completed'}).eq('id', body.card_id).execute()
        
        # 6. 게임화 업데이트
        gamification_result = await gamification.award_for_card_completion(
            user_id=user_id,
            num_correct=quiz_result['correct'] if quiz_result else 0,
            num_questions=quiz_result['total'] if quiz_result else 0,
            completion_date=card['date']
        )
        
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
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "DB_ERROR",
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
