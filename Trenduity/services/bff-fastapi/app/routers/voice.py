from fastapi import APIRouter
from typing import Dict
from pydantic import BaseModel
from app.services.voice_parser import VoiceParser

router = APIRouter()


class ParseIntentRequest(BaseModel):
    text: str  # 음성 인식 결과


@router.post("/intent")
async def parse_intent(body: ParseIntentRequest) -> Dict:
    """
    음성 텍스트를 파싱하여 인텐트 추출
    
    Request:
        { "text": "엄마한테 전화해" }
    
    Response:
        {
          "ok": true,
          "data": {
            "intent": "call",
            "slots": { "name": "엄마" },
            "action": {
              "kind": "contact_lookup",
              "name": "엄마",
              "hint": "엄마님의 연락처를 찾아주세요."
            },
            "summary": "엄마님께 전화 걸기"
          }
        }
    """
    parser = VoiceParser()
    parsed = parser.parse(body.text)
    
    if not parsed:
        return {
            "ok": False,
            "error": {
                "code": "INTENT_NOT_RECOGNIZED",
                "message": "음성 명령을 이해하지 못했어요. 다시 말씀해 주세요."
            }
        }
    
    action = parser.to_action(parsed)
    summary = _generate_summary(parsed)
    
    return {
        "ok": True,
        "data": {
            "intent": parsed.intent,
            "slots": parsed.slots,
            "action": action,
            "summary": summary
        }
    }


def _generate_summary(parsed) -> str:
    """
    사용자 친화적인 요약 문장 생성
    """
    if parsed.intent == "call":
        return f"{parsed.slots['name']}님께 전화 걸기"
    elif parsed.intent == "sms":
        return f"{parsed.slots['name']}님께 문자 보내기"
    elif parsed.intent == "search":
        return f"'{parsed.slots['query']}' 검색하기"
    elif parsed.intent == "remind":
        return f"'{parsed.slots['text']}' 알림 설정"
    elif parsed.intent == "navigate":
        return f"{parsed.slots['destination']} 길찾기"
    elif parsed.intent == "open":
        return f"{parsed.slots['target']} 열기"
    return "명령 실행"
