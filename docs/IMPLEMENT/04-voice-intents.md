# 04. Voice Intents (음성 인텐트)

> **기능**: 6가지 음성 명령 처리 (전화, 문자, 검색, 알림, 길찾기, 앱 열기)  
> **우선순위**: 🟡 SHOULD (Week 3)  
> **의존성**: [01-implementation-rules.md](./01-implementation-rules.md)

---

## 📋 목표

50-70대 사용자가 **음성으로 스마트폰 기능을 실행**할 수 있도록 합니다.

**핵심 가치**:
- 🎤 **간단한 명령어**: "엄마한테 전화해", "날씨 검색"
- 🧠 **한국어 파싱**: 정규식 기반의 간단하고 명확한 인텐트 추출
- 🔄 **확인 UI**: 실행 전 한 번 더 확인
- 📱 **네이티브 연동**: 전화/문자/지도 앱 실행

---

## 🗂️ 지원 인텐트

| 인텐트 | 예시 명령 | 슬롯 | 액션 |
|--------|-----------|------|------|
| **call** | "엄마한테 전화해" | name | `tel:` URI 또는 연락처 조회 |
| **sms** | "아들한테 문자 보내" | name, message | SMS 앱 열기 |
| **search** | "오늘 날씨 검색" | query | 구글/네이버 검색 |
| **remind** | "내일 병원 알려줘" | text, time | (미구현 stub) |
| **navigate** | "서울역 길찾기" | destination | 지도 앱 열기 |
| **open** | "인사이트 열어줘" | target | 앱 내 화면 이동 |

---

## 🔧 BFF 구현

### 1) `services/voice_parser.py` - 인텐트 파싱

```python
# services/bff-fastapi/app/services/voice_parser.py
import re
from typing import Literal

IntentType = Literal["call", "sms", "search", "remind", "navigate", "open"]

class ParsedIntent:
    def __init__(
        self,
        intent: IntentType,
        slots: dict,
        confidence: float = 1.0
    ):
        self.intent = intent
        self.slots = slots
        self.confidence = confidence

class VoiceParser:
    """
    한국어 음성 명령을 파싱하여 인텐트 추출
    
    Example:
        parser = VoiceParser()
        result = parser.parse("엄마한테 전화해")
        # ParsedIntent(intent="call", slots={"name": "엄마"})
    """
    
    # 패턴 정의 (정규식)
    PATTERNS = {
        "call": [
            r"(.+)(한테|에게|께)\s*(전화|통화)(해|하자|할게)",
            r"(.+)\s*(전화)(해|하자|걸어)",
        ],
        "sms": [
            r"(.+)(한테|에게)\s*(문자|메시지)(해|보내|보낼게)",
        ],
        "search": [
            r"(.+)\s*(검색|찾아|알려)",
        ],
        "remind": [
            r"(.+)\s*(알려|알림|리마인드)",
        ],
        "navigate": [
            r"(.+)\s*(길찾기|가는 길|네비게이션)",
        ],
        "open": [
            r"(인사이트|카드|커뮤니티|설정)\s*(열어|보여|가자)",
        ],
    }
    
    def parse(self, text: str) -> ParsedIntent | None:
        """
        음성 텍스트를 파싱하여 인텐트 추출
        
        Args:
            text: 음성 인식 결과 (한국어)
        
        Returns:
            ParsedIntent or None
        """
        text = text.strip()
        
        # 각 인텐트별 패턴 매칭
        for intent, patterns in self.PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, text)
                if match:
                    slots = self._extract_slots(intent, match)
                    return ParsedIntent(intent=intent, slots=slots)
        
        # 매칭 실패
        return None
    
    def _extract_slots(self, intent: str, match: re.Match) -> dict:
        """
        정규식 매치 결과에서 슬롯 추출
        """
        if intent == "call":
            return {"name": match.group(1).strip()}
        
        elif intent == "sms":
            name = match.group(1).strip()
            # TODO: 메시지 내용 추출 (별도 프롬프트 필요)
            return {"name": name, "message": None}
        
        elif intent == "search":
            return {"query": match.group(1).strip()}
        
        elif intent == "remind":
            return {"text": match.group(1).strip(), "time": None}
        
        elif intent == "navigate":
            return {"destination": match.group(1).strip()}
        
        elif intent == "open":
            target = match.group(1).strip()
            return {"target": target}
        
        return {}
    
    def to_action(self, parsed: ParsedIntent) -> dict:
        """
        ParsedIntent를 실행 가능한 액션으로 변환
        
        Returns:
            {
                "kind": "tel" | "sms" | "url" | "route" | "reminder",
                "uri": "tel:010-1234-5678" (optional),
                "route": "/insights" (optional),
                ...
            }
        """
        if parsed.intent == "call":
            name = parsed.slots.get("name")
            # 실제로는 연락처 DB 조회 필요
            # MVP에서는 단순히 이름만 반환
            return {
                "kind": "contact_lookup",
                "name": name,
                "hint": f"{name}님의 연락처를 찾아주세요."
            }
        
        elif parsed.intent == "sms":
            name = parsed.slots.get("name")
            return {
                "kind": "sms",
                "name": name,
                "hint": f"{name}님께 문자를 보내세요."
            }
        
        elif parsed.intent == "search":
            query = parsed.slots.get("query")
            return {
                "kind": "url",
                "url": f"https://www.google.com/search?q={query}",
                "hint": f"'{query}' 검색 결과를 엽니다."
            }
        
        elif parsed.intent == "remind":
            return {
                "kind": "reminder",
                "text": parsed.slots.get("text"),
                "hint": "알림 기능은 곧 지원 예정이에요."
            }
        
        elif parsed.intent == "navigate":
            destination = parsed.slots.get("destination")
            return {
                "kind": "url",
                "url": f"https://map.naver.com/v5/search/{destination}",
                "hint": f"{destination} 길찾기를 시작해요."
            }
        
        elif parsed.intent == "open":
            target = parsed.slots.get("target")
            route_map = {
                "인사이트": "/insights",
                "카드": "/home",
                "커뮤니티": "/community",
                "설정": "/settings"
            }
            return {
                "kind": "route",
                "route": route_map.get(target, "/home"),
                "hint": f"{target} 화면으로 이동해요."
            }
        
        return {"kind": "unknown"}
```

