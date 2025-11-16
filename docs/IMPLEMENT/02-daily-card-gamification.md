# 02. Daily Card + Quiz + Gamification

> **기능**: 오늘의 한 가지 카드 + 퀴즈 + 포인트/스트릭 시스템  
> **우선순위**: 🔴 MUST (Week 1)  
> **의존성**: [01-implementation-rules.md](./01-implementation-rules.md)

---

## 📋 목표

50-70대 사용자에게 **매일 하나의 학습 카드**를 제공하고, 간단한 퀴즈를 통해 이해도를 확인합니다. 완료 시 포인트와 스트릭을 부여하여 지속적인 학습을 유도합니다.

**핵심 가치**:
- 🎯 **단순함**: 하루에 딱 하나, 3분이면 끝
- 📱 **큰 버튼**: 터치하기 쉬운 48-64dp 버튼
- 🎤 **읽어주기**: TTS로 전체 내용 음성 제공
- 🏆 **동기부여**: 포인트/스트릭으로 성취감

---

## 🗂️ DB 설계

### 1) `cards` 테이블
```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'ai_tools', 'digital_safety', 'health_info'
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_cards_user_date ON cards(user_id, date);
```

#### `payload` 구조
```json
{
  "title": "챗GPT로 손자 생일 축하 메시지 만들기",
  "tldr": "챗GPT를 사용하면 마음을 담은 멋진 메시지를 쉽게 만들 수 있어요.",
  "body": "1. 챗GPT에 '손자 생일 축하 메시지 작성해줘'라고 말해요.\n2. 원하는 톤(따뜻하게, 유머러스하게)을 추가로 요청할 수 있어요.\n3. 결과를 복사해서 카카오톡으로 전송하면 끝!",
  "impact": "손자가 할아버지의 마음을 더 잘 느낄 수 있어요.",
  "quiz": [
    {
      "id": "q1",
      "question": "챗GPT에게 무엇을 요청하나요?",
      "options": ["날씨 알려줘", "메시지 작성해줘", "음악 틀어줘"],
      "correctIndex": 1,
      "explanation": "챗GPT는 글쓰기를 도와주는 AI예요."
    }
  ]
}
```

### 2) `gamification` 테이블
```sql
CREATE TABLE gamification (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  points INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_activity_date DATE,
  badges JSONB DEFAULT '[]', -- ["첫걸음", "일주일 연속"]
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gamification_points ON gamification(points DESC);
```

---

## 🔧 BFF 구현

### 1) `GET /v1/cards/today` - 오늘의 카드 가져오기

#### 엔드포인트
```python
# services/bff-fastapi/app/routers/cards.py
from fastapi import APIRouter, Depends, HTTPException
from datetime import date
from app.dependencies import get_current_user, get_supabase
from app.schemas.dtos import CardDto

router = APIRouter(prefix="/v1/cards", tags=["cards"])

@router.get("/today")
async def get_today_card(
    user_id: str = Depends(get_current_user),
    db = Depends(get_supabase)
):
    """
    오늘의 카드 조회
    
    Returns:
        { "ok": true, "data": { "card": CardDto } }
    """
    today = date.today().isoformat()
    
    # 1. 오늘 카드 조회
    result = db.table('cards') \
        .select('*') \
        .eq('user_id', user_id) \
        .eq('date', today) \
        .limit(1) \
        .execute()
    
    if not result.data:
        # 2. 카드가 없으면 fallback 생성 (또는 최근 카드 재사용)
        card = await _create_fallback_card(db, user_id, today)
    else:
        card = result.data[0]
    
    return {
        "ok": True,
        "data": {"card": card}
    }

async def _create_fallback_card(db, user_id: str, date: str):
    """
    임시 fallback 카드 (실제로는 pre-generated pool에서 선택)
    """
    fallback_payload = {
        "title": "오늘의 AI 꿀팁",
        "tldr": "AI를 활용한 간단한 팁을 알려드려요.",
        "body": "챗GPT를 사용하면 다양한 질문에 답을 얻을 수 있어요.",
        "impact": "일상이 더 편리해져요.",
        "quiz": []
    }
    
    new_card = {
        "user_id": user_id,
        "date": date,
        "type": "ai_tools",
        "payload": fallback_payload,
        "status": "pending"
    }
    
    result = db.table('cards').insert(new_card).execute()
    return result.data[0]
```

### 2) `POST /v1/cards/complete` - 카드 완료 + 퀴즈 채점

