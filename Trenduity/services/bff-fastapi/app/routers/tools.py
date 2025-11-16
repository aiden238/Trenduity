from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from typing import List, Literal

from app.core.deps import get_current_user, get_supabase, get_gamification_service
from app.services.gamification import GamificationService

router = APIRouter()

# 도구별 스텝 정의
TOOL_STEPS = {
    "canva": [
        {"step": 1, "title": "템플릿 선택하기", "description": "마음에 드는 템플릿을 골라보세요."},
        {"step": 2, "title": "텍스트 수정하기", "description": "글자를 바꿔서 내 것으로 만들어요."},
        {"step": 3, "title": "이미지 바꾸기", "description": "원하는 사진으로 교체해 보세요."},
        {"step": 4, "title": "저장하고 공유하기", "description": "완성본을 저장하고 가족에게 보내요."},
    ],
    "miri": [
        {"step": 1, "title": "Miri 앱 열기", "description": "Miri 앱을 설치하고 로그인해요."},
        {"step": 2, "title": "질문하기", "description": "'오늘 날씨 어때?'라고 물어보세요."},
        {"step": 3, "title": "음성으로 검색", "description": "말로 검색해 보세요."},
    ],
    "sora": [
        {"step": 1, "title": "Sora 소개", "description": "Sora는 영상을 만드는 AI예요."},
        {"step": 2, "title": "프롬프트 작성", "description": "원하는 영상을 글로 설명해요."},
        {"step": 3, "title": "결과 확인", "description": "AI가 만든 영상을 감상해요."},
    ],
}


class ToolStep(BaseModel):
    """도구 단계"""

    step: int
    title: str
    description: str
    status: Literal["not_started", "in_progress", "done"]


class ToolProgressResponse(BaseModel):
    """도구 진행 상황 응답"""

    tool: str
    steps: List[ToolStep]


class UpdateProgressRequest(BaseModel):
    """진행 상황 업데이트 요청"""

    tool: str
    step: int
    status: Literal["in_progress", "done"]


class UpdateProgressResponse(BaseModel):
    """진행 상황 업데이트 응답"""

    points_added: int = 0
    total_points: int = 0


@router.get("/progress")
async def get_tool_progress(
    tool: str = Query(..., description="canva | miri | sora"),
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    도구별 진행 상황 조회

    - 도구별 정의된 단계 목록 반환
    - DB에서 사용자 진행 상황 조회 후 병합
    - status: not_started (기본값), in_progress, done
    """
    try:
        if tool not in TOOL_STEPS:
            return {
                "ok": False,
                "error": {
                    "code": "INVALID_TOOL",
                    "message": "지원하지 않는 도구예요. canva, miri, sora 중 선택해 주세요.",
                },
            }

        # DB에서 진행 상황 조회
        try:
            result = (
                supabase.table("tools_progress")
                .select("step, status")
                .eq("user_id", current_user["id"])
                .eq("tool", tool)
                .execute()
            )
            progress_map = {row["step"]: row["status"] for row in result.data}
        except Exception:
            # 테이블이 아직 없으면 빈 맵 사용
            progress_map = {}

        # 스텝 정의 + 진행 상황 병합
        steps = []
        for step_def in TOOL_STEPS[tool]:
            step_num = step_def["step"]
            status = progress_map.get(step_num, "not_started")

            steps.append(
                ToolStep(
                    step=step_num,
                    title=step_def["title"],
                    description=step_def["description"],
                    status=status,
                )
            )

        # Envelope 응답
        return {
            "ok": True,
            "data": ToolProgressResponse(tool=tool, steps=steps).model_dump(),
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "TOOL_PROGRESS_FETCH_FAILED",
                "message": f"진행 상황을 불러올 수 없어요: {str(e)}",
            },
        }


@router.post("/progress")
async def update_tool_progress(
    body: UpdateProgressRequest,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
    gamification: GamificationService = Depends(get_gamification_service),
):
    """
    도구 진행 상황 업데이트 + 게임화

    - tools_progress 테이블에 upsert
    - status가 'done'일 경우 포인트 부여 (+3점)
    """
    try:
        # 도구 유효성 검증
        if body.tool not in TOOL_STEPS:
            return {
                "ok": False,
                "error": {
                    "code": "INVALID_TOOL",
                    "message": "지원하지 않는 도구예요.",
                },
            }

        # 스텝 유효성 검증
        valid_steps = [s["step"] for s in TOOL_STEPS[body.tool]]
        if body.step not in valid_steps:
            return {
                "ok": False,
                "error": {
                    "code": "INVALID_STEP",
                    "message": f"유효하지 않은 단계예요. (1-{len(valid_steps)})",
                },
            }

        # Upsert 진행 상황
        try:
            supabase.table("tools_progress").upsert(
                {
                    "user_id": current_user["id"],
                    "tool": body.tool,
                    "step": body.step,
                    "status": body.status,
                }
            ).execute()
        except Exception:
            # 테이블이 없으면 무시 (나중에 생성될 예정)
            pass

        # 게임화 (단계 완료 시만)
        if body.status == "done":
            try:
                points_result = await gamification.award_for_tool_step_completion(
                    user_id=current_user["id"],
                    tool=body.tool,
                    step=body.step,
                )

                return {
                    "ok": True,
                    "data": UpdateProgressResponse(**points_result).model_dump(),
                }
            except Exception as e:
                # 게임화 실패해도 업데이트 자체는 성공
                return {
                    "ok": True,
                    "data": UpdateProgressResponse().model_dump(),
                }

        return {
            "ok": True,
            "data": UpdateProgressResponse().model_dump(),
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "TOOL_PROGRESS_UPDATE_FAILED",
                "message": f"진행 상황을 업데이트할 수 없어요: {str(e)}",
            },
        }
