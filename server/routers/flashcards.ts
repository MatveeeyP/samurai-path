import { z } from "zod/v4";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getFlashcards, insertFlashcard, updateFlashcardSM2 } from "../db";

// SM-2 algorithm implementation
function sm2(quality: number, repetitions: number, easeFactor: number, interval: number) {
  // quality: 0-5 (0=blackout, 5=perfect)
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 6;
    else newInterval = Math.round(interval * newEF);
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);

  return { newEF, newInterval, newRepetitions, nextDate };
}

export const flashcardsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        topic: z.string().optional(),
        dueOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      return getFlashcards(ctx.user.id, input.topic, input.dueOnly);
    }),

  create: protectedProcedure
    .input(
      z.object({
        front: z.string(),
        back: z.string(),
        topic: z.string().optional(),
        cardType: z.enum(["text", "drawing"]).default("text"),
        frontDrawing: z.string().optional(),
        backDrawing: z.string().optional(),
        template: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await insertFlashcard({
        userId: ctx.user.id,
        front: input.front,
        back: input.back,
        topic: input.topic,
        cardType: input.cardType,
        frontDrawing: input.frontDrawing,
        backDrawing: input.backDrawing,
        template: input.template,
        isCustom: true,
      });
      return { success: true };
    }),

  review: protectedProcedure
    .input(
      z.object({
        cardId: z.number(),
        quality: z.number().min(0).max(5),
        currentRepetitions: z.number().default(0),
        currentEaseFactor: z.number().default(2.5),
        currentInterval: z.number().default(1),
      })
    )
    .mutation(async ({ input }) => {
      const { newEF, newInterval, newRepetitions, nextDate } = sm2(
        input.quality,
        input.currentRepetitions,
        input.currentEaseFactor,
        input.currentInterval
      );

      await updateFlashcardSM2(input.cardId, {
        scheduledAt: nextDate,
        repetitionCount: newRepetitions,
        easeFactor: newEF,
      });

      return { nextDate, newInterval, newRepetitions };
    }),

  systemCards: publicProcedure
    .input(z.object({ topic: z.string().optional() }))
    .query(async ({ input }) => {
      return getFlashcards(undefined, input.topic, false);
    }),
});
