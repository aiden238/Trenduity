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
