import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { rememberMay21Users, rememberMay21Goals, rememberMay21Sessions, rememberMay21Tasks, rememberMay21Materials } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const rememberMay21Router = router({
  // Onboarding: Create or update user profile
  setupProfile: protectedProcedure
    .input(z.object({
      displayName: z.string().min(1),
      mentorMode: z.enum(["kind", "strict", "rude"]),
      weeklyHoursGoal: z.number().positive(),
      seasonGoal: z.string().optional(),
      seasonGoalProgress: z.number().optional(),
      studyBlockFormat: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db.select().from(rememberMay21Users).where(eq(rememberMay21Users.userId, ctx.user.id)).limit(1);

      if (existing.length > 0) {
        await db.update(rememberMay21Users).set({
          displayName: input.displayName,
          mentorMode: input.mentorMode,
          weeklyHoursGoal: input.weeklyHoursGoal,
          seasonGoal: input.seasonGoal,
          seasonGoalProgress: input.seasonGoalProgress,
          studyBlockFormat: input.studyBlockFormat,
          updatedAt: new Date(),
        }).where(eq(rememberMay21Users.userId, ctx.user.id));
        return existing[0];
      }

      await db.insert(rememberMay21Users).values({
        userId: ctx.user.id,
        displayName: input.displayName,
        mentorMode: input.mentorMode,
        weeklyHoursGoal: input.weeklyHoursGoal,
        seasonGoal: input.seasonGoal,
        seasonGoalProgress: input.seasonGoalProgress,
        studyBlockFormat: input.studyBlockFormat,
      });

      return { userId: ctx.user.id, ...input };
    }),

  // Get user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const result = await db.select().from(rememberMay21Users).where(eq(rememberMay21Users.userId, ctx.user.id)).limit(1);
    return result[0] || null;
  }),

  // Add study session
  addSession: protectedProcedure
    .input(z.object({
      sessionType: z.string(),
      hours: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(rememberMay21Sessions).values({
        userId: ctx.user.id,
        sessionType: input.sessionType,
        hours: input.hours,
        createdAt: new Date(),
      });

      return { success: true };
    }),

  // Get weekly sessions
  getWeeklySessions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessions = await db.select().from(rememberMay21Sessions).where(
      and(
        eq(rememberMay21Sessions.userId, ctx.user.id),
      )
    );

    return sessions.filter(s => s.createdAt >= weekAgo);
  }),

  // Get all goals
  getGoals: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db.select().from(rememberMay21Goals).where(eq(rememberMay21Goals.userId, ctx.user.id));
  }),

  // Create goal
  createGoal: protectedProcedure
    .input(z.object({
      title: z.string(),
      targetDate: z.date(),
      isGrandGoal: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(rememberMay21Goals).values({
        userId: ctx.user.id,
        title: input.title,
        targetDate: input.targetDate,
        isGrandGoal: input.isGrandGoal,
      });

      return { ...input };
    }),

  // Get tasks
  getTasks: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db.select().from(rememberMay21Tasks).where(eq(rememberMay21Tasks.userId, ctx.user.id));
  }),

  // Create task
  createTask: protectedProcedure
    .input(z.object({
      title: z.string(),
      dueDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(rememberMay21Tasks).values({
        userId: ctx.user.id,
        title: input.title,
        dueDate: input.dueDate,
      });

      return { ...input };
    }),

  // Toggle task completion
  toggleTask: protectedProcedure
    .input(z.object({ taskId: z.number(), isCompleted: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(rememberMay21Tasks).set({ isCompleted: input.isCompleted }).where(
        and(eq(rememberMay21Tasks.id, input.taskId), eq(rememberMay21Tasks.userId, ctx.user.id))
      );

      return { success: true };
    }),

  // Upload material
  uploadMaterial: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileUrl: z.string(),
      fileType: z.string(),
      linkedGoalId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(rememberMay21Materials).values({
        userId: ctx.user.id,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        linkedGoalId: input.linkedGoalId,
      });

      return { ...input };
    }),

  // Get materials
  getMaterials: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db.select().from(rememberMay21Materials).where(eq(rememberMay21Materials.userId, ctx.user.id));
  }),
});
