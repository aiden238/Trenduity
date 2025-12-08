"""
AI 채팅 라우터

시니어 친화적 AI 채팅 기능 제공
- 다중 AI 모델 지원 (GPT, Gemini, Claude)
- 시니어 맞춤 시스템 프롬프트
- 레이트 리미팅 및 사용량 추적
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from redis import Redis
import logging
import httpx
import os

from app.core.deps import get_current_user, get_redis_client

logger = logging.getLogger(__name__)
router = APIRouter()

# 환경 변수 - 각 AI 서비스 API 키
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY", "")  # Gemini
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")  # Claude

# 레이트 리미팅
RATE_LIMIT_WINDOW = 60  # 1분
RATE_LIMIT_MAX_REQUESTS = 10  # 최대 10회

# AI 모델 설정
AI_MODEL_CONFIG = {
    # 빠른 일반 비서 - Gemini
    "quick": {
        "provider": "google",
        "model": "gemini-1.5-flash",
        "fallback_model": "gemini-1.5-flash",
        "name": "빠른 일반 비서",
    },
    # 만능 비서 - GPT-4o-mini (빠른 GPT 계열)
    "allround": {
        "provider": "openai",
        "model": "gpt-4o-mini",
        "fallback_model": "gpt-3.5-turbo",
        "name": "만능 비서",
    },
    # 글쓰기 비서 - Claude
    "writer": {
        "provider": "anthropic",
        "model": "claude-3-5-sonnet-20241022",
        "fallback_model": "claude-3-haiku-20240307",
        "name": "글쓰기 비서",
    },
    # 척척박사 비서 - 플래그쉽 계열 (GPT-4o)
    "expert": {
        "provider": "openai",
        "model": "gpt-4o",
        "fallback_model": "gpt-4o-mini",
        "name": "척척박사 비서",
    },
    # 천재 비서 - Claude Opus 4.5급 하이엔드 (든든 플랜 전용)
    "genius": {
        "provider": "anthropic",
        "model": "claude-sonnet-4-20250514",
        "fallback_model": "claude-3-5-sonnet-20241022",
        "name": "천재 비서",
    },
}

# 시니어 친화적 시스템 프롬프트
SYSTEM_PROMPT = """당신은 50-70대 시니어를 위한 친절한 AI 도우미입니다.

규칙:
1. 항상 존댓말을 사용하세요 ("~해요", "~이에요", "~드려요")
2. 쉬운 단어를 사용하세요 (전문용어 피하기)
3. 답변은 짧고 핵심적으로 (2-3문장)
4. 이모지를 적절히 사용해서 친근하게 대화하세요 😊
5. 디지털/기술 관련 질문에 특히 친절하게 설명해주세요
6. 건강, 사기 예방 관련 조언을 할 때는 신중하게 답변하세요

예시 응답:
- "안녕하세요! 무엇을 도와드릴까요? 😊"
- "쉽게 설명드릴게요. 스마트폰에서..."
- "걱정 마세요. 차근차근 알려드릴게요!"
"""


class Message(BaseModel):
    """채팅 메시지"""
    role: str = Field(..., description="메시지 역할 (user/assistant)")
    content: str = Field(..., description="메시지 내용")


class ChatRequest(BaseModel):
    """채팅 요청"""
    message: str = Field(..., min_length=1, max_length=500, description="사용자 메시지")
    history: List[Message] = Field(default=[], description="이전 대화 기록 (최근 10개)")
    model_id: Optional[str] = Field(default="allround", description="AI 모델 ID (quick/allround/writer/expert/genius)")
    system_prompt: Optional[str] = Field(default=None, description="커스텀 시스템 프롬프트")


class ChatResponse(BaseModel):
    """채팅 응답"""
    reply: str
    usage: Optional[dict] = None
    model_used: Optional[str] = None


async def call_openai(messages: List[dict], model: str) -> dict:
    """OpenAI API 호출"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.7
            }
        )
        if response.status_code != 200:
            raise Exception(f"OpenAI API error: {response.status_code}")
        data = response.json()
        return {
            "reply": data["choices"][0]["message"]["content"],
            "usage": data.get("usage"),
            "model_used": model
        }


