# 08. Family & Med Check

> **기능**: 가족 연동 + 복약 체크 + 사용량 대시보드  
> **우선순위**: 🟡 SHOULD (Week 4-5)  
> **의존성**: [01-implementation-rules.md](./01-implementation-rules.md)

---

## 📋 목표

50-70대 사용자를 **가족이 지켜볼 수 있는 구조**를 만들고, **복약 체크** 기능을 제공합니다.

**핵심 가치**:
- 👨‍👩‍👧‍👦 **가족 연동**: 자녀/보호자가 부모님 활동 확인
- 💊 **복약 체크**: 매일 약 먹기 기록
- 📊 **사용량 대시보드**: 월별 활동 통계 (웹 콘솔)
- 🔔 **알림**: 오래 미체크 시 가족에게 알림

---

## 🗂️ DB 설계

### 1) `family_links` 테이블
```sql
CREATE TABLE family_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guardian_id UUID NOT NULL REFERENCES auth.users(id), -- 보호자 (자녀)
  user_id UUID NOT NULL REFERENCES auth.users(id), -- 시니어 (부모)
  perms JSONB DEFAULT '{"read": true, "alerts": true}', -- 권한
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(guardian_id, user_id)
);

CREATE INDEX idx_family_links_guardian ON family_links(guardian_id);
CREATE INDEX idx_family_links_user ON family_links(user_id);
```

### 2) `med_checks` 테이블
```sql
CREATE TABLE med_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date DATE NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_med_checks_user_date ON med_checks(user_id, date DESC);
```

### 3) `usage_counters` 테이블
```sql
CREATE TABLE usage_counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  month VARCHAR(7) NOT NULL, -- '2025-11'
  cards_completed INT DEFAULT 0,
  insights_viewed INT DEFAULT 0,
  med_checks_done INT DEFAULT 0,
  total_points INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, month)
);

CREATE INDEX idx_usage_counters_user_month ON usage_counters(user_id, month);
```

---

## 🔧 BFF 구현

### 1) Family Links API

#### `POST /v1/family/invite` - 초대 링크 생성

```python
# services/bff-fastapi/app/routers/family.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import get_current_user, get_supabase
import secrets

router = APIRouter(prefix="/v1/family", tags=["family"])

class InviteRequest(BaseModel):
    user_id: str  # 시니어 user_id
    perms: dict = {"read": True, "alerts": True}

@router.post("/invite")
async def create_invite(
    body: InviteRequest,
    guardian_id: str = Depends(get_current_user),
    db = Depends(get_supabase)
):
    """
    가족 초대 링크 생성
    
    Request:
        {
          "user_id": "senior-uuid",
          "perms": {"read": true, "alerts": true}
        }
    
    Response:
        {
          "ok": true,
          "data": {
            "invite_token": "abc123...",
            "expires_at": "2025-11-20T..."
          }
        }
    """
    # 초대 토큰 생성 (간단한 구현)
    invite_token = secrets.token_urlsafe(16)
    
    # TODO: 실제로는 invite_tokens 테이블에 저장
    # 여기서는 간소화
    
    # 직접 링크 생성 (MVP)
    db.table('family_links').insert({
        'guardian_id': guardian_id,
        'user_id': body.user_id,
        'perms': body.perms
    }).execute()
    
    return {
        "ok": True,
        "data": {
            "invite_token": invite_token,
            "message": "가족 연동이 완료되었어요."
        }
    }
```

#### `GET /v1/family/members` - 연동된 멤버 목록

