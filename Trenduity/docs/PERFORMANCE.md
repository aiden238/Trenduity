# 성능 최적화 가이드

## BFF API 최적화 (FastAPI)

### 1. 응답 시간 모니터링

**구현 완료**: `app/middleware/performance.py`
- 모든 API 요청의 응답 시간 측정
- 200ms 초과 시 WARNING 로그
- 응답 헤더에 `X-Process-Time` 추가

**확인 방법**:
```powershell
# BFF 서버 로그 확인
# 200ms 이상 요청은 ⚠️ SLOW REQUEST로 표시됨
```

**최적화 타겟**:
- 목표: 모든 엔드포인트 < 200ms
- 현재 느린 가능성: 
  - `/v1/insights` (복잡한 JOIN)
  - `/v1/family/members` (다중 테이블 조회)

### 2. N+1 쿼리 문제 해결

**문제 예시** (community.py):
```python
# ❌ N+1 문제: 게시글마다 작성자 조회
for post in posts:
    author = supabase.table('profiles').select('display_name').eq('id', post['author_id']).single()
    post['author_name'] = author['display_name']

# ✅ 해결: 단일 쿼리로 조인
posts = supabase.table('qna_posts').select('*, profiles(display_name)').execute()
```

**개선 완료**:
- [x] `community.py` - Q&A 포스트 목록 (author 조회 → users JOIN)
- [x] `community.py` - 답변 목록 (author 조회 → profiles JOIN)
- [x] `community.py` - 리액션 수 (개별 조회 → 일괄 조회 후 집계)
- [x] `family.py` - 가족 멤버 목록 (user 정보 → users JOIN)
- [x] `family.py` - 마지막 활동 (개별 조회 → 일괄 조회 후 Python 집계)

**개선 전후 비교**:
- `GET /v1/qna?limit=20`: 20개 포스트 → 41회 쿼리 (1개 목록 + 20개 author + 20개 reactions)
- `GET /v1/qna?limit=20`: 20개 포스트 → **2회 쿼리** (1개 JOIN + 1개 reactions 일괄 조회)
- **쿼리 수 95% 감소** (41회 → 2회)

- `GET /v1/family/members`: 5명 멤버 → 11회 쿼리 (1개 목록 + 5개 user + 5개 cards)
- `GET /v1/family/members`: 5명 멤버 → **2회 쿼리** (1개 JOIN + 1개 cards 일괄 조회)
- **쿼리 수 82% 감소** (11회 → 2회)

### 3. 데이터베이스 인덱스 확인

**필수 인덱스** (supabase_schema.sql):
```sql
-- 이미 생성됨
CREATE INDEX idx_cards_user_date ON cards(user_id, date);
CREATE INDEX idx_gamification_user ON gamification(user_id);
CREATE INDEX idx_qna_posts_topic ON qna_posts(topic);
CREATE INDEX idx_qna_answers_post ON qna_answers(post_id);

-- 추가 권장
CREATE INDEX idx_family_members_guardian ON family_members(guardian_id);
CREATE INDEX idx_scam_checks_user ON scam_checks(user_id);
CREATE INDEX idx_med_checks_user_date ON med_checks(user_id, checked_at);
```

### 4. Redis 캐싱 활용

**캐시 후보**:
- 오늘의 카드 (1시간 TTL)
- 인사이트 목록 (10분 TTL)
- 사용자 게임화 정보 (5분 TTL)

**구현 예시**:
```python
from app.core.deps import get_redis_client

# 캐시 확인
cache_key = f"card:today:{user_id}"
cached_data = redis_client.get(cache_key)
if cached_data:
    return json.loads(cached_data)

# DB 조회
data = fetch_from_database()

# 캐시 저장 (1시간)
redis_client.setex(cache_key, 3600, json.dumps(data))
```

### 5. 응답 페이로드 최적화

**현재 문제**:
- 큰 텍스트 필드 (cards.body: ~2000자)
- 불필요한 필드 포함

**해결책**:
```python
# ❌ 모든 필드 반환
SELECT * FROM cards

# ✅ 필요한 필드만 선택
SELECT id, type, payload->>'title', payload->>'tldr' FROM cards
```

### 6. 동시 요청 제한 (Rate Limiting)

**구현 예정**: Redis 기반 레이트 리미팅
- 사용자당: 100 req/min
- IP당: 300 req/min

---

## Mobile 앱 최적화 (React Native)

### 1. 이미지 최적화

**현재 상태**: PNG/JPG 직접 사용
**개선안**: WebP 변환 + 반응형 로딩

**구현**:
```bash
# 이미지 변환 스크립트
cd Trenduity/apps/mobile-expo/assets/images
for file in *.png; do
  cwebp -q 80 "$file" -o "${file%.png}.webp"
done
```