async def call_google(messages: List[dict], model: str, system_prompt: str) -> dict:
    """Google Gemini API 호출"""
    # Gemini 형식으로 변환
    contents = []
    for msg in messages:
        if msg["role"] == "user":
            contents.append({"role": "user", "parts": [{"text": msg["content"]}]})
        elif msg["role"] == "assistant":
            contents.append({"role": "model", "parts": [{"text": msg["content"]}]})
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GOOGLE_AI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": contents,
                "systemInstruction": {"parts": [{"text": system_prompt}]},
                "generationConfig": {
                    "maxOutputTokens": 500,
                    "temperature": 0.7
                }
            }
        )
        if response.status_code != 200:
            raise Exception(f"Google AI API error: {response.status_code}")
        data = response.json()
        reply = data["candidates"][0]["content"]["parts"][0]["text"]
        return {
            "reply": reply,
            "usage": data.get("usageMetadata"),
            "model_used": model
        }


async def call_anthropic(messages: List[dict], model: str, system_prompt: str) -> dict:
    """Anthropic Claude API 호출"""
    # Claude 형식으로 변환 (system은 별도)
    claude_messages = []
    for msg in messages:
        if msg["role"] in ["user", "assistant"]:
            claude_messages.append({"role": msg["role"], "content": msg["content"]})
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "system": system_prompt,
                "messages": claude_messages,
                "max_tokens": 500,
                "temperature": 0.7
            }
        )
        if response.status_code != 200:
            raise Exception(f"Anthropic API error: {response.status_code}")
        data = response.json()
        reply = data["content"][0]["text"]
        return {
            "reply": reply,
            "usage": data.get("usage"),
            "model_used": model
        }


@router.post("/send")
async def send_message(
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
    redis: Optional[Redis] = Depends(get_redis_client)
):
    """
    AI 채팅 메시지 전송
    
    다중 AI 모델 지원:
    - quick: Gemini (빠른 일반 비서)
    - allround: GPT-4o-mini (만능 비서)
    - writer: Claude (글쓰기 비서)
    - expert: GPT-4o (척척박사 비서)
    - genius: Claude Opus급 (천재 비서)
    """
    user_id = current_user["id"]
    model_id = body.model_id or "allround"
    
    # 모델 설정 가져오기
    model_config = AI_MODEL_CONFIG.get(model_id, AI_MODEL_CONFIG["allround"])
    provider = model_config["provider"]
    model = model_config["model"]
    
    # 시스템 프롬프트 (커스텀 또는 기본)
    system_prompt = body.system_prompt or SYSTEM_PROMPT
    
    # 레이트 리미팅
    if redis:
        try:
            rate_limit_key = f"ratelimit:chat:{user_id}:{model_id}"
            current_count = redis.get(rate_limit_key)
            
            if current_count and int(current_count) >= RATE_LIMIT_MAX_REQUESTS:
                return {
                    "ok": False,
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": "너무 많은 메시지를 보내셨어요. 잠시 후 다시 시도해 주세요."
                    }
                }
            
            pipe = redis.pipeline()
            pipe.incr(rate_limit_key)
            pipe.expire(rate_limit_key, RATE_LIMIT_WINDOW)
            pipe.execute()
        except Exception as e:
            logger.warning(f"Redis rate limiting failed: {e}")
    
    # 메시지 준비
    messages = [{"role": "system", "content": system_prompt}]
    for msg in body.history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": body.message})
    
    # API 키 확인 및 호출
    try:
        result = None
        
        if provider == "openai" and OPENAI_API_KEY:
            result = await call_openai(messages, model)
        elif provider == "google" and GOOGLE_AI_API_KEY:
            result = await call_google(messages, model, system_prompt)
        elif provider == "anthropic" and ANTHROPIC_API_KEY:
            result = await call_anthropic(messages, model, system_prompt)
        
        # 폴백: OpenAI로 대체
        if not result and OPENAI_API_KEY:
            fallback_model = model_config.get("fallback_model", "gpt-3.5-turbo")
            logger.info(f"Using fallback model: {fallback_model}")
            result = await call_openai(messages, fallback_model)
        
        # 결과 반환
        if result:
            return {
                "ok": True,
                "data": {
                    "reply": result["reply"],
                    "usage": result.get("usage"),
                    "model_used": result.get("model_used")
                }
            }
        
        # API 키 없으면 목업 응답
        return {
            "ok": True,
            "data": {
                "reply": _get_mock_response(body.message),
                "usage": None,
                "model_used": "mock"
            }
        }
            
    except Exception as e:
        logger.error(f"Chat API error: {e}")
        return {
            "ok": True,
            "data": {
                "reply": _get_mock_response(body.message),
                "usage": None,
                "model_used": "mock"
            }
        }