```python
@router.get("/members")
async def get_family_members(
    guardian_id: str = Depends(get_current_user),
    db = Depends(get_supabase)
):
    """
    보호자가 관리하는 시니어 목록
    
    Response:
        {
          "ok": true,
          "data": {
            "members": [
              {
                "user_id": "...",
                "name": "홍길동",
                "last_activity": "2025-11-13",
                "perms": {...}
              }
            ]
          }
        }
    """
    result = db.table('family_links') \
        .select('user_id, perms, users(name, email)') \
        .eq('guardian_id', guardian_id) \
        .execute()
    
    members = []
    for link in result.data:
        # 마지막 활동 조회
        last_card = db.table('cards') \
            .select('date') \
            .eq('user_id', link['user_id']) \
            .order('date', desc=True) \
            .limit(1) \
            .execute()
        
        members.append({
            'user_id': link['user_id'],
            'name': link['users']['name'],
            'last_activity': last_card.data[0]['date'] if last_card.data else None,
            'perms': link['perms']
        })
    
    return {
        "ok": True,
        "data": {
            "members": members
        }
    }
```

### 2) Med Check API

#### `POST /v1/med/check` - 복약 체크

```python
from datetime import date
from app.services.gamification import GamificationService
from app.dependencies import get_gamification_service

@router.post("/check")
async def check_med(
    user_id: str = Depends(get_current_user),
    db = Depends(get_supabase),
    gamification: GamificationService = Depends(get_gamification_service)
):
    """
    오늘 복약 체크
    
    Response:
        {
          "ok": true,
          "data": {
            "checked": true,
            "points_added": 2,
            "streak_days": 5
          }
        }
    """
    today = date.today().isoformat()
    
    # 중복 체크 방지
    existing = db.table('med_checks') \
        .select('id') \
        .eq('user_id', user_id) \
        .eq('date', today) \
        .execute()
    
    if existing.data:
        return {
            "ok": True,
            "data": {
                "checked": True,
                "message": "오늘은 이미 체크했어요."
            }
        }
    
    # 체크 기록
    db.table('med_checks').insert({
        'user_id': user_id,
        'date': today
    }).execute()
    
    # 게임화 포인트
    points_result = await gamification.award_for_med_check(user_id, today)
    
    return {
        "ok": True,
        "data": {
            "checked": True,
            **points_result
        }
    }
```

#### `GET /v1/med/status` - 복약 체크 현황

```python
from datetime import datetime, timedelta

@router.get("/status")
async def get_med_status(
    user_id: str = Depends(get_current_user),
    db = Depends(get_supabase)
):
    """
    최근 7일 복약 체크 현황
    
    Response:
        {
          "ok": true,
          "data": {
            "last_7_days": [
              {"date": "2025-11-13", "checked": true},
              {"date": "2025-11-12", "checked": false},
              ...
            ],
            "total_this_month": 15
          }
        }
    """
    # 최근 7일
    today = date.today()
    last_7_days = [(today - timedelta(days=i)).isoformat() for i in range(7)]
    
    checks = db.table('med_checks') \
        .select('date') \
        .eq('user_id', user_id) \
        .in_('date', last_7_days) \
        .execute()
    
    checked_dates = {row['date'] for row in checks.data}
    
    status = [
        {'date': d, 'checked': d in checked_dates}
        for d in last_7_days
    ]
    
    # 이번 달 총 체크 수
    this_month = today.strftime('%Y-%m')
    month_checks = db.table('med_checks') \
        .select('id', count='exact') \
        .eq('user_id', user_id) \
        .gte('date', f'{this_month}-01') \
        .execute()
    
    return {
        "ok": True,
        "data": {
            "last_7_days": status,
            "total_this_month": month_checks.count or 0
        }
    }
```

### 3) Usage API (웹 콘솔용)

#### `GET /v1/usage` - 사용량 통계

