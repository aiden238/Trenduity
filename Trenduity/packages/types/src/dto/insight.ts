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
