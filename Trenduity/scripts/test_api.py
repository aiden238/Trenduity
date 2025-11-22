"""
BFF API 간단 테스트 스크립트
"""
import requests
import json
from time import sleep

BASE_URL = "http://localhost:8000"

def test_health():
    """Health check 테스트"""
    print("\n🔍 Test 1: Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ 실패: {e}")
        return False

def test_insights_list():
    """Insights 목록 조회 테스트"""
    print("\n🔍 Test 2: GET /v1/insights")
    try:
        response = requests.get(f"{BASE_URL}/v1/insights?topic=ai&limit=5", timeout=5)
        print(f"   Status: {response.status_code}")
        data = response.json()
        if data.get("ok"):
            insights = data.get("data", {}).get("insights", [])
            total = data.get("data", {}).get("total", 0)
            print(f"   ✅ 성공: {len(insights)}개 인사이트 조회 (전체 {total}개)")
            if insights:
                print(f"   예시: {insights[0].get('title', 'N/A')}")
        else:
            print(f"   ❌ 실패: {data.get('error', {}).get('message', 'Unknown')}")
        return data.get("ok", False)
    except Exception as e:
        print(f"   ❌ 실패: {e}")
        return False

def test_qna_list():
    """Q&A 목록 조회 테스트"""
    print("\n🔍 Test 3: GET /v1/community/qna")
    try:
        response = requests.get(f"{BASE_URL}/v1/community/qna?limit=10", timeout=5)
        print(f"   Status: {response.status_code}")
        data = response.json()
        if data.get("ok"):
            posts = data.get("data", {}).get("posts", [])
            total = data.get("data", {}).get("total", 0)
            print(f"   ✅ 성공: {len(posts)}개 질문 조회 (전체 {total}개)")
            if posts:
                print(f"   예시: {posts[0].get('title', 'N/A')}")
        else:
            print(f"   ❌ 실패: {data.get('error', {}).get('message', 'Unknown')}")
        return data.get("ok", False)
    except Exception as e:
        print(f"   ❌ 실패: {e}")
        return False

def test_qna_answers():
    """Q&A 답변 조회 테스트 (시드 데이터의 첫 포스트 사용)"""
    print("\n🔍 Test 4: GET /v1/community/qna/{post_id}/answers")
    try:
        # 먼저 포스트 목록 조회
        list_response = requests.get(f"{BASE_URL}/v1/community/qna?limit=1", timeout=5)
        list_data = list_response.json()
        
        if not list_data.get("ok") or not list_data.get("data", {}).get("posts"):
            print("   ⚠️ 건너뛰기: 포스트가 없음")
            return True
        
        post_id = list_data["data"]["posts"][0]["id"]
        print(f"   포스트 ID: {post_id}")
        
        # 답변 조회
        response = requests.get(f"{BASE_URL}/v1/community/qna/{post_id}/answers", timeout=5)
        print(f"   Status: {response.status_code}")
        data = response.json()
        
        if data.get("ok"):
            answers = data.get("data", {}).get("answers", [])
            total = data.get("data", {}).get("total", 0)
            print(f"   ✅ 성공: {len(answers)}개 답변 조회 (전체 {total}개)")
            if answers:
                print(f"   예시: {answers[0].get('body', 'N/A')[:50]}...")
        else:
            print(f"   ❌ 실패: {data.get('error', {}).get('message', 'Unknown')}")
        
        return data.get("ok", False)
    except Exception as e:
        print(f"   ❌ 실패: {e}")
        return False

def main():
    print("=" * 60)
    print("🚀 BFF API 테스트 시작")
    print("=" * 60)
    
    # 서버 준비 대기
    print("\n⏳ 서버 준비 대기 중 (3초)...")
    sleep(3)
    
    results = []
    results.append(("Health Check", test_health()))
    results.append(("Insights List", test_insights_list()))
    results.append(("QnA List", test_qna_list()))
    results.append(("QnA Answers", test_qna_answers()))
    
    print("\n" + "=" * 60)
    print("📊 테스트 결과 요약")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status}: {name}")
    
    print(f"\n   총 {total}개 테스트 중 {passed}개 통과 ({passed/total*100:.0f}%)")
    
    if passed == total:
        print("\n🎉 모든 테스트 통과!")
    else:
        print(f"\n⚠️ {total - passed}개 테스트 실패")

if __name__ == "__main__":
    main()
