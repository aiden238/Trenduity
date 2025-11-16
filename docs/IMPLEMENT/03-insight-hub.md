# 03. Insight Hub (인사이트 허브)

> **기능**: 주제별 AI/디지털/건강 인사이트 제공 + 팔로우 기능  
> **우선순위**: 🔴 MUST (Week 2)  
> **의존성**: [01-implementation-rules.md](./01-implementation-rules.md), [09-a11y-wiring.md](./09-a11y-wiring.md)

---

## 📋 목표

50-70대 사용자가 **관심 주제의 최신 정보**를 쉽게 탐색하고 학습할 수 있도록 합니다.

**핵심 가치**:
- 📚 **큐레이션**: AI가 선별한 고품질 콘텐츠
- 🔖 **팔로우**: 관심 주제만 모아보기
- 🎤 **TTS 지원**: 긴 글도 음성으로 청취
- 🔍 **쉬운 필터링**: 주제별 탭 UI

---

## 🗂️ DB 설계

### 1) `insights` 테이블
```sql
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  topic VARCHAR(50) NOT NULL, -- 'ai_tools', 'digital_safety', 'health', 'finance'
  title VARCHAR(200) NOT NULL,
  summary TEXT NOT NULL, -- 2-3줄 요약
  source VARCHAR(100), -- 출처
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_date_topic ON insights(date DESC, topic);
CREATE INDEX idx_insights_topic ON insights(topic);
```

#### `payload` 구조
```json
{
  "body": "전체 본문 (1000자 이내)",
  "impact": "이 정보가 왜 중요한지",
  "references": [
    { "title": "참고 링크 1", "url": "https://..." }
  ]
}
```

### 2) `insight_follows` 테이블
```sql
CREATE TABLE insight_follows (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  topic VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (user_id, topic)
);

CREATE INDEX idx_insight_follows_user ON insight_follows(user_id);
```

---

## 🔧 BFF 구현

### 1) `GET /v1/insights` - 인사이트 목록

#### 엔드포인트
```python
# services/bff-fastapi/app/routers/insights.py
from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta
from app.dependencies import get_supabase

router = APIRouter(prefix="/v1/insights", tags=["insights"])

@router.get("")
async def list_insights(
    topic: str | None = Query(None, description="Filter by topic"),
    range: str = Query("weekly", description="weekly | monthly"),
    limit: int = Query(20, le=50),
    offset: int = Query(0),
    db = Depends(get_supabase)
):
    """
    인사이트 목록 조회
    
    Query params:
        topic: ai_tools, digital_safety, health, finance
        range: weekly (7일), monthly (30일)
        limit: 최대 50
        offset: 페이지네이션
    
    Returns:
        {
          "ok": true,
          "data": {
            "insights": [...],
            "total": 42
          }
        }
    """
    # 1. 날짜 범위 계산
    days = 7 if range == "weekly" else 30
    start_date = (datetime.now() - timedelta(days=days)).date()
    
    # 2. 쿼리 빌드
    query = db.table('insights') \
        .select('id, date, topic, title, summary, source', count='exact') \
        .gte('date', start_date.isoformat()) \
        .order('date', desc=True) \
        .range(offset, offset + limit - 1)
    
    if topic:
        query = query.eq('topic', topic)
    
    result = query.execute()
    
    return {
        "ok": True,
        "data": {
            "insights": result.data,
            "total": result.count
        }
    }
```

### 2) `GET /v1/insights/:id` - 인사이트 상세

```python
@router.get("/{insight_id}")
async def get_insight_detail(
    insight_id: str,
    db = Depends(get_supabase)
):
    """
    인사이트 상세 조회
    
    Returns:
        {
          "ok": true,
          "data": {
            "insight": {
              "id": "...",
              "title": "...",
              "summary": "...",
              "body": "...",
              "impact": "...",
              "source": "...",
              "references": [...]
            }
          }
        }
    """
    result = db.table('insights') \
        .select('*') \
        .eq('id', insight_id) \
        .single() \
        .execute()
    
    if not result.data:
        return {
            "ok": False,
            "error": {
                "code": "INSIGHT_NOT_FOUND",
                "message": "인사이트를 찾을 수 없어요."
            }
        }
    
    insight = result.data
    body = insight['payload'].get('body', '')
    impact = insight['payload'].get('impact', '')
    references = insight['payload'].get('references', [])
    
    return {
        "ok": True,
        "data": {
            "insight": {
                **insight,
                "body": body,
                "impact": impact,
                "references": references
            }
        }
    }
```

### 3) `POST /v1/insights/follow` - 주제 팔로우

