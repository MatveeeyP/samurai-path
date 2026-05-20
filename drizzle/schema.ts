import {
  boolean,
  float,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Core Users ───────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  grade: varchar("grade", { length: 16 }),
  region: varchar("region", { length: 128 }),
  egeDateTarget: timestamp("egeDateTarget"),
  targetScore: int("targetScore").default(85),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Tasks / Problems ─────────────────────────────────────────────────────────

export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  subject: varchar("subject", { length: 64 }).notNull().default("Математика"),
  topic: varchar("topic", { length: 128 }).notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).notNull().default("medium"),
  category: varchar("category", { length: 128 }),
  text: text("text").notNull(),
  answer: varchar("answer", { length: 256 }),
  solution: text("solution"),
  source: varchar("source", { length: 256 }),
  isGenerated: boolean("isGenerated").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ─── User Attempts ────────────────────────────────────────────────────────────

export const userAttempts = mysqlTable("user_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskId: int("taskId").notNull(),
  userAnswer: varchar("userAnswer", { length: 512 }),
  userSolution: text("userSolution"),
  isCorrect: boolean("isCorrect").default(false),
  errorType: varchar("errorType", { length: 64 }),
  aiExplanation: text("aiExplanation"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserAttempt = typeof userAttempts.$inferSelect;

// ─── Diagnostics ──────────────────────────────────────────────────────────────

export const diagnosticSessions = mysqlTable("diagnostic_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  answers: json("answers"),
  completed: boolean("completed").default(false),
  aiComment: text("aiComment"),
  predictedScore: int("predictedScore"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userTopicScores = mysqlTable("user_topic_scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 128 }).notNull(),
  score: int("score").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserTopicScore = typeof userTopicScores.$inferSelect;

// ─── Adaptive Plans ───────────────────────────────────────────────────────────

export const userPlans = mysqlTable("user_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 16 }).notNull(),
  topic: varchar("topic", { length: 128 }),
  taskIds: json("taskIds"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending"),
  estimatedMinutes: int("estimatedMinutes").default(40),
});

export type UserPlan = typeof userPlans.$inferSelect;

// ─── Warrior / Gamification ───────────────────────────────────────────────────

export const userWarrior = mysqlTable("user_warrior", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalMinutes: int("totalMinutes").default(0).notNull(),
  samuraiCount: int("samuraiCount").default(0).notNull(),
  cityLevel: int("cityLevel").default(0).notNull(),
  warriorRank: varchar("warriorRank", { length: 32 }).default("ронин").notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastActiveDate: varchar("lastActiveDate", { length: 16 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserWarrior = typeof userWarrior.$inferSelect;

// ─── Flashcards ───────────────────────────────────────────────────────────────

export const flashcards = mysqlTable("flashcards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  front: text("front").notNull(),
  back: text("back").notNull(),
  topic: varchar("topic", { length: 128 }),
  cardType: mysqlEnum("cardType", ["text", "drawing"]).default("text"),
  frontDrawing: text("frontDrawing"),
  backDrawing: text("backDrawing"),
  template: varchar("template", { length: 64 }),
  isCustom: boolean("isCustom").default(false),
  scheduledAt: timestamp("scheduledAt").defaultNow(),
  repetitionCount: int("repetitionCount").default(0),
  easeFactor: float("easeFactor").default(2.5),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Flashcard = typeof flashcards.$inferSelect;

// ─── Motivation Stories ───────────────────────────────────────────────────────

export const motivationStories = mysqlTable("motivation_stories", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  summary: text("summary"),
  fullText: text("fullText"),
  heroName: varchar("heroName", { length: 128 }),
  category: mysqlEnum("category", ["famous", "student", "quote", "provocation"]).default("famous"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MotivationStory = typeof motivationStories.$inferSelect;

// ─── Variants (ЕГЭ test sets) ─────────────────────────────────────────────────

export const variants = mysqlTable("variants", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  type: mysqlEnum("type", ["trial", "marathon", "custom"]).default("trial"),
  taskIds: json("taskIds"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Variant = typeof variants.$inferSelect;

export const userVariantAttempts = mysqlTable("user_variant_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  variantId: int("variantId").notNull(),
  answers: json("answers"),
  score: int("score").default(0),
  completed: boolean("completed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Homework ─────────────────────────────────────────────────────────────────

export const homework = mysqlTable("homework", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  title: varchar("title", { length: 256 }).notNull(),
  taskIds: json("taskIds"),
  status: mysqlEnum("status", ["assigned", "submitted", "reviewed"]).default("assigned"),
  dueDate: timestamp("dueDate"),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Homework = typeof homework.$inferSelect;

// ─── Theory Articles ──────────────────────────────────────────────────────────

export const theoryArticles = mysqlTable("theory_articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),
  topic: varchar("topic", { length: 128 }),
  tags: json("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TheoryArticle = typeof theoryArticles.$inferSelect;

// ─── News ─────────────────────────────────────────────────────────────────────

export const news = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type News = typeof news.$inferSelect;

// ─── Videos ───────────────────────────────────────────────────────────────────

export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  isExternal: boolean("isExternal").default(true),
  topic: varchar("topic", { length: 128 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Video = typeof videos.$inferSelect;

// ─── Task Boards (Excalidraw) ─────────────────────────────────────────────────

export const taskBoards = mysqlTable("task_boards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskId: int("taskId").notNull(),
  boardData: json("boardData"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Quotes ───────────────────────────────────────────────────────────────────

export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  text: text("text").notNull(),
  author: varchar("author", { length: 128 }),
  category: varchar("category", { length: 64 }).default("warrior"),
});

export type Quote = typeof quotes.$inferSelect;

// ─── Remember May 21 (Вспомни 21 мая) ─────────────────────────────────────────

export const rememberMay21Users = mysqlTable("remember_may21_users", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mentorMode: mysqlEnum("mentorMode", ["kind", "strict", "rude"]).default("kind").notNull(),
  displayName: varchar("displayName", { length: 128 }).notNull(),
  weeklyHoursGoal: float("weeklyHoursGoal").default(48).notNull(),
  seasonGoal: text("seasonGoal"),
  seasonGoalProgress: int("seasonGoalProgress").default(0),
  studyBlockFormat: text("studyBlockFormat"),
  currentStreak: int("currentStreak").default(0).notNull(),
  freezesRemaining: int("freezesRemaining").default(0).notNull(),
  lastStudyDate: timestamp("lastStudyDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RememberMay21User = typeof rememberMay21Users.$inferSelect;

export const rememberMay21Goals = mysqlTable("remember_may21_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  targetDate: timestamp("targetDate").notNull(),
  isGrandGoal: boolean("isGrandGoal").default(false).notNull(),
  progress: int("progress").default(0),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RememberMay21Goal = typeof rememberMay21Goals.$inferSelect;

export const rememberMay21Sessions = mysqlTable("remember_may21_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionType: varchar("sessionType", { length: 64 }).notNull(),
  hours: float("hours").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RememberMay21Session = typeof rememberMay21Sessions.$inferSelect;

export const rememberMay21Tasks = mysqlTable("remember_may21_tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  dueDate: timestamp("dueDate"),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RememberMay21Task = typeof rememberMay21Tasks.$inferSelect;

export const rememberMay21Materials = mysqlTable("remember_may21_materials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 256 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(),
  fileType: varchar("fileType", { length: 32 }).notNull(),
  linkedGoalId: int("linkedGoalId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RememberMay21Material = typeof rememberMay21Materials.$inferSelect;

export const rememberMay21DailySummaries = mysqlTable("remember_may21_daily_summaries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 16 }).notNull(), // YYYY-MM-DD format
  hoursLogged: float("hoursLogged").default(0).notNull(),
  tasksCompleted: int("tasksCompleted").default(0).notNull(),
  mood: mysqlEnum("mood", ["excellent", "good", "neutral", "tired", "struggling"]).default("neutral"),
  reflection: text("reflection"),
  nextDayFocus: text("nextDayFocus"),
  aiEncouragement: text("aiEncouragement"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RememberMay21DailySummary = typeof rememberMay21DailySummaries.$inferSelect;

export const rememberMay21Streaks = mysqlTable("remember_may21_streaks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastActiveDate: timestamp("lastActiveDate"),
  freezeCount: int("freezeCount").default(3).notNull(), // Total freezes available
  freezeUsedToday: boolean("freezeUsedToday").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RememberMay21Streak = typeof rememberMay21Streaks.$inferSelect;
