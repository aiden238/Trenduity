# 06. Tool Tracks (도구 실습)

> **기능**: Canva/Miri/Sora 등 AI 도구 단계별 실습 가이드  
> **우선순위**: 🟡 SHOULD (Week 4)  
> **의존성**: [01-implementation-rules.md](./01-implementation-rules.md), [02-daily-card-gamification.md](./02-daily-card-gamification.md)

---

## 📋 목표

50-70대 사용자가 **AI 도구를 직접 체험**하며 학습할 수 있도록 합니다.

**핵심 가치**:
- 📚 **단계별 가이드**: 작은 단계로 나누어 학습
- ✅ **진행 추적**: 어디까지 했는지 기록
- 🎮 **게임화**: 단계 완료 시 포인트 획득
- 📱 **외부 앱 연동**: Canva, Miri 등 실제 앱 사용

---

## 🗂️ DB 설계

### `tools_progress` 테이블
```sql
CREATE TABLE tools_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  tool VARCHAR(50) NOT NULL, -- 'canva', 'miri', 'sora'
  step INT NOT NULL, -- 1, 2, 3, ...
  status VARCHAR(20) NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'done'
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, tool, step)
);

CREATE INDEX idx_tools_progress_user_tool ON tools_progress(user_id, tool);
```

---

## 🔧 BFF 구현

### 1) `GET /v1/tools/progress` - 진행 상황 조회

```python
# services/bff-fastapi/app/routers/tools.py
from fastapi import APIRouter, Depends, Query
from app.dependencies import get_current_user, get_supabase

router = APIRouter(prefix="/v1/tools", tags=["tools"])

# 도구별 스텝 정의
TOOL_STEPS = {
    "canva": [
        {"step": 1, "title": "템플릿 선택하기", "description": "마음에 드는 템플릿을 골라보세요."},
        {"step": 2, "title": "텍스트 수정하기", "description": "글자를 바꿔서 내 것으로 만들어요."},
        {"step": 3, "title": "이미지 바꾸기", "description": "원하는 사진으로 교체해 보세요."},
        {"step": 4, "title": "저장하고 공유하기", "description": "완성본을 저장하고 가족에게 보내요."},
    ],
    "miri": [
        {"step": 1, "title": "Miri 앱 열기", "description": "Miri 앱을 설치하고 로그인해요."},
        {"step": 2, "title": "질문하기", "description": "'오늘 날씨 어때?'라고 물어보세요."},
        {"step": 3, "title": "음성으로 검색", "description": "말로 검색해 보세요."},
    ],
    "sora": [
        {"step": 1, "title": "Sora 소개", "description": "Sora는 영상을 만드는 AI예요."},
        {"step": 2, "title": "프롬프트 작성", "description": "원하는 영상을 글로 설명해요."},
        {"step": 3, "title": "결과 확인", "description": "AI가 만든 영상을 감상해요."},
    ],
}

@router.get("/progress")
async def get_tool_progress(
    tool: str = Query(..., description="canva | miri | sora"),
    user_id: str = Depends(get_current_user),
    db = Depends(get_supabase)
):
    """
    도구별 진행 상황 조회
    
    Returns:
        {
          "ok": true,
          "data": {
            "tool": "canva",
            "steps": [
              {
                "step": 1,
                "title": "템플릿 선택하기",
                "description": "...",
                "status": "done"
              },
              ...
            ]
          }
        }
    """
    if tool not in TOOL_STEPS:
        return {
            "ok": False,
            "error": {
                "code": "INVALID_TOOL",
                "message": "지원하지 않는 도구예요."
            }
        }
    
    # DB에서 진행 상황 조회
    result = db.table('tools_progress') \
        .select('step, status') \
        .eq('user_id', user_id) \
        .eq('tool', tool) \
        .execute()
    
    # 진행 상황 맵 생성
    progress_map = {row['step']: row['status'] for row in result.data}
    
    # 스텝 정의 + 진행 상황 병합
    steps = []
    for step_def in TOOL_STEPS[tool]:
        step_num = step_def['step']
        status = progress_map.get(step_num, 'not_started')
        
        steps.append({
            **step_def,
            'status': status
        })
    
    return {
        "ok": True,
        "data": {
            "tool": tool,
            "steps": steps
        }
    }
```

