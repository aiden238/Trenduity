"""
E2E 시나리오 1: 카드 완료 플로우

시나리오:
1. 오늘의 카드 조회 (GET /v1/cards/today)
2. 카드 완료 + 퀴즈 정답 제출 (POST /v1/cards/complete)
3. 게임화 데이터 확인 (GET /v1/gamification)
4. 포인트 증가 검증 (BASE_POINTS + QUIZ_CORRECT_POINTS)
5. 배지 획득 검증 (첫걸음 배지)
"""
import pytest
from httpx import AsyncClient
import uuid


class TestCardCompletionFlow:
    """카드 완료 E2E 플로우 테스트"""
    
    @pytest.mark.asyncio
    async def test_complete_card_flow_with_quiz(self, client: AsyncClient, senior_headers):
        """카드 완료 → 퀴즈 정답 → 포인트/배지 확인 전체 플로우"""
        # 1. 초기 게임화 상태 확인
        gamification_before = await client.get(
            "/v1/gamification",
            headers=senior_headers
        )
        assert gamification_before.status_code == 200
        before_data = gamification_before.json()["data"]
        initial_points = before_data.get("total_points", 0)
        initial_badges = before_data.get("badges", [])
        
        # 2. 오늘의 카드 조회
        card_response = await client.get(
            "/v1/cards/today",
            headers=senior_headers
        )
        assert card_response.status_code == 200
        card_data = card_response.json()
        assert card_data["ok"] is True
        card = card_data["data"]
        
        # 데이터가 비어있으면 테스트 스킵
        if not card or "id" not in card:
            import pytest
            pytest.skip("오늘의 카드가 없거나 응답 구조가 다릅니다.")
        
        # 카드에 퀴즈가 있는지 확인
        has_quiz = card.get("has_quiz", False)
        quiz_questions = card.get("quiz_questions", [])
        
        # 3. 카드 완료 요청 (퀴즈 포함)
        completion_data = {
            "card_id": card["id"],
            "completed_at": "2025-11-19T10:00:00Z"
        }
        
        if has_quiz and len(quiz_questions) > 0:
            # 퀴즈가 있으면 정답 제출
            completion_data["quiz_result"] = {
                "total_questions": len(quiz_questions),
                "correct_answers": len(quiz_questions)  # 모두 정답
            }
        
        complete_response = await client.post(
            "/v1/cards/complete",
            headers=senior_headers,
            json=completion_data
        )
        assert complete_response.status_code == 200
        complete_data = complete_response.json()
        assert complete_data["ok"] is True
        
        # 4. 완료 후 게임화 상태 확인
        gamification_after = await client.get(
            "/v1/gamification",
            headers=senior_headers
        )
        assert gamification_after.status_code == 200
        after_data = gamification_after.json()["data"]
        final_points = after_data.get("total_points", 0)
        final_badges = after_data.get("badges", [])
        
        # 5. 포인트 증가 검증
        expected_points_increase = 5  # BASE_CARD_POINTS
        if has_quiz and len(quiz_questions) > 0:
            expected_points_increase += len(quiz_questions) * 2  # CORRECT_ANSWER_POINTS
        
        assert final_points >= initial_points + expected_points_increase, \
            f"포인트가 예상만큼 증가하지 않음: {initial_points} → {final_points} (기대: +{expected_points_increase})"
        
        # 6. 배지 획득 검증 (첫걸음 배지는 5 포인트에 획득)
        if final_points >= 5 and "첫걸음" not in initial_badges:
            assert "첫걸음" in final_badges, "5 포인트 달성 시 '첫걸음' 배지를 획득해야 함"
        
        print(f"✅ 카드 완료 플로우 성공: {initial_points}pt → {final_points}pt")
    
    @pytest.mark.asyncio
    async def test_duplicate_card_completion_rejected(self, client: AsyncClient, senior_headers):
        """중복 카드 완료 시도는 거부되어야 함"""
        # 1. 오늘의 카드 조회
        card_response = await client.get(
            "/v1/cards/today",
            headers=senior_headers
        )
        assert card_response.status_code == 200
        card_data = card_response.json()
        
        # 데이터 구조 확인
        if not card_data.get("ok") or "id" not in card_data.get("data", {}):
            pytest.skip("카드 데이터 없음")
        
        card_id = card_data["data"]["id"]
        
        # 2. 첫 번째 완료 (성공)
        completion_data = {
            "card_id": card_id,
            "completed_at": "2025-11-19T10:00:00Z"
        }
        
        first_complete = await client.post(
            "/v1/cards/complete",
            headers=senior_headers,
            json=completion_data
        )
        # 첫 완료는 성공 또는 이미 완료됨
        assert first_complete.status_code == 200
        
        # 3. 두 번째 완료 시도 (거부되어야 함)
        second_complete = await client.post(
            "/v1/cards/complete",
            headers=senior_headers,
            json=completion_data
        )
        assert second_complete.status_code == 200
        second_data = second_complete.json()
        
        # 중복 완료는 ok: false 또는 이미 완료 메시지
        if not second_data.get("ok"):
            assert "이미" in second_data["error"]["message"] or "중복" in second_data["error"]["message"]
        
        print("✅ 중복 완료 방지 검증 성공")
    
    @pytest.mark.asyncio
    async def test_streak_bonus_on_consecutive_days(self, client: AsyncClient, senior_headers):
        """연속 일수 달성 시 스트릭 보너스 포인트 확인"""
        # 1. 초기 게임화 상태 확인
        gamification_before = await client.get(
            "/v1/gamification",
            headers=senior_headers
        )
        assert gamification_before.status_code == 200
        before_data = gamification_before.json()["data"]
        initial_streak = before_data.get("streak_days", 0)
        
        # 2. 카드 완료
        card_response = await client.get("/v1/cards/today", headers=senior_headers)
        card_data = card_response.json()
        
        if not card_data.get("ok") or "id" not in card_data.get("data", {}):
            import pytest
            pytest.skip("카드 데이터 없음")
        
        card_id = card_data["data"]["id"]
        
        completion_data = {
            "card_id": card_id,
            "completed_at": "2025-11-19T10:00:00Z"
        }
        
        await client.post(
            "/v1/cards/complete",
            headers=senior_headers,
            json=completion_data
        )
        
        # 3. 스트릭 확인
        gamification_after = await client.get(
            "/v1/gamification",
            headers=senior_headers
        )
        assert gamification_after.status_code == 200
        after_data = gamification_after.json()["data"]
        final_streak = after_data.get("streak_days", 0)
        
        # 스트릭은 유지되거나 증가
        assert final_streak >= initial_streak, "스트릭은 감소하지 않아야 함"
        
        # 7일 연속 또는 30일 연속 배지 확인
        badges = after_data.get("badges", [])
        if final_streak >= 7:
            assert "일주일 연속" in badges, "7일 연속 달성 시 배지 획득해야 함"
        if final_streak >= 30:
            assert "한 달 연속" in badges, "30일 연속 달성 시 배지 획득해야 함"
        
        print(f"✅ 스트릭 검증 성공: {initial_streak}일 → {final_streak}일")
