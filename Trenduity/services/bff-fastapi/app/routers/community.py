from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Literal
from datetime import datetime
import logging

from app.core.deps import get_current_user, get_supabase
from app.utils.error_translator import translate_db_error, is_db_error

router = APIRouter()

# Pydantic Models


class CreateQnaRequest(BaseModel):
    """Q&A 포스트 생성 요청"""

    title: str = Field(..., min_length=5, max_length=200)
    body: str = Field(..., min_length=10, max_length=2000)
    topic: Literal["ai_tools", "digital_safety", "health", "general"] = "general"
    is_anon: bool = False


class QnaPost(BaseModel):
    """Q&A 포스트"""

    id: str
    author_id: str
    author_name: Optional[str] = None
    topic: str
    title: str
    body: str
    is_anon: bool
    ai_summary: Optional[str] = None
    created_at: datetime
    reaction_count: int = 0


class QnaPostsResponse(BaseModel):
    """Q&A 목록 응답"""

    posts: List[QnaPost]
    total: int


class CreateQnaResponse(BaseModel):
    """Q&A 생성 응답"""

    post_id: str
    message: str


class AddReactionRequest(BaseModel):
    """리액션 추가 요청"""

    target_type: Literal["qna_post", "card", "insight"]
    target_id: str
    kind: Literal["cheer", "useful", "like"] = "like"


class AddReactionResponse(BaseModel):
    """리액션 추가 응답"""

    added: bool
    total_reactions: int


class CreateAnswerRequest(BaseModel):
    """답변 작성 요청"""

    body: str = Field(..., min_length=10, max_length=2000)
    is_anon: bool = False


class Answer(BaseModel):
    """답변"""

    id: str
    post_id: str
    author_id: Optional[str]
    author_name: Optional[str]
    body: str
    is_anon: bool
    created_at: datetime


class AnswersResponse(BaseModel):
    """답변 목록 응답"""

    answers: List[Answer]
    total: int


