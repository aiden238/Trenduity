from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    환경변수 설정
    """
    
    # App
    ENV: str = "development"
    DEBUG: bool = True
    API_VERSION: str = "v1"
    
    # Supabase
    supabase_url: str
    supabase_service_role_key: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:19006"]
    
    # LLM (향후)
    # OPENAI_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