#### 엔드포인트
```python
from pydantic import BaseModel
from app.services.gamification import GamificationService

class CompleteCardRequest(BaseModel):
    card_id: str
    quiz_answers: dict[str, int] | None = None  # { "q1": 1, "q2": 0 }

@router.post("/complete")
async def complete_card(
    body: CompleteCardRequest,
    user_id: str = Depends(get_current_user),
    db = Depends(get_supabase),
    gamification: GamificationService = Depends(get_gamification_service)
):
    """
    카드 완료 + 퀴즈 채점 + 게임화 업데이트
    
    Returns:
        {
          "ok": true,
          "data": {
            "points_added": 11,
            "total_points": 150,
            "streak_days": 7,
            "quiz_result": { "correct": 2, "total": 3 }
          }
        }
    """
    # 1. 카드 조회
    card = db.table('cards').select('*').eq('id', body.card_id).single().execute()
    if not card.data:
        raise HTTPException(status_code=404, detail={"ok": False, "error": "카드를 찾을 수 없어요."})
    
    # 2. 퀴즈 채점
    quiz_result = None
    if body.quiz_answers:
        quiz_result = _grade_quiz(card.data['payload']['quiz'], body.quiz_answers)
    
    # 3. 카드 상태 업데이트
    db.table('cards').update({'status': 'completed'}).eq('id', body.card_id).execute()
    
    # 4. 게임화 업데이트
    gamification_result = await gamification.award_for_card_completion(
        user_id=user_id,
        num_correct=quiz_result['correct'] if quiz_result else 0,
        num_questions=quiz_result['total'] if quiz_result else 0,
        date=card.data['date']
    )
    
    return {
        "ok": True,
        "data": {
            **gamification_result,
            "quiz_result": quiz_result
        }
    }

def _grade_quiz(quiz: list[dict], answers: dict[str, int]) -> dict:
    """
    퀴즈 채점
    
    Args:
        quiz: [{ "id": "q1", "correctIndex": 1 }, ...]
        answers: { "q1": 1, "q2": 0 }
    
    Returns:
        { "correct": 2, "total": 3, "details": [...] }
    """
    correct = 0
    details = []
    
    for q in quiz:
        user_answer = answers.get(q['id'])
        is_correct = user_answer == q['correctIndex']
        
        if is_correct:
            correct += 1
        
        details.append({
            "question_id": q['id'],
            "is_correct": is_correct,
            "explanation": q['explanation']
        })
    
    return {
        "correct": correct,
        "total": len(quiz),
        "details": details
    }
```

---

## 🎮 Gamification Service

### `services/gamification.py`
```python
# services/bff-fastapi/app/services/gamification.py
from datetime import date, timedelta
from supabase import Client

class GamificationService:
    BASE_CARD_POINTS = 5
    CORRECT_ANSWER_POINTS = 2
    DAILY_STREAK_BONUS = 3
    
    def __init__(self, db: Client):
        self.db = db
    
    async def award_for_card_completion(
        self,
        user_id: str,
        num_correct: int,
        num_questions: int,
        date: str
    ) -> dict:
        """
        카드 완료 시 포인트/스트릭 업데이트
        
        Returns:
            {
                "points_added": 13,
                "total_points": 150,
                "streak_days": 7,
                "new_badges": []
            }
        """
        # 1. 포인트 계산
        points = self.BASE_CARD_POINTS + (num_correct * self.CORRECT_ANSWER_POINTS)
        
        # 2. 게임화 레코드 조회
        gamif = await self._get_or_create_gamification(user_id)
        
        # 3. 스트릭 업데이트
        streak_days = await self._update_streak(gamif, date)
        
        if streak_days > 0:
            points += self.DAILY_STREAK_BONUS
        
        # 4. 포인트 추가
        new_total = gamif['points'] + points
        
        self.db.table('gamification').update({
            'points': new_total,
            'streak_days': streak_days,
            'last_activity_date': date
        }).eq('user_id', user_id).execute()
        
        # 5. 배지 확인
        new_badges = await self._check_new_badges(user_id, new_total, streak_days)
        
        return {
            "points_added": points,
            "total_points": new_total,
            "streak_days": streak_days,
            "new_badges": new_badges
        }
    
    async def _get_or_create_gamification(self, user_id: str) -> dict:
        result = self.db.table('gamification').select('*').eq('user_id', user_id).execute()
        
        if not result.data:
            new_gamif = {
                'user_id': user_id,
                'points': 0,
                'streak_days': 0,
                'badges': []
            }
            result = self.db.table('gamification').insert(new_gamif).execute()
        
        return result.data[0]
    
    async def _update_streak(self, gamif: dict, current_date: str) -> int:
        """
        스트릭 계산: 연속 일수
        
        Rules:
        - 오늘이 어제 다음날이면 streak +1
        - 오늘이 어제보다 2일 이상 차이나면 streak 리셋
        """
        last_date_str = gamif.get('last_activity_date')
        
        if not last_date_str:
            return 1  # 첫 활동
        
        last_date = date.fromisoformat(last_date_str)
        current = date.fromisoformat(current_date)
        
        diff = (current - last_date).days
        
        if diff == 1:
            # 연속
            return gamif['streak_days'] + 1
        elif diff == 0:
            # 같은 날 (중복 완료 시)
            return gamif['streak_days']
        else:
            # 끊김
            return 1
    
    async def _check_new_badges(self, user_id: str, total_points: int, streak_days: int) -> list[str]:
        """
        새로운 배지 확인
        
        Badges:
        - "첫걸음": 첫 카드 완료
        - "일주일 연속": 7일 스트릭
        - "포인트 100": 100 포인트 달성
        """
        gamif = self.db.table('gamification').select('badges').eq('user_id', user_id).single().execute()
        existing_badges = gamif.data['badges'] if gamif.data else []
        
        new_badges = []
        
        # 첫걸음
        if "첫걸음" not in existing_badges and total_points >= 5:
            new_badges.append("첫걸음")
        
        # 일주일 연속
        if "일주일 연속" not in existing_badges and streak_days >= 7:
            new_badges.append("일주일 연속")
        
        # 포인트 100
        if "포인트 100" not in existing_badges and total_points >= 100:
            new_badges.append("포인트 100")
        
        if new_badges:
            updated_badges = existing_badges + new_badges
            self.db.table('gamification').update({'badges': updated_badges}).eq('user_id', user_id).execute()
        
        return new_badges
```

