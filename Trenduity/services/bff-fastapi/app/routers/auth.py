"""
인증 API 라우터

기능:
- 회원가입 (signup)
- 로그인 (login)
- 로그아웃 (logout)
- 프로필 조회/수정
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timedelta
import logging
import jwt
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Supabase 클라이언트 (service_role 키 사용 - RLS 우회)
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY
)

# JWT 설정
JWT_SECRET = settings.SUPABASE_JWT_SECRET or "your-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 30


# DTO 정의
class SignupRequest(BaseModel):
    """회원가입 요청"""
    email: EmailStr = Field(..., description="이메일")
    password: str = Field(..., min_length=6, description="비밀번호 (최소 6자)")
    name: Optional[str] = Field(None, max_length=100, description="이름 (선택)")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "senior@example.com",
                "password": "password123",
                "name": "홍길동"
            }
        }


class LoginRequest(BaseModel):
    """로그인 요청"""
    email: EmailStr = Field(..., description="이메일")
    password: str = Field(..., description="비밀번호")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "senior@example.com",
                "password": "password123"
            }
        }


class UpdateProfileRequest(BaseModel):
    """프로필 수정 요청"""
    name: Optional[str] = Field(None, max_length=100, description="이름")
    age_group: Optional[str] = Field(None, description="연령대 (50s, 60s, 70s)")
    interests: Optional[list[str]] = Field(None, description="관심사 목록")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "홍길동",
                "age_group": "60s",
                "interests": ["ai_tools", "finance", "health"]
            }
        }


class AuthResponse(BaseModel):
    """인증 응답"""
    token: str = Field(..., description="JWT 토큰")
    user: dict = Field(..., description="사용자 정보")


def create_jwt_token(user_id: str, email: str) -> str:
    """JWT 토큰 생성"""
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user_from_token(token: str) -> dict:
    """JWT 토큰에서 사용자 정보 추출"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="토큰이 만료되었습니다.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")


@router.post("/signup", response_model=dict)
async def signup(body: SignupRequest):
    """
    회원가입
    
    - 이메일/비밀번호로 새 계정 생성
    - Supabase users 테이블에 저장
    - JWT 토큰 반환
    """
    try:
        # 1. 이메일 중복 체크
        existing = supabase.table("users").select("id").eq("email", body.email).execute()
        if existing.data:
            raise HTTPException(
                status_code=400,
                detail={
                    "ok": False,
                    "error": {
                        "code": "EMAIL_ALREADY_EXISTS",
                        "message": "이미 사용 중인 이메일입니다."
                    }
                }
            )
        
        # 2. 사용자 생성 (Supabase Auth 사용)
        auth_response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {
                    "name": body.name or "",
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=500,
                detail={
                    "ok": False,
                    "error": {
                        "code": "SIGNUP_FAILED",
                        "message": "회원가입에 실패했습니다. 다시 시도해 주세요."
                    }
                }
            )
        
        user_id = auth_response.user.id
        
        # 3. users 테이블에 프로필 정보 저장
        user_data = {
            "id": user_id,
            "email": body.email,
            "name": body.name or "",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        supabase.table("users").insert(user_data).execute()
        
        # 4. JWT 토큰 생성
        token = create_jwt_token(user_id, body.email)
        
        # 5. 응답
        return {
            "ok": True,
            "data": {
                "token": token,
                "user": {
                    "id": user_id,
                    "email": body.email,
                    "name": body.name or ""
                }
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"회원가입 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                }
            }
        )


@router.post("/login", response_model=dict)
async def login(body: LoginRequest):
    """
    로그인
    
    - 이메일/비밀번호 확인
    - JWT 토큰 반환
    """
    try:
        # 1. Supabase Auth 로그인
        auth_response = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=401,
                detail={
                    "ok": False,
                    "error": {
                        "code": "INVALID_CREDENTIALS",
                        "message": "이메일 또는 비밀번호가 올바르지 않습니다."
                    }
                }
            )
        
        user_id = auth_response.user.id
        
        # 2. users 테이블에서 프로필 정보 조회
        user_result = supabase.table("users").select("*").eq("id", user_id).single().execute()
        user_data = user_result.data
        
        # 3. JWT 토큰 생성
        token = create_jwt_token(user_id, body.email)
        
        # 4. 응답
        return {
            "ok": True,
            "data": {
                "token": token,
                "user": {
                    "id": user_id,
                    "email": user_data.get("email"),
                    "name": user_data.get("name", ""),
                    "age_group": user_data.get("age_group"),
                    "interests": user_data.get("interests", [])
                }
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"로그인 실패: {e}")
        raise HTTPException(
            status_code=401,
            detail={
                "ok": False,
                "error": {
                    "code": "LOGIN_FAILED",
                    "message": "로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요."
                }
            }
        )


@router.get("/me", response_model=dict)
async def get_profile(user_id: str = Depends(lambda: "demo-user-id")):
    """
    현재 로그인한 사용자 프로필 조회
    
    TODO: JWT 토큰 검증 미들웨어 추가 필요
    """
    try:
        result = supabase.table("users").select("*").eq("id", user_id).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=404,
                detail={
                    "ok": False,
                    "error": {
                        "code": "USER_NOT_FOUND",
                        "message": "사용자를 찾을 수 없습니다."
                    }
                }
            )
        
        return {
            "ok": True,
            "data": {
                "user": result.data
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로필 조회 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "서버 오류가 발생했습니다."
                }
            }
        )


@router.patch("/me", response_model=dict)
async def update_profile(
    body: UpdateProfileRequest,
    user_id: str = Depends(lambda: "demo-user-id")
):
    """
    프로필 수정
    
    - 이름, 연령대, 관심사 업데이트
    """
    try:
        # 업데이트할 필드만 추출
        update_data = {}
        if body.name is not None:
            update_data["name"] = body.name
        if body.age_group is not None:
            update_data["age_group"] = body.age_group
        if body.interests is not None:
            update_data["interests"] = body.interests
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Supabase 업데이트
        result = supabase.table("users").update(update_data).eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=404,
                detail={
                    "ok": False,
                    "error": {
                        "code": "USER_NOT_FOUND",
                        "message": "사용자를 찾을 수 없습니다."
                    }
                }
            )
        
        return {
            "ok": True,
            "data": {
                "user": result.data[0]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로필 수정 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "서버 오류가 발생했습니다."
                }
            }
        )
