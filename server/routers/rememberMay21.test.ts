import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";
import { rememberMay21Users, rememberMay21Streaks, rememberMay21DailySummaries, rememberMay21Sessions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Remember May 21 Router", () => {
  let db: any;
  const testUserId = 999; // Test user ID

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup test data
    if (db) {
      await db.delete(rememberMay21DailySummaries).where(eq(rememberMay21DailySummaries.userId, testUserId));
      await db.delete(rememberMay21Streaks).where(eq(rememberMay21Streaks.userId, testUserId));
      await db.delete(rememberMay21Sessions).where(eq(rememberMay21Sessions.userId, testUserId));
      await db.delete(rememberMay21Users).where(eq(rememberMay21Users.userId, testUserId));
    }
  });

  it("should create a Remember May 21 user profile", async () => {
    if (!db) {
      throw new Error("Database not available");
    }

    await db.insert(rememberMay21Users).values({
      userId: testUserId,
      displayName: "Test User",
      mentorMode: "kind",
      weeklyHoursGoal: 48,
      seasonGoal: "Test goal",
    });

    const result = await db.select().from(rememberMay21Users).where(eq(rememberMay21Users.userId, testUserId)).limit(1);
    expect(result.length).toBe(1);
    expect(result[0].displayName).toBe("Test User");
    expect(result[0].mentorMode).toBe("kind");
  });

  it("should create a streak record for user", async () => {
    if (!db) {
      throw new Error("Database not available");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.insert(rememberMay21Streaks).values({
      userId: testUserId,
      currentStreak: 5,
      longestStreak: 10,
      lastActiveDate: today,
      freezeCount: 3,
      freezeUsedToday: false,
    });

    const result = await db.select().from(rememberMay21Streaks).where(eq(rememberMay21Streaks.userId, testUserId)).limit(1);
    expect(result.length).toBe(1);
    expect(result[0].currentStreak).toBe(5);
    expect(result[0].longestStreak).toBe(10);
    expect(result[0].freezeCount).toBe(3);
  });

  it("should save a daily summary", async () => {
    if (!db) {
      throw new Error("Database not available");
    }

    const today = new Date().toISOString().split("T")[0];

    await db.insert(rememberMay21DailySummaries).values({
      userId: testUserId,
      date: today,
      hoursLogged: 4.5,
      tasksCompleted: 3,
      mood: "good",
      reflection: "Good day",
      nextDayFocus: "Focus on math",
    });

    const result = await db.select().from(rememberMay21DailySummaries).where(
      eq(rememberMay21DailySummaries.userId, testUserId)
    ).limit(1);

    expect(result.length).toBe(1);
    expect(result[0].hoursLogged).toBe(4.5);
    expect(result[0].tasksCompleted).toBe(3);
    expect(result[0].mood).toBe("good");
  });

  it("should add a study session", async () => {
    if (!db) {
      throw new Error("Database not available");
    }

    await db.insert(rememberMay21Sessions).values({
      userId: testUserId,
      sessionType: "Math",
      hours: 2,
    });

    const result = await db.select().from(rememberMay21Sessions).where(eq(rememberMay21Sessions.userId, testUserId));
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].sessionType).toBe("Math");
    expect(result[0].hours).toBe(2);
  });

  it("should update streak on day close", async () => {
    if (!db) {
      throw new Error("Database not available");
    }

    // Get current streak
    const streaks = await db.select().from(rememberMay21Streaks).where(eq(rememberMay21Streaks.userId, testUserId)).limit(1);
    expect(streaks.length).toBe(1);

    const oldStreak = streaks[0].currentStreak;

    // Update streak (simulate day close with hours logged)
    await db.update(rememberMay21Streaks).set({
      currentStreak: oldStreak + 1,
      updatedAt: new Date(),
    }).where(eq(rememberMay21Streaks.userId, testUserId));

    const updated = await db.select().from(rememberMay21Streaks).where(eq(rememberMay21Streaks.userId, testUserId)).limit(1);
    expect(updated[0].currentStreak).toBe(oldStreak + 1);
  });

  it("should use a freeze", async () => {
    if (!db) {
      throw new Error("Database not available");
    }

    const streaks = await db.select().from(rememberMay21Streaks).where(eq(rememberMay21Streaks.userId, testUserId)).limit(1);
    const oldFreezeCount = streaks[0].freezeCount;

    await db.update(rememberMay21Streaks).set({
      freezeCount: oldFreezeCount - 1,
      freezeUsedToday: true,
      updatedAt: new Date(),
    }).where(eq(rememberMay21Streaks.userId, testUserId));

    const updated = await db.select().from(rememberMay21Streaks).where(eq(rememberMay21Streaks.userId, testUserId)).limit(1);
    expect(updated[0].freezeCount).toBe(oldFreezeCount - 1);
    expect(updated[0].freezeUsedToday).toBe(true);
  });
});
