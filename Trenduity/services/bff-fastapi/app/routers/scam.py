from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import List, Literal

from app.core.deps import get_current_user, get_supabase
from app.services.scam_checker import ScamChecker

router = APIRouter()
checker = ScamChecker()


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
):
    """
    SMS/URL 사기 검사

    - 키워드 매칭으로 위험도 판정 (safe/warn/danger)
    - 구체적인 대응 팁 제공
    - 선택적으로 scam_checks 테이블에 로그 기록
    """
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
