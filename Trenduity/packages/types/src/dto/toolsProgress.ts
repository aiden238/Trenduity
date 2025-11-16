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
