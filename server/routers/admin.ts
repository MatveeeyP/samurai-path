import { z } from "zod/v4";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb, insertTask, getTasks } from "../db";
import {
  tasks,
  variants,
  homework,
  theoryArticles,
  news,
  videos,
  motivationStories,
  quotes,
  flashcards,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Требуются права администратора" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Tasks
  createTask: adminProcedure
    .input(
      z.object({
        subject: z.string().optional(),
        topic: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
        category: z.string().optional(),
        text: z.string(),
        answer: z.string().optional(),
        solution: z.string().optional(),
        source: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await insertTask(input);
      return { success: true };
    }),

  deleteTask: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
    }),

  // Variants
  createVariant: adminProcedure
    .input(
      z.object({
        title: z.string(),
        type: z.enum(["trial", "marathon", "custom"]),
        taskIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(variants).values({ title: input.title, type: input.type, taskIds: input.taskIds });
      return { success: true };
    }),

  // Homework
  createHomework: adminProcedure
    .input(
      z.object({
        title: z.string(),
        taskIds: z.array(z.number()),
        dueDate: z.string().optional(),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(homework).values({
        title: input.title,
        taskIds: input.taskIds,
        userId: input.userId,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      });
      return { success: true };
    }),

  reviewHomework: adminProcedure
    .input(z.object({ id: z.number(), feedback: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .update(homework)
        .set({ status: "reviewed", feedback: input.feedback })
        .where(eq(homework.id, input.id));
      return { success: true };
    }),

  // Theory
  createArticle: adminProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        topic: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(theoryArticles).values(input);
      return { success: true };
    }),

  // News
  createNews: adminProcedure
    .input(z.object({ title: z.string(), content: z.string(), imageUrl: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(news).values(input);
      return { success: true };
    }),

  // Videos
  createVideo: adminProcedure
    .input(
      z.object({
        title: z.string(),
        url: z.string(),
        isExternal: z.boolean().default(true),
        topic: z.string().optional(),
        thumbnailUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(videos).values(input);
      return { success: true };
    }),

  // Motivation
  createStory: adminProcedure
    .input(
      z.object({
        title: z.string(),
        summary: z.string().optional(),
        fullText: z.string().optional(),
        heroName: z.string().optional(),
        category: z.enum(["famous", "student", "quote", "provocation"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(motivationStories).values(input);
      return { success: true };
    }),

  createQuote: adminProcedure
    .input(z.object({ text: z.string(), author: z.string().optional(), category: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(quotes).values(input);
      return { success: true };
    }),

  // Flashcards
  createFlashcard: adminProcedure
    .input(
      z.object({
        front: z.string(),
        back: z.string(),
        topic: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(flashcards).values({ ...input, isCustom: false });
      return { success: true };
    }),

  // Stats
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { taskCount: 0, userCount: 0 };
    const taskList = await getTasks({ limit: 1000 });
    return { taskCount: taskList.length, userCount: 0 };
  }),
});
