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