```python
@router.get("")
async def get_usage_stats(
    user_id: str,  # Query param
    month: str | None = None,  # '2025-11'
    guardian_id: str = Depends(get_current_user),
    db = Depends(get_supabase)
):
    """
    사용량 통계 조회 (보호자만)
    
    Response:
        {
          "ok": true,
          "data": {
            "cards_completed": 20,
            "insights_viewed": 15,
            "med_checks_done": 18,
            "total_points": 250
          }
        }
    """
    # 권한 확인
    link = db.table('family_links') \
        .select('perms') \
        .eq('guardian_id', guardian_id) \
        .eq('user_id', user_id) \
        .single() \
        .execute()
    
    if not link.data or not link.data['perms'].get('read'):
        return {
            "ok": False,
            "error": {
                "code": "NO_PERMISSION",
                "message": "권한이 없어요."
            }
        }
    
    # 월 지정 안하면 이번 달
    if not month:
        month = date.today().strftime('%Y-%m')
    
    # 통계 조회
    stats = db.table('usage_counters') \
        .select('*') \
        .eq('user_id', user_id) \
        .eq('month', month) \
        .single() \
        .execute()
    
    if stats.data:
        return {
            "ok": True,
            "data": stats.data
        }
    else:
        # 데이터 없으면 0으로
        return {
            "ok": True,
            "data": {
                "cards_completed": 0,
                "insights_viewed": 0,
                "med_checks_done": 0,
                "total_points": 0
            }
        }
```

### 4) Gamification Service 확장

```python
# services/bff-fastapi/app/services/gamification.py (기존 파일 수정)
class GamificationService:
    # 기존 상수들...
    MED_CHECK_POINTS = 2
    
    async def award_for_med_check(self, user_id: str, date: str) -> dict:
        """
        복약 체크 시 포인트 부여
        
        Returns:
            {
                "points_added": 2,
                "total_points": 155,
                "streak_days": 5
            }
        """
        points = self.MED_CHECK_POINTS
        
        # 포인트 추가
        gamif = await self._get_or_create_gamification(user_id)
        new_total = gamif['points'] + points
        
        self.db.table('gamification').update({
            'points': new_total
        }).eq('user_id', user_id).execute()
        
        # 스트릭 계산 (선택사항)
        # TODO: 복약 연속 일수 추적
        
        return {
            "points_added": points,
            "total_points": new_total
        }
```

---

## 📱 Mobile 구현

### 1) Screen: `MedCheckScreen`

```typescript
// apps/mobile-rn/src/screens/MedCheckScreen.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Typography, Button, Card } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

export default function MedCheckScreen() {
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const queryClient = useQueryClient();
  
  const { data: status } = useQuery({
    queryKey: ['medStatus'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/med/status');
      return response.data.data;
    },
  });
  
  const checkMed = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/v1/med/check');
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medStatus'] });
    },
  });
  
  const todayChecked = status?.last_7_days?.[0]?.checked || false;
  
  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing }}>
        <Typography variant="heading1" fontSize={fontSizes.heading1}>
          💊 복약 체크
        </Typography>
        
        <Typography
          variant="body"
          fontSize={fontSizes.body}
          color="#666666"
          style={{ marginTop: spacing }}
        >
          매일 약을 먹었는지 기록하세요.
        </Typography>
        
        {/* 오늘 체크 */}
        <Card style={{ marginTop: spacing * 2, padding: spacing * 2 }}>
          {todayChecked ? (
            <>
              <Typography
                variant="heading2"
                fontSize={fontSizes.heading2}
                color="#4CAF50"
                style={{ textAlign: 'center' }}
              >
                ✅ 오늘 약을 먹었어요!
              </Typography>
              <Typography
                variant="body"
                fontSize={fontSizes.body}
                style={{ marginTop: spacing, textAlign: 'center' }}
              >
                잘하셨어요. 내일도 잊지 마세요!
              </Typography>
            </>
          ) : (
            <>
              <Typography
                variant="heading2"
                fontSize={fontSizes.heading2}
                style={{ textAlign: 'center' }}
              >
                오늘 약 먹으셨나요?
              </Typography>
              <Button
                onPress={() => checkMed.mutate()}
                variant="primary"
                height={buttonHeight * 1.5}
                style={{ marginTop: spacing * 2 }}
                disabled={checkMed.isPending}
                accessibilityLabel="오늘 약 먹기 체크하기"
              >
                {checkMed.isPending ? '기록 중...' : '네, 먹었어요!'}
              </Button>
            </>
          )}
        </Card>
        
        {/* 최근 7일 */}
        <View style={{ marginTop: spacing * 2 }}>
          <Typography variant="heading2" fontSize={fontSizes.heading2}>
            📅 최근 7일
          </Typography>
          
          <View style={{ flexDirection: 'row', marginTop: spacing }}>
            {status?.last_7_days?.map((day: any) => (
              <View key={day.date} style={[styles.dayBox, { margin: spacing / 4 }]}>
                <Typography variant="caption" fontSize={fontSizes.caption}>
                  {new Date(day.date).getDate()}일
                </Typography>
                <Typography variant="heading1" fontSize={fontSizes.heading1}>
                  {day.checked ? '✅' : '⭕'}
                </Typography>
              </View>
            ))}
          </View>
        </View>
        
        {/* 이번 달 통계 */}
        {status?.total_this_month !== undefined && (
          <Card style={{ marginTop: spacing * 2, backgroundColor: '#E8F5E9' }}>
            <Typography variant="body" fontSize={fontSizes.body}>
              🗓️ 이번 달: {status.total_this_month}일 체크했어요!
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
  dayBox: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
});
```