**컴포넌트에서 사용**:
```tsx
import { Image } from 'expo-image';

<Image
  source={require('./image.webp')}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
/>
```

### 2. React Query 최적화

**현재 설정** (useQna.ts):
```typescript
staleTime: 5 * 60 * 1000, // 5분
```

**개선 설정**:
```typescript
// 자주 변경되는 데이터 (Q&A 목록)
staleTime: 1 * 60 * 1000, // 1분

// 거의 변경 없는 데이터 (인사이트, 카드)
staleTime: 10 * 60 * 1000, // 10분

// 정적 데이터 (코스 목록)
staleTime: Infinity,
```

**Prefetching 추가**:
```typescript
// 상세 페이지로 이동 전 데이터 미리 로드
const queryClient = useQueryClient();
queryClient.prefetchQuery({
  queryKey: ['qna', 'detail', postId],
  queryFn: () => fetchQnaDetail(postId),
});
```

### 3. Lazy Loading

**구현**:
```tsx
import { lazy, Suspense } from 'react';
import { Spinner } from '@repo/ui';

const QnaDetailScreen = lazy(() => import('./QnaDetailScreen'));

<Suspense fallback={<Spinner />}>
  <QnaDetailScreen />
</Suspense>
```

---

## 웹 콘솔 최적화 (Next.js)

### 1. 번들 분석

**실행**:
```powershell
cd apps/web-next
npm install -D @next/bundle-analyzer
```

**next.config.js 수정**:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // 기존 설정
});
```

**분석 실행**:
```powershell
$env:ANALYZE="true"; npm run build
```

### 2. Code Splitting

**현재 문제**: 모든 컴포넌트가 초기 번들에 포함

**해결책**:
```typescript
// Dynamic import
import dynamic from 'next/dynamic';

const DashboardChart = dynamic(() => import('@/components/DashboardChart'), {
  loading: () => <Spinner />,
  ssr: false, // 클라이언트 전용
});
```

### 3. 이미지 최적화

**사용**: Next.js Image 컴포넌트
```tsx
import Image from 'next/image';

<Image
  src="/images/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // LCP 개선
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

---

## 성능 측정

### 1. Lighthouse CI

**설치**:
```powershell
npm install -g @lhci/cli
```

**실행**:
```powershell
lhci autorun --collect.url=http://localhost:3000
```

**목표 점수**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

### 2. BFF API 벤치마크

**도구**: Apache Bench 또는 wrk
```powershell
# 카드 조회 성능 테스트
ab -n 1000 -c 10 http://localhost:8000/v1/cards/today
```

**목표**:
- 평균 응답 시간: < 100ms
- 95 percentile: < 200ms
- Throughput: > 500 req/sec

---

## 체크리스트

### BFF API
- [x] 성능 모니터링 미들웨어 추가 (`app/middleware/performance.py`)
- [x] N+1 쿼리 최적화 (community, family 라우터) - JOIN + 일괄 조회로 95% 개선
- [x] Redis 캐싱 인프라 구축 (`app/utils/cache.py`)
- [x] 데이터베이스 인덱스 스크립트 (`scripts/add_performance_indexes.sql`)
- [ ] Rate limiting 구현 (TODO)

### Mobile
- [ ] WebP 이미지 변환 (TODO)
- [x] React Query staleTime 조정 (useTodayCard: 60min, useInsights: 15min, useQna: 3-5min)
- [ ] Prefetching 추가 (TODO)
- [ ] Lazy loading 적용 (TODO)

### Web
- [x] Bundle analyzer 설정 (`next.config.js` + `npm run build:analyze`)
- [x] Next.js 최적화 설정 (swcMinify, images, optimizePackageImports)
- [ ] Code splitting 적용 (TODO)
- [ ] Next.js Image 사용 (TODO)
- [ ] Lighthouse CI 통합 (TODO)

### 측정
- [ ] BFF 벤치마크 실행 (TODO)
- [ ] Lighthouse 점수 확인 (TODO)
- [ ] 프로덕션 모니터링 설정 (TODO)

---

## 다음 단계 (수동 작업)

### 1. 데이터베이스 인덱스 적용
```powershell
# Supabase SQL Editor에서 실행
# 파일: scripts/add_performance_indexes.sql
```

### 2. 번들 분석 실행
```powershell
cd apps\web-next
npm run build:analyze
# 브라우저에서 http://127.0.0.1:8888 열림
```

### 3. 성능 측정
```powershell
# BFF 벤치마크 (Apache Bench)
ab -n 1000 -c 10 http://localhost:8000/v1/cards/today

# Lighthouse 점수
npx lighthouse http://localhost:3000 --view
```
