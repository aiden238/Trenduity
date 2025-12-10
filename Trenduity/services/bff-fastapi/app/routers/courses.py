"""
강좌(Courses) API 라우터
EBSI 스타일 학습 시스템
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

from app.core.deps import get_db_connection

router = APIRouter(prefix="/v1/courses", tags=["Courses"])


# ============================================================
# DTOs (Pydantic Models)
# ============================================================

class PanelData(BaseModel):
    """강의 패널 데이터"""
    type: str = Field(..., description="패널 타입 (image, step, tip, etc.)")
    content: Optional[str] = Field(None, description="패널 내용")
    number: Optional[int] = Field(None, description="step 번호")
    items: Optional[List[str]] = Field(None, description="리스트 아이템")
    title: Optional[str] = Field(None, description="패널 제목")

class LectureData(BaseModel):
    """강의 정보"""
    id: int
    lecture_number: int = Field(..., description="강의 번호 (1강, 2강...)")
    title: str
    duration: int = Field(..., description="강의 시간 (분)")
    script: str = Field(..., description="TTS 대본")
    panels: List[dict] = Field(default_factory=list, description="강의 패널")
    created_at: datetime

class CourseData(BaseModel):
    """강좌 정보"""
    id: str
    title: str
    thumbnail: str
    description: Optional[str]
    category: str
    total_lectures: int
    created_at: datetime
    updated_at: datetime

class CourseWithLectures(CourseData):
    """강좌 + 강의 목록"""
    lectures: List[LectureData]

class UserCourseProgress(BaseModel):
    """사용자 강좌 진행 상황"""
    course_id: str
    last_watched_lecture: int
    completed_lectures: int
    completed_at: Optional[datetime]
    last_accessed_at: datetime

class EnvelopeResponse(BaseModel):
    """Envelope 패턴 응답"""
    ok: bool
    data: Optional[Any] = None
    error: Optional[dict] = None


# ============================================================
# API Endpoints
# ============================================================

@router.get("/", response_model=EnvelopeResponse)
async def get_courses(
    category: Optional[str] = Query(None, description="카테고리 필터"),
    user_id: Optional[str] = None
):
    """
    강좌 목록 조회
    
    - 모든 강좌 또는 카테고리별 필터링
    - 사용자 진행 상황 포함 (completed_lectures, last_watched_lecture)
    """
    # 개발 모드에서는 user_id가 없으면 기본값 사용
    if not user_id:
        user_id = "demo-user"
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # 강좌 목록 조회
            query = """
                SELECT 
                    c.*,
                    COALESCE(p.completed_lectures, 0) as user_completed_lectures,
                    COALESCE(p.last_watched_lecture, 0) as user_last_watched
                FROM courses c
                LEFT JOIN user_course_progress p ON c.id = p.course_id AND p.user_id = %s
            """
            params = [user_id]
            
            if category:
                query += " WHERE c.category = %s"
                params.append(category)
            
            query += " ORDER BY c.created_at DESC"
            
            cur.execute(query, params)
            rows = cur.fetchall()
            
            courses = []
            for row in rows:
                courses.append({
                    "id": row[0],
                    "title": row[1],
                    "thumbnail": row[2],
                    "description": row[3],
                    "category": row[4],
                    "total_lectures": row[5],
                    "created_at": row[6].isoformat() if row[6] else None,
                    "updated_at": row[7].isoformat() if row[7] else None,
                    "user_completed_lectures": row[8],
                    "user_last_watched": row[9]
                })
            
            return {"ok": True, "data": {"courses": courses}}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "COURSES_FETCH_ERROR",
                    "message": f"강좌 목록을 가져오는 중 오류가 발생했어요: {str(e)}"
                }
            }
        )
    finally:
        conn.close()


@router.get("/{course_id}", response_model=EnvelopeResponse)
async def get_course_detail(
    course_id: str,
    user_id: Optional[str] = None
):
    """
    강좌 상세 정보 조회 (강의 목록 포함)
    
    - 강좌 기본 정보
    - 전체 강의 목록 (1강, 2강, 3강...)
    - 사용자 진행 상황
    """
    if not user_id:
        user_id = "demo-user"
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # 강좌 정보
            cur.execute("""
                SELECT * FROM courses WHERE id = %s
            """, (course_id,))
            course_row = cur.fetchone()
            
            if not course_row:
                raise HTTPException(
                    status_code=404,
                    detail={
                        "ok": False,
                        "error": {
                            "code": "COURSE_NOT_FOUND",
                            "message": "강좌를 찾을 수 없어요"
                        }
                    }
                )
            
            # 강의 목록
            cur.execute("""
                SELECT * FROM lectures 
                WHERE course_id = %s 
                ORDER BY lecture_number ASC
            """, (course_id,))
            lecture_rows = cur.fetchall()
            
            # 사용자 진행 상황
            cur.execute("""
                SELECT * FROM user_course_progress 
                WHERE user_id = %s AND course_id = %s
            """, (user_id, course_id))
            progress_row = cur.fetchone()
            
            course_data = {
                "id": course_row[0],
                "title": course_row[1],
                "thumbnail": course_row[2],
                "description": course_row[3],
                "category": course_row[4],
                "total_lectures": course_row[5],
                "created_at": course_row[6].isoformat() if course_row[6] else None,
                "updated_at": course_row[7].isoformat() if course_row[7] else None,
                "lectures": [
                    {
                        "id": row[0],
                        "lecture_number": row[2],
                        "title": row[3],
                        "duration": row[4],
                        "script": row[5],
                        "panels": row[6] if row[6] else [],
                        "created_at": row[7].isoformat() if row[7] else None
                    }
                    for row in lecture_rows
                ],
                "user_progress": {
                    "last_watched_lecture": progress_row[3] if progress_row else 0,
                    "completed_lectures": progress_row[4] if progress_row else 0,
                    "completed_at": progress_row[5].isoformat() if progress_row and progress_row[5] else None
                } if progress_row else None
            }
            
            return {"ok": True, "data": course_data}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "COURSE_DETAIL_ERROR",
                    "message": f"강좌 상세 정보를 가져오는 중 오류가 발생했어요: {str(e)}"
                }
            }
        )
    finally:
        conn.close()


@router.get("/{course_id}/lectures/{lecture_number}", response_model=EnvelopeResponse)
async def get_lecture(
    course_id: str,
    lecture_number: int,
    user_id: Optional[str] = None
):
    """
    특정 강의 조회
    
    - 강의 스크립트 (TTS용)
    - 패널 데이터 (화면 구성)
    """
    if not user_id:
        user_id = "demo-user"
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM lectures 
                WHERE course_id = %s AND lecture_number = %s
            """, (course_id, lecture_number))
            row = cur.fetchone()
            
            if not row:
                raise HTTPException(
                    status_code=404,
                    detail={
                        "ok": False,
                        "error": {
                            "code": "LECTURE_NOT_FOUND",
                            "message": "강의를 찾을 수 없어요"
                        }
                    }
                )
            
            lecture_data = {
                "id": row[0],
                "course_id": row[1],
                "lecture_number": row[2],
                "title": row[3],
                "duration": row[4],
                "script": row[5],
                "panels": row[6] if row[6] else [],
                "created_at": row[7].isoformat() if row[7] else None
            }
            
            return {"ok": True, "data": lecture_data}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "LECTURE_FETCH_ERROR",
                    "message": f"강의를 가져오는 중 오류가 발생했어요: {str(e)}"
                }
            }
        )
    finally:
        conn.close()


