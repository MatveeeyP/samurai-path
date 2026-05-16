import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { useAuth } from "@/_core/hooks/useAuth";

const TOPICS = ["Алгебра", "Геометрия", "Параметры", "Производные", "Теория вероятностей"];

const SAMPLE_TASKS: Record<string, { text: string; answer: string; topic: string }[]> = {
  "Алгебра": [
    { text: "Решите уравнение: x² - 5x + 6 = 0", answer: "2; 3", topic: "Алгебра" },
    { text: "Найдите значение выражения: (2³ · 4) / 8", answer: "4", topic: "Алгебра" },
    { text: "При каких x выполняется неравенство: 2x - 4 > 0?", answer: "x > 2", topic: "Алгебра" },
  ],
  "Геометрия": [
    { text: "В прямоугольном треугольнике катеты 6 и 8. Найдите гипотенузу.", answer: "10", topic: "Геометрия" },
    { text: "Найдите площадь круга с радиусом 3 (ответ через π)", answer: "9π", topic: "Геометрия" },
    { text: "Угол между диагоналями ромба 60°, диагональ 8. Найдите площадь ромба.", answer: "16√3", topic: "Геометрия" },
  ],
  "Параметры": [
    { text: "При каких a уравнение ax = 3 имеет решение?", answer: "a ≠ 0", topic: "Параметры" },
    { text: "При каких a уравнение x² - 2ax + a = 0 имеет два корня?", answer: "a > 1 или a < 0", topic: "Параметры" },
    { text: "При каких a система {x+y=a, x-y=2} имеет решение с x > 0?", answer: "a > -2", topic: "Параметры" },
  ],
  "Производные": [
    { text: "Найдите производную: f(x) = x³ - 3x", answer: "3x² - 3", topic: "Производные" },
    { text: "На каком промежутке f(x) = x² - 4x возрастает?", answer: "(2; +∞)", topic: "Производные" },
    { text: "Найдите точку минимума: f(x) = x² - 6x + 5", answer: "x = 3", topic: "Производные" },
  ],
  "Теория вероятностей": [
    { text: "В урне 4 красных и 6 синих шаров. P(красный)?", answer: "0.4", topic: "Теория вероятностей" },
    { text: "Монету бросают 3 раза. P(все орлы)?", answer: "0.125", topic: "Теория вероятностей" },
    { text: "P(A) = 0.6, P(B) = 0.4, A и B независимы. P(A и B)?", answer: "0.24", topic: "Теория вероятностей" },
  ],
};

