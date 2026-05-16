import { z } from "zod/v4";
import { protectedProcedure, router } from "../_core/trpc";
import { getHomework, updateHomeworkStatus } from "../db";

export const homeworkRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getHomework(ctx.user.id);
  }),

  submit: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await updateHomeworkStatus(input.id, "submitted");
      return { success: true };
    }),
});
