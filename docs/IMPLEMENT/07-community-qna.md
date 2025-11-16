# 07. Community Q&A + Reactions

> **기능**: 가벼운 커뮤니티 (리액션 + 질문/답변)  
> **우선순위**: 🟢 NICE (Week 5)  
> **의존성**: [01-implementation-rules.md](./01-implementation-rules.md)

---

## 📋 목표

50-70대 사용자들이 **서로 소통**하고 **경험을 공유**할 수 있는 공간을 제공합니다.

**핵심 가치**:
- 👍 **간단한 리액션**: "응원해요", "도움됐어요" 버튼
- ❓ **익명 질문**: 부끄러운 질문도 편하게
- 🤖 **AI 요약**: 긴 글도 한눈에
- 🔍 **주제별 필터**: 관심사별로 찾기 쉽게

---

## 🗂️ DB 설계

### 1) `reactions` 테이블
```sql
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  target_type VARCHAR(50) NOT NULL, -- 'card', 'insight', 'course', 'qna_post'
  target_id UUID NOT NULL,
  kind VARCHAR(50) NOT NULL, -- 'cheer', 'useful', 'like'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, target_type, target_id, kind)
);

CREATE INDEX idx_reactions_target ON reactions(target_type, target_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
```

### 2) `qna_posts` 테이블
```sql
CREATE TABLE qna_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  topic VARCHAR(50) NOT NULL, -- 'ai_tools', 'digital_safety', 'health', 'general'
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  is_anon BOOLEAN DEFAULT FALSE,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qna_posts_topic ON qna_posts(topic);
CREATE INDEX idx_qna_posts_created ON qna_posts(created_at DESC);
```

### 3) `qna_votes` 테이블 (선택사항)
```sql
CREATE TABLE qna_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  post_id UUID NOT NULL REFERENCES qna_posts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_qna_votes_post ON qna_votes(post_id);
```

---

## 🔧 BFF 구현

### 1) Reactions API

#### `POST /v1/reactions` - 리액션 추가/제거

```python
# services/bff-fastapi/app/routers/reactions.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import get_current_user, get_supabase

router = APIRouter(prefix="/v1/reactions", tags=["reactions"])

class AddReactionRequest(BaseModel):
    target_type: str  # 'card', 'insight', 'course', 'qna_post'
    target_id: str
    kind: str  # 'cheer', 'useful', 'like'

@router.post("")
async def toggle_reaction(
    body: AddReactionRequest,
    user_id: str = Depends(get_current_user),
    db = Depends(get_supabase)
):
    """
    리액션 토글 (추가/제거)
    
    Request:
        {
          "target_type": "card",
          "target_id": "card-123",
          "kind": "cheer"
        }
    
    Response:
        {
          "ok": true,
          "data": {
            "action": "added" | "removed",
            "total_count": 42
          }
        }
    """
    # 기존 리액션 확인
    existing = db.table('reactions') \
        .select('id') \
        .eq('user_id', user_id) \
        .eq('target_type', body.target_type) \
        .eq('target_id', body.target_id) \
        .eq('kind', body.kind) \
        .execute()
    
    if existing.data:
        # 이미 있으면 제거
        db.table('reactions').delete().eq('id', existing.data[0]['id']).execute()
        action = "removed"
    else:
        # 없으면 추가
        db.table('reactions').insert({
            'user_id': user_id,
            'target_type': body.target_type,
            'target_id': body.target_id,
            'kind': body.kind
        }).execute()
        action = "added"
    
    # 총 개수 조회
    count_result = db.table('reactions') \
        .select('id', count='exact') \
        .eq('target_type', body.target_type) \
        .eq('target_id', body.target_id) \
        .eq('kind', body.kind) \
        .execute()
    
    return {
        "ok": True,
        "data": {
            "action": action,
            "total_count": count_result.count or 0
        }
    }
```

#### `GET /v1/reactions` - 리액션 통계 조회

```python
@router.get("")
async def get_reactions(
    target_type: str,
    target_id: str,
    user_id: str = Depends(get_current_user),
    db = Depends(get_supabase)
):
    """
    특정 대상의 리액션 통계
    
    Response:
        {
          "ok": true,
          "data": {
            "reactions": {
              "cheer": { "count": 15, "user_reacted": true },
              "useful": { "count": 8, "user_reacted": false }
            }
          }
        }
    """
    # 전체 리액션 조회
    all_reactions = db.table('reactions') \
        .select('kind, user_id') \
        .eq('target_type', target_type) \
        .eq('target_id', target_id) \
        .execute()
    
    # 카운트 집계
    reaction_stats = {}
    for r in all_reactions.data:
        kind = r['kind']
        if kind not in reaction_stats:
            reaction_stats[kind] = {'count': 0, 'user_reacted': False}
        
        reaction_stats[kind]['count'] += 1
        if r['user_id'] == user_id:
            reaction_stats[kind]['user_reacted'] = True
    
    return {
        "ok": True,
        "data": {
            "reactions": reaction_stats
        }
    }
```

### 2) Q&A API

#### `GET /v1/qna` - Q&A 목록 조회