---

## 📱 Mobile 구현

### 1) Hook: `useTodayCard`

```typescript
// apps/mobile-rn/src/hooks/useTodayCard.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

interface TodayCardData {
  card: {
    id: string;
    title: string;
    tldr: string;
    body: string;
    impact: string;
    quiz?: QuizQuestion[];
    status: 'pending' | 'completed';
  };
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function useTodayCard() {
  return useQuery({
    queryKey: ['todayCard'],
    queryFn: async (): Promise<TodayCardData> => {
      const response = await apiClient.get('/v1/cards/today');
      if (!response.data.ok) {
        throw new Error(response.data.error?.message || '카드를 불러올 수 없어요.');
      }
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}

export function useCompleteCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cardId, quizAnswers }: { 
      cardId: string; 
      quizAnswers?: Record<string, number> 
    }) => {
      const response = await apiClient.post('/v1/cards/complete', {
        card_id: cardId,
        quiz_answers: quizAnswers,
      });
      
      if (!response.data.ok) {
        throw new Error(response.data.error?.message || '완료 처리에 실패했어요.');
      }
      
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayCard'] });
    },
  });
}
```

### 2) Screen: `TodayCardScreen`

```typescript
// apps/mobile-rn/src/screens/TodayCardScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Typography, Button, Card } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';
import { useTodayCard, useCompleteCard } from '@/hooks/useTodayCard';
import { useTTS } from '@/hooks/useTTS';
import QuizSection from './components/QuizSection';
import CompletionModal from './components/CompletionModal';

export default function TodayCardScreen() {
  const { data, isLoading, error } = useTodayCard();
  const completeCard = useCompleteCard();
  const { speak } = useTTS();
  const { spacing, buttonHeight, fontSizes } = useA11y();
  
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorBanner message="오늘의 카드를 불러올 수 없어요." />;
  }
  
  const card = data?.card;
  if (!card) return null;
  
  const handleTTS = () => {
    const fullText = `${card.title}. ${card.tldr}. ${card.body}`;
    speak(fullText);
  };
  
  const handleComplete = async () => {
    try {
      const result = await completeCard.mutateAsync({
        cardId: card.id,
        quizAnswers: card.quiz ? quizAnswers : undefined,
      });
      
      setCompletionData(result);
      setShowCompletion(true);
    } catch (err) {
      // 에러는 useMutation에서 처리
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing }}>
        {/* 카드 타입 태그 */}
        <View style={styles.tagContainer}>
          <Typography variant="caption" color="primary">
            {card.type === 'ai_tools' ? '🤖 AI 활용법' : '🛡️ 디지털 안전'}
          </Typography>
        </View>
        
        {/* 제목 */}
        <Typography
          variant="heading1"
          fontSize={fontSizes.heading1}
          style={{ marginTop: spacing }}
        >
          {card.title}
        </Typography>
        
        {/* TL;DR */}
        <Card style={{ marginTop: spacing, backgroundColor: '#F0F8FF' }}>
          <Typography variant="body" fontSize={fontSizes.body}>
            💡 {card.tldr}
          </Typography>
        </Card>
        
        {/* 본문 */}
        <Typography
          variant="body"
          fontSize={fontSizes.body}
          style={{ marginTop: spacing, lineHeight: fontSizes.body * 1.6 }}
        >
          {card.body}
        </Typography>
        
        {/* 영향 */}
        <Card style={{ marginTop: spacing, backgroundColor: '#FFF4E6' }}>
          <Typography variant="body" fontSize={fontSizes.body}>
            ✨ {card.impact}
          </Typography>
        </Card>
        
        {/* 읽어주기 버튼 */}
        <Button
          onPress={handleTTS}
          variant="secondary"
          height={buttonHeight}
          style={{ marginTop: spacing }}
          accessibilityLabel="카드 내용 읽어주기"
        >
          🎤 읽어주기
        </Button>
        
        {/* 퀴즈 섹션 */}
        {card.quiz && card.quiz.length > 0 && (
          <QuizSection
            quiz={card.quiz}
            answers={quizAnswers}
            onAnswerChange={setQuizAnswers}
          />
        )}
        
        {/* 완료 버튼 */}
        <Button
          onPress={handleComplete}
          variant="primary"
          height={buttonHeight * 1.2}
          style={{ marginTop: spacing * 2 }}
          disabled={
            card.status === 'completed' || 
            (card.quiz && Object.keys(quizAnswers).length < card.quiz.length)
          }
          accessibilityLabel="오늘의 카드 완료하기"
        >
          {card.status === 'completed' ? '✅ 완료됨' : '완료하기'}
        </Button>
      </View>
      
      {/* 완료 모달 */}
      {showCompletion && (
        <CompletionModal
          data={completionData}
          onClose={() => setShowCompletion(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tagContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
});
```

