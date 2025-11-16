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
