import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): {
  ctx: TrpcContext;
  clearedCookies: Array<{ name: string; options: Record<string, unknown> }>;
} {
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "samurai@example.com",
    name: "Тестовый Самурай",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ─── Auth Tests ────────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      httpOnly: true,
      path: "/",
    });
  });

  it("returns current user when authenticated", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const me = await caller.auth.me();

    expect(me).not.toBeNull();
    expect(me?.name).toBe("Тестовый Самурай");
    expect(me?.role).toBe("user");
  });

  it("returns null for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const me = await caller.auth.me();

    expect(me).toBeNull();
  });
});

// ─── Diagnostics Router Tests ──────────────────────────────────────────────────

describe("diagnostics.getTopics", () => {
  it("returns the 5 diagnostic topics", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const topics = await caller.diagnostics.getTopics();

    expect(Array.isArray(topics)).toBe(true);
    expect(topics).toHaveLength(5);
    expect(topics).toContain("Алгебра");
    expect(topics).toContain("Геометрия");
    expect(topics).toContain("Параметры");
    expect(topics).toContain("Производные");
    expect(topics).toContain("Теория вероятностей");
  });
});

// ─── Theory Router Tests ───────────────────────────────────────────────────────

describe("theory.list", () => {
  it("returns an array (empty or with articles)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.theory.list({});

    expect(Array.isArray(articles)).toBe(true);
  });

  it("accepts optional topic filter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.theory.list({ topic: "Алгебра" });

    expect(Array.isArray(articles)).toBe(true);
  });
});

// ─── Motivation Router Tests ───────────────────────────────────────────────────

describe("motivation.quotes", () => {
  it("returns an array of quotes", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const quotes = await caller.motivation.quotes({});

    expect(Array.isArray(quotes)).toBe(true);
  });
});

describe("motivation.stories", () => {
  it("returns an array of stories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const stories = await caller.motivation.stories({});

    expect(Array.isArray(stories)).toBe(true);
  });
});

// ─── Variants Router Tests ─────────────────────────────────────────────────────

describe("variants.list", () => {
  it("returns an array of variants", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const variants = await caller.variants.list({});

    expect(Array.isArray(variants)).toBe(true);
  });
});

// ─── News Router Tests ─────────────────────────────────────────────────────────

describe("news.list", () => {
  it("returns an array of news items", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const news = await caller.news.list({ limit: 5 });

    expect(Array.isArray(news)).toBe(true);
  });
});

describe("news.videos", () => {
  it("returns an array of videos", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const videos = await caller.news.videos({});

    expect(Array.isArray(videos)).toBe(true);
  });
});

// ─── Tasks Router Tests ────────────────────────────────────────────────────────

describe("tasks.list", () => {
  it("returns an array of tasks", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const tasks = await caller.tasks.list({ limit: 10 });

    expect(Array.isArray(tasks)).toBe(true);
  });

  it("accepts topic filter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const tasks = await caller.tasks.list({ topic: "Алгебра", limit: 5 });

    expect(Array.isArray(tasks)).toBe(true);
  });
});

describe("tasks.count", () => {
  it("returns a number", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const count = await caller.tasks.count();

    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

// ─── Admin Router Tests ────────────────────────────────────────────────────────

describe("admin procedures", () => {
  it("throws FORBIDDEN for non-admin user", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.getStats()).rejects.toThrow();
  });

  it("allows admin to call getStats", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.admin.getStats();

    expect(stats).toBeDefined();
    expect(typeof stats.taskCount).toBe("number");
  });
});