### 3) Component: `QuizSection`

```typescript
// apps/mobile-rn/src/screens/components/QuizSection.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Button } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Props {
  quiz: QuizQuestion[];
  answers: Record<string, number>;
  onAnswerChange: (answers: Record<string, number>) => void;
}

export default function QuizSection({ quiz, answers, onAnswerChange }: Props) {
  const { spacing, buttonHeight, fontSizes } = useA11y();
  
  const handleSelect = (questionId: string, optionIndex: number) => {
    onAnswerChange({
      ...answers,
      [questionId]: optionIndex,
    });
  };
  
  return (
    <View style={{ marginTop: spacing * 2 }}>
      <Typography variant="heading2" fontSize={fontSizes.heading2}>
        📝 이해도 확인
      </Typography>
      
      {quiz.map((q, qIndex) => (
        <View key={q.id} style={{ marginTop: spacing * 1.5 }}>
          <Typography variant="body" fontSize={fontSizes.body}>
            {qIndex + 1}. {q.question}
          </Typography>
          
          <View style={{ marginTop: spacing }}>
            {q.options.map((option, index) => {
              const isSelected = answers[q.id] === index;
              
              return (
                <Button
                  key={index}
                  onPress={() => handleSelect(q.id, index)}
                  variant={isSelected ? 'primary' : 'outline'}
                  height={buttonHeight}
                  style={{ marginTop: spacing / 2 }}
                  accessibilityLabel={`${qIndex + 1}번 문제 ${index + 1}번 선택지: ${option}`}
                >
                  {option}
                </Button>
              );
            })}
          </View>
          
          {/* 선택 후 즉시 피드백 표시 (옵션) */}
          {answers[q.id] !== undefined && (
            <View style={{ marginTop: spacing, padding: spacing, backgroundColor: '#F0F8FF', borderRadius: 8 }}>
              <Typography variant="caption" fontSize={fontSizes.caption}>
                {answers[q.id] === q.correctIndex ? '✅ 정답이에요!' : '❌ 다시 생각해 보세요'}
              </Typography>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
```

### 4) Component: `CompletionModal`