```python
from pydantic import BaseModel
from app.dependencies import get_current_user

class FollowTopicRequest(BaseModel):
    topic: str  # ai_tools, digital_safety, health, finance

@router.post("/follow")
async def follow_topic(
    body: FollowTopicRequest,
    user_id: str = Depends(get_current_user),
    db = Depends(get_supabase)
):
    """
    주제 팔로우 (토글)
    
    Returns:
        {
          "ok": true,
          "data": { "is_following": true }
        }
    """
    # 기존 팔로우 확인
    existing = db.table('insight_follows') \
        .select('*') \
        .eq('user_id', user_id) \
        .eq('topic', body.topic) \
        .execute()
    
    if existing.data:
        # 이미 팔로우 중 → 언팔로우
        db.table('insight_follows') \
            .delete() \
            .eq('user_id', user_id) \
            .eq('topic', body.topic) \
            .execute()
        
        return {
            "ok": True,
            "data": {"is_following": False}
        }
    else:
        # 팔로우
        db.table('insight_follows').insert({
            'user_id': user_id,
            'topic': body.topic
        }).execute()
        
        return {
            "ok": True,
            "data": {"is_following": True}
        }
```

### 4) `GET /v1/insights/following` - 팔로우 중인 주제 목록

```python
@router.get("/following")
async def get_following_topics(
    user_id: str = Depends(get_current_user),
    db = Depends(get_supabase)
):
    """
    사용자가 팔로우 중인 주제 목록
    
    Returns:
        {
          "ok": true,
          "data": {
            "topics": ["ai_tools", "health"]
          }
        }
    """
    result = db.table('insight_follows') \
        .select('topic') \
        .eq('user_id', user_id) \
        .execute()
    
    topics = [row['topic'] for row in result.data]
    
    return {
        "ok": True,
        "data": {"topics": topics}
    }
```

---

## 📱 Mobile 구현

### 1) Hooks

```typescript
// apps/mobile-rn/src/hooks/useInsights.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

interface InsightListItem {
  id: string;
  date: string;
  topic: string;
  title: string;
  summary: string;
  source?: string;
}

interface InsightDetail extends InsightListItem {
  body: string;
  impact: string;
  references: Array<{ title: string; url: string }>;
}

export function useInsightList(topic?: string, range: 'weekly' | 'monthly' = 'weekly') {
  return useQuery({
    queryKey: ['insights', topic, range],
    queryFn: async () => {
      const params = new URLSearchParams({ range });
      if (topic) params.append('topic', topic);
      
      const response = await apiClient.get(`/v1/insights?${params}`);
      if (!response.data.ok) {
        throw new Error(response.data.error?.message || '인사이트를 불러올 수 없어요.');
      }
      
      return response.data.data.insights as InsightListItem[];
    },
    staleTime: 1000 * 60 * 10, // 10분
  });
}

export function useInsightDetail(insightId: string) {
  return useQuery({
    queryKey: ['insight', insightId],
    queryFn: async () => {
      const response = await apiClient.get(`/v1/insights/${insightId}`);
      if (!response.data.ok) {
        throw new Error(response.data.error?.message || '상세 정보를 불러올 수 없어요.');
      }
      
      return response.data.data.insight as InsightDetail;
    },
    enabled: !!insightId,
  });
}

export function useFollowTopic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (topic: string) => {
      const response = await apiClient.post('/v1/insights/follow', { topic });
      if (!response.data.ok) {
        throw new Error(response.data.error?.message || '팔로우 처리에 실패했어요.');
      }
      return response.data.data.is_following;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });
}

export function useFollowingTopics() {
  return useQuery({
    queryKey: ['following'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/insights/following');
      if (!response.data.ok) {
        throw new Error('팔로우 목록을 불러올 수 없어요.');
      }
      return response.data.data.topics as string[];
    },
  });
}
```

### 2) Screen: `InsightListScreen`

