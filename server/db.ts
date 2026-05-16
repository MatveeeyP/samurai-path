import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  diagnosticSessions,
  flashcards,
  homework,
  motivationStories,
  news,
  quotes,
  taskBoards,
  tasks,
  theoryArticles,
  userAttempts,
  userPlans,
  userTopicScores,
  userVariantAttempts,
  userWarrior,
  users,
  variants,
  videos,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserProfile(
  userId: number,
  data: { grade?: string; region?: string; egeDateTarget?: Date; targetScore?: number }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getTasks(filters?: {
  subject?: string;
  topic?: string;
  difficulty?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(tasks);
  const conditions = [];

  if (filters?.subject) conditions.push(eq(tasks.subject, filters.subject));
  if (filters?.topic) conditions.push(eq(tasks.topic, filters.topic));
  if (filters?.difficulty)
    conditions.push(eq(tasks.difficulty, filters.difficulty as "easy" | "medium" | "hard"));
  if (filters?.category) conditions.push(eq(tasks.category, filters.category));
  if (filters?.search) {
    conditions.push(
      or(
        sql`${tasks.text} LIKE ${`%${filters.search}%`}`,
        sql`${tasks.topic} LIKE ${`%${filters.search}%`}`
      )
    );
  }

  if (conditions.length > 0) {
    // @ts-ignore
    query = query.where(and(...conditions));
  }

  // @ts-ignore
  return query
    .orderBy(desc(tasks.createdAt))
    .limit(filters?.limit ?? 50)
    .offset(filters?.offset ?? 0);
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result[0];
}

export async function getTasksByTopic(topic: string, difficulty?: string, limit = 5) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(tasks.topic, topic)];
  if (difficulty) conditions.push(eq(tasks.difficulty, difficulty as "easy" | "medium" | "hard"));
  return db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .limit(limit);
}

export async function insertTask(data: {
  subject?: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  category?: string;
  text: string;
  answer?: string;
  solution?: string;
  source?: string;
  isGenerated?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(tasks).values(data);
  return result;
}

export async function countTasks() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(tasks);
  return result[0]?.count ?? 0;
}

// ─── User Attempts ────────────────────────────────────────────────────────────

export async function saveAttempt(data: {
  userId: number;
  taskId: number;
  userAnswer?: string;
  userSolution?: string;
  isCorrect?: boolean;
  errorType?: string;
  aiExplanation?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(userAttempts).values(data);
}

export async function getUserAttempts(userId: number, taskId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(userAttempts.userId, userId)];
  if (taskId) conditions.push(eq(userAttempts.taskId, taskId));
  return db
    .select()
    .from(userAttempts)
    .where(and(...conditions))
    .orderBy(desc(userAttempts.createdAt));
}

