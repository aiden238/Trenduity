# 02. Shared Packages - 공유 패키지 구성

> UI 컴포넌트 및 타입 정의 패키지 생성

---

## 📋 목표

- **packages/ui**: 디자인 토큰 및 기본 UI 컴포넌트
- **packages/types**: 공유 TypeScript 타입 및 Zod 스키마
- 모바일(RN)과 웹(Next.js) 모두에서 사용 가능한 구조

---

## 🗂️ 폴더 구조

```
packages/
├── ui/
│   ├── src/
│   │   ├── tokens/
│   │   │   └── a11y.ts          # 접근성 토큰
│   │   ├── components/
│   │   │   ├── Typography.tsx   # 텍스트 컴포넌트
│   │   │   ├── Button.tsx       # 버튼 컴포넌트
│   │   │   ├── Card.tsx         # 카드 컴포넌트
│   │   │   └── SectionHeader.tsx # 섹션 헤더
│   │   └── index.ts             # 메인 export
│   ├── package.json
│   └── tsconfig.json
└── types/
    ├── src/
    │   ├── dto/
    │   │   ├── card.ts          # 카드 DTO
    │   │   ├── insight.ts       # 인사이트 DTO
    │   │   ├── qna.ts           # Q&A DTO
    │   │   ├── reaction.ts      # 반응 DTO
    │   │   ├── toolsProgress.ts # 도구 진행도 DTO
    │   │   └── gamification.ts  # 게임화 DTO
    │   └── index.ts             # 메인 export
    ├── package.json
    └── tsconfig.json
```

---

## 📦 Package 1: packages/ui

### package.json

```json
{
  "name": "@repo/ui",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.72.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.2.0"
  }
}
```

---

### src/tokens/a11y.ts

**목적**: 접근성 모드별 디자인 토큰 정의

```typescript
/**
 * 접근성 모드 타입
 */
export type A11yMode = 'normal' | 'easy' | 'ultra';

/**
 * 접근성 토큰 인터페이스
 */
export interface A11yTokens {
  fontSize: {
    small: number;
    body: number;
    title: number;
    heading: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  touchTarget: {
    minWidth: number;
    minHeight: number;
  };
  colors: {
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    background: {
      primary: string;
      secondary: string;
    };
    border: string;
  };
}

/**
 * 접근성 모드별 토큰
 */
export const a11yTokens: Record<A11yMode, A11yTokens> = {
  normal: {
    fontSize: {
      small: 12,
      body: 16,
      title: 20,
      heading: 24,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    touchTarget: {
      minWidth: 44,
      minHeight: 44,
    },
    colors: {
      text: {
        primary: '#000000',
        secondary: '#666666',
        disabled: '#999999',
      },
      background: {
        primary: '#FFFFFF',
        secondary: '#F5F5F5',
      },
      border: '#E0E0E0',
    },
  },
  easy: {
    fontSize: {
      small: 14,
      body: 20,
      title: 24,
      heading: 28,
    },
    spacing: {
      xs: 6,
      sm: 12,
      md: 20,
      lg: 28,
      xl: 40,
    },
    touchTarget: {
      minWidth: 60,
      minHeight: 60,
    },
    colors: {
      text: {
        primary: '#000000',
        secondary: '#555555',
        disabled: '#888888',
      },
      background: {
        primary: '#FFFFFF',
        secondary: '#F0F0F0',
      },
      border: '#CCCCCC',
    },
  },
  ultra: {
    fontSize: {
      small: 18,
      body: 28,
      title: 32,
      heading: 40,
    },
    spacing: {
      xs: 8,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 48,
    },
    touchTarget: {
      minWidth: 80,
      minHeight: 80,
    },
    colors: {
      text: {
        primary: '#000000',
        secondary: '#444444',
        disabled: '#777777',
      },
      background: {
        primary: '#FFFFFF',
        secondary: '#EEEEEE',
      },
      border: '#BBBBBB',
    },
  },
};

/**
 * 현재 모드의 토큰 가져오기
 */
export const getA11yTokens = (mode: A11yMode = 'normal'): A11yTokens => {
  return a11yTokens[mode];
};
```

---

### src/components/Typography.tsx

**목적**: 접근성 모드를 반영한 텍스트 컴포넌트

```typescript
import React from 'react';
import { Text, TextStyle } from 'react-native';
import { A11yMode, getA11yTokens } from '../tokens/a11y';

export interface TypographyProps {
  variant?: 'small' | 'body' | 'title' | 'heading';
  mode?: A11yMode;
  children: React.ReactNode;
  style?: TextStyle;
}

/**
 * Typography 컴포넌트
 * 
 * TODO(IMPLEMENT): A11y Context에서 mode 자동 주입
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  mode = 'normal',
  children,
  style,
}) => {
  const tokens = getA11yTokens(mode);
  const fontSize = tokens.fontSize[variant];

  return (
    <Text
      style={[
        {
          fontSize,
          color: tokens.colors.text.primary,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
```