@router.get("/qna")
async def get_qna_list(
    topic: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    Q&A 목록 조회

    - topic 필터링 (optional)
    - 최신순 정렬
    - 페이지네이션
    - 익명 게시물은 author_name 숨김
    """
    try:
        # 기본 쿼리 - LEFT JOIN으로 author 정보 한 번에 조회 (N+1 방지)
        query = supabase.table("qna_posts").select(
            "*, users!inner(name)", count="exact"
        )

        # topic 필터
        if topic:
            query = query.eq("topic", topic)

        # 정렬 및 페이지네이션
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)

        try:
            result = query.execute()
        except Exception:
            # 테이블이 없으면 빈 목록 반환
            return {
                "ok": True,
                "data": QnaPostsResponse(posts=[], total=0).model_dump(),
            }

        # 포스트별 리액션 수 일괄 조회 (N+1 방지)
        post_ids = [row["id"] for row in result.data or []]
        reaction_counts = {}
        if post_ids:
            try:
                # 모든 포스트의 리액션을 한 번에 조회
                reactions_result = (
                    supabase.table("reactions")
                    .select("target_id")
                    .eq("target_type", "qna_post")
                    .in_("target_id", post_ids)
                    .execute()
                )
                
                # target_id별 카운트
                for reaction in reactions_result.data or []:
                    target_id = reaction["target_id"]
                    reaction_counts[target_id] = reaction_counts.get(target_id, 0) + 1
            except Exception:
                pass

        # author_name 추출 및 포스트 구성
        posts = []
        for row in result.data or []:
            # JOIN된 author 정보 사용 (is_anon이 아닐 때만)
            author_name = None
            if not row["is_anon"] and row.get("users"):
                author_name = row["users"].get("name")

            # 미리 조회한 리액션 수 사용
            reaction_count = reaction_counts.get(row["id"], 0)

            posts.append(
                QnaPost(
                    id=row["id"],
                    author_id=row["author_id"],
                    author_name=author_name,
                    topic=row["topic"],
                    title=row["title"],
                    body=row["body"],
                    is_anon=row["is_anon"],
                    ai_summary=row.get("ai_summary"),
                    created_at=row["created_at"],
                    reaction_count=reaction_count,
                )
            )

        # Envelope 응답
        return {
            "ok": True,
            "data": QnaPostsResponse(
                posts=posts, total=result.count or 0
            ).model_dump(),
        }

    except Exception as e:
        # DB 에러인 경우 한국어 번역 적용
        if is_db_error(e):
            error_info = translate_db_error(e)
            return {
                "ok": False,
                "error": error_info
            }
        
        # 일반 에러
        return {
            "ok": False,
            "error": {
                "code": "QNA_LIST_ERROR",
                "message": "Q&A 목록을 불러올 수 없어요. 새로고침 해보세요.",
            },
        }


@router.post("/qna")
async def create_qna_post(
    body: CreateQnaRequest,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    Q&A 포스트 작성

    - 제목/내용 길이 검증
    - 간단한 AI 요약 생성 (첫 100자)
    - qna_posts 테이블 INSERT
    """
    try:
        # 간단한 AI 요약 (첫 100자 + "...")
        ai_summary = (
            body.body[:100] + "..." if len(body.body) > 100 else body.body
        )

        # Insert
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

            if not result.data:
                raise Exception("Insert failed")

            post_id = result.data[0]["id"]

            # Envelope 응답
            return {
                "ok": True,
                "data": CreateQnaResponse(
                    post_id=post_id, message="질문을 올렸어요! 곧 답변이 달릴 거예요."
                ).model_dump(),
            }

        except Exception as e:
            # DB 에러인 경우 한국어 번역 적용
            if is_db_error(e):
                error_info = translate_db_error(e)
                return {
                    "ok": False,
                    "error": error_info
                }
            
            return {
                "ok": False,
                "error": {
                    "code": "QNA_CREATE_ERROR",
                    "message": "질문을 올릴 수 없어요. 잠시 후 다시 시도해 주세요.",
                },
            }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # DB 에러인 경우 한국어 번역 적용
        if is_db_error(e):
            error_info = translate_db_error(e)
            return {
                "ok": False,
                "error": error_info
            }
        
        return {
            "ok": False,
            "error": {
                "code": "QNA_CREATE_ERROR",
                "message": "질문을 올릴 수 없어요. 잠시 후 다시 시도해 주세요.",
            },
        }


@router.get("/qna/{post_id}/answers")
async def get_answers(
    post_id: str,
    limit: int = 20,
    offset: int = 0,
    supabase=Depends(get_supabase),
):
    """
    특정 Q&A 포스트의 답변 목록 조회

    - 최신순 정렬
    - 페이지네이션
    - 익명 답변은 author_name 숨김
    """
    try:
        # 답변 조회 - LEFT JOIN으로 profiles 한 번에 조회 (N+1 방지)
        query = (
            supabase.table("qna_answers")
            .select("*, profiles(display_name)", count="exact")
            .eq("post_id", post_id)
            .order("created_at", desc=False)  # 오래된 답변이 위로
            .range(offset, offset + limit - 1)
        )

        try:
            result = query.execute()
        except Exception:
            # 테이블이 없으면 빈 목록 반환
            return {
                "ok": True,
                "data": AnswersResponse(answers=[], total=0).model_dump(),
            }

        # JOIN된 author 정보 사용 (익명이 아닌 경우만)
        answers = []
        for row in result.data or []:
            author_name = None
            if not row["is_anon"] and row["author_id"] and row.get("profiles"):
                author_name = row["profiles"].get("display_name")

            answers.append(
                Answer(
                    id=row["id"],
                    post_id=row["post_id"],
                    author_id=row["author_id"],
                    author_name=author_name,
                    body=row["body"],
                    is_anon=row["is_anon"],
                    created_at=row["created_at"],
                )
            )

        # Envelope 응답
        return {
            "ok": True,
            "data": AnswersResponse(
                answers=answers, total=result.count or 0
            ).model_dump(),
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "ANSWERS_FETCH_FAILED",
                "message": f"답변 목록을 불러올 수 없어요: {str(e)}",
            },
        }


