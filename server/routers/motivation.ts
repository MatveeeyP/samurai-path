import { z } from "zod/v4";
import { publicProcedure, router } from "../_core/trpc";
import { getMotivationStories, getQuotes } from "../db";

export const motivationRouter = router({
  stories: publicProcedure
    .input(z.object({ category: z.string().optional() }))
    .query(async ({ input }) => {
      return getMotivationStories(input.category);
    }),

  quotes: publicProcedure
    .input(z.object({ category: z.string().optional() }))
    .query(async ({ input }) => {
      return getQuotes(input.category);
    }),
});