### 2) `POST /v1/voice/intent` - 인텐트 파싱 엔드포인트

```python
# services/bff-fastapi/app/routers/voice.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.voice_parser import VoiceParser

router = APIRouter(prefix="/v1/voice", tags=["voice"])

class ParseIntentRequest(BaseModel):
    text: str  # 음성 인식 결과

@router.post("/intent")
async def parse_intent(body: ParseIntentRequest):
    """
    음성 텍스트를 파싱하여 인텐트 추출
    
    Request:
        { "text": "엄마한테 전화해" }
    
    Response:
        {
          "ok": true,
          "data": {
            "intent": "call",
            "slots": { "name": "엄마" },
            "action": {
              "kind": "contact_lookup",
              "name": "엄마",
              "hint": "엄마님의 연락처를 찾아주세요."
            },
            "summary": "엄마님께 전화 걸기"
          }
        }
    """
    parser = VoiceParser()
    parsed = parser.parse(body.text)
    
    if not parsed:
        return {
            "ok": False,
            "error": {
                "code": "INTENT_NOT_RECOGNIZED",
                "message": "음성 명령을 이해하지 못했어요. 다시 말씀해 주세요."
            }
        }
    
    action = parser.to_action(parsed)
    summary = _generate_summary(parsed)
    
    return {
        "ok": True,
        "data": {
            "intent": parsed.intent,
            "slots": parsed.slots,
            "action": action,
            "summary": summary
        }
    }

def _generate_summary(parsed) -> str:
    """
    사용자 친화적인 요약 문장 생성
    """
    if parsed.intent == "call":
        return f"{parsed.slots['name']}님께 전화 걸기"
    elif parsed.intent == "sms":
        return f"{parsed.slots['name']}님께 문자 보내기"
    elif parsed.intent == "search":
        return f"'{parsed.slots['query']}' 검색하기"
    elif parsed.intent == "remind":
        return f"'{parsed.slots['text']}' 알림 설정"
    elif parsed.intent == "navigate":
        return f"{parsed.slots['destination']} 길찾기"
    elif parsed.intent == "open":
        return f"{parsed.slots['target']} 열기"
    return "명령 실행"
```

