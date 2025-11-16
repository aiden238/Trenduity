# 02. DTO/Schema Tests (TypeScript Zod)

> **목적**: TypeScript DTO 및 Zod 스키마 검증  
> **도구**: Vitest/Jest  
> **환경**: `packages/types/__tests__/`

---

## 📋 목표

**타입 안정성 보장**:
- Zod 스키마 parse 성공/실패 검증
- 필수 필드 누락 시 에러
- BFF 응답 형태와 일치성

---

## 🧪 Card DTO Tests

### `packages/types/__tests__/card.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { CardSchema, CardCompleteRequestSchema } from '../src/card';

describe('CardSchema', () => {
  it('should parse valid card', () => {
    const validCard = {
      id: '123',
      type: 'ai_tips',
      title: 'Test Card',
      tldr: 'Summary',
      body: 'Content',
      quiz: [],
      estimatedReadMinutes: 3
    };
    
    const result = CardSchema.safeParse(validCard);
    expect(result.success).toBe(true);
  });
  
  it('should reject missing required fields', () => {
    const invalid = {
      id: '123',
      type: 'ai_tips'
      // title 누락
    };
    
    const result = CardSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
  
  it('should reject invalid type enum', () => {
    const invalid = {
      id: '123',
      type: 'invalid_type',  // 잘못된 enum
      title: 'Test'
    };
    
    const result = CardSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('CardCompleteRequestSchema', () => {
  it('should parse valid complete request', () => {
    const valid = {
      cardId: '123',
      quizAnswers: [0, 1, 2],
      readTimeSeconds: 180
    };
    
    const result = CardCompleteRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
```

---

## 💡 Insight DTO Tests

### `packages/types/__tests__/insight.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { InsightSchema, InsightTopicSchema } from '../src/insight';

describe('InsightSchema', () => {
  it('should parse valid insight', () => {
    const valid = {
      id: '123',
      topic: 'ai',
      title: 'Test Insight',
      summary: 'Summary',
      readTimeMinutes: 5,
      isFollowing: false
    };
    
    const result = InsightSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
  
  it('should validate topic enum', () => {
    const validTopics = ['ai', 'bigtech', 'economy', 'safety', 'mobile101'];
    
    validTopics.forEach(topic => {
      const result = InsightTopicSchema.safeParse(topic);
      expect(result.success).toBe(true);
    });
  });
});
```

---

## 🎤 Voice Intent DTO Tests

### `packages/types/__tests__/voice.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { VoiceIntentRequestSchema, VoiceIntentResponseSchema } from '../src/voice';

describe('VoiceIntentRequestSchema', () => {
  it('should parse valid request', () => {
    const valid = {
      text: '엄마에게 전화해 줘'
    };
    
    const result = VoiceIntentRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
  
  it('should reject empty text', () => {
    const invalid = {
      text: ''
    };
    
    const result = VoiceIntentRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('VoiceIntentResponseSchema', () => {
  it('should parse valid response', () => {
    const valid = {
      intent: 'call',
      slots: {
        target: '엄마'
      },
      summary: '엄마에게 전화합니다',
      confidence: 0.9
    };
    
    const result = VoiceIntentResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
```

---

## 🚨 Scam Check DTO Tests

### `packages/types/__tests__/scam.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { ScamCheckRequestSchema, ScamCheckResponseSchema } from '../src/scam';

describe('ScamCheckRequestSchema', () => {
  it('should parse SMS check', () => {
    const valid = {
      text: '[긴급] 확인 필요',
      url: null
    };
    
    const result = ScamCheckRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
  
  it('should parse URL check', () => {
    const valid = {
      text: null,
      url: 'http://bit.ly/xxx'
    };
    
    const result = ScamCheckRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});

describe('ScamCheckResponseSchema', () => {
  it('should parse valid response', () => {
    const valid = {
      riskLevel: 'danger',
      matchedPatterns: ['긴급', '단축URL'],
      tips: ['모르는 링크는 클릭하지 마세요']
    };
    
    const result = ScamCheckResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
  
  it('should validate risk level enum', () => {
    const validLevels = ['safe', 'warn', 'danger'];
    
    validLevels.forEach(level => {
      const response = {
        riskLevel: level,
        matchedPatterns: [],
        tips: []
      };
      
      const result = ScamCheckResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });
  });
});
```

---

## ✅ 실행 방법

```bash
# packages/types에서
cd packages/types
npm test

# 또는 루트에서
pnpm test --filter @repo/types

# Watch 모드
npm test -- --watch

# 커버리지
npm test -- --coverage
```

---

## 📝 체크리스트

- [ ] CardSchema 테스트
- [ ] InsightSchema 테스트
- [ ] VoiceIntentSchema 테스트
- [ ] ScamCheckSchema 테스트
- [ ] QnASchema 테스트
- [ ] GamificationSchema 테스트
- [ ] 모든 enum 검증
- [ ] 필수 필드 누락 케이스

---

**문서 작성**: AI Test Guide  
**최종 업데이트**: 2025년 11월 13일