```typescript
// apps/mobile-rn/src/screens/InsightListScreen.tsx
import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Card, Button } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';
import { useInsightList, useFollowingTopics } from '@/hooks/useInsights';
import { useNavigation } from '@react-navigation/native';

const TOPICS = [
  { key: 'all', label: '전체', icon: '📚' },
  { key: 'ai_tools', label: 'AI 활용', icon: '🤖' },
  { key: 'digital_safety', label: '디지털 안전', icon: '🛡️' },
  { key: 'health', label: '건강', icon: '💊' },
  { key: 'finance', label: '금융', icon: '💰' },
];

export default function InsightListScreen() {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [range, setRange] = useState<'weekly' | 'monthly'>('weekly');
  
  const { data: insights, isLoading } = useInsightList(selectedTopic, range);
  const { data: followingTopics } = useFollowingTopics();
  const { spacing, fontSizes } = useA11y();
  const navigation = useNavigation();
  
  const handleInsightPress = (insightId: string) => {
    navigation.navigate('InsightDetail', { insightId });
  };
  
  return (
    <View style={styles.container}>
      {/* 주제 필터 */}
      <View style={[styles.topicFilter, { paddingVertical: spacing }]}>
        <FlatList
          horizontal
          data={TOPICS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = 
              (item.key === 'all' && !selectedTopic) || 
              item.key === selectedTopic;
            
            return (
              <TouchableOpacity
                onPress={() => setSelectedTopic(item.key === 'all' ? undefined : item.key)}
                style={[
                  styles.topicChip,
                  { marginHorizontal: spacing / 2 },
                  isSelected && styles.topicChipSelected
                ]}
                accessibilityLabel={`${item.label} 주제 필터`}
              >
                <Typography
                  variant="body"
                  fontSize={fontSizes.body}
                  color={isSelected ? '#FFFFFF' : '#666666'}
                >
                  {item.icon} {item.label}
                </Typography>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      
      {/* 기간 필터 */}
      <View style={[styles.rangeFilter, { padding: spacing }]}>
        <Button
          onPress={() => setRange('weekly')}
          variant={range === 'weekly' ? 'primary' : 'outline'}
          style={{ flex: 1, marginRight: spacing / 2 }}
        >
          최근 7일
        </Button>
        <Button
          onPress={() => setRange('monthly')}
          variant={range === 'monthly' ? 'primary' : 'outline'}
          style={{ flex: 1, marginLeft: spacing / 2 }}
        >
          최근 30일
        </Button>
      </View>
      
      {/* 인사이트 목록 */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={insights}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleInsightPress(item.id)}
              accessibilityLabel={`인사이트: ${item.title}`}
            >
              <Card style={{ marginBottom: spacing }}>
                {/* 주제 태그 */}
                <View style={styles.topicTag}>
                  <Typography variant="caption" fontSize={fontSizes.caption} color="#666666">
                    {TOPICS.find(t => t.key === item.topic)?.icon} {TOPICS.find(t => t.key === item.topic)?.label}
                  </Typography>
                </View>
                
                {/* 제목 */}
                <Typography
                  variant="heading2"
                  fontSize={fontSizes.heading2}
                  style={{ marginTop: spacing / 2 }}
                >
                  {item.title}
                </Typography>
                
                {/* 요약 */}
                <Typography
                  variant="body"
                  fontSize={fontSizes.body}
                  color="#666666"
                  style={{ marginTop: spacing / 2 }}
                  numberOfLines={2}
                >
                  {item.summary}
                </Typography>
                
                {/* 날짜 & 출처 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing }}>
                  <Typography variant="caption" fontSize={fontSizes.caption} color="#999999">
                    {item.date}
                  </Typography>
                  {item.source && (
                    <Typography variant="caption" fontSize={fontSizes.caption} color="#999999">
                      출처: {item.source}
                    </Typography>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topicFilter: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  topicChipSelected: {
    backgroundColor: '#2196F3',
  },
  rangeFilter: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  topicTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F8FF',
    borderRadius: 4,
  },
});
```

### 3) Screen: `InsightDetailScreen`