---

## 📱 Mobile 구현

### 1) Hook: `useVoiceIntent`

```typescript
// apps/mobile-rn/src/hooks/useVoiceIntent.ts
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

interface ParsedIntent {
  intent: string;
  slots: Record<string, any>;
  action: {
    kind: 'contact_lookup' | 'sms' | 'url' | 'route' | 'reminder' | 'unknown';
    name?: string;
    url?: string;
    route?: string;
    hint?: string;
  };
  summary: string;
}

export function useVoiceIntent() {
  return useMutation({
    mutationFn: async (text: string): Promise<ParsedIntent> => {
      const response = await apiClient.post('/v1/voice/intent', { text });
      
      if (!response.data.ok) {
        throw new Error(response.data.error?.message || '음성 명령을 이해하지 못했어요.');
      }
      
      return response.data.data;
    },
  });
}
```

### 2) Component: `VoiceOverlay`

```typescript
// apps/mobile-rn/src/components/VoiceOverlay.tsx
import React, { useState } from 'react';
import { Modal, View, StyleSheet, TextInput, Linking } from 'react-native';
import { Typography, Button } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';
import { useVoiceIntent } from '@/hooks/useVoiceIntent';
import { useNavigation } from '@react-navigation/native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function VoiceOverlay({ visible, onClose }: Props) {
  const [inputText, setInputText] = useState('');
  const [parsedIntent, setParsedIntent] = useState<any>(null);
  
  const parseIntent = useVoiceIntent();
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const navigation = useNavigation();
  
  const handleParse = async () => {
    try {
      const result = await parseIntent.mutateAsync(inputText);
      setParsedIntent(result);
    } catch (err) {
      // 에러는 useMutation에서 처리
    }
  };
  
  const handleConfirm = () => {
    if (!parsedIntent) return;
    
    const { action } = parsedIntent;
    
    // 액션 실행
    if (action.kind === 'route') {
      navigation.navigate(action.route);
    } else if (action.kind === 'url') {
      Linking.openURL(action.url);
    } else if (action.kind === 'contact_lookup') {
      // TODO: 연락처 앱 연동 (실제 구현 필요)
      alert(`${action.name}님의 연락처를 찾아주세요.`);
    } else if (action.kind === 'sms') {
      // TODO: SMS 앱 연동
      alert(`${action.name}님께 문자를 보내세요.`);
    } else if (action.kind === 'reminder') {
      alert('알림 기능은 곧 지원 예정이에요.');
    }
    
    // 닫기
    handleClose();
  };
  
  const handleClose = () => {
    setInputText('');
    setParsedIntent(null);
    onClose();
  };
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modal, { padding: spacing * 2 }]}>
          <Typography variant="heading1" fontSize={fontSizes.heading1}>
            🎤 음성 명령
          </Typography>
          
          {!parsedIntent ? (
            <>
              {/* 입력 단계 */}
              <Typography
                variant="body"
                fontSize={fontSizes.body}
                color="#666666"
                style={{ marginTop: spacing }}
              >
                무엇을 도와드릴까요?
              </Typography>
              
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="예: 엄마한테 전화해"
                style={[
                  styles.input,
                  {
                    marginTop: spacing,
                    padding: spacing,
                    fontSize: fontSizes.body,
                  }
                ]}
                multiline
                autoFocus
                accessibilityLabel="음성 명령 입력"
              />
              
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
                  onPress={handleParse}
                  variant="primary"
                  height={buttonHeight}
                  style={{ flex: 1, marginLeft: spacing / 2 }}
                  disabled={!inputText.trim() || parseIntent.isPending}
                >
                  {parseIntent.isPending ? '분석 중...' : '확인'}
                </Button>
              </View>
            </>
          ) : (
            <>
              {/* 확인 단계 */}
              <Typography
                variant="body"
                fontSize={fontSizes.body}
                style={{ marginTop: spacing * 2 }}
              >
                다음 명령을 실행할까요?
              </Typography>
              
              <View style={[styles.intentCard, { marginTop: spacing, padding: spacing }]}>
                <Typography
                  variant="heading2"
                  fontSize={fontSizes.heading2}
                  color="#2196F3"
                >
                  {parsedIntent.summary}
                </Typography>
                
                {parsedIntent.action.hint && (
                  <Typography
                    variant="caption"
                    fontSize={fontSizes.caption}
                    color="#666666"
                    style={{ marginTop: spacing / 2 }}
                  >
                    {parsedIntent.action.hint}
                  </Typography>
                )}
              </View>
              
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
                  onPress={handleConfirm}
                  variant="primary"
                  height={buttonHeight}
                  style={{ flex: 1, marginLeft: spacing / 2 }}
                >
                  실행
                </Button>
              </View>
            </>
          )}
          
          {parseIntent.isError && (
            <Typography
              variant="caption"
              fontSize={fontSizes.caption}
              color="#F44336"
              style={{ marginTop: spacing, textAlign: 'center' }}
            >
              {parseIntent.error?.message}
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
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 300,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    minHeight: 80,
  },
  intentCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
});
```

