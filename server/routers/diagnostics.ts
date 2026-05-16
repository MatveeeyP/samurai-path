import { z } from "zod/v4";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createDiagnosticSession,
  completeDiagnosticSession,
  getTopicScores,
  upsertTopicScore,
  getTasksByTopic,
} from "../db";

const DIAGNOSTIC_TOPICS = ["Алгебра", "Геометрия", "Параметры", "Производные", "Теория вероятностей"];

export const diagnosticsRouter = router({
  getTopics: publicProcedure.query(() => DIAGNOSTIC_TOPICS),

  getTopicScores: protectedProcedure.query(async ({ ctx }) => {
    return getTopicScores(ctx.user.id);
  }),

  startSession: protectedProcedure.mutation(async ({ ctx }) => {
    const tasks = [];
    for (const topic of DIAGNOSTIC_TOPICS) {
      const topicTasks = await getTasksByTopic(topic, "medium", 3);
      tasks.push(...topicTasks);
    }
    const result = await createDiagnosticSession(ctx.user.id);
    return { tasks, sessionCreated: true };
  }),

  submitResults: protectedProcedure
    .input(
      z.object({
        sessionId: z.number().optional(),
        answers: z.array(
          z.object({
            topic: z.string(),
            taskId: z.number(),
            isCorrect: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Calculate scores per topic
      const topicStats: Record<string, { correct: number; total: number }> = {};

      for (const answer of input.answers) {
        if (!topicStats[answer.topic]) {
          topicStats[answer.topic] = { correct: 0, total: 0 };
        }
        topicStats[answer.topic].total++;
        if (answer.isCorrect) topicStats[answer.topic].correct++;
      }

      const scores = Object.entries(topicStats).map(([topic, stats]) => ({
        topic,
        score: Math.round((stats.correct / stats.total) * 100),
      }));

      // Save scores to DB
      for (const { topic, score } of scores) {
        await upsertTopicScore(ctx.user.id, topic, score);
      }

      // Calculate predicted EGE score (rough estimate)
      const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
      const predictedScore = Math.round(40 + (avgScore / 100) * 60);

      if (input.sessionId) {
        await completeDiagnosticSession(input.sessionId, {
          answers: input.answers,
          predictedScore,
        });
      }

      return { scores, predictedScore };
    }),
});
