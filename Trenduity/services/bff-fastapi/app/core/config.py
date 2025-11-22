from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator
from typing import List, Optional, Any
import os


class Settings(BaseSettings):
    """
    환경변수 설정
    
    모든 환경 변수는 .env 파일 또는 시스템 환경 변수에서 로드됩니다.
    필수 변수가 누락된 경우 시작 시 에러를 발생시킵니다.
    """
    
    # ==================== 기본 설정 ====================
    ENV: str = "development"
    DEBUG: bool = True
    API_VERSION: str = "v1"
    PORT: int = 8000
    
    # ==================== Supabase 설정 ====================
    # ⚠️ 필수: SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY는 반드시 설정해야 함
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # ==================== Redis 설정 ====================
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: Optional[str] = None
    REDIS_MAX_CONNECTIONS: int = 10
    
    # ==================== CORS 설정 ====================
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
        "http://localhost:19006"
    ]
    CORS_METHODS: List[str] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    CORS_HEADERS: str = "*"
    
    # ==================== JWT 설정 ====================
    JWT_SECRET: str = "dev-secret-change-in-production"
    JWT_EXPIRATION: int = 3600
    
    # ==================== 외부 API ====================
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    AZURE_OPENAI_ENDPOINT: Optional[str] = None
    AZURE_OPENAI_KEY: Optional[str] = None
    AZURE_OPENAI_DEPLOYMENT: Optional[str] = None
    
    # ==================== 레이트 리미팅 ====================
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 10
    
    # ==================== 로깅 ====================
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "text"
    
    # ==================== 성능 ====================
    SLOW_REQUEST_THRESHOLD_MS: int = 200
    CACHE_TTL_SHORT: int = 60
    CACHE_TTL_MEDIUM: int = 600
    CACHE_TTL_LONG: int = 3600
    
    # ==================== 보안 ====================
    ALLOWED_FILE_EXTENSIONS: str = "jpg,jpeg,png,gif,webp,pdf"
    MAX_FILE_SIZE_MB: int = 10
    
    # ==================== 기능 플래그 ====================
    FEATURE_AI_ENABLED: bool = True
    FEATURE_VOICE_ENABLED: bool = True
    FEATURE_COMMUNITY_ENABLED: bool = True
    
    # ==================== 모니터링 ====================
    SENTRY_DSN: Optional[str] = None
    SENTRY_ENVIRONMENT: str = "development"
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )
    
    @model_validator(mode="before")
    @classmethod
    def parse_cors(cls, data: Any) -> Any:
        if isinstance(data, dict) and "CORS_ORIGINS" in data:
            cors_val = data["CORS_ORIGINS"]
            if isinstance(cors_val, str):
                data["CORS_ORIGINS"] = [origin.strip() for origin in cors_val.split(",")]
        return data


# 설정 인스턴스 생성
settings = Settings()


# ==================== 환경 변수 검증 ====================
def validate_required_env_vars():
    """
    필수 환경 변수가 설정되어 있는지 확인합니다.
    누락된 경우 명확한 에러 메시지를 출력합니다.
    """
    missing_vars = []
    
    # 필수 변수 리스트
    required_vars = {
        "SUPABASE_URL": settings.SUPABASE_URL,
        "SUPABASE_SERVICE_ROLE_KEY": settings.SUPABASE_SERVICE_ROLE_KEY,
    }
    
    # 프로덕션 환경에서 추가 필수 변수
    if settings.ENV == "production":
        required_vars["JWT_SECRET"] = settings.JWT_SECRET
        if settings.JWT_SECRET == "dev-secret-change-in-production":
            missing_vars.append("JWT_SECRET (프로덕션에서는 dev-secret 사용 금지)")
    
    # 누락된 변수 확인
    for var_name, var_value in required_vars.items():
        if not var_value or var_value == "":
            missing_vars.append(var_name)
    
    # 에러 발생
    if missing_vars:
        raise ValueError(
            f"❌ 필수 환경 변수가 설정되지 않았습니다:\n"
            f"   - {', '.join(missing_vars)}\n\n"
            f"💡 해결 방법:\n"
            f"   1. .env.example 파일을 복사하여 .env 파일 생성\n"
            f"   2. .env 파일에 실제 값 입력\n"
            f"   3. BFF 서버 재시작\n\n"
            f"📄 자세한 내용은 docs/ENVIRONMENT.md 참조"
        )


# 앱 시작 시 환경 변수 검증
try:
    validate_required_env_vars()
    print(f"[OK] 환경 변수 검증 완료 (ENV={settings.ENV})")
except ValueError as e:
    print(f"\n{e}\n")
    if settings.ENV == "production":
        raise  # 프로덕션에서는 즉시 종료
    else:
        print("[WARNING] 개발 환경이므로 경고만 표시합니다. 실제 배포 시 반드시 수정하세요.\n")
