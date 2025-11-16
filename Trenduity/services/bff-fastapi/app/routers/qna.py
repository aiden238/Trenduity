from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

from app.core.deps import get_current_user, get_supabase

router = APIRouter()


class QnaPostListItem(BaseModel):
    """Q&A 목록 아이템"""

    id: str
    title: str
    ai_summary: str
    author_name: str
    created_at: str
    vote_count: int


class QnaPostDetail(BaseModel):
    """Q&A 상세"""

    id: str
    title: str
    body: str
    topic: str
    author_name: str
    created_at: str
    vote_count: int


class CreateQnaRequest(BaseModel):
    """Q&A 작성 요청"""

    topic: Literal["ai_tools", "digital_safety", "health", "general"]
    title: str = Field(..., min_length=5, max_length=200)
    body: str = Field(..., min_length=10, max_length=2000)
    is_anon: bool = False


class QnaListResponse(BaseModel):
    """Q&A 목록 응답"""

    posts: List[QnaPostListItem]
    total: int


class CreateQnaResponse(BaseModel):
    """Q&A 작성 응답"""

    post_id: str


@router.get("")
async def list_qna(
    topic: Optional[str] = Query(None, description="ai_tools | digital_safety | health | general"),
    limit: int = Query(20, le=50),
    offset: int = Query(0),
    supabase=Depends(get_supabase),
):
    """
    Q&A 목록 조회

    - 주제별 필터링 가능
    - 생성일 기준 내림차순 정렬
    - 익명 처리 적용
    - vote_count 계산 (qna_votes 테이블 조인)
    """
    try:
        # 목록 조회
        query = (
            supabase.table("qna_posts")
            .select("*", count="exact")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
        )

        if topic:
            query = query.eq("topic", topic)

        try:
            result = query.execute()
        except Exception:
            # 테이블이 없으면 빈 목록 반환
            return {
                "ok": True,
                "data": QnaListResponse(posts=[], total=0).model_dump(),
            }

        # vote_count 조회 (별도 쿼리)
        posts = []
        for post in result.data:
            try:
                vote_result = (
                    supabase.table("qna_votes")
                    .select("id", count="exact")
                    .eq("post_id", post["id"])
                    .execute()
                )
                vote_count = vote_result.count or 0
            except Exception:
                vote_count = 0

            posts.append(
                QnaPostListItem(
                    id=post["id"],
                    title=post["title"],
                    ai_summary=post.get("ai_summary")
                    or (post["body"][:100] + ("..." if len(post["body"]) > 100 else "")),
                    author_name="익명" if post.get("is_anon") else "사용자",
                    created_at=post["created_at"],
                    vote_count=vote_count,
                )
            )

        # Envelope 응답
        return {
            "ok": True,
            "data": QnaListResponse(posts=posts, total=result.count or 0).model_dump(),
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "QNA_LIST_FETCH_FAILED",
                "message": f"Q&A 목록을 불러올 수 없어요: {str(e)}",
            },
        }


@router.get("/{post_id}")
async def get_qna_detail(
    post_id: str,
    supabase=Depends(get_supabase),
):
    """
    Q&A 상세 조회

    - 전체 본문 표시
    - vote_count 계산
    - 익명 처리 적용
    """
    try:
        # 포스트 조회
        try:
            result = (
                supabase.table("qna_posts")
                .select("*")
                .eq("id", post_id)
                .single()
                .execute()
            )
        except Exception:
            return {
                "ok": False,
                "error": {
                    "code": "POST_NOT_FOUND",
                    "message": "질문을 찾을 수 없어요.",
                },
            }

        if not result.data:
            return {
                "ok": False,
                "error": {
                    "code": "POST_NOT_FOUND",
                    "message": "질문을 찾을 수 없어요.",
                },
            }

        post = result.data

        # vote_count 조회
        try:
            vote_result = (
                supabase.table("qna_votes")
                .select("id", count="exact")
                .eq("post_id", post_id)
                .execute()
            )
            vote_count = vote_result.count or 0
        except Exception:
            vote_count = 0

        # Envelope 응답
        return {
            "ok": True,
            "data": {
                "post": QnaPostDetail(
                    id=post["id"],
                    title=post["title"],
                    body=post["body"],
                    topic=post["topic"],
                    author_name="익명" if post.get("is_anon") else "사용자",
                    created_at=post["created_at"],
                    vote_count=vote_count,
                ).model_dump()
            },
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "QNA_DETAIL_FETCH_FAILED",
                "message": f"질문 상세를 불러올 수 없어요: {str(e)}",
            },
        }


@router.post("")
async def create_qna(
    body: CreateQnaRequest,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    Q&A 작성

    - AI 요약 생성 (MVP: 본문 앞부분 100자)
    - 익명 옵션 지원
    - 주제별 분류
    """
    try:
        # AI 요약 생성 (MVP: 단순 자르기)
        ai_summary = body.body[:100] + ("..." if len(body.body) > 100 else "")

        # TODO: 실제로는 LLM으로 요약 생성
        # ai_summary = await generate_summary(body.body)

        # 포스트 생성
        try:
            result = (
                supabase.table("qna_posts")
                .insert(
                    {
                        "author_id": current_user["id"],
                        "topic": body.topic,
                        "title": body.title,
                        "body": body.body,
                        "is_anon": body.is_anon,
                        "ai_summary": ai_summary,
                    }
                )
                .execute()
            )
        except Exception as e:
            return {
                "ok": False,
                "error": {
                    "code": "QNA_CREATE_FAILED",
                    "message": f"질문을 작성할 수 없어요: {str(e)}",
                },
            }

        # Envelope 응답
        return {
            "ok": True,
            "data": CreateQnaResponse(post_id=result.data[0]["id"]).model_dump(),
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "QNA_CREATE_FAILED",
                "message": f"질문을 작성할 수 없어요: {str(e)}",
            },
        }