@router.post("/qna/{post_id}/answers")
async def create_answer(
    post_id: str,
    body: CreateAnswerRequest,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    Q&A 포스트에 답변 작성

    - 내용 길이 검증
    - qna_answers 테이블 INSERT
    """
    try:
        # 포스트 존재 확인
        try:
            post_check = (
                supabase.table("qna_posts")
                .select("id")
                .eq("id", post_id)
                .single()
                .execute()
            )
            if not post_check.data:
                return {
                    "ok": False,
                    "error": {
                        "code": "POST_NOT_FOUND",
                        "message": "질문을 찾을 수 없어요.",
                    },
                }
        except Exception as e:
            return {
                "ok": False,
                "error": {
                    "code": "POST_NOT_FOUND",
                    "message": f"질문을 찾을 수 없어요: {str(e)}",
                },
            }

        # 답변 INSERT
        try:
            result = (
                supabase.table("qna_answers")
                .insert(
                    {
                        "post_id": post_id,
                        "author_id": current_user["id"],
                        "body": body.body,
                        "is_anon": body.is_anon,
                    }
                )
                .execute()
            )

            if not result.data:
                raise Exception("Insert failed")

            answer_id = result.data[0]["id"]

            # Envelope 응답
            return {
                "ok": True,
                "data": {
                    "answer_id": answer_id,
                    "message": "답변을 올렸어요! 감사합니다.",
                },
            }

        except Exception as e:
            return {
                "ok": False,
                "error": {
                    "code": "ANSWER_CREATE_FAILED",
                    "message": f"답변을 올릴 수 없어요: {str(e)}",
                },
            }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "ANSWER_CREATE_FAILED",
                "message": f"답변을 올릴 수 없어요: {str(e)}",
            },
        }


@router.delete("/reactions/{reaction_id}")
async def delete_reaction(
    reaction_id: str,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    리액션 삭제

    - reactions 테이블에서 reaction_id로 삭제
    - 본인의 리액션만 삭제 가능
    """
    try:
        # 리액션 소유권 확인
        try:
            reaction_check = (
                supabase.table("reactions")
                .select("id, user_id")
                .eq("id", reaction_id)
                .single()
                .execute()
            )
            
            if not reaction_check.data:
                return {
                    "ok": False,
                    "error": {
                        "code": "REACTION_NOT_FOUND",
                        "message": "리액션을 찾을 수 없어요.",
                    },
                }
            
            # 본인의 리액션인지 확인
            if reaction_check.data["user_id"] != current_user["id"]:
                return {
                    "ok": False,
                    "error": {
                        "code": "FORBIDDEN",
                        "message": "다른 사람의 리액션은 삭제할 수 없어요.",
                    },
                }
        
        except Exception as e:
            return {
                "ok": False,
                "error": {
                    "code": "REACTION_CHECK_FAILED",
                    "message": f"리액션 확인 중 오류가 발생했어요: {str(e)}",
                },
            }
        
        # 리액션 삭제
        try:
            supabase.table("reactions").delete().eq("id", reaction_id).execute()
            
            return {
                "ok": True,
                "data": {
                    "deleted": True,
                    "message": "리액션을 취소했어요.",
                },
            }
        
        except Exception as e:
            return {
                "ok": False,
                "error": {
                    "code": "REACTION_DELETE_FAILED",
                    "message": f"리액션을 삭제할 수 없어요: {str(e)}",
                },
            }
    
    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "REACTION_DELETE_FAILED",
                "message": f"리액션을 삭제할 수 없어요: {str(e)}",
            },
        }


@router.post("/reactions")
async def add_reaction(
    body: AddReactionRequest,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase),
):
    """
    리액션 추가/제거 (토글)

    - reactions 테이블에 upsert
    - 이미 있으면 삭제 (토글)
    - 없으면 추가
    """
    try:
        # 기존 리액션 확인
        try:
            existing = (
                supabase.table("reactions")
                .select("id")
                .eq("user_id", current_user["id"])
                .eq("target_type", body.target_type)
                .eq("target_id", body.target_id)
                .eq("kind", body.kind)
                .execute()
            )

            if existing.data:
                # 이미 있으면 삭제 (토글)
                supabase.table("reactions").delete().eq(
                    "id", existing.data[0]["id"]
                ).execute()
                added = False
            else:
                # 없으면 추가
                supabase.table("reactions").insert(
                    {
                        "user_id": current_user["id"],
                        "target_type": body.target_type,
                        "target_id": body.target_id,
                        "kind": body.kind,
                    }
                ).execute()
                added = True

        except Exception as e:
            # 테이블이 없으면 에러
            return {
                "ok": False,
                "error": {
                    "code": "REACTION_FAILED",
                    "message": f"리액션을 추가할 수 없어요: {str(e)}",
                },
            }

        # 전체 리액션 수 조회
        total_reactions = 0
        try:
            count_result = (
                supabase.table("reactions")
                .select("id", count="exact")
                .eq("target_type", body.target_type)
                .eq("target_id", body.target_id)
                .execute()
            )
            total_reactions = count_result.count or 0
        except Exception:
            pass

        # Envelope 응답
        return {
            "ok": True,
            "data": AddReactionResponse(
                added=added, total_reactions=total_reactions
            ).model_dump(),
        }

    except Exception as e:
        return {
            "ok": False,
            "error": {
                "code": "REACTION_FAILED",
                "message": f"리액션을 추가할 수 없어요: {str(e)}",
            },
        }