@router.post("/{course_id}/progress", response_model=EnvelopeResponse)
async def update_progress(
    course_id: str,
    lecture_number: int = Query(..., description="완료한 강의 번호"),
    user_id: Optional[str] = None
):
    """
    강의 진행 상황 업데이트
    
    - 마지막으로 본 강의 번호 갱신
    - 완료한 강의 수 증가
    - 전체 강좌 완료 시 completed_at 설정
    """
    if not user_id:
        user_id = "demo-user"
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # 강좌 총 강의 수 확인
            cur.execute("""
                SELECT total_lectures FROM courses WHERE id = %s
            """, (course_id,))
            course_row = cur.fetchone()
            
            if not course_row:
                raise HTTPException(status_code=404, detail={
                    "ok": False,
                    "error": {"code": "COURSE_NOT_FOUND", "message": "강좌를 찾을 수 없어요"}
                })
            
            total_lectures = course_row[0]
            is_completed = (lecture_number >= total_lectures)
            
            # 진행 상황 upsert
            cur.execute("""
                INSERT INTO user_course_progress 
                    (user_id, course_id, last_watched_lecture, completed_lectures, completed_at, last_accessed_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
                ON CONFLICT (user_id, course_id) DO UPDATE SET
                    last_watched_lecture = GREATEST(EXCLUDED.last_watched_lecture, user_course_progress.last_watched_lecture),
                    completed_lectures = GREATEST(EXCLUDED.completed_lectures, user_course_progress.completed_lectures),
                    completed_at = CASE 
                        WHEN EXCLUDED.completed_at IS NOT NULL THEN EXCLUDED.completed_at
                        ELSE user_course_progress.completed_at
                    END,
                    last_accessed_at = NOW()
                RETURNING *
            """, (
                user_id,
                course_id,
                lecture_number,
                lecture_number,
                datetime.now() if is_completed else None
            ))
            
            row = cur.fetchone()
            conn.commit()
            
            progress_data = {
                "user_id": row[1],
                "course_id": row[2],
                "last_watched_lecture": row[3],
                "completed_lectures": row[4],
                "completed_at": row[5].isoformat() if row[5] else None,
                "is_course_completed": is_completed
            }
            
            return {"ok": True, "data": progress_data}
    
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "PROGRESS_UPDATE_ERROR",
                    "message": f"진행 상황을 업데이트하는 중 오류가 발생했어요: {str(e)}"
                }
            }
        )
    finally:
        conn.close()


