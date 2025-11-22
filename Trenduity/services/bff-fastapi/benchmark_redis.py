"""
Redis 성능 벤치마크 스크립트

카드 완료 중복 체크 성능 비교:
- Redis 캐시 사용 (첫 호출 후)
- DB 조회 (Redis 없을 때)
"""
import asyncio
import time
from httpx import AsyncClient


async def benchmark_card_completion():
    """카드 완료 API 성능 측정"""
    
    base_url = "http://localhost:8000"
    headers = {
        "Authorization": "Bearer test-jwt-token-for-senior-user",
        "Content-Type": "application/json"
    }
    
    # 테스트할 카드 ID (실제 DB에 존재하는 ID)
    card_id = "ee4148a8-6f5b-497f-8f44-40c537e19220"
    
    print("🚀 Redis 성능 벤치마크 시작\n")
    print("=" * 60)
    
    async with AsyncClient(base_url=base_url, timeout=30.0) as client:
        
        # 1. 첫 번째 호출 (DB 저장 + Redis 캐싱)
        print("\n1️⃣ 첫 번째 카드 완료 (DB 저장 + Redis 캐싱)")
        start = time.time()
        try:
            response = await client.post(
                "/v1/cards/complete",
                json={"card_id": card_id},
                headers=headers
            )
            elapsed_first = (time.time() - start) * 1000
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ 성공: {elapsed_first:.2f}ms")
                print(f"   포인트: {data['data'].get('points_added', 0)}")
                print(f"   스트릭: {data['data'].get('streak_days', 0)}일")
            else:
                print(f"   ❌ 실패 ({response.status_code}): {response.text}")
                return
                
        except Exception as e:
            print(f"   ❌ 에러: {e}")
            return
        
        # 2. 두 번째 호출 (Redis 중복 체크 - 빠름)
        print("\n2️⃣ 중복 완료 시도 (Redis 캐시 조회)")
        start = time.time()
        try:
            response = await client.post(
                "/v1/cards/complete",
                json={"card_id": card_id},
                headers=headers
            )
            elapsed_redis = (time.time() - start) * 1000
            
            if response.status_code == 400:
                print(f"   ✅ 중복 방지 성공: {elapsed_redis:.2f}ms")
                print(f"   메시지: {response.json()['detail']['error']['message']}")
            elif response.status_code == 500:
                print(f"   ⚠️ 서버 에러 (로그 확인 필요): {elapsed_redis:.2f}ms")
                error_data = response.json()
                print(f"   상세: {error_data.get('detail', {}).get('error', {}).get('message', 'Unknown')}")
            else:
                print(f"   ⚠️ 예상치 못한 응답 ({response.status_code})")
                
        except Exception as e:
            print(f"   ❌ 에러: {e}")
        
        # 3. 여러 번 호출해서 평균 성능 측정
        print("\n3️⃣ 반복 테스트 (Redis 캐시 히트율 측정)")
        timings = []
        for i in range(10):
            start = time.time()
            try:
                response = await client.post(
                    "/v1/cards/complete",
                    json={"card_id": card_id},
                    headers=headers
                )
                elapsed = (time.time() - start) * 1000
                timings.append(elapsed)
            except Exception:
                pass
        
        if timings:
            avg_time = sum(timings) / len(timings)
            min_time = min(timings)
            max_time = max(timings)
            
            print(f"   평균: {avg_time:.2f}ms")
            print(f"   최소: {min_time:.2f}ms")
            print(f"   최대: {max_time:.2f}ms")
        
        print("\n" + "=" * 60)
        print("\n📊 성능 요약:")
        print(f"   첫 완료 (DB 저장): {elapsed_first:.2f}ms")
        if timings:
            print(f"   Redis 캐시 조회: {avg_time:.2f}ms (평균)")
            speedup = elapsed_first / avg_time
            print(f"   성능 향상: {speedup:.1f}x 빠름")
        
        print("\n✅ 벤치마크 완료!")


if __name__ == "__main__":
    asyncio.run(benchmark_card_completion())
