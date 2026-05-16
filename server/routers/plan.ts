import { z } from "zod/v4";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserPlans, createPlan, updatePlanStatus, getTopicScores, getTasksByTopic } from "../db";
import { format, addDays, startOfWeek } from "date-fns";

export const planRouter = router({
  getWeeklyPlan: protectedProcedure
    .input(z.object({ weekStart: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const start = input.weekStart ?? format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
      const end = format(addDays(new Date(start), 6), "yyyy-MM-dd");
      return getUserPlans(ctx.user.id, start, end);
    }),

  getMonthlyPlan: protectedProcedure
    .input(z.object({ month: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const start = input.month ?? format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd");
      const end = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), "yyyy-MM-dd");
      return getUserPlans(ctx.user.id, start, end);
    }),

  generatePlan: protectedProcedure.mutation(async ({ ctx }) => {
    const scores = await getTopicScores(ctx.user.id);
    const weakTopics = scores
      .filter((s) => s.score < 60)
      .sort((a, b) => a.score - b.score)
      .map((s) => s.topic);

    const allTopics = ["Алгебра", "Геометрия", "Параметры", "Производные", "Теория вероятностей"];
    const topicsToStudy = weakTopics.length > 0 ? weakTopics : allTopics;

    const today = new Date();
    const plans = [];

    for (let i = 0; i < 7; i++) {
      const date = format(addDays(today, i), "yyyy-MM-dd");
      const topic = topicsToStudy[i % topicsToStudy.length];
      const tasks = await getTasksByTopic(topic, "medium", 3);
      const taskIds = tasks.map((t) => t.id);

      await createPlan({
        userId: ctx.user.id,
        date,
        topic,
        taskIds,
        estimatedMinutes: 40,
      });

      plans.push({ date, topic, taskIds, estimatedMinutes: 40 });
    }

    return plans;
  }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
        status: z.enum(["pending", "in_progress", "completed"]),
      })
    )
    .mutation(async ({ input }) => {
      await updatePlanStatus(input.planId, input.status);
      return { success: true };
    }),
});
