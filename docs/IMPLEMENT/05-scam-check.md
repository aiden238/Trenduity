# 05. Scam Check (사기 검사)

> **기능**: SMS/URL 사기 문자 및 피싱 사이트 검사  
> **우선순위**: 🟡 SHOULD (Week 3)  
> **의존성**: [01-implementation-rules.md](./01-implementation-rules.md)

---

## 📋 목표

50-70대 사용자를 **보이스피싱과 스미싱으로부터 보호**합니다.

**핵심 가치**:
- 🛡️ **간단 검사**: 의심스러운 문자/링크 붙여넣기만 하면 끝
- 🚦 **신호등 UI**: 초록/노랑/빨강으로 위험도 표시
- 💡 **구체적 팁**: "이런 경우 조심하세요" 안내
- 📊 **패턴 학습**: 사기 패턴 DB 누적 (선택사항)

---

## 🗂️ DB 설계 (선택사항)

### `scam_checks` 테이블
```sql
CREATE TABLE scam_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  input TEXT NOT NULL, -- 검사한 문자/URL
  label VARCHAR(20) NOT NULL, -- 'safe', 'warn', 'danger'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scam_checks_user ON scam_checks(user_id);
CREATE INDEX idx_scam_checks_label ON scam_checks(label);
```

**용도**:
- 사용자별 검사 이력
- 사기 패턴 통계 분석
- 가족 대시보드 경고 표시

---

## 🔧 BFF 구현

### 1) `services/scam_checker.py` - 사기 검사 로직

```python
# services/bff-fastapi/app/services/scam_checker.py
import re
from typing import Literal

LabelType = Literal["safe", "warn", "danger"]

class ScamCheckResult:
    def __init__(self, label: LabelType, tips: list[str]):
        self.label = label
        self.tips = tips

class ScamChecker:
    """
    SMS/URL 사기 검사 (정규식 기반)
    
    Example:
        checker = ScamChecker()
        result = checker.check("국세청입니다. 환급금 수령을 위해 클릭하세요 http://...")
        # ScamCheckResult(label="danger", tips=[...])
    """
    
    # 위험 키워드
    DANGER_KEYWORDS = [
        "환급금", "국세청", "경찰청", "검찰청",
        "계좌이체", "비밀번호", "OTP", "보안카드",
        "긴급", "지급정지", "압류", "소송",
        "택배", "미수령", "재배송",
        "카카오톡", "네이버", "은행", "카드사",
        "본인인증", "로그인", "정보 업데이트"
    ]
    
    # 경고 키워드
    WARN_KEYWORDS = [
        "당첨", "무료", "선착순", "지급",
        "클릭", "링크", "바로가기",
        "확인", "승인", "처리"
    ]
    
    # 의심 URL 패턴
    SUSPICIOUS_URL_PATTERNS = [
        r"bit\.ly",       # 단축 URL
        r"gg\.gg",
        r"tinyurl\.com",
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",  # IP 주소
        r"[a-z0-9]{10,}\.com",  # 랜덤 문자열 도메인
    ]
    
    def check(self, input_text: str) -> ScamCheckResult:
        """
        입력 텍스트의 사기 위험도 판정
        
        Args:
            input_text: 검사할 SMS 또는 URL
        
        Returns:
            ScamCheckResult(label, tips)
        """
        if not input_text or len(input_text) < 5:
            return ScamCheckResult(
                label="safe",
                tips=["검사할 내용이 너무 짧아요."]
            )
        
        # 1. 위험 키워드 검사
        danger_count = sum(
            1 for keyword in self.DANGER_KEYWORDS
            if keyword in input_text
        )
        
        # 2. 경고 키워드 검사
        warn_count = sum(
            1 for keyword in self.WARN_KEYWORDS
            if keyword in input_text
        )
        
        # 3. URL 패턴 검사
        suspicious_url = any(
            re.search(pattern, input_text)
            for pattern in self.SUSPICIOUS_URL_PATTERNS
        )
        
        # 4. 판정
        if danger_count >= 2 or (danger_count >= 1 and suspicious_url):
            return ScamCheckResult(
                label="danger",
                tips=self._get_danger_tips(input_text)
            )
        elif warn_count >= 2 or danger_count == 1 or suspicious_url:
            return ScamCheckResult(
                label="warn",
                tips=self._get_warn_tips(input_text)
            )
        else:
            return ScamCheckResult(
                label="safe",
                tips=["지금까지는 의심스러운 내용이 발견되지 않았어요."]
            )
    
    def _get_danger_tips(self, text: str) -> list[str]:
        """
        위험 수준 대응 팁
        """
        tips = [
            "⚠️ 매우 의심스러운 내용이에요!",
            "공공기관(국세청, 경찰청 등)은 문자로 개인정보를 요구하지 않아요.",
            "링크를 절대 클릭하지 마세요.",
            "계좌번호나 비밀번호를 입력하지 마세요.",
        ]
        
        if "환급" in text or "지급" in text:
            tips.append("환급금은 직접 홈페이지나 앱에서 확인하세요.")
        
        if re.search(r"http", text):
            tips.append("의심 링크는 112(경찰)에 신고할 수 있어요.")
        
        return tips
    
    def _get_warn_tips(self, text: str) -> list[str]:
        """
        경고 수준 대응 팁
        """
        tips = [
            "⚠️ 조금 의심스러운 내용이 있어요.",
            "발신자가 정말 아는 사람인지 확인하세요.",
        ]
        
        if re.search(r"http", text):
            tips.append("링크를 클릭하기 전에 가족에게 물어보세요.")
        
        if "당첨" in text or "무료" in text:
            tips.append("'공짜'는 없어요. 의심해 보세요.")
        
        tips.append("의심되면 절대 클릭하지 말고 삭제하세요.")
        
        return tips
```

