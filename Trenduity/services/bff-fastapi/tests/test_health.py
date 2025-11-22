"""
헬스 체크 및 기본 API 테스트
"""
import pytest
from httpx import AsyncClient

class TestHealthAPI:
    """헬스 체크 API 테스트"""
    
    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        """헬스 체크 성공"""
        response = await client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "env" in data
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self, client: AsyncClient):
        """루트 경로 접근"""
        response = await client.get("/")
        # 루트 경로는 200 OK 반환 (welcome 메시지 또는 docs 리다이렉트)
        assert response.status_code in [200, 307, 308]
    
    @pytest.mark.asyncio
    async def test_docs_available(self, client: AsyncClient):
        """API 문서 접근 가능"""
        response = await client.get("/docs")
        assert response.status_code == 200