### 2) `POST /v1/tools/progress` - 진행 상황 업데이트

```python
from pydantic import BaseModel
from app.services.gamification import GamificationService
from app.dependencies import get_gamification_service

class UpdateProgressRequest(BaseModel):
    tool: str  # canva, miri, sora
    step: int
    status: str  # 'in_progress' | 'done'

@router.post("/progress")
async def update_tool_progress(
    body: UpdateProgressRequest,
    user_id: str = Depends(get_current_user),
    db = Depends(get_supabase),
    gamification: GamificationService = Depends(get_gamification_service)
):
    """
    도구 진행 상황 업데이트 + 게임화
    
    Request:
        { "tool": "canva", "step": 1, "status": "done" }
    
    Response:
        {
          "ok": true,
          "data": {
            "points_added": 3,
            "total_points": 153
          }
        }
    """
    # Upsert 진행 상황
    db.table('tools_progress').upsert({
        'user_id': user_id,
        'tool': body.tool,
        'step': body.step,
        'status': body.status
    }).execute()
    
    # 게임화 (단계 완료 시만)
    if body.status == 'done':
        points_result = await gamification.award_for_tool_step_completion(
            user_id=user_id,
            tool=body.tool,
            step=body.step
        )
        
        return {
            "ok": True,
            "data": points_result
        }
    
    return {
        "ok": True,
        "data": {}
    }
```

### 3) Gamification Service 확장

```python
# services/bff-fastapi/app/services/gamification.py (기존 파일 수정)
class GamificationService:
    # 기존 상수들...
    TOOL_STEP_POINTS = 3
    
    async def award_for_tool_step_completion(
        self,
        user_id: str,
        tool: str,
        step: int
    ) -> dict:
        """
        도구 단계 완료 시 포인트 부여
        
        Returns:
            {
                "points_added": 3,
                "total_points": 153
            }
        """
        points = self.TOOL_STEP_POINTS
        
        # 포인트 추가
        gamif = await self._get_or_create_gamification(user_id)
        new_total = gamif['points'] + points
        
        self.db.table('gamification').update({
            'points': new_total
        }).eq('user_id', user_id).execute()
        
        return {
            "points_added": points,
            "total_points": new_total
        }
```

---

## 📱 Mobile 구현

### 1) Hooks

```typescript
// apps/mobile-rn/src/hooks/useToolTrack.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

interface ToolStep {
  step: number;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'done';
}

interface ToolProgress {
  tool: string;
  steps: ToolStep[];
}

export function useToolProgress(tool: string) {
  return useQuery({
    queryKey: ['toolProgress', tool],
    queryFn: async (): Promise<ToolProgress> => {
      const response = await apiClient.get(`/v1/tools/progress?tool=${tool}`);
      if (!response.data.ok) {
        throw new Error(response.data.error?.message || '진행 상황을 불러올 수 없어요.');
      }
      return response.data.data;
    },
    enabled: !!tool,
  });
}

export function useUpdateToolProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      tool,
      step,
      status,
    }: {
      tool: string;
      step: number;
      status: 'in_progress' | 'done';
    }) => {
      const response = await apiClient.post('/v1/tools/progress', {
        tool,
        step,
        status,
      });
      
      if (!response.data.ok) {
        throw new Error(response.data.error?.message || '업데이트에 실패했어요.');
      }
      
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['toolProgress', variables.tool] });
    },
  });
}
```

### 2) Screen: `ToolTrackScreen`