```python
# services/bff-fastapi/app/routers/qna.py
from fastapi import APIRouter, Depends, Query
from app.dependencies import get_supabase

router = APIRouter(prefix="/v1/qna", tags=["qna"])

@router.get("")
async def list_qna(
    topic: str | None = Query(None),
    limit: int = Query(20, le=50),
    offset: int = Query(0),
    db = Depends(get_supabase)
):
    """
    Q&A 목록 조회
    
    Response:
        {
          "ok": true,
          "data": {
            "posts": [
              {
                "id": "...",
                "title": "...",
                "ai_summary": "...",
                "author_name": "익명" | "홍길동",
                "created_at": "...",
                "vote_count": 5
              }
            ],
            "total": 42
          }
        }
    """
    query = db.table('qna_posts') \
        .select('*, qna_votes(count)', count='exact') \
        .order('created_at', desc=True) \
        .range(offset, offset + limit - 1)
    
    if topic:
        query = query.eq('topic', topic)
    
    result = query.execute()
    
    # 익명 처리
    posts = []
    for post in result.data:
        posts.append({
            'id': post['id'],
            'title': post['title'],
            'ai_summary': post['ai_summary'] or post['body'][:100] + '...',
            'author_name': '익명' if post['is_anon'] else '사용자',
            'created_at': post['created_at'],
            'vote_count': len(post.get('qna_votes', []))
        })
    
    return {
        "ok": True,
        "data": {
            "posts": posts,
            "total": result.count
        }
    }
```

#### `GET /v1/qna/:id` - Q&A 상세 조회

```python
@router.get("/{post_id}")
async def get_qna_detail(
    post_id: str,
    db = Depends(get_supabase)
):
    """
    Q&A 상세 조회
    
    Response:
        {
          "ok": true,
          "data": {
            "post": {
              "id": "...",
              "title": "...",
              "body": "...",
              "author_name": "익명" | "홍길동",
              "created_at": "...",
              "vote_count": 5
            }
          }
        }
    """
    result = db.table('qna_posts') \
        .select('*, qna_votes(count)') \
        .eq('id', post_id) \
        .single() \
        .execute()
    
    if not result.data:
        return {
            "ok": False,
            "error": {
                "code": "POST_NOT_FOUND",
                "message": "질문을 찾을 수 없어요."
            }
        }
    
    post = result.data
    
    return {
        "ok": True,
        "data": {
            "post": {
                'id': post['id'],
                'title': post['title'],
                'body': post['body'],
                'author_name': '익명' if post['is_anon'] else '사용자',
                'created_at': post['created_at'],
                'vote_count': len(post.get('qna_votes', []))
            }
        }
    }
```

#### `POST /v1/qna` - Q&A 작성

```python
from pydantic import BaseModel
from app.dependencies import get_current_user

class CreateQnARequest(BaseModel):
    topic: str
    title: str
    body: str
    is_anon: bool = False

@router.post("")
async def create_qna(
    req: CreateQnARequest,
    user_id: str = Depends(get_current_user),
    db = Depends(get_supabase)
):
    """
    Q&A 작성
    
    Request:
        {
          "topic": "ai_tools",
          "title": "챗GPT 사용법이 궁금해요",
          "body": "챗GPT를 어떻게 사용하나요?",
          "is_anon": true
        }
    
    Response:
        {
          "ok": true,
          "data": {
            "post_id": "..."
          }
        }
    """
    # AI 요약 생성 (MVP에서는 단순 자르기)
    ai_summary = req.body[:100] + ('...' if len(req.body) > 100 else '')
    
    # TODO: 실제로는 LLM으로 요약 생성
    # ai_summary = await generate_summary(req.body)
    
    # 포스트 생성
    result = db.table('qna_posts').insert({
        'author_id': user_id,
        'topic': req.topic,
        'title': req.title,
        'body': req.body,
        'is_anon': req.is_anon,
        'ai_summary': ai_summary
    }).execute()
    
    return {
        "ok": True,
        "data": {
            "post_id": result.data[0]['id']
        }
    }
```

---

## 📱 Mobile 구현

### 1) Hooks

```typescript
// apps/mobile-rn/src/hooks/useCommunity.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

// Reactions
export function useReactions(targetType: string, targetId: string) {
  return useQuery({
    queryKey: ['reactions', targetType, targetId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/v1/reactions?target_type=${targetType}&target_id=${targetId}`
      );
      return response.data.data.reactions;
    },
    enabled: !!targetType && !!targetId,
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      targetType,
      targetId,
      kind,
    }: {
      targetType: string;
      targetId: string;
      kind: string;
    }) => {
      const response = await apiClient.post('/v1/reactions', {
        target_type: targetType,
        target_id: targetId,
        kind,
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['reactions', variables.targetType, variables.targetId],
      });
    },
  });
}

// Q&A
export function useQnAList(topic?: string) {
  return useQuery({
    queryKey: ['qna', topic],
    queryFn: async () => {
      const params = topic ? `?topic=${topic}` : '';
      const response = await apiClient.get(`/v1/qna${params}`);
      return response.data.data.posts;
    },
  });
}