```typescript
// apps/mobile-rn/src/screens/InsightDetailScreen.tsx
import React from 'react';
import { ScrollView, View, StyleSheet, Linking } from 'react-native';
import { Typography, Button, Card } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';
import { useInsightDetail, useFollowTopic, useFollowingTopics } from '@/hooks/useInsights';
import { useTTS } from '@/hooks/useTTS';
import { useRoute } from '@react-navigation/native';

export default function InsightDetailScreen() {
  const route = useRoute();
  const { insightId } = route.params as { insightId: string };
  
  const { data: insight, isLoading, error } = useInsightDetail(insightId);
  const { data: followingTopics } = useFollowingTopics();
  const followTopic = useFollowTopic();
  const { speak, stop } = useTTS();
  const { spacing, buttonHeight, fontSizes } = useA11y();
  
  if (isLoading) return <LoadingSpinner />;
  if (error || !insight) return <ErrorBanner message="인사이트를 불러올 수 없어요." />;
  
  const isFollowing = followingTopics?.includes(insight.topic);
  
  const handleTTS = () => {
    const fullText = `${insight.title}. ${insight.summary}. ${insight.body}`;
    speak(fullText);
  };
  
  const handleFollow = () => {
    followTopic.mutate(insight.topic);
  };
  
  const handleReferencePress = (url: string) => {
    Linking.openURL(url);
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing }}>
        {/* 제목 */}
        <Typography
          variant="heading1"
          fontSize={fontSizes.heading1}
        >
          {insight.title}
        </Typography>
        
        {/* 요약 */}
        <Card style={{ marginTop: spacing, backgroundColor: '#F0F8FF' }}>
          <Typography variant="body" fontSize={fontSizes.body}>
            💡 {insight.summary}
          </Typography>
        </Card>
        
        {/* 본문 */}
        <Typography
          variant="body"
          fontSize={fontSizes.body}
          style={{ marginTop: spacing, lineHeight: fontSizes.body * 1.6 }}
        >
          {insight.body}
        </Typography>
        
        {/* 영향 */}
        {insight.impact && (
          <Card style={{ marginTop: spacing, backgroundColor: '#FFF4E6' }}>
            <Typography variant="body" fontSize={fontSizes.body}>
              ✨ {insight.impact}
            </Typography>
          </Card>
        )}
        
        {/* 참고 링크 */}
        {insight.references && insight.references.length > 0 && (
          <View style={{ marginTop: spacing }}>
            <Typography variant="heading2" fontSize={fontSizes.heading2}>
              🔗 참고 자료
            </Typography>
            {insight.references.map((ref, index) => (
              <Button
                key={index}
                onPress={() => handleReferencePress(ref.url)}
                variant="outline"
                height={buttonHeight}
                style={{ marginTop: spacing / 2 }}
                accessibilityLabel={`참고 링크: ${ref.title}`}
              >
                {ref.title}
              </Button>
            ))}
          </View>
        )}
        
        {/* 액션 버튼 */}
        <View style={{ marginTop: spacing * 2 }}>
          <Button
            onPress={handleTTS}
            variant="secondary"
            height={buttonHeight}
            accessibilityLabel="인사이트 읽어주기"
          >
            🎤 읽어주기
          </Button>
          
          <Button
            onPress={handleFollow}
            variant={isFollowing ? 'outline' : 'primary'}
            height={buttonHeight}
            style={{ marginTop: spacing }}
            accessibilityLabel={isFollowing ? '주제 팔로우 해제' : '주제 팔로우'}
          >
            {isFollowing ? '⭐ 팔로우 중' : '⭐ 주제 팔로우'}
          </Button>
        </View>
        
        {/* 출처 */}
        {insight.source && (
          <Typography
            variant="caption"
            fontSize={fontSizes.caption}
            color="#999999"
            style={{ marginTop: spacing * 2, textAlign: 'center' }}
          >
            출처: {insight.source}
          </Typography>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
```

---

## 🌐 Web 구현 (선택사항)

```typescript
// apps/web-console/app/insights/page.tsx
import { createClient } from '@/utils/supabase/server';

export default async function InsightsPage() {
  const supabase = createClient();
  
  const { data: insights } = await supabase
    .from('insights')
    .select('*')
    .order('date', { ascending: false })
    .limit(20);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">인사이트 관리</h1>
      
      <div className="mt-6 space-y-4">
        {insights?.map((insight) => (
          <div key={insight.id} className="border rounded-lg p-4">
            <div className="flex justify-between">
              <h2 className="font-semibold">{insight.title}</h2>
              <span className="text-sm text-gray-500">{insight.date}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{insight.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ 테스트 체크리스트

### DB 테스트
- [ ] `insights` 테이블에 샘플 데이터 삽입 (각 주제별 3-5개)
- [ ] 날짜 인덱스 확인 (EXPLAIN ANALYZE)
- [ ] `insight_follows` 테이블 UNIQUE 제약 확인

### BFF 테스트
```bash
# 인사이트 목록
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8000/v1/insights?topic=ai_tools&range=weekly"

# 인사이트 상세
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:8000/v1/insights/<INSIGHT_ID>

# 팔로우
curl -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"topic":"ai_tools"}' \
  http://localhost:8000/v1/insights/follow
```

- [ ] 필터링 동작 확인 (topic, range)
- [ ] 페이지네이션 확인 (limit, offset)
- [ ] 팔로우 토글 동작 확인

### Mobile 테스트
- [ ] 주제 필터 칩 동작
- [ ] 기간 필터 (7일/30일) 전환
- [ ] 인사이트 카드 탭 → 상세 화면 이동
- [ ] 읽어주기 버튼 → TTS 작동
- [ ] 팔로우 버튼 → 상태 토글
- [ ] 참고 링크 → 브라우저 열기

### 접근성 테스트
- [ ] 필터 칩 accessibility label
- [ ] 카드 전체 터치 영역
- [ ] TTS 재생 중 정지 가능

---

## 🔗 다음 단계

Insight Hub 완료 후:
- **다음**: [04. Voice Intents](./04-voice-intents.md)
- **병렬 작업 가능**: [05. Scam Check](./05-scam-check.md)

---

**문서 작성**: AI Implementation Guide  
**최종 업데이트**: 2025년 11월 13일