@router.get("/recommend/today", response_model=EnvelopeResponse)
async def get_today_recommendation(user_id: Optional[str] = None):
    """
    오늘의 학습 추천
    
    - 진행 중인 강좌가 있으면 → "이어서 보기"
    - 없으면 → 새로운 강좌 추천
    """
    if not user_id:
        user_id = "demo-user"
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # 가장 최근에 본 강좌 찾기
            cur.execute("""
                SELECT 
                    p.course_id,
                    p.last_watched_lecture,
                    p.completed_lectures,
                    c.title,
                    c.thumbnail,
                    c.total_lectures
                FROM user_course_progress p
                JOIN courses c ON p.course_id = c.id
                WHERE p.user_id = %s 
                    AND p.completed_at IS NULL
                ORDER BY p.last_accessed_at DESC
                LIMIT 1
            """, (user_id,))
            row = cur.fetchone()
            
            if row:
                # 진행 중인 강좌 있음
                recommendation = {
                    "type": "continue",
                    "course_id": row[0],
                    "next_lecture": row[1] + 1,
                    "title": row[3],
                    "thumbnail": row[4],
                    "progress": f"{row[2]}/{row[5]}강",
                    "message": "이어서 보기"
                }
            else:
                # 새로운 강좌 추천 (최신순)
                cur.execute("""
                    SELECT id, title, thumbnail, total_lectures
                    FROM courses
                    WHERE id NOT IN (
                        SELECT course_id FROM user_course_progress 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    )
                    ORDER BY created_at DESC
                    LIMIT 1
                """, (user_id,))
                row = cur.fetchone()
                
                if row:
                    recommendation = {
                        "type": "new",
                        "course_id": row[0],
                        "next_lecture": 1,
                        "title": row[1],
                        "thumbnail": row[2],
                        "progress": f"0/{row[3]}강",
                        "message": "새로운 강좌 시작하기"
                    }
                else:
                    recommendation = None
            
            return {"ok": True, "data": recommendation}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "RECOMMENDATION_ERROR",
                    "message": f"추천을 가져오는 중 오류가 발생했어요: {str(e)}"
                }
            }
        )
    finally:
        conn.close()