### 2) `POST /v1/scam/check` - 사기 검사 엔드포인트

```python
# services/bff-fastapi/app/routers/scam.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.scam_checker import ScamChecker
from app.dependencies import get_current_user, get_supabase

router = APIRouter(prefix="/v1/scam", tags=["scam"])

class ScamCheckRequest(BaseModel):
    input: str  # 검사할 문자/URL (최대 500자)

@router.post("/check")
async def check_scam(
    body: ScamCheckRequest,
    user_id: str = Depends(get_current_user),
    db = Depends(get_supabase)
):
    """
    사기 문자/URL 검사
    
    Request:
        { "input": "국세청입니다. 환급금을 수령하려면 클릭하세요..." }
    
    Response:
        {
          "ok": true,
          "data": {
            "label": "danger",
            "tips": [
              "⚠️ 매우 의심스러운 내용이에요!",
              "공공기관은 문자로 개인정보를 요구하지 않아요.",
              ...
            ]
          }
        }
    """
    # 입력 길이 체크
    if len(body.input) > 500:
        return {
            "ok": False,
            "error": {
                "code": "INPUT_TOO_LONG",
                "message": "입력이 너무 길어요. 500자 이내로 입력해 주세요."
            }
        }
    
    # 검사 실행
    checker = ScamChecker()
    result = checker.check(body.input)
    
    # (선택사항) DB에 검사 이력 저장
    try:
        db.table('scam_checks').insert({
            'user_id': user_id,
            'input': body.input[:200],  # 일부만 저장 (프라이버시)
            'label': result.label
        }).execute()
    except Exception as e:
        # 로그만 남기고 에러는 무시 (핵심 기능 아님)
        print(f"Failed to save scam check: {e}")
    
    return {
        "ok": True,
        "data": {
            "label": result.label,
            "tips": result.tips
        }
    }
```

---

## 📱 Mobile 구현

### 1) Hook: `useScamCheck`

```typescript
// apps/mobile-rn/src/hooks/useScamCheck.ts
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

interface ScamCheckResult {
  label: 'safe' | 'warn' | 'danger';
  tips: string[];
}

export function useScamCheck() {
  return useMutation({
    mutationFn: async (input: string): Promise<ScamCheckResult> => {
      const response = await apiClient.post('/v1/scam/check', { input });
      
      if (!response.data.ok) {
        throw new Error(response.data.error?.message || '검사에 실패했어요.');
      }
      
      return response.data.data;
    },
  });
}
```

### 2) Component: `ScamCheckSheet`

