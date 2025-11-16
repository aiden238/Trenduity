from fastapi import APIRouter
from typing import Dict, List

router = APIRouter()


@router.get("/qna")
async def get_qna_list(subject: str = "폰", limit: int = 20) -> Dict:
    """
    Q&A 목록 조회
    
    TODO(IMPLEMENT):
    - Supabase에서 qna_posts 조회
    - is_deleted = false 필터
    - 페이지네이션
    """
    return {
        "status": "TODO",
        "message": f"Get Q&A list for subject={subject} not implemented",
        "data": [],
    }


@router.post("/qna")
async def create_qna_post(title: str, body: str, subject: str, is_anon: bool) -> Dict:
    """
    Q&A 작성
    
    TODO(IMPLEMENT):
    - 토큰 검증
    - 내용 검증 (금칙어 필터, 길이 제한)
    - AI 요약 생성 (룰 기반)
    - qna_posts 테이블 INSERT
    - audit_logs 기록
    """
    return {
        "status": "TODO",
        "message": "Create Q&A post not implemented",
        "post_id": "",
    }


@router.post("/reactions")
async def add_reaction(target_type: str, target_id: str, reaction_type: str) -> Dict:
    """
    반응 추가 (범용)
    
    TODO(IMPLEMENT):
    - 토큰 검증
    - reactions 테이블 upsert
    - 중복 반응 방지
    """
    return {
        "status": "TODO",
        "message": f"Add reaction not implemented",
    }