### 3) Integration: 홈 화면에 버튼 추가

```typescript
// apps/mobile-rn/src/screens/HomeAScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@repo/ui';
import { useA11y } from '@/contexts/A11yContext';
import VoiceOverlay from '@/components/VoiceOverlay';

export default function HomeAScreen() {
  const [showVoice, setShowVoice] = useState(false);
  const { spacing, buttonHeight } = useA11y();
  
  return (
    <View style={styles.container}>
      {/* 기존 콘텐츠 */}
      
      {/* 플로팅 음성 버튼 */}
      <View style={styles.fab}>
        <Button
          onPress={() => setShowVoice(true)}
          variant="primary"
          height={buttonHeight * 1.5}
          style={{ borderRadius: buttonHeight * 0.75 }}
          accessibilityLabel="음성 명령 시작"
        >
          🎤 말하기
        </Button>
      </View>
      
      <VoiceOverlay
        visible={showVoice}
        onClose={() => setShowVoice(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
});
```

---

## ✅ 테스트 체크리스트

### BFF 테스트
```bash
# 인텐트 파싱
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"엄마한테 전화해"}' \
  http://localhost:8000/v1/voice/intent

# 예상 응답
{
  "ok": true,
  "data": {
    "intent": "call",
    "slots": {"name": "엄마"},
    "action": {"kind": "contact_lookup", "name": "엄마"},
    "summary": "엄마님께 전화 걸기"
  }
}
```

- [ ] 6가지 인텐트 모두 테스트
- [ ] 인식 실패 케이스 (알 수 없는 명령)
- [ ] 한국어 띄어쓰기 변형 테스트

### Mobile 테스트
- [ ] 플로팅 버튼 클릭 → 오버레이 표시
- [ ] 텍스트 입력 → 인텐트 파싱 성공
- [ ] 요약 문장 표시 확인
- [ ] 실행 버튼 → 적절한 액션 (route/url/alert)
- [ ] 취소 버튼 → 오버레이 닫기

### 파싱 정확도 테스트
```typescript
// 테스트 케이스
const testCases = [
  { input: "엄마한테 전화해", expected: "call" },
  { input: "아들에게 문자 보내", expected: "sms" },
  { input: "오늘 날씨 검색", expected: "search" },
  { input: "서울역 길찾기", expected: "navigate" },
  { input: "인사이트 열어줘", expected: "open" },
];
```

---

## 🔗 다음 단계

Voice Intents 완료 후:
- **다음**: [05. Scam Check](./05-scam-check.md)
- **병렬 작업 가능**: [06. Tool Tracks](./06-tool-tracks.md)

---

**문서 작성**: AI Implementation Guide  
**최종 업데이트**: 2025년 11월 13일
