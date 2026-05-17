import { z } from "zod/v4";
import { protectedProcedure, router } from "../_core/trpc";
import { updateUserProfile, countCorrectAttempts, getWarrior, getTopicScores, getUserStats } from "../db";

export const profileRouter = router({
  update: protectedProcedure
    .input(
      z.object({
        grade: z.string().optional(),
        region: z.string().optional(),
        egeDateTarget: z.string().optional(),
        targetScore: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, {
        grade: input.grade,
        region: input.region,
        egeDateTarget: input.egeDateTarget ? new Date(input.egeDateTarget) : undefined,
        targetScore: input.targetScore,
      });
      return { success: true };
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const [solvedCount, warrior, topicScores, allStats] = await Promise.all([
      countCorrectAttempts(ctx.user.id),
      getWarrior(ctx.user.id),
      getTopicScores(ctx.user.id),
      getUserStats(ctx.user.id),
    ]);

    return { solvedCount, warrior, topicScores, totalAttempts: allStats.totalAttempts, correctAttempts: allStats.correctAttempts, successRate: allStats.successRate };
  }),
});