```typescript
// apps/mobile-rn/src/screens/ToolTrackScreen.tsx
import React from 'react';
import { ScrollView, View, StyleSheet, Linking } from 'react-native';
import { Typography, Button, Card } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';
import { useToolProgress, useUpdateToolProgress } from '@/hooks/useToolTrack';
import { useRoute } from '@react-navigation/native';

const TOOL_INFO = {
  canva: {
    name: 'Canva (디자인 도구)',
    icon: '🎨',
    appUrl: 'https://www.canva.com',
    description: '포스터, 카드, 초대장 등을 쉽게 만들 수 있어요.',
  },
  miri: {
    name: 'Miri (AI 비서)',
    icon: '🤖',
    appUrl: 'https://www.example.com/miri',
    description: '음성으로 질문하고 답변을 들을 수 있어요.',
  },
  sora: {
    name: 'Sora (AI 영상)',
    icon: '🎬',
    appUrl: 'https://openai.com/sora',
    description: '글로 설명하면 영상을 만들어 줘요.',
  },
};

export default function ToolTrackScreen() {
  const route = useRoute();
  const { tool } = route.params as { tool: string };
  
  const { data, isLoading, error } = useToolProgress(tool);
  const updateProgress = useUpdateToolProgress();
  const { spacing, buttonHeight, fontSizes } = useA11y();
  
  if (isLoading) return <LoadingSpinner />;
  if (error || !data) return <ErrorBanner message="진행 상황을 불러올 수 없어요." />;
  
  const toolInfo = TOOL_INFO[tool];
  
  const handleStepComplete = async (step: number) => {
    try {
      await updateProgress.mutateAsync({ tool, step, status: 'done' });
    } catch (err) {
      // 에러는 useMutation에서 처리
    }
  };
  
  const handleOpenApp = () => {
    Linking.openURL(toolInfo.appUrl);
  };
  
  const completedCount = data.steps.filter(s => s.status === 'done').length;
  const totalCount = data.steps.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  
  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing }}>
        {/* 도구 정보 */}
        <Card style={{ backgroundColor: '#F0F8FF' }}>
          <Typography variant="heading1" fontSize={fontSizes.heading1}>
            {toolInfo.icon} {toolInfo.name}
          </Typography>
          <Typography
            variant="body"
            fontSize={fontSizes.body}
            color="#666666"
            style={{ marginTop: spacing / 2 }}
          >
            {toolInfo.description}
          </Typography>
        </Card>
        
        {/* 진행률 */}
        <View style={{ marginTop: spacing * 2 }}>
          <Typography variant="heading2" fontSize={fontSizes.heading2}>
            📊 진행률: {progress}%
          </Typography>
          <View style={[styles.progressBar, { marginTop: spacing }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: '#4CAF50' }
              ]}
            />
          </View>
          <Typography
            variant="caption"
            fontSize={fontSizes.caption}
            color="#666666"
            style={{ marginTop: spacing / 2 }}
          >
            {completedCount}/{totalCount} 단계 완료
          </Typography>
        </View>
        
        {/* 단계 목록 */}
        <View style={{ marginTop: spacing * 2 }}>
          {data.steps.map((step) => (
            <Card key={step.step} style={{ marginBottom: spacing }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                {/* 상태 아이콘 */}
                <Typography variant="heading1" fontSize={fontSizes.heading1 * 1.2}>
                  {step.status === 'done' ? '✅' : '⭕'}
                </Typography>
                
                {/* 내용 */}
                <View style={{ flex: 1, marginLeft: spacing }}>
                  <Typography variant="heading2" fontSize={fontSizes.heading2}>
                    Step {step.step}. {step.title}
                  </Typography>
                  <Typography
                    variant="body"
                    fontSize={fontSizes.body}
                    color="#666666"
                    style={{ marginTop: spacing / 2 }}
                  >
                    {step.description}
                  </Typography>
                  
                  {step.status !== 'done' && (
                    <Button
                      onPress={() => handleStepComplete(step.step)}
                      variant="primary"
                      height={buttonHeight}
                      style={{ marginTop: spacing }}
                      disabled={updateProgress.isPending}
                      accessibilityLabel={`Step ${step.step} 완료하기`}
                    >
                      완료
                    </Button>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>
        
        {/* 앱 열기 버튼 */}
        <Button
          onPress={handleOpenApp}
          variant="secondary"
          height={buttonHeight * 1.2}
          style={{ marginTop: spacing * 2 }}
          accessibilityLabel={`${toolInfo.name} 앱 열기`}
        >
          🔗 {toolInfo.name} 앱 열기
        </Button>
        
        {/* 완료 메시지 */}
        {progress === 100 && (
          <Card style={{ marginTop: spacing * 2, backgroundColor: '#E8F5E9', padding: spacing * 1.5 }}>
            <Typography
              variant="heading2"
              fontSize={fontSizes.heading2}
              color="#4CAF50"
              style={{ textAlign: 'center' }}
            >
              🎉 모든 단계 완료!
            </Typography>
            <Typography
              variant="body"
              fontSize={fontSizes.body}
              style={{ marginTop: spacing, textAlign: 'center' }}
            >
              축하드려요! {toolInfo.name}을(를) 마스터하셨어요.
            </Typography>
          </Card>
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
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
});
```