---

### src/components/Button.tsx

**목적**: 큰 터치 영역을 가진 버튼 컴포넌트

```typescript
import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { A11yMode, getA11yTokens } from '../tokens/a11y';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  mode?: A11yMode;
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Button 컴포넌트
 * 
 * TODO(IMPLEMENT): A11y Context에서 mode 자동 주입
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  mode = 'normal',
  onPress,
  children,
  disabled = false,
  style,
}) => {
  const tokens = getA11yTokens(mode);

  const buttonStyle: ViewStyle = {
    minWidth: tokens.touchTarget.minWidth,
    minHeight: tokens.touchTarget.minHeight,
    backgroundColor: variant === 'primary' ? '#007AFF' : '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    opacity: disabled ? 0.5 : 1,
  };

  const textStyle: TextStyle = {
    fontSize: tokens.fontSize.body,
    color: variant === 'primary' ? '#FFFFFF' : '#000000',
    fontWeight: '600',
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};
```

---

### src/components/Card.tsx

**목적**: 일일 카드, 인사이트 등에 사용할 카드 컴포넌트

```typescript
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { A11yMode, getA11yTokens } from '../tokens/a11y';

export interface CardProps {
  mode?: A11yMode;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Card 컴포넌트
 * 
 * TODO(IMPLEMENT): elevation/shadow 추가
 */
export const Card: React.FC<CardProps> = ({
  mode = 'normal',
  children,
  style,
}) => {
  const tokens = getA11yTokens(mode);

  const cardStyle: ViewStyle = {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.spacing.md,
  };

  return <View style={[cardStyle, style]}>{children}</View>;
};
```

---

### src/components/SectionHeader.tsx

**목적**: 화면 섹션 헤더

```typescript
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Typography } from './Typography';
import { A11yMode, getA11yTokens } from '../tokens/a11y';

export interface SectionHeaderProps {
  title: string;
  mode?: A11yMode;
  style?: ViewStyle;
}

/**
 * SectionHeader 컴포넌트
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  mode = 'normal',
  style,
}) => {
  const tokens = getA11yTokens(mode);

  return (
    <View style={[{ marginBottom: tokens.spacing.md }, style]}>
      <Typography variant="heading" mode={mode}>
        {title}
      </Typography>
    </View>
  );
};
```

---

### src/index.ts

```typescript
// Tokens
export * from './tokens/a11y';

// Components
export * from './components/Typography';
export * from './components/Button';
export * from './components/Card';
export * from './components/SectionHeader';
```

---

## 📦 Package 2: packages/types

### package.json

```json
{
  "name": "@repo/types",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0"
  }
}
```

---

### src/dto/card.ts

```typescript
import { z } from 'zod';

/**
 * 카드 타입
 */
export const CardTypeSchema = z.enum(['ai', 'trend', 'safety', 'mobile']);
export type CardType = z.infer<typeof CardTypeSchema>;

/**
 * 카드 상태
 */
export const CardStatusSchema = z.enum(['pending', 'active', 'completed']);
export type CardStatus = z.infer<typeof CardStatusSchema>;

/**
 * 퀴즈 스키마
 */
export const QuizSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctIdx: z.number(),
  explanation: z.string(),
});
export type Quiz = z.infer<typeof QuizSchema>;

/**
 * 카드 DTO
 */
export const CardDTOSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  date: z.string(), // ISO date
  type: CardTypeSchema,
  title: z.string(),
  tldr: z.string(),
  body: z.string(),
  impact: z.string(),
  quizzes: z.array(QuizSchema),
  status: CardStatusSchema,
  completedAt: z.string().optional(), // ISO datetime
  quizScore: z.number().min(0).max(1).optional(),
});
export type CardDTO = z.infer<typeof CardDTOSchema>;
```

---

### src/dto/insight.ts

```typescript
import { z } from 'zod';

/**
 * 인사이트 토픽
 */
export const InsightTopicSchema = z.enum(['ai', 'bigtech', 'economy', 'safety', 'mobile101']);
export type InsightTopic = z.infer<typeof InsightTopicSchema>;

/**
 * 인사이트 DTO
 */
export const InsightDTOSchema = z.object({
  id: z.string().uuid(),
  topic: InsightTopicSchema,
  title: z.string(),
  body: z.string(),
  publishedAt: z.string(), // ISO datetime
  isPublished: z.boolean(),
  viewCount: z.number().int().nonnegative(),
  usefulCount: z.number().int().nonnegative(),
  cheerCount: z.number().int().nonnegative(),
});
export type InsightDTO = z.infer<typeof InsightDTOSchema>;
```

