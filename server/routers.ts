import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { tasksRouter } from "./routers/tasks";
import { aiRouter } from "./routers/ai";
import { diagnosticsRouter } from "./routers/diagnostics";
import { planRouter } from "./routers/plan";
import { warriorRouter } from "./routers/warrior";
import { flashcardsRouter } from "./routers/flashcards";
import { motivationRouter } from "./routers/motivation";
import { variantsRouter } from "./routers/variants";
import { homeworkRouter } from "./routers/homework";
import { theoryRouter } from "./routers/theory";
import { newsRouter } from "./routers/newsVideos";
import { adminRouter } from "./routers/admin";
import { profileRouter } from "./routers/profile";
import { updateUserProfile } from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  tasks: tasksRouter,
  ai: aiRouter,
  diagnostics: diagnosticsRouter,
  plan: planRouter,
  warrior: warriorRouter,
  flashcards: flashcardsRouter,
  motivation: motivationRouter,
  variants: variantsRouter,
  homework: homeworkRouter,
  theory: theoryRouter,
  news: newsRouter,
  admin: adminRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
