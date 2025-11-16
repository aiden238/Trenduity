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