---

### src/dto/qna.ts

```typescript
import { z } from 'zod';

/**
 * Q&A 주제
 */
export const QnaSubjectSchema = z.enum(['폰', '사기', '도구', '생활']);
export type QnaSubject = z.infer<typeof QnaSubjectSchema>;

/**
 * Q&A DTO
 */
export const QnaDTOSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  subject: QnaSubjectSchema,
  title: z.string().max(100),
  body: z.string().max(1000),
  isAnon: z.boolean(),
  aiSummary: z.string().optional(),
  isDeleted: z.boolean(),
  createdAt: z.string(), // ISO datetime
  updatedAt: z.string(), // ISO datetime
});
export type QnaDTO = z.infer<typeof QnaDTOSchema>;
```

---

### src/dto/reaction.ts

```typescript
import { z } from 'zod';

/**
 * 반응 타입
 */
export const ReactionTypeSchema = z.enum(['cheer', 'useful']);
export type ReactionType = z.infer<typeof ReactionTypeSchema>;

/**
 * 대상 타입
 */
export const TargetTypeSchema = z.enum(['card', 'insight', 'qna_post']);
export type TargetType = z.infer<typeof TargetTypeSchema>;

/**
 * 반응 DTO
 */
export const ReactionDTOSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  targetType: TargetTypeSchema,
  targetId: z.string().uuid(),
  reactionType: ReactionTypeSchema,
  createdAt: z.string(), // ISO datetime
});
export type ReactionDTO = z.infer<typeof ReactionDTOSchema>;
```

---

### src/dto/toolsProgress.ts

```typescript
import { z } from 'zod';

/**
 * 도구 진행도 DTO
 */
export const ToolsProgressDTOSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  trackId: z.string().uuid(),
  stepNum: z.number().int().positive(),
  completedAt: z.string().optional(), // ISO datetime
  unlockedSteps: z.array(z.number().int()),
});
export type ToolsProgressDTO = z.infer<typeof ToolsProgressDTOSchema>;
```

---

### src/dto/gamification.ts

```typescript
import { z } from 'zod';

/**
 * 배지 스키마
 */
export const BadgeSchema = z.object({
  badgeId: z.string(),
  earnedAt: z.string(), // ISO datetime
});
export type Badge = z.infer<typeof BadgeSchema>;

/**
 * 게임화 DTO
 */
export const GamificationDTOSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  points: z.number().int().nonnegative(),
  level: z.number().int().positive(),
  currentStreak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  badges: z.array(BadgeSchema),
  lastActivityDate: z.string(), // ISO date
});
export type GamificationDTO = z.infer<typeof GamificationDTOSchema>;
```

---

### src/index.ts

```typescript
// Card
export * from './dto/card';

// Insight
export * from './dto/insight';

// Q&A
export * from './dto/qna';

// Reaction
export * from './dto/reaction';

// Tools Progress
export * from './dto/toolsProgress';

// Gamification
export * from './dto/gamification';
```

---

## ✅ 작업 체크리스트

### packages/ui
- [ ] `package.json` 생성
- [ ] `tsconfig.json` 생성 (extends ../../tsconfig.base.json)
- [ ] `src/tokens/a11y.ts` 생성
- [ ] `src/components/Typography.tsx` 생성
- [ ] `src/components/Button.tsx` 생성
- [ ] `src/components/Card.tsx` 생성
- [ ] `src/components/SectionHeader.tsx` 생성
- [ ] `src/index.ts` 생성
- [ ] 타입 체크 통과

### packages/types
- [ ] `package.json` 생성
- [ ] `tsconfig.json` 생성
- [ ] `src/dto/card.ts` 생성
- [ ] `src/dto/insight.ts` 생성
- [ ] `src/dto/qna.ts` 생성
- [ ] `src/dto/reaction.ts` 생성
- [ ] `src/dto/toolsProgress.ts` 생성
- [ ] `src/dto/gamification.ts` 생성
- [ ] `src/index.ts` 생성
- [ ] Zod 스키마 검증 확인

---

## 🔗 다음 단계

공유 패키지 설정이 완료되면 **[03-mobile-app.md](./03-mobile-app.md)**로 이동하여 모바일 앱 스켈레톤을 생성합니다.

---

**작성일**: 2025년 11월 13일  
**작성자**: AI Scaffolding Assistant