### 3) Screen: `ToolListScreen` (도구 목록)

```typescript
// apps/mobile-rn/src/screens/ToolListScreen.tsx
import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Card } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';
import { useNavigation } from '@react-navigation/native';

const TOOLS = [
  { id: 'canva', name: 'Canva', icon: '🎨', description: '디자인 도구' },
  { id: 'miri', name: 'Miri', icon: '🤖', description: 'AI 비서' },
  { id: 'sora', name: 'Sora', icon: '🎬', description: 'AI 영상' },
];

export default function ToolListScreen() {
  const { spacing, fontSizes } = useA11y();
  const navigation = useNavigation();
  
  const handleToolPress = (tool: string) => {
    navigation.navigate('ToolTrack', { tool });
  };
  
  return (
    <View style={styles.container}>
      <View style={{ padding: spacing }}>
        <Typography variant="heading1" fontSize={fontSizes.heading1}>
          🛠️ AI 도구 실습
        </Typography>
        <Typography
          variant="body"
          fontSize={fontSizes.body}
          color="#666666"
          style={{ marginTop: spacing }}
        >
          단계별로 따라하며 AI 도구를 배워보세요.
        </Typography>
      </View>
      
      <FlatList
        data={TOOLS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleToolPress(item.id)}
            accessibilityLabel={`${item.name} 실습 시작`}
          >
            <Card style={{ marginBottom: spacing }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Typography variant="heading1" fontSize={fontSizes.heading1 * 1.5}>
                  {item.icon}
                </Typography>
                <View style={{ flex: 1, marginLeft: spacing }}>
                  <Typography variant="heading2" fontSize={fontSizes.heading2}>
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body"
                    fontSize={fontSizes.body}
                    color="#666666"
                  >
                    {item.description}
                  </Typography>
                </View>
                <Typography variant="heading2" fontSize={fontSizes.heading2} color="#2196F3">
                  →
                </Typography>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
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

## ✅ 테스트 체크리스트

### DB 테스트
- [ ] `tools_progress` 테이블 생성 확인
- [ ] UNIQUE 제약 (user_id, tool, step) 동작 확인

### BFF 테스트
```bash
# 진행 상황 조회
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8000/v1/tools/progress?tool=canva"

# 단계 완료
curl -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"tool":"canva","step":1,"status":"done"}' \
  http://localhost:8000/v1/tools/progress
```

- [ ] 지원하지 않는 도구 → 에러
- [ ] 진행 상황 없으면 'not_started' 기본값
- [ ] 완료 시 포인트 부여 확인

### Mobile 테스트
- [ ] 도구 목록 화면 렌더링
- [ ] 도구 선택 → 상세 화면 이동
- [ ] 진행률 바 표시 (0-100%)
- [ ] 각 단계 완료 버튼 → 체크 표시 변경
- [ ] 완료 시 포인트 토스트
- [ ] 모든 단계 완료 → 축하 메시지
- [ ] 앱 열기 버튼 → 브라우저/앱 실행

---

## 🔗 다음 단계

Tool Tracks 완료 후:
- **다음**: [07. Community Q&A](./07-community-qna.md)
- **병렬 작업 가능**: [08. Family & Med Check](./08-family-med-check.md)

---

**문서 작성**: AI Implementation Guide  
**최종 업데이트**: 2025년 11월 13일
