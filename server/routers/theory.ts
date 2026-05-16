import { z } from "zod/v4";
import { publicProcedure, router } from "../_core/trpc";
import { getTheoryArticles } from "../db";

export const theoryRouter = router({
  list: publicProcedure
    .input(z.object({ topic: z.string().optional() }))
    .query(async ({ input }) => {
      return getTheoryArticles(input.topic);
    }),
});
