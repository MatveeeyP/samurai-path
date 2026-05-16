import { z } from "zod/v4";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { saveAttempt, getTaskById } from "../db";

export const aiRouter = router({
  analyzeError: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        userAnswer: z.string(),
        userSolution: z.string(),
        taskText: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await getTaskById(input.taskId);

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Ты — опытный учитель математики, помогающий ученику найти ошибку в решении.
Твоя задача: найти ПЕРВУЮ ошибку в ходе решения ученика и объяснить её.
НЕ давай готовое решение. Только объясни ошибку и задай наводящий вопрос.
Отвечай строго на русском языке. Отвечай ТОЛЬКО JSON.`,
          },
          {
            role: "user",
            content: `Задача: ${input.taskText}
Правильный ответ: ${task?.answer ?? "неизвестен"}
Ответ ученика: ${input.userAnswer}
Ход решения ученика: ${input.userSolution}

Найди первую ошибку и верни JSON:
{
  "step_with_error": "описание шага где ошибка",
  "error_type": "арифметика|знак|формула|потеря корня|непонимание условия|подстановка|другое",
  "what_went_wrong": "что именно пошло не так (2-3 предложения)",
  "rule_to_remember": "правило которое нужно запомнить",
  "next_question": "наводящий вопрос для ученика"
}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "error_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                step_with_error: { type: "string" },
                error_type: { type: "string" },
                what_went_wrong: { type: "string" },
                rule_to_remember: { type: "string" },
                next_question: { type: "string" },
              },
              required: [
                "step_with_error",
                "error_type",
                "what_went_wrong",
                "rule_to_remember",
                "next_question",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      let analysis = {
        step_with_error: "Ошибка в вычислениях",
        error_type: "арифметика",
        what_went_wrong: "Проверь свои вычисления ещё раз",
        rule_to_remember: "Всегда проверяй промежуточные результаты",
        next_question: "Попробуй ещё раз с самого начала?",
      };

      if (content) {
        try {
          analysis =
            typeof content === "string" ? JSON.parse(content) : content;
        } catch {}
      }

      await saveAttempt({
        userId: ctx.user.id,
        taskId: input.taskId,
        userAnswer: input.userAnswer,
        userSolution: input.userSolution,
        isCorrect: false,
        errorType: analysis.error_type,
        aiExplanation: JSON.stringify(analysis),
      });

      return analysis;
    }),

  socraticChat: protectedProcedure
    .input(
      z.object({
        taskText: z.string(),
        taskAnswer: z.string().optional(),
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        userMessage: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `Ты — Сократ-наставник по математике. Ты ведёшь ученика к решению задачи через наводящие вопросы.
НИКОГДА не давай готовый ответ. Только задавай вопросы и давай подсказки.
Если ученик делает правильный шаг — хвали его: "Отлично! Теперь..."
Если ошибается — мягко направляй: "Хм, давай подумаем... А что если..."
Отвечай на русском языке. Будь дружелюбным и поддерживающим.
Задача для решения: ${input.taskText}`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: input.userMessage },
      ];

      const response = await invokeLLM({ messages });
      const reply = response.choices[0]?.message?.content ?? "Продолжай думать над задачей...";

      return { reply: typeof reply === "string" ? reply : JSON.stringify(reply) };
    }),

  motivationalPhrase: protectedProcedure
    .input(
      z.object({
        isCorrect: z.boolean(),
        attemptCount: z.number().default(1),
        topic: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      let context = "";
      if (input.isCorrect) {
        context = "Ученик решил задачу ВЕРНО";
      } else if (input.attemptCount >= 3) {
        context = "Ученик несколько раз пытался решить задачу и не сдаётся";
      } else {
        context = "Ученик решил задачу НЕВЕРНО";
      }

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Ты — мотивационный наставник в стиле самурайской философии.
Дай ОДНУ короткую мотивирующую фразу (1-2 предложения) на русском языке.
Используй метафоры самурая, воина, пути к мастерству.
НЕ используй банальные фразы. Будь оригинальным и вдохновляющим.`,
          },
          {
            role: "user",
            content: context + (input.topic ? `. Тема: ${input.topic}` : ""),
          },
        ],
      });

      const phrase = response.choices[0]?.message?.content;
      const defaultPhrases = {
        correct: "Самурай побеждает противника. Так держать!",
        wrong: "Каждый воин падал, прежде чем стать мастером. Вставай.",
        persistent: "Упорство — путь воина. Твоя настойчивость — уже победа.",
      };

      const result =
        typeof phrase === "string"
          ? phrase
          : input.isCorrect
          ? defaultPhrases.correct
          : input.attemptCount >= 3
          ? defaultPhrases.persistent
          : defaultPhrases.wrong;

      return { phrase: result };
    }),

  diagnosticComment: protectedProcedure
    .input(
      z.object({
        scores: z.array(z.object({ topic: z.string(), score: z.number() })),
        predictedScore: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const weakTopics = input.scores
        .filter((s) => s.score < 50)
        .map((s) => s.topic)
        .join(", ");
      const strongTopics = input.scores
        .filter((s) => s.score >= 70)
        .map((s) => s.topic)
        .join(", ");

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Ты — опытный репетитор по математике ЕГЭ. Дай персональный комментарий по результатам диагностики.
Отвечай на русском языке. 3-4 предложения. Будь конкретным и поддерживающим.`,
          },
          {
            role: "user",
            content: `Результаты диагностики:
Слабые темы: ${weakTopics || "нет"}
Сильные темы: ${strongTopics || "нет"}
Прогноз баллов ЕГЭ: ${input.predictedScore}

Дай персональный комментарий и главную рекомендацию.`,
          },
        ],
      });

      const comment = response.choices[0]?.message?.content;
      return {
        comment:
          typeof comment === "string"
            ? comment
            : "Хороший старт! Сосредоточься на слабых темах и практикуй каждый день.",
      };
    }),
});
