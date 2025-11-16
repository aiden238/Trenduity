# 03. Component Tests (React Testing Library)

> **목적**: React Native/Next.js 컴포넌트 렌더링 및 상호작용 테스트  
> **도구**: React Testing Library, Jest  
> **환경**: `apps/mobile-rn/__tests__/`, `apps/web-next/__tests__/`

---

## 📋 목표

**컴포넌트 검증**:
- 정상 렌더링
- 사용자 상호작용 (버튼 클릭, 입력)
- Props 전달 및 콜백 호출

---

## 📱 Mobile Component Tests

### Daily Card Component

#### `apps/mobile-rn/__tests__/TodayCardScreen.test.tsx`

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TodayCardScreen } from '@/screens/TodayCardScreen';

const mockCard = {
  id: '123',
  type: 'ai_tips',
  title: 'Test Card',
  body: 'Test content',
  quiz: [
    {
      question: 'Test question',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: 'Test'
    }
  ]
};

describe('TodayCardScreen', () => {
  it('should render card title and body', () => {
    const { getByText } = render(<TodayCardScreen card={mockCard} />);
    
    expect(getByText('Test Card')).toBeTruthy();
    expect(getByText('Test content')).toBeTruthy();
  });
  
  it('should render quiz options', () => {
    const { getByText } = render(<TodayCardScreen card={mockCard} />);
    
    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    expect(getByText('C')).toBeTruthy();
    expect(getByText('D')).toBeTruthy();
  });
  
  it('should call onComplete when quiz answered', async () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <TodayCardScreen card={mockCard} onComplete={onComplete} />
    );
    
    // 정답 선택
    fireEvent.press(getByText('A'));
    
    // 완료 버튼
    const completeButton = getByText('완료');
    fireEvent.press(completeButton);
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith({
        quizAnswers: [0],
        readTimeSeconds: expect.any(Number)
      });
    });
  });
});
```

### Voice Overlay Component

#### `apps/mobile-rn/__tests__/VoiceOverlay.test.tsx`

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VoiceOverlay } from '@/components/VoiceOverlay';

const mockIntentResult = {
  intent: 'call',
  summary: '엄마에게 전화합니다',
  slots: { target: '엄마' }
};

describe('VoiceOverlay', () => {
  it('should display intent summary', () => {
    const { getByText } = render(
      <VoiceOverlay 
        visible={true}
        intentResult={mockIntentResult}
      />
    );
    
    expect(getByText('엄마에게 전화합니다')).toBeTruthy();
  });
  
  it('should call onConfirm when confirm button pressed', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <VoiceOverlay 
        visible={true}
        intentResult={mockIntentResult}
        onConfirm={onConfirm}
      />
    );
    
    fireEvent.press(getByText('확인'));
    
    expect(onConfirm).toHaveBeenCalledWith(mockIntentResult);
  });
});
```

---

## 🌐 Web Component Tests

### Dashboard Component

#### `apps/web-next/__tests__/Dashboard.test.tsx`

```typescript
import React from 'react';
import { render } from '@testing-library/react';
import { Dashboard } from '@/components/Dashboard';

const mockSeniors = [
  {
    id: '1',
    name: '김민수 (50대)',
    lastActive: '2025-11-12T10:00:00Z',
    stats: {
      cardsRead: 7,
      currentStreak: 5
    }
  }
];

describe('Dashboard', () => {
  it('should render seniors list', () => {
    const { getByText } = render(<Dashboard seniors={mockSeniors} />);
    
    expect(getByText('김민수 (50대)')).toBeTruthy();
  });
  
  it('should display stats', () => {
    const { getByText } = render(<Dashboard seniors={mockSeniors} />);
    
    expect(getByText(/7/)).toBeTruthy();  // cards read
    expect(getByText(/5/)).toBeTruthy();  // streak
  });
  
  it('should show empty state when no seniors', () => {
    const { getByText } = render(<Dashboard seniors={[]} />);
    
    expect(getByText(/연동된 가족이 없습니다/)).toBeTruthy();
  });
});
```

---

## 🧪 실행 방법

```bash
# Mobile
cd apps/mobile-rn
npm test

# Web
cd apps/web-next
npm test

# Watch 모드
npm test -- --watch

# 특정 파일만
npm test TodayCardScreen.test.tsx
```

---

## ✅ 체크리스트

### Mobile
- [ ] TodayCardScreen 렌더링
- [ ] Quiz 상호작용
- [ ] VoiceOverlay 렌더링
- [ ] InsightCard 렌더링
- [ ] ScamCheckSheet 렌더링

### Web
- [ ] Dashboard 렌더링
- [ ] Senior 통계 표시
- [ ] Empty state 표시

---

**문서 작성**: AI Test Guide  
**최종 업데이트**: 2025년 11월 13일