```typescript
// apps/mobile-rn/src/components/ScamCheckSheet.tsx
import React, { useState } from 'react';
import { Modal, View, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Typography, Button, Card } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';
import { useScamCheck } from '@/hooks/useScamCheck';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const LABEL_CONFIG = {
  safe: {
    color: '#4CAF50',
    icon: '✅',
    title: '안전해요',
    bgColor: '#E8F5E9',
  },
  warn: {
    color: '#FF9800',
    icon: '⚠️',
    title: '주의하세요',
    bgColor: '#FFF3E0',
  },
  danger: {
    color: '#F44336',
    icon: '🚨',
    title: '위험해요!',
    bgColor: '#FFEBEE',
  },
};

export default function ScamCheckSheet({ visible, onClose }: Props) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  
  const checkScam = useScamCheck();
  const { spacing, buttonHeight, fontSizes } = useA11y();
  
  const handleCheck = async () => {
    if (!input.trim()) return;
    
    try {
      const data = await checkScam.mutateAsync(input);
      setResult(data);
    } catch (err) {
      // 에러는 useMutation에서 처리
    }
  };
  
  const handleReset = () => {
    setInput('');
    setResult(null);
  };
  
  const handleClose = () => {
    handleReset();
    onClose();
  };
  
  const config = result ? LABEL_CONFIG[result.label] : null;
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.sheet, { padding: spacing * 2 }]}>
          <Typography variant="heading1" fontSize={fontSizes.heading1}>
            🛡️ 사기 검사
          </Typography>
          
          {!result ? (
            <>
              {/* 입력 단계 */}
              <Typography
                variant="body"
                fontSize={fontSizes.body}
                color="#666666"
                style={{ marginTop: spacing }}
              >
                의심스러운 문자나 링크를 붙여넣어 주세요.
              </Typography>
              
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="예: 국세청입니다. 환급금 수령을 위해..."
                style={[
                  styles.input,
                  {
                    marginTop: spacing,
                    padding: spacing,
                    fontSize: fontSizes.body,
                  }
                ]}
                multiline
                numberOfLines={6}
                maxLength={500}
                accessibilityLabel="검사할 문자 입력"
              />
              
              <Typography
                variant="caption"
                fontSize={fontSizes.caption}
                color="#999999"
                style={{ marginTop: spacing / 2 }}
              >
                {input.length}/500자
              </Typography>
              
              <View style={{ flexDirection: 'row', marginTop: spacing * 2 }}>
                <Button
                  onPress={handleClose}
                  variant="outline"
                  height={buttonHeight}
                  style={{ flex: 1, marginRight: spacing / 2 }}
                >
                  취소
                </Button>
                <Button
                  onPress={handleCheck}
                  variant="primary"
                  height={buttonHeight}
                  style={{ flex: 1, marginLeft: spacing / 2 }}
                  disabled={!input.trim() || checkScam.isPending}
                >
                  {checkScam.isPending ? '검사 중...' : '검사하기'}
                </Button>
              </View>
            </>
          ) : (
            <>
              {/* 결과 단계 */}
              <Card
                style={[
                  styles.resultCard,
                  {
                    marginTop: spacing * 2,
                    padding: spacing * 1.5,
                    backgroundColor: config.bgColor,
                    borderLeftWidth: 4,
                    borderLeftColor: config.color,
                  }
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Typography variant="heading1" fontSize={fontSizes.heading1 * 1.5}>
                    {config.icon}
                  </Typography>
                  <Typography
                    variant="heading2"
                    fontSize={fontSizes.heading2}
                    style={{ marginLeft: spacing }}
                    color={config.color}
                  >
                    {config.title}
                  </Typography>
                </View>
              </Card>
              
              <ScrollView style={{ marginTop: spacing * 2, maxHeight: 300 }}>
                {result.tips.map((tip: string, index: number) => (
                  <Card key={index} style={{ marginBottom: spacing }}>
                    <Typography variant="body" fontSize={fontSizes.body}>
                      • {tip}
                    </Typography>
                  </Card>
                ))}
              </ScrollView>
              
              <View style={{ flexDirection: 'row', marginTop: spacing * 2 }}>
                <Button
                  onPress={handleReset}
                  variant="outline"
                  height={buttonHeight}
                  style={{ flex: 1, marginRight: spacing / 2 }}
                >
                  다시 검사
                </Button>
                <Button
                  onPress={handleClose}
                  variant="primary"
                  height={buttonHeight}
                  style={{ flex: 1, marginLeft: spacing / 2 }}
                >
                  확인
                </Button>
              </View>
            </>
          )}
          
          {checkScam.isError && (
            <Typography
              variant="caption"
              fontSize={fontSizes.caption}
              color="#F44336"
              style={{ marginTop: spacing, textAlign: 'center' }}
            >
              {checkScam.error?.message}
            </Typography>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  resultCard: {
    borderRadius: 8,
  },
});
```

