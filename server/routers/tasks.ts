import { z } from "zod/v4";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getTasks,
  getTaskById,
  getTasksByTopic,
  saveAttempt,
  getUserAttempts,
  countCorrectAttempts,
  countTasks,
  insertTask,
} from "../db";
import { invokeLLM } from "../_core/llm";

// Fallback task bank for when AI is unavailable
const FALLBACK_TASKS = [
  // Алгебра - easy
  { topic: "Алгебра", difficulty: "easy" as const, text: "Найдите значение выражения: 2x + 3, при x = 5", answer: "13", solution: "2·5 + 3 = 10 + 3 = 13" },
  { topic: "Алгебра", difficulty: "easy" as const, text: "Решите уравнение: 3x - 6 = 0", answer: "2", solution: "3x = 6, x = 2" },
  // Алгебра - medium
  { topic: "Алгебра", difficulty: "medium" as const, text: "Решите уравнение: x² - 5x + 6 = 0", answer: "2; 3", solution: "D = 25 - 24 = 1, x₁ = (5+1)/2 = 3, x₂ = (5-1)/2 = 2" },
  { topic: "Алгебра", difficulty: "medium" as const, text: "Найдите корни уравнения: x² + x - 12 = 0", answer: "-4; 3", solution: "D = 1 + 48 = 49, x₁ = (-1+7)/2 = 3, x₂ = (-1-7)/2 = -4" },
  // Алгебра - hard
  { topic: "Алгебра", difficulty: "hard" as const, text: "Решите уравнение: x⁴ - 5x² + 4 = 0", answer: "±1; ±2", solution: "Замена t = x²: t² - 5t + 4 = 0, t₁ = 1, t₂ = 4, x = ±1, x = ±2" },
  { topic: "Алгебра", difficulty: "hard" as const, text: "Найдите все значения a, при которых уравнение x² - 2ax + a + 2 = 0 имеет два различных корня", answer: "a < -1 или a > 2", solution: "D > 0: 4a² - 4(a+2) > 0, a² - a - 2 > 0, (a-2)(a+1) > 0" },
  // Геометрия - easy
  { topic: "Геометрия", difficulty: "easy" as const, text: "Найдите площадь прямоугольника со сторонами 4 и 7", answer: "28", solution: "S = 4 · 7 = 28" },
  { topic: "Геометрия", difficulty: "easy" as const, text: "Найдите периметр квадрата со стороной 6", answer: "24", solution: "P = 4 · 6 = 24" },
  // Геометрия - medium
  { topic: "Геометрия", difficulty: "medium" as const, text: "В прямоугольном треугольнике катеты равны 3 и 4. Найдите гипотенузу.", answer: "5", solution: "c² = 3² + 4² = 9 + 16 = 25, c = 5" },
  { topic: "Геометрия", difficulty: "medium" as const, text: "Найдите площадь треугольника с основанием 8 и высотой 5", answer: "20", solution: "S = (1/2) · 8 · 5 = 20" },
  // Геометрия - hard
  { topic: "Геометрия", difficulty: "hard" as const, text: "В треугольнике ABC угол A = 60°, AB = 4, AC = 6. Найдите BC.", answer: "2√7", solution: "По теореме косинусов: BC² = 16 + 36 - 2·4·6·cos60° = 52 - 24 = 28, BC = 2√7" },
  { topic: "Геометрия", difficulty: "hard" as const, text: "Радиус описанной окружности равностороннего треугольника равен 4. Найдите сторону треугольника.", answer: "4√3", solution: "R = a/√3, a = R√3 = 4√3" },
  // Параметры - easy
  { topic: "Параметры", difficulty: "easy" as const, text: "При каких значениях a уравнение ax = 5 имеет решение?", answer: "a ≠ 0", solution: "Если a ≠ 0, то x = 5/a — единственное решение" },
  { topic: "Параметры", difficulty: "easy" as const, text: "При каких a уравнение (a-1)x = 0 имеет бесконечно много решений?", answer: "a = 1", solution: "При a = 1: 0·x = 0 — верно для любого x" },
  // Параметры - medium
  { topic: "Параметры", difficulty: "medium" as const, text: "При каких значениях a уравнение x² - ax + 1 = 0 имеет два различных вещественных корня?", answer: "|a| > 2", solution: "D > 0: a² - 4 > 0, |a| > 2" },
  { topic: "Параметры", difficulty: "medium" as const, text: "Найдите все значения a, при которых система {x + y = a, x - y = 1} имеет решение с x > 0 и y > 0", answer: "a > 1", solution: "x = (a+1)/2, y = (a-1)/2. Оба > 0: a > -1 и a > 1, итого a > 1" },
  // Параметры - hard
  { topic: "Параметры", difficulty: "hard" as const, text: "При каких a уравнение |x - a| + |x + a| = 4 имеет ровно одно решение?", answer: "a = ±2", solution: "При |a| < 2 — отрезок решений, при |a| = 2 — одна точка, при |a| > 2 — нет решений" },
  { topic: "Параметры", difficulty: "hard" as const, text: "Найдите все a, при которых неравенство x² - 2ax + a > 0 выполняется для всех x", answer: "0 < a < 1", solution: "D < 0: 4a² - 4a < 0, a(a-1) < 0, 0 < a < 1" },
  // Производные - easy
  { topic: "Производные", difficulty: "easy" as const, text: "Найдите производную функции f(x) = 3x² + 2x - 1", answer: "6x + 2", solution: "f'(x) = 6x + 2" },
  { topic: "Производные", difficulty: "easy" as const, text: "Найдите производную f(x) = sin(x) + cos(x)", answer: "cos(x) - sin(x)", solution: "f'(x) = cos(x) - sin(x)" },
  // Производные - medium
  { topic: "Производные", difficulty: "medium" as const, text: "Найдите точки экстремума функции f(x) = x³ - 3x + 2", answer: "x = -1 (max), x = 1 (min)", solution: "f'(x) = 3x² - 3 = 0, x = ±1. f''(-1) = -6 < 0 (max), f''(1) = 6 > 0 (min)" },
  { topic: "Производные", difficulty: "medium" as const, text: "На каком промежутке функция f(x) = x² - 4x + 3 убывает?", answer: "(-∞; 2)", solution: "f'(x) = 2x - 4 < 0, x < 2" },
  // Производные - hard
  { topic: "Производные", difficulty: "hard" as const, text: "Найдите наибольшее значение функции f(x) = x·e^(-x) на [0; 3]", answer: "1/e", solution: "f'(x) = e^(-x) - x·e^(-x) = e^(-x)(1-x) = 0, x = 1. f(1) = 1/e, f(0) = 0, f(3) = 3/e³ < 1/e" },
  { topic: "Производные", difficulty: "hard" as const, text: "Исследуйте функцию f(x) = x⁴ - 8x² + 3 на экстремумы", answer: "x = 0 (max), x = ±2 (min)", solution: "f'(x) = 4x³ - 16x = 4x(x²-4) = 0, x = 0, ±2. f''(0) = -16 < 0 (max), f''(±2) = 32 > 0 (min)" },
  // Теория вероятностей - easy
  { topic: "Теория вероятностей", difficulty: "easy" as const, text: "В урне 3 красных и 7 синих шаров. Найдите вероятность вытащить красный шар.", answer: "0.3", solution: "P = 3/10 = 0.3" },
  { topic: "Теория вероятностей", difficulty: "easy" as const, text: "Монету бросают 2 раза. Найдите вероятность выпадения двух орлов.", answer: "0.25", solution: "P = (1/2)·(1/2) = 1/4 = 0.25" },
  // Теория вероятностей - medium
  { topic: "Теория вероятностей", difficulty: "medium" as const, text: "Из колоды 36 карт вытаскивают одну. Найдите вероятность, что это туз или король.", answer: "2/9", solution: "P = (4+4)/36 = 8/36 = 2/9" },
  { topic: "Теория вероятностей", difficulty: "medium" as const, text: "Вероятность попасть в цель при одном выстреле 0.7. Найдите вероятность попасть хотя бы раз при двух выстрелах.", answer: "0.91", solution: "P = 1 - P(не попасть оба раза) = 1 - 0.3² = 1 - 0.09 = 0.91" },
  // Теория вероятностей - hard
  { topic: "Теория вероятностей", difficulty: "hard" as const, text: "В группе 20 студентов, 12 из них сдали экзамен. Случайно выбирают 3 студентов. Найдите вероятность, что все трое сдали.", answer: "≈ 0.193", solution: "P = C(12,3)/C(20,3) = 220/1140 ≈ 0.193" },
  { topic: "Теория вероятностей", difficulty: "hard" as const, text: "Случайная величина X имеет нормальное распределение N(5, 4). Найдите P(3 < X < 7).", answer: "≈ 0.683", solution: "P(3 < X < 7) = P(-1 < Z < 1) ≈ 0.683 (правило одного сигма)" },
];

