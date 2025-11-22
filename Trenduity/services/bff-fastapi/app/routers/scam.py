from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import List, Literal, Optional
from redis import Redis
import logging

from app.core.deps import get_current_user, get_supabase, get_redis_client
from app.services.scam_checker import ScamChecker

logger = logging.getLogger(__name__)
router = APIRouter()
checker = ScamChecker()

# 레이트 리미팅 설정
RATE_LIMIT_WINDOW = 60  # 1분
RATE_LIMIT_MAX_REQUESTS = 5  # 최대 5회


class ScamCheckRequest(BaseModel):
    """사기 검사 요청"""

    input: str = Field(..., min_length=5, max_length=500, description="검사할 문자 내용")

    @field_validator("input")
    @classmethod
    def validate_input(cls, v: str) -> str:
        if len(v.strip()) < 5:
            raise ValueError("검사할 내용이 너무 짧습니다. 최소 5자 이상 입력해 주세요.")
        return v


class ScamCheckResponse(BaseModel):
    """사기 검사 응답"""

    label: Literal["safe", "warn", "danger"]
    tips: List[str]


@router.post("/check")
async def check_scam(
    body: ScamCheckRequest,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
    redis: Optional[Redis] = Depends(get_redis_client)
):
    """
    SMS/URL 사기 검사

    - 키워드 매칭으로 위험도 판정 (safe/warn/danger)
    - 구체적인 대응 팁 제공
    - 레이트 리미팅: 1분당 5회
    - 선택적으로 scam_checks 테이블에 로그 기록
    """
    user_id = current_user["id"]
    
    # 레이트 리미팅 체크
    if redis:
        try:
            rate_limit_key = f"ratelimit:scam:{user_id}"
            current_count = redis.get(rate_limit_key)
            
            if current_count and int(current_count) >= RATE_LIMIT_MAX_REQUESTS:
                raise HTTPException(
                    status_code=429,
                    detail={
                        "ok": False,
                        "error": {
                            "code": "RATE_LIMIT_EXCEEDED",
                            "message": "사기 검사를 너무 자주 요청했어요. 1분 후 다시 시도해 주세요."
                        }
                    }
                )
            
            # 카운트 증가
            pipe = redis.pipeline()
            pipe.incr(rate_limit_key)
            pipe.expire(rate_limit_key, RATE_LIMIT_WINDOW)
            pipe.execute()
            
            logger.info(f"레이트 리미팅: user={user_id}, count={int(current_count or 0) + 1}/{RATE_LIMIT_MAX_REQUESTS}")
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"레이트 리미팅 체크 실패 (계속 진행): {e}")
    
    try:
        # ScamChecker 서비스로 검사
        result = checker.check(body.input)

        # 선택적 DB 로깅 (실패해도 응답에 영향 없음)
        try:
            supabase.table("scam_checks").insert(
                {
                    "user_id": current_user["id"],
                    "input": body.input[:200],  # 최대 200자만 저장
                    "label": result.label,
                }
            ).execute()
        except Exception:
            # 로깅 실패는 무시 (테이블이 아직 없을 수 있음)
            pass

        # Envelope 응답
        return {
            "ok": True,
            "data": ScamCheckResponse(
                label=result.label,
                tips=result.tips,
            ).model_dump(),
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "SCAM_CHECK_FAILED",
                "message": f"사기 검사에 실패했습니다: {str(e)}",
            },
        }