### 3) Integration: 설정/도구 화면에 버튼 추가

```typescript
// apps/mobile-rn/src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';
import ScamCheckSheet from '@/components/ScamCheckSheet';

export default function SettingsScreen() {
  const [showScamCheck, setShowScamCheck] = useState(false);
  const { spacing, buttonHeight } = useA11y();
  
  return (
    <View style={styles.container}>
      {/* 기존 설정 항목들 */}
      
      <View style={{ padding: spacing }}>
        <Button
          onPress={() => setShowScamCheck(true)}
          variant="secondary"
          height={buttonHeight}
          accessibilityLabel="사기 문자 검사하기"
        >
          🛡️ 사기 검사
        </Button>
      </View>
      
      <ScamCheckSheet
        visible={showScamCheck}
        onClose={() => setShowScamCheck(false)}
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

## 🌐 Web 구현 (선택사항)

### 대시보드: 최근 위험 검사 알림

```typescript
// apps/web-console/app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();
  
  // 최근 7일간 위험 판정 건수
  const { data: dangerChecks } = await supabase
    .from('scam_checks')
    .select('user_id, created_at, users(name)')
    .eq('label', 'danger')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(10);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">대시보드</h1>
      
      {dangerChecks && dangerChecks.length > 0 && (
        <div className="mt-6 border-l-4 border-red-500 bg-red-50 p-4 rounded">
          <h2 className="font-semibold text-red-700">🚨 최근 위험 검사</h2>
          <ul className="mt-2 space-y-1">
            {dangerChecks.map((check) => (
              <li key={check.created_at} className="text-sm">
                {check.users.name}님 - {new Date(check.created_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-red-600">
            가족에게 연락하여 확인해 보세요.
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## ✅ 테스트 체크리스트

### BFF 테스트
```bash
# 위험 케이스
curl -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"input":"국세청입니다. 환급금 수령을 위해 클릭하세요 http://bit.ly/abc123"}' \
  http://localhost:8000/v1/scam/check

# 예상: label="danger", tips 배열 포함
```

- [ ] 위험 키워드 2개 이상 → `danger`
- [ ] 경고 키워드 2개 → `warn`
- [ ] 의심 URL 패턴 → `warn` 또는 `danger`
- [ ] 정상 텍스트 → `safe`
- [ ] 500자 초과 입력 → 에러

### Mobile 테스트
- [ ] 사기 검사 버튼 → Sheet 표시
- [ ] 긴 텍스트 입력 → 스크롤 가능
- [ ] 500자 제한 표시
- [ ] 검사 중 로딩 상태
- [ ] 결과 화면: 신호등 색상 표시
- [ ] 팁 목록 스크롤 가능
- [ ] 다시 검사 / 확인 버튼 동작

### 사기 패턴 테스트
```typescript
const testCases = [
  {
    input: "국세청입니다. 환급금을 받으려면 클릭하세요.",
    expected: "danger"
  },
  {
    input: "당첨되었습니다! 무료로 상품을 받으세요.",
    expected: "warn"
  },
  {
    input: "안녕하세요. 점심 드셨나요?",
    expected: "safe"
  },
];
```

---

## 🔗 다음 단계

Scam Check 완료 후:
- **다음**: [06. Tool Tracks](./06-tool-tracks.md)
- **병렬 작업 가능**: [07. Community Q&A](./07-community-qna.md)

---

**문서 작성**: AI Implementation Guide  
**최종 업데이트**: 2025년 11월 13일