export const tasksRouter = router({
  list: publicProcedure
    .input(
      z.object({
        subject: z.string().optional(),
        topic: z.string().optional(),
        difficulty: z.string().optional(),
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return getTasks(input);
    }),

  count: publicProcedure.query(async () => {
    return countTasks();
  }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getTaskById(input.id);
    }),

  byTopic: publicProcedure
    .input(z.object({ topic: z.string(), difficulty: z.string().optional(), limit: z.number().default(5) }))
    .query(async ({ input }) => {
      return getTasksByTopic(input.topic, input.difficulty, input.limit);
    }),

  submit: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        userAnswer: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await getTaskById(input.taskId);
      if (!task) throw new Error("Task not found");

      const isCorrect =
        task.answer?.trim().toLowerCase() === input.userAnswer.trim().toLowerCase();

      await saveAttempt({
        userId: ctx.user.id,
        taskId: input.taskId,
        userAnswer: input.userAnswer,
        isCorrect,
      });

      return { isCorrect, correctAnswer: isCorrect ? task.answer : undefined };
    }),

  myAttempts: protectedProcedure
    .input(z.object({ taskId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return getUserAttempts(ctx.user.id, input.taskId);
    }),

  solvedCount: protectedProcedure.query(async ({ ctx }) => {
    return countCorrectAttempts(ctx.user.id);
  }),

  generate: protectedProcedure
    .input(
      z.object({
        topic: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
        count: z.number().default(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Ты — опытный учитель математики, создающий задачи для подготовки к ЕГЭ. 
Создавай задачи строго по теме и уровню сложности. Отвечай ТОЛЬКО JSON.`,
            },
            {
              role: "user",
              content: `Создай ${input.count} задач по теме "${input.topic}", уровень: ${input.difficulty === "easy" ? "лёгкий" : input.difficulty === "medium" ? "средний" : "сложный"}.
Формат ответа — JSON массив объектов:
[{"text": "условие задачи", "answer": "ответ", "solution": "подробное решение"}]`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "tasks",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        answer: { type: "string" },
                        solution: { type: "string" },
                      },
                      required: ["text", "answer", "solution"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["tasks"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
          const generatedTasks = parsed.tasks || parsed;
          const result = [];
          for (const t of generatedTasks) {
            await insertTask({
              topic: input.topic,
              difficulty: input.difficulty,
              text: t.text,
              answer: t.answer,
              solution: t.solution,
              isGenerated: true,
            });
            result.push(t);
          }
          return { tasks: result, source: "ai" };
        }
      } catch (err) {
        console.error("[AI Generator] Error:", err);
      }

      // Fallback: return from manual bank
      const fallback = FALLBACK_TASKS.filter(
        (t) => t.topic === input.topic && t.difficulty === input.difficulty
      );
      const shuffled = fallback.sort(() => Math.random() - 0.5).slice(0, input.count);
      return { tasks: shuffled, source: "fallback" };
    }),
});
