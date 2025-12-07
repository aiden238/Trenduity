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
from supabase import Client
from app.core.config import settings
from app.core.deps import get_supabase, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# JWT 설정 (BFF 자체 JWT 토큰 생성용)
JWT_SECRET = settings.JWT_SECRET
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 30


# DTO 정의
class SignupRequest(BaseModel):
    """회원가입 요청"""
    email: EmailStr = Field(..., description="이메일")
    password: str = Field(..., min_length=6, description="비밀번호 (최소 6자)")
    name: Optional[str] = Field(None, max_length=100, description="이름 (선택)")
    phone: Optional[str] = Field(None, min_length=10, max_length=11, pattern=r"^\d{10,11}$", description="전화번호 (10-11자리 숫자, 선택)")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "senior@example.com",
                "password": "password123",
                "name": "홍길동",
                "phone": "01012345678"
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


class SocialLoginRequest(BaseModel):
    """소셜 로그인 요청"""
    provider: str = Field(..., description="소셜 로그인 제공자 (google, kakao, naver)")
    access_token: str = Field(..., description="OAuth access token")
    refresh_token: Optional[str] = Field(None, description="OAuth refresh token")

    class Config:
        json_schema_extra = {
            "example": {
                "provider": "google",
                "access_token": "ya29.xxx...",
                "refresh_token": "1//xxx..."
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
async def signup(body: SignupRequest, supabase: Client = Depends(get_supabase)):
    """
    회원가입
    
    - 이메일/비밀번호로 새 계정 생성
    - Supabase users 테이블에 저장
    - JWT 토큰 반환
    """
    if not supabase:
        raise HTTPException(status_code=503, detail={"ok": False, "error": {"message": "서비스를 사용할 수 없습니다."}})
    try:
        # 1. 이메일 중복 체크
        existing = supabase.table("profiles").select("id").eq("email", body.email).execute()
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
        logger.info(f"Supabase Auth 사용자 생성 성공: {user_id}")
        
        # 3. profiles 테이블에 프로필 정보 저장 (upsert로 중복 방지)
        # 참고: phone 필드는 profiles 테이블 스키마에 없음
        user_data = {
            "id": user_id,
            "email": body.email,
            "display_name": body.name or "",
            "updated_at": datetime.utcnow().isoformat()
        }
        
        logger.info(f"profiles 테이블에 upsert 시도: {user_data}")
        # upsert: 이미 존재하면 업데이트, 없으면 삽입
        supabase.table("profiles").upsert(user_data).execute()
        logger.info(f"profiles 테이블 upsert 성공")
        
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
        import traceback
        error_detail = traceback.format_exc()
        logger.error(f"회원가입 실패: {e}\n상세: {error_detail}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": f"서버 오류가 발생했습니다: {str(e)}"
                }
            }
        )


@router.post("/social", response_model=dict)
async def social_login(body: SocialLoginRequest, supabase: Client = Depends(get_supabase)):
    """
    소셜 로그인 (카카오/네이버/구글)
    
    - OAuth access_token을 받아 Supabase 사용자 정보 조회/생성
    - 기존 사용자면 로그인, 신규 사용자면 자동 회원가입
    - JWT 토큰 반환
    """
    if not supabase:
        raise HTTPException(status_code=503, detail={"ok": False, "error": {"message": "서비스를 사용할 수 없습니다."}})
    
    try:
        logger.info(f"소셜 로그인 시도: provider={body.provider}")
        
        # Supabase에서 access_token으로 사용자 정보 조회
        # 이미 Supabase OAuth로 인증된 토큰이므로 get_user로 검증
        user_response = supabase.auth.get_user(body.access_token)
        
        if not user_response or not user_response.user:
            logger.error("소셜 로그인: 사용자 정보를 가져올 수 없음")
            raise HTTPException(
                status_code=401,
                detail={
                    "ok": False,
                    "error": {
                        "code": "INVALID_TOKEN",
                        "message": "소셜 로그인 인증에 실패했습니다. 다시 시도해 주세요."
                    }
                }
            )
        
        supabase_user = user_response.user
        user_id = supabase_user.id
        email = supabase_user.email or ""
        user_metadata = supabase_user.user_metadata or {}
        
        # 사용자 이름 추출 (provider별로 다를 수 있음)
        name = user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]
        avatar_url = user_metadata.get("avatar_url") or user_metadata.get("picture")
        
        logger.info(f"소셜 로그인 사용자: id={user_id}, email={email}, name={name}")
        
        # profiles 테이블에서 기존 프로필 확인
        existing_profile = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        is_new_user = False
        
        if not existing_profile.data:
            # 신규 사용자 - 프로필 생성
            is_new_user = True
            profile_data = {
                "id": user_id,
                "email": email,
                "display_name": name,
                "avatar_url": avatar_url,
                "auth_provider": body.provider,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            try:
                supabase.table("profiles").insert(profile_data).execute()
                logger.info(f"신규 소셜 사용자 프로필 생성: {user_id}")
            except Exception as insert_err:
                logger.warning(f"프로필 생성 실패 (이미 존재할 수 있음): {insert_err}")
                # 이미 존재하면 무시
        else:
            # 기존 사용자 - 마지막 로그인 시간 업데이트
            try:
                supabase.table("profiles").update({
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("id", user_id).execute()
            except Exception as update_err:
                logger.warning(f"프로필 업데이트 실패: {update_err}")
        
        # JWT 토큰 생성
        token = create_jwt_token(user_id, email)
        
        # 프로필 정보 조회
        profile_result = supabase.table("profiles").select("*").eq("id", user_id).execute()
        profile_data = profile_result.data[0] if profile_result.data else {}
        
        return {
            "ok": True,
            "data": {
                "token": token,
                "user": {
                    "id": user_id,
                    "email": email,
                    "name": profile_data.get("display_name") or name,
                    "age_group": profile_data.get("age_group"),
                    "interests": profile_data.get("interests", []),
                    "avatar_url": profile_data.get("avatar_url") or avatar_url
                },
                "is_new_user": is_new_user
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"소셜 로그인 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "SOCIAL_LOGIN_FAILED",
                    "message": "소셜 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요."
                }
            }
        )


@router.post("/login", response_model=dict)
async def login(body: LoginRequest, supabase: Client = Depends(get_supabase)):
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
        
        # 2. profiles 테이블에서 프로필 정보 조회
        user_result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
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
async def get_profile(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    현재 로그인한 사용자 프로필 조회
    
    JWT 토큰 검증된 사용자 ID 사용
    """
    if not supabase:
        raise HTTPException(status_code=503, detail={"ok": False, "error": {"message": "서비스를 사용할 수 없습니다."}})
    user_id = current_user["id"]
    try:
        result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        
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
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    프로필 수정
    
    - 이름, 연령대, 관심사 업데이트
    - JWT 토큰 검증된 사용자 ID 사용
    """
    if not supabase:
        raise HTTPException(status_code=503, detail={"ok": False, "error": {"message": "서비스를 사용할 수 없습니다."}})
    user_id = current_user["id"]
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
        result = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
        
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