def _get_mock_response(user_message: str) -> str:
    """목업 응답 생성 (API 키 없을 때)"""
    user_message_lower = user_message.lower()
    
    if "안녕" in user_message:
        return "안녕하세요! 😊 무엇을 도와드릴까요? 궁금한 것이 있으시면 편하게 물어보세요!"
    
    if "chatgpt" in user_message_lower or "챗지피티" in user_message:
        return "ChatGPT는 AI 채팅 서비스예요. 마치 저처럼 질문에 답해주는 똑똑한 친구라고 생각하시면 돼요! 😊 무엇이든 물어보세요."
    
    if "사기" in user_message or "보이스피싱" in user_message:
        return "⚠️ 사기 의심 전화나 문자는 절대 응하지 마세요! 가족이나 경찰(112)에 먼저 확인하세요. 의심스러운 내용은 '사기검사' 기능으로 확인해 보세요."
    
    if "카카오톡" in user_message or "카톡" in user_message:
        return "카카오톡은 무료 메시지 앱이에요. 📱 가족, 친구와 문자, 사진, 영상통화를 무료로 할 수 있어요. 어떤 기능이 궁금하세요?"
    
    if "유튜브" in user_message or "youtube" in user_message_lower:
        return "유튜브는 동영상을 볼 수 있는 앱이에요. 🎬 요리법, 건강 정보, 뉴스 등 다양한 영상이 있어요. 검색창에 보고 싶은 내용을 입력하면 돼요!"
    
    if "비밀번호" in user_message:
        return "🔐 비밀번호는 8자 이상, 숫자와 문자를 섞어서 만드세요. 절대 다른 사람에게 알려주면 안 돼요! 까먹지 않게 안전한 곳에 적어두세요."
    
    if "고마워" in user_message or "감사" in user_message:
        return "도움이 되었다니 기뻐요! 😊 언제든 궁금한 것이 있으면 물어보세요. 항상 여기 있을게요!"
    
    return f"좋은 질문이에요! 😊 '{user_message[:20]}...'에 대해 더 자세히 알려드릴게요. 어떤 부분이 특히 궁금하세요?"


@router.get("/suggestions")
async def get_suggestions():
    """
    추천 질문 목록
    
    AI 채팅 시작 시 보여줄 추천 질문
    """
    return {
        "ok": True,
        "data": {
            "suggestions": [
                {"text": "ChatGPT가 뭐예요?", "icon": "🤖"},
                {"text": "카카오톡 사용법 알려주세요", "icon": "💬"},
                {"text": "유튜브에서 영상 찾는 법", "icon": "🎬"},
                {"text": "안전한 비밀번호 만드는 법", "icon": "🔐"},
                {"text": "스마트폰 글씨 크게 하는 법", "icon": "📱"},
                {"text": "보이스피싱 구별하는 법", "icon": "⚠️"},
            ]
        }
    }
