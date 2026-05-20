import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { rememberMay21Users, rememberMay21Goals, rememberMay21Sessions, rememberMay21Tasks, rememberMay21Materials, rememberMay21DailySummaries, rememberMay21Streaks } from "../../drizzle/schema";
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

  // ─── Day-Closing Ritual ───────────────────────────────────────────────────────

  // Day-Closing Ritual: Save daily summary and update streak
  closeDayRitual: protectedProcedure
    .input(z.object({
      date: z.string(), // YYYY-MM-DD
      hoursLogged: z.number().nonnegative(),
      tasksCompleted: z.number().nonnegative(),
      mood: z.enum(["excellent", "good", "neutral", "tired", "struggling"]),
      reflection: z.string().optional(),
      nextDayFocus: z.string().optional(),
      aiEncouragement: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Save daily summary
      await db.insert(rememberMay21DailySummaries).values({
        userId: ctx.user.id,
        date: input.date,
        hoursLogged: input.hoursLogged,
        tasksCompleted: input.tasksCompleted,
        mood: input.mood,
        reflection: input.reflection,
        nextDayFocus: input.nextDayFocus,
        aiEncouragement: input.aiEncouragement,
      });

      // Update or create streak
      const streaks = await db.select().from(rememberMay21Streaks).where(eq(rememberMay21Streaks.userId, ctx.user.id)).limit(1);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (streaks.length === 0) {
        // Create new streak
        await db.insert(rememberMay21Streaks).values({
          userId: ctx.user.id,
          currentStreak: input.hoursLogged > 0 ? 1 : 0,
          longestStreak: input.hoursLogged > 0 ? 1 : 0,
          lastActiveDate: input.hoursLogged > 0 ? today : null,
          freezeCount: 3,
          freezeUsedToday: false,
        });
      } else {
        const streak = streaks[0];
        const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
        lastActive?.setHours(0, 0, 0, 0);

        let newCurrentStreak = streak.currentStreak;
        let newLongestStreak = streak.longestStreak;

        if (input.hoursLogged > 0) {
          const daysDiff = lastActive ? Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)) : 1;
          if (daysDiff === 1) {
            newCurrentStreak = streak.currentStreak + 1;
          } else if (daysDiff > 1) {
            newCurrentStreak = 1;
          } else {
            newCurrentStreak = streak.currentStreak;
          }
          newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak);
        }

        await db.update(rememberMay21Streaks).set({
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastActiveDate: input.hoursLogged > 0 ? today : streak.lastActiveDate,
          freezeUsedToday: false,
          updatedAt: new Date(),
        }).where(eq(rememberMay21Streaks.userId, ctx.user.id));
      }

      return { success: true };
    }),

  // Get today's summary
  getTodaySummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const result = await db.select().from(rememberMay21DailySummaries).where(
      and(eq(rememberMay21DailySummaries.userId, ctx.user.id), eq(rememberMay21DailySummaries.date, today))
    ).limit(1);

    return result[0] || null;
  }),

  // Get streak info
  getStreakInfo: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const result = await db.select().from(rememberMay21Streaks).where(eq(rememberMay21Streaks.userId, ctx.user.id)).limit(1);
    return result[0] || null;
  }),

  // Use freeze (skip one day without losing streak)
  useFreeze: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const streaks = await db.select().from(rememberMay21Streaks).where(eq(rememberMay21Streaks.userId, ctx.user.id)).limit(1);
    if (streaks.length === 0) throw new Error("Streak not found");

    const streak = streaks[0];
    if (streak.freezeCount <= 0) throw new Error("No freezes remaining");
    if (streak.freezeUsedToday) throw new Error("Already used freeze today");

    await db.update(rememberMay21Streaks).set({
      freezeCount: streak.freezeCount - 1,
      freezeUsedToday: true,
      updatedAt: new Date(),
    }).where(eq(rememberMay21Streaks.userId, ctx.user.id));

    return { success: true, freezesRemaining: streak.freezeCount - 1 };
  }),

  // Get heatmap data (7-day activity by hour)
  getHeatmapData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return {};

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessions = await db.select().from(rememberMay21Sessions).where(
      and(
        eq(rememberMay21Sessions.userId, ctx.user.id),
      )
    );

    // Group sessions by date and hour
    const heatmap: Record<string, Record<number, number>> = {};
    sessions.forEach(session => {
      if (session.createdAt >= sevenDaysAgo) {
        const date = session.createdAt.toISOString().split('T')[0];
        const hour = session.createdAt.getHours();
        if (!heatmap[date]) heatmap[date] = {};
        heatmap[date][hour] = (heatmap[date][hour] || 0) + session.hours;
      }
    });

    return heatmap;
  }),

  // Get 7-day summary for dashboard
  getWeekSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const summaries = await db.select().from(rememberMay21DailySummaries).where(
      and(
        eq(rememberMay21DailySummaries.userId, ctx.user.id),
      )
    );

    return summaries.filter(s => {
      const date = new Date(s.date + "T00:00:00Z");
      return date >= sevenDaysAgo;
    });
  }),
});
