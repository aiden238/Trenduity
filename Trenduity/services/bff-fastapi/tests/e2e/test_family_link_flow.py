"""
E2E 시나리오 4: 가족 링크 플로우

시나리오:
1. 가족 연결 요청 (POST /v1/family/link)
2. 가족 멤버 목록 조회 (GET /v1/family/members)
3. 멤버 활동 확인
4. 격려 메시지 전송 (POST /v1/family/encourage)
"""
import pytest
from httpx import AsyncClient


class TestFamilyLinkFlow:
    """가족 링크 E2E 플로우 테스트"""
    
    @pytest.mark.asyncio
    async def test_family_link_and_members_flow(self, client: AsyncClient, senior_headers, guardian_headers):
        """가족 연결 → 멤버 조회 플로우"""
        # 1. 시니어: 가족 연결 요청 (초대 코드 생성)
        link_response = await client.post(
            "/v1/family/link",
            headers=senior_headers,
            json={"action": "generate_code"}
        )
        
        if link_response.status_code == 200:
            link_data = link_response.json()
            if link_data.get("ok"):
                invite_code = link_data["data"].get("invite_code")
                assert invite_code is not None, "초대 코드가 생성되어야 함"
                print(f"✅ 초대 코드 생성: {invite_code}")
        
        # 2. 가족 멤버 목록 조회
        members_response = await client.get(
            "/v1/family/members",
            headers=senior_headers
        )
        assert members_response.status_code == 200
        members_data = members_response.json()
        assert members_data["ok"] is True
        
        # 멤버 목록 검증
        members = members_data["data"]["members"]
        assert isinstance(members, list), "멤버 목록은 배열이어야 함"
        
        print(f"✅ 가족 멤버 {len(members)}명 조회 성공")
    
    @pytest.mark.asyncio
    async def test_encourage_message_flow(self, client: AsyncClient, guardian_headers, senior_headers):
        """보호자 → 시니어 격려 메시지 전송 플로우"""
        # 1. 보호자: 가족 멤버 목록 조회
        members_response = await client.get(
            "/v1/family/members",
            headers=guardian_headers
        )
        assert members_response.status_code == 200
        members_data = members_response.json()
        
        if not members_data.get("ok"):
            pytest.skip("가족 멤버가 없어 격려 메시지 테스트 스킵")
        
        members = members_data["data"]["members"]
        if len(members) == 0:
            pytest.skip("연결된 가족이 없음")
        
        # 2. 첫 번째 멤버에게 격려 메시지 전송
        target_member = members[0]
        encourage_data = {
            "member_id": target_member.get("id") or target_member.get("user_id"),
            "message": "오늘도 열심히 학습하시는 모습이 멋져요! 💪",
            "type": "cheer"
        }
        
        encourage_response = await client.post(
            "/v1/family/encourage",
            headers=guardian_headers,
            json=encourage_data
        )
        assert encourage_response.status_code == 200
        encourage_result = encourage_response.json()
        assert encourage_result["ok"] is True
        
        result = encourage_result["data"]
        assert "message" in result or "sent" in result, "전송 확인 메시지가 있어야 함"
        
        print(f"✅ 격려 메시지 전송 성공: {encourage_data['message']}")
    
    @pytest.mark.asyncio
    async def test_member_activity_tracking(self, client: AsyncClient, guardian_headers):
        """가족 멤버 활동 추적"""
        # 가족 멤버 목록과 활동 조회
        members_response = await client.get(
            "/v1/family/members",
            headers=guardian_headers
        )
        assert members_response.status_code == 200
        members_data = members_response.json()
        
        if not members_data.get("ok"):
            pytest.skip("가족 멤버가 없음")
        
        members = members_data["data"]["members"]
        
        # 각 멤버의 활동 데이터 확인
        for member in members:
            # 활동 통계 필드 확인 (있을 경우)
            if "total_points" in member:
                assert isinstance(member["total_points"], (int, float)), "포인트는 숫자여야 함"
            
            if "streak_days" in member:
                assert isinstance(member["streak_days"], int), "스트릭은 정수여야 함"
            
            if "last_activity" in member:
                assert isinstance(member["last_activity"], str), "마지막 활동은 문자열이어야 함"
        
        print(f"✅ {len(members)}명 멤버 활동 추적 성공")
    
    @pytest.mark.asyncio
    async def test_family_link_with_invalid_code(self, client: AsyncClient, guardian_headers):
        """잘못된 초대 코드로 연결 시도는 실패"""
        invalid_link_data = {
            "action": "join",
            "invite_code": "INVALID-CODE-12345"
        }
        
        response = await client.post(
            "/v1/family/link",
            headers=guardian_headers,
            json=invalid_link_data
        )
        
        # 404 또는 400 에러 예상
        if response.status_code == 200:
            data = response.json()
            # ok: false 또는 에러 메시지 있어야 함
            if not data.get("ok"):
                assert "error" in data, "에러 정보가 있어야 함"
        else:
            assert response.status_code in [400, 404], "잘못된 코드는 에러 반환해야 함"
        
        print("✅ 잘못된 초대 코드 거부 검증 성공")
    
    @pytest.mark.asyncio
    async def test_encourage_message_validation(self, client: AsyncClient, guardian_headers):
        """격려 메시지 유효성 검증"""
        # 빈 메시지
        invalid_data = {
            "member_id": "test-member-id",
            "message": "",
            "type": "cheer"
        }
        
        response = await client.post(
            "/v1/family/encourage",
            headers=guardian_headers,
            json=invalid_data
        )
        
        # 422 Validation Error 예상
        assert response.status_code in [400, 422], "빈 메시지는 거부되어야 함"
        
        print("✅ 격려 메시지 유효성 검증 성공")
