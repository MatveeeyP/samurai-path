import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { rememberMay21Users, rememberMay21Streaks, rememberMay21DailySummaries } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const rememberMay21MentorRouter = router({
  // Get mentor message based on action and personality
  getMentorMessage: protectedProcedure
    .input(z.object({
      action: z.enum(["motivate", "plan", "reflect", "rest"]),
      mentorMode: z.enum(["kind", "strict", "rude"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get user context
      const user = await db.select().from(rememberMay21Users).where(eq(rememberMay21Users.userId, ctx.user.id)).limit(1);
      if (!user.length) throw new Error("User not found");

      const streak = await db.select().from(rememberMay21Streaks).where(eq(rememberMay21Streaks.userId, ctx.user.id)).limit(1);
      const today = new Date().toISOString().split("T")[0];
      const todaySummary = await db.select().from(rememberMay21DailySummaries).where(
        eq(rememberMay21DailySummaries.userId, ctx.user.id)
      ).limit(1);

      const currentStreak = streak.length > 0 ? streak[0].currentStreak : 0;
      const hoursLogged = todaySummary.length > 0 ? todaySummary[0].hoursLogged : 0;
      const mood = todaySummary.length > 0 ? todaySummary[0].mood : "neutral";

      // Build context for LLM
      const context = {
        userName: user[0].displayName,
        currentStreak,
        hoursLogged,
        weeklyGoal: user[0].weeklyHoursGoal,
        mood,
        mentorMode: input.mentorMode,
        action: input.action,
      };

      // Generate message via LLM
      const systemPrompt = buildSystemPrompt(input.mentorMode);
      const userPrompt = buildUserPrompt(context);

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const message = response.choices[0]?.message?.content || "Ты делаешь отлично!";
        return { success: true, message };
      } catch (error) {
        // Fallback to hardcoded messages if LLM fails
        const fallbackMessage = getFallbackMessage(context);
        return { success: true, message: fallbackMessage };
      }
    }),

  // Get daily encouragement (called at day close)
  getDailyEncouragement: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const user = await db.select().from(rememberMay21Users).where(eq(rememberMay21Users.userId, ctx.user.id)).limit(1);
    if (!user.length) throw new Error("User not found");

    const streak = await db.select().from(rememberMay21Streaks).where(eq(rememberMay21Streaks.userId, ctx.user.id)).limit(1);
    const today = new Date().toISOString().split("T")[0];
    const todaySummary = await db.select().from(rememberMay21DailySummaries).where(
      eq(rememberMay21DailySummaries.userId, ctx.user.id)
    ).limit(1);

    const currentStreak = streak.length > 0 ? streak[0].currentStreak : 0;
    const hoursLogged = todaySummary.length > 0 ? todaySummary[0].hoursLogged : 0;
    const mood = todaySummary.length > 0 ? todaySummary[0].mood : "neutral";

    const systemPrompt = `You are a supportive and encouraging mentor for a Russian student studying for exams (ЕГЭ/ОГЭ). 
Your personality is ${user[0].mentorMode === "kind" ? "warm, supportive, and motivating" : user[0].mentorMode === "strict" ? "direct, demanding, and focused on results" : "blunt, no-nonsense, and pragmatic"}.
Generate a brief, personalized encouragement message for the end of the day. Keep it under 2 sentences in Russian.
Consider: streak=${currentStreak} days, hours today=${hoursLogged}h, mood=${mood}.`;

    const userPrompt = `Generate an end-of-day encouragement message for ${user[0].displayName} who studied ${hoursLogged} hours today and has a ${currentStreak}-day streak.`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const message = response.choices[0]?.message?.content || "Спи спокойно, ты молодец! 😴";
      return { success: true, message };
    } catch (error) {
      return { success: true, message: "Спи спокойно, ты молодец! 😴" };
    }
  }),
});

function buildSystemPrompt(mentorMode: string): string {
  const personalities = {
    kind: `You are a warm, supportive, and encouraging mentor. Use positive language, celebrate achievements, and provide gentle guidance. Be empathetic and understanding.`,
    strict: `You are a demanding, results-focused mentor. Push for excellence, hold high standards, and be direct about expectations. No excuses, only solutions.`,
    rude: `You are a blunt, no-nonsense mentor who doesn't sugarcoat things. Be pragmatic, direct, and slightly sarcastic. Get straight to the point.`,
  };

  return `You are a personal study mentor for a Russian student preparing for exams (ЕГЭ/ОГЭ). ${personalities[mentorMode as keyof typeof personalities]}
Always respond in Russian. Keep messages concise (1-2 sentences max). Be specific to the user's current situation.`;
}

function buildUserPrompt(context: {
  userName: string;
  currentStreak: number;
  hoursLogged: number;
  weeklyGoal: number;
  mood: string | null;
  mentorMode: string;
  action: string;
}): string {
  const actions = {
    motivate: `${context.userName} has a ${context.currentStreak}-day streak and studied ${context.hoursLogged} hours today. They feel ${context.mood}. Give them motivation to keep going.`,
    plan: `${context.userName} needs help planning tomorrow. They have a weekly goal of ${context.weeklyGoal} hours and currently have a ${context.currentStreak}-day streak. What should they focus on?`,
    reflect: `${context.userName} wants to reflect on today. They studied ${context.hoursLogged} hours and their mood is ${context.mood}. Help them think about what they learned.`,
    rest: `${context.userName} needs permission to rest. They've been studying hard (${context.currentStreak}-day streak). Remind them that rest is important for learning.`,
  };

  return actions[context.action as keyof typeof actions] || actions.motivate;
}

function getFallbackMessage(context: {
  userName: string;
  currentStreak: number;
  hoursLogged: number;
  weeklyGoal: number;
  mood: string | null;
  mentorMode: string;
  action: string;
}): string {
  const fallbacks = {
    kind: {
      motivate: `${context.currentStreak} дней подряд — ты молодец! Продолжай в том же духе, ты на правильном пути! 💪`,
      plan: `Завтра сосредоточься на самом важном. Я верю в тебя! 📋`,
      reflect: `Рефлексия — это мудро! Ты растёшь с каждым днём! 🌱`,
      rest: `Позаботься о себе, восстанови силы. Завтра ты будешь ещё сильнее! 😴`,
    },
    strict: {
      motivate: `${context.currentStreak} дней — хорошо, но не расслабляйся! Впереди ещё много работы. Завтра нужно быть ещё лучше!`,
      plan: `Завтра нужно сделать ещё больше. Составь чёткий план и выполни его без отговорок.`,
      reflect: `Анализируй каждый день. Только так ты поймёшь, что работает, а что нет.`,
      rest: `Отдыхай, но не слишком долго. Завтра снова в бой!`,
    },
    rude: {
      motivate: `${context.currentStreak} дней — ладно, неплохо. Но это не финиш, а только начало. Не зевай, впереди сложнее.`,
      plan: `Спланируй завтра или будешь жалеть. Никаких отговорок.`,
      reflect: `Не просто делай, думай! Анализируй, учись на ошибках.`,
      rest: `Спи, восстанавливайся. Завтра нужно быть на 100%.`,
    },
  };

  return fallbacks[context.mentorMode as keyof typeof fallbacks]?.[context.action as keyof typeof fallbacks.kind] || "Ты делаешь отлично!";
}