---

## 🌐 Web Console 구현

### Dashboard: 가족 멤버 현황

```typescript
// apps/web-console/app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();
  const user = (await supabase.auth.getUser()).data.user;
  
  // 가족 멤버 목록
  const { data: members } = await supabase
    .from('family_links')
    .select('user_id, users(name)')
    .eq('guardian_id', user?.id);
  
  // 각 멤버의 통계
  const memberStats = await Promise.all(
    members?.map(async (member) => {
      const thisMonth = new Date().toISOString().slice(0, 7);
      
      const { data: usage } = await supabase
        .from('usage_counters')
        .select('*')
        .eq('user_id', member.user_id)
        .eq('month', thisMonth)
        .single();
      
      const { data: lastMedCheck } = await supabase
        .from('med_checks')
        .select('date')
        .eq('user_id', member.user_id)
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      return {
        name: member.users.name,
        usage: usage || { cards_completed: 0, med_checks_done: 0 },
        lastMedCheck: lastMedCheck?.date,
      };
    }) || []
  );
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">가족 대시보드</h1>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {memberStats.map((stat) => (
          <div key={stat.name} className="border rounded-lg p-4">
            <h2 className="font-semibold text-lg">{stat.name}님</h2>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">이번 달 카드 완료</span>
                <span className="font-semibold">{stat.usage.cards_completed}개</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">복약 체크</span>
                <span className="font-semibold">{stat.usage.med_checks_done}일</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">마지막 복약 체크</span>
                <span className={`font-semibold ${
                  stat.lastMedCheck === new Date().toISOString().split('T')[0]
                    ? 'text-green-600'
                    : 'text-orange-600'
                }`}>
                  {stat.lastMedCheck || '기록 없음'}
                </span>
              </div>
            </div>
            
            {stat.lastMedCheck !== new Date().toISOString().split('T')[0] && (
              <div className="mt-4 bg-orange-50 border-l-4 border-orange-500 p-3">
                <p className="text-sm text-orange-700">
                  오늘 아직 복약 체크를 하지 않았어요.
                </p>
              </div>
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

### BFF 테스트
```bash
# 복약 체크
curl -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  http://localhost:8000/v1/med/check

# 복약 현황
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:8000/v1/med/status

# 가족 멤버 목록
curl -H "Authorization: Bearer <GUARDIAN_TOKEN>" \
  http://localhost:8000/v1/family/members
```

### Mobile 테스트
- [ ] 복약 체크 버튼 → 완료 메시지
- [ ] 중복 체크 방지
- [ ] 최근 7일 캘린더 표시
- [ ] 이번 달 통계 표시
- [ ] 포인트 획득 확인

### Web 테스트
- [ ] 대시보드에서 멤버별 통계 표시
- [ ] 미체크 시 경고 표시
- [ ] 권한 없는 사용자 접근 차단

---

## 🔗 다음 단계

- **다음**: [09. A11y Wiring](./09-a11y-wiring.md)

---

**문서 작성**: AI Implementation Guide  
**최종 업데이트**: 2025년 11월 13일
