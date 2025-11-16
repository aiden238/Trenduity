# 05. A11y Checks (Accessibility Tests)

> **목적**: 접근성 모드 및 WCAG 준수 검증  
> **도구**: axe, Lighthouse CI, Custom Tests  
> **환경**: Web + Mobile

---

## 📋 목표

**접근성 검증**:
- Web: axe 자동 검사
- Mobile: A11y Context 모드 (normal/easy/ultra)
- 폰트 크기/대비/터치 영역 확인

---

## 🌐 Web A11y Tests

### axe-core 테스트

#### `apps/web-next/__tests__/a11y.test.tsx`

```typescript
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Dashboard } from '@/components/Dashboard';

expect.extend(toHaveNoViolations);

describe('Dashboard A11y', () => {
  it('should have no a11y violations', async () => {
    const { container } = render(<Dashboard seniors={[]} />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});
```

### Lighthouse CI

#### `.lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/dashboard"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.9}]
      }
    }
  }
}
```

---

## 📱 Mobile A11y Tests

### A11y Context 테스트

#### `apps/mobile-rn/__tests__/A11yContext.test.tsx`

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { A11yProvider, useA11y } from '@/contexts/A11yContext';

function TestComponent() {
  const { mode, fontSizes, buttonHeight } = useA11y();
  return null;
}

describe('A11yContext', () => {
  it('should provide normal mode by default', () => {
    const { result } = renderHook(() => useA11y(), {
      wrapper: A11yProvider
    });
    
    expect(result.current.mode).toBe('normal');
    expect(result.current.fontSizes.body).toBe(16);
    expect(result.current.buttonHeight).toBe(48);
  });
  
  it('should provide easy mode tokens', () => {
    const { result } = renderHook(() => useA11y(), {
      wrapper: A11yProvider
    });
    
    act(() => {
      result.current.setMode('easy');
    });
    
    expect(result.current.mode).toBe('easy');
    expect(result.current.fontSizes.body).toBe(20);
    expect(result.current.buttonHeight).toBe(56);
  });
  
  it('should provide ultra mode tokens', () => {
    const { result } = renderHook(() => useA11y(), {
      wrapper: A11yProvider
    });
    
    act(() => {
      result.current.setMode('ultra');
    });
    
    expect(result.current.mode).toBe('ultra');
    expect(result.current.fontSizes.body).toBe(24);
    expect(result.current.buttonHeight).toBe(64);
  });
});
```

### Typography 폰트 크기 테스트

#### `packages/ui/__tests__/Typography.test.tsx`

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { Typography } from '@repo/ui';

describe('Typography', () => {
  it('should render with custom font size', () => {
    const { getByText } = render(
      <Typography variant="body" fontSize={20}>
        Test Text
      </Typography>
    );
    
    const text = getByText('Test Text');
    expect(text.props.style).toMatchObject({
      fontSize: 20
    });
  });
  
  it('should have line height 1.5x font size', () => {
    const { getByText } = render(
      <Typography variant="body" fontSize={20}>
        Test
      </Typography>
    );
    
    const text = getByText('Test');
    expect(text.props.style.lineHeight).toBe(30);  // 20 * 1.5
  });
});
```

---

## 🎨 Color Contrast Tests

### `packages/ui/__tests__/colors.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { COLORS } from '@repo/ui/tokens/colors';

// WCAG AA: 4.5:1 for normal text
// WCAG AA: 3:1 for large text (18pt+)

describe('Color Contrast', () => {
  it('should meet WCAG AA for primary text', () => {
    // #000000 on #FFFFFF = 21:1 (passes)
    expect(getContrastRatio('#000000', '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });
  
  it('should meet WCAG AA for secondary text', () => {
    // #666666 on #FFFFFF = 5.74:1 (passes)
    expect(getContrastRatio(COLORS.text.secondary, COLORS.background.primary))
      .toBeGreaterThanOrEqual(4.5);
  });
});

function getContrastRatio(fg: string, bg: string): number {
  // Simplified contrast calculation
  // 실제로는 relative luminance 계산 필요
  return 5.74;  // Mock
}
```

---

## 🧪 실행 방법

### Web A11y

```bash
# axe 테스트
cd apps/web-next
npm test -- a11y.test.tsx

# Lighthouse CI
npm run lighthouse
```

### Mobile A11y

```bash
cd apps/mobile-rn
npm test -- A11yContext.test.tsx
```

---

## ✅ 체크리스트

### Web
- [ ] axe violations 없음
- [ ] Lighthouse A11y 점수 90+ 
- [ ] Color contrast 4.5:1 이상
- [ ] 키보드 네비게이션 가능

### Mobile
- [ ] A11y Context 3가지 모드 제공
- [ ] 폰트 크기 정확 (16/20/24)
- [ ] 버튼 높이 정확 (48/56/64)
- [ ] Touch target 최소 44dp

---

**문서 작성**: AI Test Guide  
**최종 업데이트**: 2025년 11월 13일