export function useQnADetail(postId: string) {
  return useQuery({
    queryKey: ['qna', postId],
    queryFn: async () => {
      const response = await apiClient.get(`/v1/qna/${postId}`);
      return response.data.data.post;
    },
    enabled: !!postId,
  });
}

export function useCreateQnA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      topic: string;
      title: string;
      body: string;
      is_anon: boolean;
    }) => {
      const response = await apiClient.post('/v1/qna', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qna'] });
    },
  });
}
```

### 2) Component: `ReactionButtons`

```typescript
// apps/mobile-rn/src/components/ReactionButtons.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Typography } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';
import { useReactions, useToggleReaction } from '@/hooks/useCommunity';

interface Props {
  targetType: string;
  targetId: string;
}

const REACTION_CONFIG = {
  cheer: { label: '응원해요', icon: '👏' },
  useful: { label: '도움됐어요', icon: '💡' },
};

export default function ReactionButtons({ targetType, targetId }: Props) {
  const { data: reactions } = useReactions(targetType, targetId);
  const toggleReaction = useToggleReaction();
  const { spacing, fontSizes } = useA11y();
  
  const handleReaction = (kind: string) => {
    toggleReaction.mutate({ targetType, targetId, kind });
  };
  
  return (
    <View style={[styles.container, { marginTop: spacing }]}>
      {Object.entries(REACTION_CONFIG).map(([kind, config]) => {
        const reactionData = reactions?.[kind];
        const isActive = reactionData?.user_reacted || false;
        const count = reactionData?.count || 0;
        
        return (
          <Button
            key={kind}
            onPress={() => handleReaction(kind)}
            variant={isActive ? 'primary' : 'outline'}
            style={[styles.button, { marginRight: spacing / 2 }]}
            accessibilityLabel={`${config.label} (${count}명)`}
          >
            <Typography variant="body" fontSize={fontSizes.body}>
              {config.icon} {config.label} {count > 0 && `(${count})`}
            </Typography>
          </Button>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
```

### 3) Screen: `QnAListScreen`

```typescript
// apps/mobile-rn/src/screens/QnAListScreen.tsx
import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Card, Button } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';
import { useQnAList } from '@/hooks/useCommunity';
import { useNavigation } from '@react-navigation/native';

const TOPICS = [
  { key: 'all', label: '전체' },
  { key: 'ai_tools', label: 'AI 활용' },
  { key: 'digital_safety', label: '디지털 안전' },
  { key: 'health', label: '건강' },
  { key: 'general', label: '일반' },
];

export default function QnAListScreen() {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const { data: posts, isLoading } = useQnAList(selectedTopic);
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      {/* 주제 필터 */}
      <View style={{ padding: spacing }}>
        <FlatList
          horizontal
          data={TOPICS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Button
              onPress={() => setSelectedTopic(item.key === 'all' ? undefined : item.key)}
              variant={
                (item.key === 'all' && !selectedTopic) || item.key === selectedTopic
                  ? 'primary'
                  : 'outline'
              }
              style={{ marginRight: spacing / 2 }}
            >
              {item.label}
            </Button>
          )}
        />
      </View>
      
      {/* 질문 목록 */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('QnADetail', { postId: item.id })}
            accessibilityLabel={`질문: ${item.title}`}
          >
            <Card style={{ marginBottom: spacing }}>
              <Typography variant="heading2" fontSize={fontSizes.heading2}>
                {item.title}
              </Typography>
              <Typography
                variant="body"
                fontSize={fontSizes.body}
                color="#666666"
                style={{ marginTop: spacing / 2 }}
                numberOfLines={2}
              >
                {item.ai_summary}
              </Typography>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing }}>
                <Typography variant="caption" fontSize={fontSizes.caption} color="#999999">
                  {item.author_name}
                </Typography>
                <Typography variant="caption" fontSize={fontSizes.caption} color="#999999">
                  💡 {item.vote_count}명이 유용하다고 했어요
                </Typography>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
      
      {/* 질문 작성 버튼 */}
      <View style={[styles.fab, { padding: spacing }]}>
        <Button
          onPress={() => navigation.navigate('CreateQnA')}
          variant="primary"
          height={buttonHeight}
          accessibilityLabel="질문 작성하기"
        >
          ✏️ 질문하기
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});
```

---

## ✅ 테스트 체크리스트

### BFF 테스트
```bash
# 리액션 추가
curl -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"target_type":"card","target_id":"card-123","kind":"cheer"}' \
  http://localhost:8000/v1/reactions

# Q&A 목록
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8000/v1/qna?topic=ai_tools"
```

### Mobile 테스트
- [ ] 리액션 버튼 토글 동작
- [ ] 리액션 카운트 실시간 업데이트
- [ ] Q&A 주제 필터링
- [ ] 질문 작성 (익명 토글)
- [ ] AI 요약 표시

---

## 🔗 다음 단계

- **다음**: [08. Family & Med Check](./08-family-med-check.md)

---

**문서 작성**: AI Implementation Guide  
**최종 업데이트**: 2025년 11월 13일