export async function countCorrectAttempts(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(distinct taskId)` })
    .from(userAttempts)
    .where(and(eq(userAttempts.userId, userId), eq(userAttempts.isCorrect, true)));
  return result[0]?.count ?? 0;
}

// ─── Diagnostics ──────────────────────────────────────────────────────────────

export async function createDiagnosticSession(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(diagnosticSessions).values({ userId });
  return result;
}

export async function completeDiagnosticSession(
  sessionId: number,
  data: { answers: unknown; aiComment?: string; predictedScore?: number }
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(diagnosticSessions)
    .set({ ...data, completed: true })
    .where(eq(diagnosticSessions.id, sessionId));
}

export async function getTopicScores(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userTopicScores).where(eq(userTopicScores.userId, userId));
}

export async function upsertTopicScore(userId: number, topic: string, score: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(userTopicScores)
    .values({ userId, topic, score })
    .onDuplicateKeyUpdate({ set: { score } });
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export async function getUserPlans(userId: number, startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(userPlans.userId, userId)];
  if (startDate) conditions.push(gte(userPlans.date, startDate));
  if (endDate) conditions.push(lte(userPlans.date, endDate));
  return db
    .select()
    .from(userPlans)
    .where(and(...conditions))
    .orderBy(userPlans.date);
}

export async function createPlan(data: {
  userId: number;
  date: string;
  topic?: string;
  taskIds?: unknown;
  estimatedMinutes?: number;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userPlans).values(data).onDuplicateKeyUpdate({ set: { topic: data.topic } });
}

export async function updatePlanStatus(
  planId: number,
  status: "pending" | "in_progress" | "completed"
) {
  const db = await getDb();
  if (!db) return;
  await db.update(userPlans).set({ status }).where(eq(userPlans.id, planId));
}

// ─── Warrior ──────────────────────────────────────────────────────────────────

export async function getWarrior(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userWarrior).where(eq(userWarrior.userId, userId)).limit(1);
  if (result[0]) return result[0];

  // Auto-create if not exists
  await db.insert(userWarrior).values({ userId });
  const created = await db
    .select()
    .from(userWarrior)
    .where(eq(userWarrior.userId, userId))
    .limit(1);
  return created[0] ?? null;
}

export async function updateWarrior(
  userId: number,
  data: Partial<{
    totalMinutes: number;
    samuraiCount: number;
    cityLevel: number;
    warriorRank: string;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
  }>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(userWarrior).set(data).where(eq(userWarrior.userId, userId));
}

// ─── Flashcards ───────────────────────────────────────────────────────────────

export async function getFlashcards(userId?: number, topic?: string, dueOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (userId) conditions.push(or(eq(flashcards.userId, userId), eq(flashcards.isCustom, false)));
  if (topic) conditions.push(eq(flashcards.topic, topic));
  if (dueOnly) conditions.push(lte(flashcards.scheduledAt, new Date()));

  let q = db.select().from(flashcards);
  if (conditions.length > 0) {
    // @ts-ignore
    q = q.where(and(...conditions));
  }
  return q.orderBy(flashcards.scheduledAt);
}

export async function insertFlashcard(data: {
  userId?: number;
  front: string;
  back: string;
  topic?: string;
  isCustom?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(flashcards).values(data);
}

export async function updateFlashcardSM2(
  id: number,
  data: { scheduledAt: Date; repetitionCount: number; easeFactor: number }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(flashcards).set(data).where(eq(flashcards.id, id));
}

// ─── Motivation ───────────────────────────────────────────────────────────────

export async function getMotivationStories(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category) {
    return db
      .select()
      .from(motivationStories)
      .where(
        eq(motivationStories.category, category as "famous" | "student" | "quote" | "provocation")
      );
  }
  return db.select().from(motivationStories);
}

export async function getQuotes(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category) {
    return db.select().from(quotes).where(eq(quotes.category, category));
  }
  return db.select().from(quotes);
}

// ─── Variants ─────────────────────────────────────────────────────────────────

export async function getVariants(type?: string) {
  const db = await getDb();
  if (!db) return [];
  if (type) {
    return db
      .select()
      .from(variants)
      .where(eq(variants.type, type as "trial" | "marathon" | "custom"));
  }
  return db.select().from(variants).orderBy(desc(variants.createdAt));
}

export async function getVariantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(variants).where(eq(variants.id, id)).limit(1);
  return result[0];
}

// ─── Homework ─────────────────────────────────────────────────────────────────

export async function getHomework(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (userId) {
    return db
      .select()
      .from(homework)
      .where(or(eq(homework.userId, userId), sql`${homework.userId} IS NULL`))
      .orderBy(desc(homework.createdAt));
  }
  return db.select().from(homework).orderBy(desc(homework.createdAt));
}

export async function updateHomeworkStatus(
  id: number,
  status: "assigned" | "submitted" | "reviewed",
  feedback?: string
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(homework)
    .set({ status, ...(feedback ? { feedback } : {}) })
    .where(eq(homework.id, id));
}

// ─── Theory ───────────────────────────────────────────────────────────────────

export async function getTheoryArticles(topic?: string) {
  const db = await getDb();
  if (!db) return [];
  if (topic) {
    return db.select().from(theoryArticles).where(eq(theoryArticles.topic, topic));
  }
  return db.select().from(theoryArticles).orderBy(desc(theoryArticles.createdAt));
}

// ─── News ─────────────────────────────────────────────────────────────────────

export async function getNews(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(news).orderBy(desc(news.createdAt)).limit(limit);
}

// ─── Videos ───────────────────────────────────────────────────────────────────

export async function getVideos(topic?: string) {
  const db = await getDb();
  if (!db) return [];
  if (topic) {
    return db.select().from(videos).where(eq(videos.topic, topic));
  }
  return db.select().from(videos).orderBy(desc(videos.createdAt));
}

// ─── Task Boards ──────────────────────────────────────────────────────────────

export async function getTaskBoard(userId: number, taskId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(taskBoards)
    .where(and(eq(taskBoards.userId, userId), eq(taskBoards.taskId, taskId)))
    .limit(1);
  return result[0] ?? null;
}

export async function saveTaskBoard(userId: number, taskId: number, boardData: unknown) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(taskBoards)
    .values({ userId, taskId, boardData })
    .onDuplicateKeyUpdate({ set: { boardData } });
}
