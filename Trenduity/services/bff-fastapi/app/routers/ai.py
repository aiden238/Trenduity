"""
AI 라우터

AI 채팅, 상담, 4가지 비서 모델(GPT-5/Gemini) 연동
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field
import logging
import httpx
import os
from datetime import datetime

from app.core.deps import get_current_user_optional

logger = logging.getLogger(__name__)
router = APIRouter()

# 환경 변수에서 API 키 로드
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# API 엔드포인트
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
GOOGLE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models"


class ConversationMessage(BaseModel):
    """대화 메시지"""
    role: Literal["user", "assistant", "system"]
    content: str


class AIConsultRequest(BaseModel):
    """AI 상담 요청"""
    message: str = Field(..., min_length=1, max_length=1000, description="사용자 메시지")
    conversation_history: List[ConversationMessage] = Field(default_factory=list, description="대화 기록 (최근 10개)")


class AIChatRequest(BaseModel):
    """AI 채팅 요청"""
    model_config = {"protected_namespaces": ()}
    
    message: str = Field(..., min_length=1, max_length=1000, description="사용자 메시지")
    model_id: Literal["allround", "quick", "writer", "expert"] = Field(..., description="AI 모델 ID")
    conversation_history: List[ConversationMessage] = Field(default_factory=list, description="대화 기록")


class AIResponse(BaseModel):
    """AI 응답"""
    model_config = {"protected_namespaces": ()}
    
    response: str
    model_used: str
    tokens_used: Optional[int] = None


# AI 모델별 설정
AI_MODEL_CONFIG = {
    "allround": {
        "name": "만능 비서",
        "provider": "openai",
        "model": "gpt-5-nano",  # GPT-5 Nano (최신 OpenAI 모델)
        "system_prompt": "당신은 시니어를 위한 만능 AI 도우미입니다. 디지털 기기 사용법, 앱 활용, 일상 생활의 모든 궁금증에 친절하고 자세하게 답변해주세요. 어르신이 이해하기 쉽게 단계별로 설명하고, 이모지를 적절히 사용해 친근하게 소통하세요.",
    },
    "quick": {
        "name": "빠른 비서",
        "provider": "google",
        "model": "gemini-2.0-flash-lite",  # Gemini 2.0 Flash Lite (최신 빠른 모델)
        "system_prompt": "당신은 빠르고 간결한 답변을 제공하는 AI 도우미입니다. 사용자의 질문에 핵심만 짧고 명확하게 답변하세요. 불필요한 설명은 생략하고, 꼭 필요한 정보만 전달하세요.",
    },
    "writer": {
        "name": "글쓰기 비서",
        "provider": "google",
        "model": "gemini-2.5-flash",  # Gemini 2.5 Flash (최신 균형 모델)
        "system_prompt": "당신은 시니어를 위한 친절한 글쓰기 도우미입니다. 사용자가 편지, 문자, 이메일, 축하 메시지 등을 작성할 때 쉽고 정중한 표현으로 도와주세요. 어려운 표현은 피하고, 따뜻하고 정감 있는 한국어를 사용하세요.",
    },
    "expert": {
        "name": "척척박사 비서",
        "provider": "openai",
        "model": "gpt-5-mini",  # GPT-5 Mini (최신 OpenAI 경량 모델)
        "system_prompt": "당신은 시니어를 위한 박식한 정보 도우미입니다. 건강, 생활 상식, 역사, 문화 등 다양한 분야의 질문에 쉽고 정확하게 답변해주세요. 전문 용어는 쉽게 풀어서 설명하고, 필요하면 예시를 들어주세요.",
    },
}


async def call_openai_api(
    messages: List[Dict[str, str]],
    model: str = "gpt-5-nano",
    max_tokens: int = 500,
    temperature: float = 0.7,
) -> Dict:
    """OpenAI API 호출"""
    if not OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY not configured")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "API_KEY_MISSING",
                    "message": "OpenAI API 키가 설정되지 않았어요. 관리자에게 문의해주세요.",
                },
            },
        )

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    # GPT-5 모델은 max_completion_tokens 사용, 이전 모델은 max_tokens 사용
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }
    
    if model.startswith("gpt-5"):
        payload["max_completion_tokens"] = max_tokens
    else:
        payload["max_tokens"] = max_tokens

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(OPENAI_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            return {
                "response": data["choices"][0]["message"]["content"],
                "tokens_used": data.get("usage", {}).get("total_tokens", 0),
            }
    except httpx.HTTPStatusError as e:
        logger.error(f"OpenAI API error: {e.response.text}")
        raise HTTPException(
            status_code=502,
            detail={
                "ok": False,
                "error": {
                    "code": "OPENAI_API_ERROR",
                    "message": "AI 응답을 생성할 수 없어요. 잠시 후 다시 시도해주세요.",
                },
            },
        )
    except Exception as e:
        logger.error(f"OpenAI API call failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "AI_REQUEST_FAILED",
                    "message": "AI와 통신 중 오류가 발생했어요.",
                },
            },
        )


async def call_google_gemini_api(
    messages: List[Dict[str, str]],
    model: str = "gemini-2.0-flash-lite",
    max_tokens: int = 500,
    temperature: float = 0.7,
) -> Dict:
    """Google Gemini API 호출"""
    if not GOOGLE_API_KEY:
        logger.error("GOOGLE_API_KEY not configured")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "API_KEY_MISSING",
                    "message": "Google API 키가 설정되지 않았어요. 관리자에게 문의해주세요.",
                },
            },
        )

    # Gemini API는 메시지 형식이 다름
    # system 메시지는 contents의 첫 부분에 포함
    contents = []
    system_instruction = None
    
    for msg in messages:
        if msg["role"] == "system":
            system_instruction = msg["content"]
        else:
            contents.append({
                "role": "user" if msg["role"] == "user" else "model",
                "parts": [{"text": msg["content"]}],
            })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
        },
    }
    
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    url = f"{GOOGLE_API_URL}/{model}:generateContent?key={GOOGLE_API_KEY}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # Gemini 응답 파싱
            if "candidates" in data and len(data["candidates"]) > 0:
                content = data["candidates"][0]["content"]["parts"][0]["text"]
                tokens_used = data.get("usageMetadata", {}).get("totalTokenCount", 0)
                
                return {
                    "response": content,
                    "tokens_used": tokens_used,
                }
            else:
                raise Exception("No response from Gemini")
                
    except httpx.HTTPStatusError as e:
        logger.error(f"Gemini API error: {e.response.text}")
        raise HTTPException(
            status_code=502,
            detail={
                "ok": False,
                "error": {
                    "code": "GEMINI_API_ERROR",
                    "message": "AI 응답을 생성할 수 없어요. 잠시 후 다시 시도해주세요.",
                },
            },
        )
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "AI_REQUEST_FAILED",
                    "message": "AI와 통신 중 오류가 발생했어요.",
                },
            },
        )


@router.post("/consult")
async def ai_consult(
    request: AIConsultRequest,
    current_user: Optional[str] = Depends(get_current_user_optional),
):
    """
    AI 맞춤 상담
    
    시니어의 고민이나 질문에 대해 친절하게 상담해주는 엔드포인트.
    기본적으로 만능 비서 모델을 사용합니다.
    인증 없이도 사용 가능합니다.
    """
    user_id = current_user if current_user else "anonymous"
    
    logger.info(f"AI Consult request from user {user_id}")
    
    # 대화 기록 구성 (최근 10개만)
    messages = [
        {
            "role": "system",
            "content": "당신은 시니어를 위한 따뜻하고 공감적인 AI 상담 비서입니다. 건강, 기술, 가족, 일상생활 등 어떤 주제든 친구처럼 이야기를 들어주고 조언해주세요. 어려운 표현은 쉽게 풀어서 설명하고, 이모지를 적절히 사용해 친근하게 소통하세요. 사용자의 감정을 이해하고 공감하며, 실질적인 도움이 되는 조언을 제공하세요.",
        }
    ]
    
    # 대화 기록 추가 (최근 10개)
    for msg in request.conversation_history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})
    
    # 사용자 메시지 추가
    messages.append({"role": "user", "content": request.message})
    
    # OpenAI API 호출 (만능 비서 모델)
    result = await call_openai_api(
        messages=messages,
        model="gpt-5-nano",
        max_tokens=700,
        temperature=0.8,
    )
    
    return {
        "ok": True,
        "data": AIResponse(
            response=result["response"],
            model_used="gpt-4o (만능 비서)",
            tokens_used=result.get("tokens_used"),
        ).model_dump(),
    }


@router.post("/chat")
async def ai_chat(
    request: AIChatRequest,
    current_user: Optional[str] = Depends(get_current_user_optional),
):
    """
    AI 채팅 (4가지 비서 모델)
    
    사용자가 선택한 AI 비서 모델과 채팅합니다.
    - allround: GPT-4o (만능 비서)
    - quick: Gemini 1.5 Flash (빠른 비서)
    - writer: Gemini 1.5 Pro (글쓰기 비서)
    - expert: GPT-4o Mini (척척박사 비서)
    인증 없이도 사용 가능합니다.
    """
    user_id = current_user if current_user else "anonymous"
    model_id = request.model_id
    
    if model_id not in AI_MODEL_CONFIG:
        raise HTTPException(
            status_code=400,
            detail={
                "ok": False,
                "error": {
                    "code": "INVALID_MODEL",
                    "message": "지원하지 않는 AI 모델이에요.",
                },
            },
        )
    
    config = AI_MODEL_CONFIG[model_id]
    logger.info(f"AI Chat request from user {user_id}, model: {config['name']}")
    
    # 대화 기록 구성
    messages = [
        {"role": "system", "content": config["system_prompt"]}
    ]
    
    # 대화 기록 추가 (최근 15개)
    for msg in request.conversation_history[-15:]:
        messages.append({"role": msg.role, "content": msg.content})
    
    # 사용자 메시지 추가
    messages.append({"role": "user", "content": request.message})
    
    # API 호출
    if config["provider"] == "openai":
        result = await call_openai_api(
            messages=messages,
            model=config["model"],
            max_tokens=800 if model_id == "allround" else 500,
            temperature=0.7,
        )
    else:  # google
        result = await call_google_gemini_api(
            messages=messages,
            model=config["model"],
            max_tokens=800 if model_id == "writer" else 400,
            temperature=0.7,
        )
    
    return {
        "ok": True,
        "data": AIResponse(
            response=result["response"],
            model_used=f"{config['model']} ({config['name']})",
            tokens_used=result.get("tokens_used"),
        ).model_dump(),
    }


@router.get("/models")
async def get_ai_models():
    """
    사용 가능한 AI 모델 목록 조회
    """
    models = []
    for model_id, config in AI_MODEL_CONFIG.items():
        models.append({
            "id": model_id,
            "name": config["name"],
            "provider": config["provider"],
            "model": config["model"],
        })
    
    return {
        "ok": True,
        "data": {
            "models": models,
        },
    }
