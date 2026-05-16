import { z } from "zod/v4";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getVariants, getVariantById } from "../db";
import { getDb } from "../db";
import { userVariantAttempts } from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";

export const variantsRouter = router({
  list: publicProcedure
    .input(z.object({ type: z.string().optional() }))
    .query(async ({ input }) => {
      return getVariants(input.type);
    }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getVariantById(input.id);
    }),

  submit: protectedProcedure
    .input(
      z.object({
        variantId: z.number(),
        answers: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const variant = await getVariantById(input.variantId);
      if (!variant) throw new Error("Variant not found");

      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      await db.insert(userVariantAttempts).values({
        userId: ctx.user.id,
        variantId: input.variantId,
        answers: input.answers,
        completed: true,
      });

      return { success: true };
    }),
});
