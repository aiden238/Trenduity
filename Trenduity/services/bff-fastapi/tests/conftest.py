"""
Pytest 공통 설정 및 픽스처
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient
from app.main import app
import os

# 테스트 환경 변수 설정
os.environ["ENV"] = "development"
os.environ["SUPABASE_URL"] = "https://onnthandrqutdmvwnilf.supabase.co"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubnRoYW5kcnF1dGRtdnduaWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQwMTgwMSwiZXhwIjoyMDc4OTc3ODAxfQ.-nw0DaxYu_MIRDsn3irLKUIfksTN-A1hoSP_3KOQZ6U"

# 테스트용 토큰
TEST_SENIOR_TOKEN = "test-jwt-token-for-senior-user"
TEST_GUARDIAN_TOKEN = "test-jwt-token-for-guardian-user"

@pytest_asyncio.fixture
async def client():
    """비동기 HTTP 클라이언트"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def senior_headers():
    """시니어 사용자 인증 헤더"""
    return {
        "Authorization": f"Bearer {TEST_SENIOR_TOKEN}",
        "Content-Type": "application/json"
    }

@pytest.fixture
def guardian_headers():
    """보호자 사용자 인증 헤더"""
    return {
        "Authorization": f"Bearer {TEST_GUARDIAN_TOKEN}",
        "Content-Type": "application/json"
    }

@pytest.fixture
def test_card_id():
    """테스트용 카드 ID (실제 DB의 첫 번째 카드)"""
    return "ee4148a8-6f5b-497f-8f44-40c537e19220"