```typescript
// apps/mobile-rn/src/screens/components/CompletionModal.tsx
import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Typography, Button } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';

interface Props {
  data: {
    points_added: number;
    total_points: number;
    streak_days: number;
    quiz_result?: { correct: number; total: number };
    new_badges: string[];
  };
  onClose: () => void;
}

export default function CompletionModal({ data, onClose }: Props) {
  const { spacing, buttonHeight, fontSizes } = useA11y();
  
  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { padding: spacing * 2 }]}>
          <Typography variant="heading1" fontSize={fontSizes.heading1} style={{ textAlign: 'center' }}>
            🎉 완료!
          </Typography>
          
          <View style={{ marginTop: spacing * 2 }}>
            <Typography variant="body" fontSize={fontSizes.body}>
              ⭐ 포인트: +{data.points_added} (총 {data.total_points})
            </Typography>
            
            <Typography variant="body" fontSize={fontSizes.body} style={{ marginTop: spacing }}>
              🔥 연속 학습: {data.streak_days}일
            </Typography>
            
            {data.quiz_result && (
              <Typography variant="body" fontSize={fontSizes.body} style={{ marginTop: spacing }}>
                📝 퀴즈 결과: {data.quiz_result.correct}/{data.quiz_result.total} 정답
              </Typography>
            )}
            
            {data.new_badges.length > 0 && (
              <View style={{ marginTop: spacing, padding: spacing, backgroundColor: '#FFF4E6', borderRadius: 8 }}>
                <Typography variant="body" fontSize={fontSizes.body}>
                  🏆 새 배지: {data.new_badges.join(', ')}
                </Typography>
              </View>
            )}
          </View>
          
          <Button
            onPress={onClose}
            variant="primary"
            height={buttonHeight}
            style={{ marginTop: spacing * 2 }}
            accessibilityLabel="닫기"
          >
            확인
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
});
```

---

## 🌐 Web 구현 (선택사항)

### Dashboard: 최근 카드 완료 현황

```typescript
// apps/web-console/app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();
  
  // 가족 구성원 목록
  const { data: members } = await supabase
    .from('family_links')
    .select('user_id, users(name)')
    .eq('guardian_id', (await supabase.auth.getUser()).data.user?.id);
  
  // 각 멤버의 최근 카드 완료 정보
  const cardData = await Promise.all(
    members.map(async (member) => {
      const { data } = await supabase
        .from('cards')
        .select('date, type, status')
        .eq('user_id', member.user_id)
        .order('date', { ascending: false })
        .limit(1);
      
      return {
        name: member.users.name,
        lastCard: data?.[0],
      };
    })
  );
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">대시보드</h1>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {cardData.map((item) => (
          <div key={item.name} className="border rounded-lg p-4">
            <h2 className="font-semibold">{item.name}</h2>
            {item.lastCard ? (
              <>
                <p className="text-sm text-gray-600">
                  마지막 활동: {item.lastCard.date}
                </p>
                <p className="text-sm">
                  {item.lastCard.status === 'completed' ? '✅ 완료' : '⏳ 진행 중'}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">활동 기록 없음</p>
            )}
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
- [ ] `cards` 테이블에 샘플 데이터 삽입
- [ ] `user_id + date` UNIQUE 제약 확인
- [ ] `gamification` 테이블 초기화 확인

### BFF 테스트
```bash
# 오늘의 카드 조회
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:8000/v1/cards/today

# 카드 완료
curl -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"card_id":"<CARD_ID>","quiz_answers":{"q1":1}}' \
  http://localhost:8000/v1/cards/complete
```

- [ ] 200 OK 응답 확인
- [ ] `ok: true` 및 `data` 구조 확인
- [ ] 게임화 포인트 업데이트 확인

### Mobile 테스트
- [ ] 카드 화면 렌더링 (제목, 본문, 퀴즈)
- [ ] 읽어주기 버튼 → TTS 작동
- [ ] 퀴즈 선택 → 버튼 하이라이트
- [ ] 완료 버튼 → 모달 표시 (포인트, 스트릭)
- [ ] 큰 버튼 크기 확인 (≥48dp)
- [ ] A11y 라벨 읽기 (VoiceOver/TalkBack)

### 접근성 테스트
- [ ] 폰트 크기 조정 (normal/easy/ultra 모드)
- [ ] 터치 타겟 크기 적절
- [ ] Color contrast 4.5:1 이상

---

## 🔗 다음 단계

Daily Card 완료 후:
- **다음**: [03. Insight Hub](./03-insight-hub.md)
- **병렬 작업 가능**: [04. Voice Intents](./04-voice-intents.md)

---

**문서 작성**: AI Implementation Guide  
**최종 업데이트**: 2025년 11월 13일