export default function Diagnostics() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [phase, setPhase] = useState<"intro" | "testing" | "results">("intro");
  const [currentTopicIdx, setCurrentTopicIdx] = useState(0);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { topic: string; taskId: number; isCorrect: boolean }[]>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<{ scores: { topic: string; score: number }[]; predictedScore: number } | null>(null);
  const [aiComment, setAiComment] = useState("");

  const { data: existingScores } = trpc.diagnostics.getTopicScores.useQuery(undefined, { enabled: isAuthenticated });
  const submitMutation = trpc.diagnostics.submitResults.useMutation();
  const commentMutation = trpc.ai.diagnosticComment.useMutation();

  const currentTopic = TOPICS[currentTopicIdx];
  const currentTasks = SAMPLE_TASKS[currentTopic] ?? [];
  const currentTask = currentTasks[currentTaskIdx];
  const totalTasks = TOPICS.length * 3;
  const completedTasks = currentTopicIdx * 3 + currentTaskIdx;

  const handleAnswer = (isCorrect: boolean) => {
    const topicAnswers = answers[currentTopic] ?? [];
    const newAnswers = {
      ...answers,
      [currentTopic]: [
        ...topicAnswers,
        { topic: currentTopic, taskId: currentTaskIdx, isCorrect },
      ],
    };
    setAnswers(newAnswers);
    setShowAnswer(false);
    setCurrentAnswer("");

    if (currentTaskIdx < 2) {
      setCurrentTaskIdx(currentTaskIdx + 1);
    } else if (currentTopicIdx < TOPICS.length - 1) {
      setCurrentTopicIdx(currentTopicIdx + 1);
      setCurrentTaskIdx(0);
    } else {
      // All done — submit
      const allAnswers = Object.values(newAnswers).flat();
      submitMutation.mutate(
        { answers: allAnswers },
        {
          onSuccess: async (data) => {
            setResults(data);
            setPhase("results");
            const comment = await commentMutation.mutateAsync({
              scores: data.scores,
              predictedScore: data.predictedScore,
            });
            setAiComment(comment.comment);
          },
          onError: () => toast.error("Ошибка сохранения результатов"),
        }
      );
    }
  };

  const checkAnswer = () => {
    if (!currentAnswer.trim()) return;
    const correct = currentTask.answer.trim().toLowerCase();
    const user = currentAnswer.trim().toLowerCase();
    const isCorrect = correct === user || correct.replace(/\s/g, "") === user.replace(/\s/g, "");
    setShowAnswer(true);
    return isCorrect;
  };

  const radarData = (results?.scores ?? existingScores ?? []).map((s) => ({
    topic: s.topic.slice(0, 8),
    score: s.score,
  }));

  if (phase === "intro") {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 8 }}>🎯 Диагностика</h1>
        <p style={{ color: "#D5D5DC", marginBottom: 24 }}>
          Определи свой уровень по 5 темам ЕГЭ за 15 задач
        </p>

        {existingScores && existingScores.length > 0 ? (
          <div className="card-samurai" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Твои текущие результаты</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#33333D" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: "#D5D5DC", fontSize: 11 }} />
                <Radar name="Уровень" dataKey="score" stroke="#E63E7C" fill="#E63E7C" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
              {existingScores.map((s) => (
                <div key={s.topic} style={{ textAlign: "center", padding: "8px", background: "#242430", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "#D5D5DC", marginBottom: 2 }}>{s.topic.slice(0, 10)}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.score >= 70 ? "#4ade80" : s.score >= 40 ? "#D4A82C" : "#E63E7C" }}>
                    {s.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="card-samurai" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Что тебя ждёт</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: "⚔️", text: "15 задач по 5 темам (3 на каждую)" },
              { icon: "🎯", text: "Карта пробелов в виде радарной диаграммы" },
              { icon: "📊", text: "Прогноз баллов ЕГЭ" },
              { icon: "🤖", text: "Персональный комментарий от AI" },
              { icon: "🗺️", text: "Автоматический план подготовки" },
            ].map((item) => (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#D5D5DC" }}>
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-samurai" style={{ fontSize: 15, padding: "12px 32px" }} onClick={() => setPhase("testing")}>
            🎯 Начать диагностику
          </button>
          {existingScores && existingScores.length > 0 && (
            <button
              onClick={() => navigate("/plan")}
              style={{ padding: "12px 24px", background: "transparent", border: "1px solid #33333D", borderRadius: 8, color: "#D5D5DC", cursor: "pointer", fontSize: 14 }}
            >
              Перейти к плану →
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "testing" && currentTask) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Progress */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#D5D5DC", marginBottom: 8 }}>
            <span>Задача {completedTasks + 1} из {totalTasks}</span>
            <span style={{ color: "#F08AB0" }}>{currentTopic}</span>
          </div>
          <div className="progress-samurai">
            <div className="progress-samurai-fill" style={{ width: `${(completedTasks / totalTasks) * 100}%` }} />
          </div>
        </div>

        {/* Topic pills */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {TOPICS.map((t, i) => (
            <span
              key={t}
              className="badge-samurai"
              style={{
                background: i < currentTopicIdx ? "rgba(45,157,95,0.2)" : i === currentTopicIdx ? "rgba(230,62,124,0.2)" : "rgba(255,255,255,0.05)",
                color: i < currentTopicIdx ? "#4ade80" : i === currentTopicIdx ? "#F08AB0" : "#D5D5DC",
              }}
            >
              {i < currentTopicIdx ? "✓ " : ""}{t.slice(0, 8)}
            </span>
          ))}
        </div>

        {/* Task */}
        <div className="card-samurai animate-fade-in-up">
          <div style={{ fontSize: 16, lineHeight: 1.7, color: "#fff", marginBottom: 20 }}>
            {currentTask.text}
          </div>

          {!showAnswer ? (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <input
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                  placeholder="Введите ответ..."
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    background: "#242430",
                    border: "1px solid #33333D",
                    borderRadius: 8,
                    color: "white",
                    fontSize: 15,
                  }}
                />
                <button className="btn-samurai" onClick={() => {
                  const isCorrect = checkAnswer();
                  if (isCorrect !== undefined) {
                    setTimeout(() => handleAnswer(isCorrect), 1500);
                  }
                }}>
                  Проверить
                </button>
              </div>
              <button
                onClick={() => { setShowAnswer(true); }}
                style={{ background: "none", border: "none", color: "#D5D5DC", cursor: "pointer", fontSize: 13 }}
              >
                Не знаю ответ
              </button>
            </div>
          ) : (
            <div>
              <div style={{ padding: 12, background: "#242430", borderRadius: 8, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 4 }}>ОТВЕТ</div>
                <div style={{ fontSize: 16, color: "#4ade80", fontWeight: 700 }}>{currentTask.answer}</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => handleAnswer(true)}
                  style={{ flex: 1, padding: "10px", background: "rgba(45,157,95,0.2)", border: "1px solid #2D9D5F", borderRadius: 8, color: "#4ade80", cursor: "pointer", fontWeight: 600 }}
                >
                  ✓ Знал
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  style={{ flex: 1, padding: "10px", background: "rgba(230,62,124,0.2)", border: "1px solid #E63E7C", borderRadius: 8, color: "#E63E7C", cursor: "pointer", fontWeight: 600 }}
                >
                  ✗ Не знал
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "results" && results) {
    const weakTopics = results.scores.filter((s) => s.score < 50).map((s) => s.topic);
    return (
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 8 }}>📊 Результаты диагностики</h1>

        {/* Predicted score */}
        <div className="card-samurai" style={{ marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 8, fontFamily: "Cinzel, serif" }}>ПРОГНОЗ ЕГЭ</div>
          <div className="stat-number" style={{ fontSize: 64 }}>{results.predictedScore}</div>
          <div style={{ fontSize: 16, color: "#D5D5DC" }}>баллов из 100</div>
          <div className="progress-samurai" style={{ maxWidth: 300, margin: "12px auto 0" }}>
            <div className="progress-samurai-fill" style={{ width: `${results.predictedScore}%` }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Radar */}
          <div className="card-samurai">
            <h3 style={{ marginBottom: 12 }}>Карта знаний</h3>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#33333D" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: "#D5D5DC", fontSize: 10 }} />
                <Radar name="Уровень" dataKey="score" stroke="#E63E7C" fill="#E63E7C" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Scores */}
          <div className="card-samurai">
            <h3 style={{ marginBottom: 12 }}>По темам</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {results.scores.map((s) => (
                <div key={s.topic}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: "#D5D5DC" }}>{s.topic}</span>
                    <span style={{ color: s.score >= 70 ? "#4ade80" : s.score >= 40 ? "#D4A82C" : "#E63E7C", fontWeight: 700 }}>
                      {s.score}%
                    </span>
                  </div>
                  <div className="progress-samurai">
                    <div
                      className="progress-samurai-fill"
                      style={{
                        width: `${s.score}%`,
                        background: s.score >= 70 ? "linear-gradient(90deg, #2D9D5F, #4ade80)" : s.score >= 40 ? "linear-gradient(90deg, #D4A82C, #fbbf24)" : "linear-gradient(90deg, #E63E7C, #B5135A)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Comment */}
        {aiComment && (
          <div className="card-samurai" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 8, fontFamily: "Cinzel, serif" }}>🤖 КОММЕНТАРИЙ AI</div>
            <p style={{ fontSize: 14, color: "#fff", lineHeight: 1.7, margin: 0 }}>{aiComment}</p>
          </div>
        )}

        {/* Weak topics */}
        {weakTopics.length > 0 && (
          <div className="card-samurai" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12 }}>⚠️ Приоритеты для изучения</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {weakTopics.map((t) => (
                <span key={t} className="badge-samurai badge-yellow">{t}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn-samurai" onClick={() => navigate("/plan")}>
            🗺️ Получить план подготовки
          </button>
          <button
            onClick={() => navigate("/practice")}
            style={{ padding: "10px 20px", background: "transparent", border: "1px solid #33333D", borderRadius: 8, color: "#D5D5DC", cursor: "pointer", fontSize: 14 }}
          >
            ⚔️ Начать практику
          </button>
          <button
            onClick={() => { setPhase("intro"); setAnswers({}); setCurrentTopicIdx(0); setCurrentTaskIdx(0); setResults(null); }}
            style={{ padding: "10px 20px", background: "transparent", border: "1px solid #33333D", borderRadius: 8, color: "#D5D5DC", cursor: "pointer", fontSize: 14 }}
          >
            🔄 Пройти снова
          </button>
        </div>
      </div>
    );
  }

  return <div style={{ textAlign: "center", padding: 40, color: "#D5D5DC" }}>Загрузка...</div>;
}
