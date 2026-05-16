import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const SAMPLE_VARIANT = {
  title: "Вариант ЕГЭ 2024 №1",
  year: 2024,
  tasks: [
    { number: 1, topic: "Алгебра", text: "Найдите значение выражения: 3⁴ · 3⁻² / 3", answer: "9", points: 1 },
    { number: 2, topic: "Алгебра", text: "Решите уравнение: 2x - 8 = 0", answer: "4", points: 1 },
    { number: 3, topic: "Геометрия", text: "В прямоугольнике стороны 5 и 12. Найдите диагональ.", answer: "13", points: 1 },
    { number: 4, topic: "Теория вероятностей", text: "В ящике 4 красных и 6 синих шаров. Найдите вероятность вытащить красный.", answer: "0.4", points: 1 },
    { number: 5, topic: "Алгебра", text: "Найдите корни уравнения: x² - 7x + 12 = 0", answer: "3; 4", points: 1 },
    { number: 6, topic: "Производные", text: "Найдите производную: f(x) = 5x³ - 2x", answer: "15x² - 2", points: 1 },
    { number: 7, topic: "Геометрия", text: "Найдите площадь треугольника с основанием 8 и высотой 6.", answer: "24", points: 1 },
    { number: 8, topic: "Алгебра", text: "При каких x выполняется: |2x - 4| < 6?", answer: "-1 < x < 5", points: 1 },
    { number: 9, topic: "Производные", text: "Найдите точку максимума: f(x) = -x² + 4x - 3", answer: "x = 2", points: 2 },
    { number: 10, topic: "Параметры", text: "При каких a уравнение x² - 2ax + a² - 1 = 0 имеет два различных корня?", answer: "a ∈ ℝ (при любом a)", points: 2 },
  ],
};

export default function Variants() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeVariant, setActiveVariant] = useState<typeof SAMPLE_VARIANT | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number; score: number } | null>(null);

  const { data: variants } = trpc.variants.list.useQuery({});

  const handleSubmitVariant = () => {
    if (!activeVariant) return;
    let correct = 0;
    activeVariant.tasks.forEach((task) => {
      const userAns = (answers[task.number] ?? "").trim().toLowerCase().replace(/\s/g, "");
      const correctAns = task.answer.trim().toLowerCase().replace(/\s/g, "");
      if (userAns === correctAns) correct++;
    });
    const score = Math.round(40 + (correct / activeVariant.tasks.length) * 60);
    setResults({ correct, total: activeVariant.tasks.length, score });
    setSubmitted(true);
    toast.success(`Вариант сдан! ${correct}/${activeVariant.tasks.length} верных`);
  };

  if (activeVariant) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>{activeVariant.title}</h1>
            <p style={{ color: "#D5D5DC" }}>{activeVariant.tasks.length} заданий</p>
          </div>
          <button
            onClick={() => { setActiveVariant(null); setAnswers({}); setSubmitted(false); setResults(null); }}
            style={{ background: "none", border: "1px solid #33333D", borderRadius: 8, padding: "8px 16px", color: "#D5D5DC", cursor: "pointer" }}
          >
            ← Назад
          </button>
        </div>

        {results && (
          <div className="card-samurai animate-fade-in-up" style={{ marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 8, fontFamily: "Cinzel, serif" }}>РЕЗУЛЬТАТ</div>
            <div className="stat-number" style={{ fontSize: 56 }}>{results.score}</div>
            <div style={{ fontSize: 16, color: "#D5D5DC" }}>баллов · {results.correct}/{results.total} верных</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {activeVariant.tasks.map((task) => {
            const userAns = answers[task.number] ?? "";
            const isCorrect = submitted && userAns.trim().toLowerCase().replace(/\s/g, "") === task.answer.trim().toLowerCase().replace(/\s/g, "");
            const isWrong = submitted && userAns.trim() !== "" && !isCorrect;
            return (
              <div
                key={task.number}
                className="card-samurai"
                style={{
                  borderLeftColor: submitted ? (isCorrect ? "#2D9D5F" : isWrong ? "#E63E7C" : "#33333D") : "#33333D",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: submitted ? (isCorrect ? "#2D9D5F" : isWrong ? "#E63E7C" : "#33333D") : "#33333D",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    {task.number}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <span className="badge-samurai badge-pink">{task.topic}</span>
                      <span className="badge-samurai badge-blue">{task.points} б.</span>
                    </div>
                    <div style={{ fontSize: 15, color: "#fff", marginBottom: 10, lineHeight: 1.6 }}>{task.text}</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input
                        value={userAns}
                        onChange={(e) => setAnswers({ ...answers, [task.number]: e.target.value })}
                        disabled={submitted}
                        placeholder="Ответ..."
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          background: "#242430",
                          border: `1px solid ${submitted ? (isCorrect ? "#2D9D5F" : isWrong ? "#E63E7C" : "#33333D") : "#33333D"}`,
                          borderRadius: 8,
                          color: "white",
                          fontSize: 14,
                        }}
                      />
                      {submitted && isWrong && (
                        <div style={{ fontSize: 13, color: "#4ade80" }}>✓ {task.answer}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!submitted && (
          <button
            className="btn-samurai"
            onClick={handleSubmitVariant}
            style={{ marginTop: 20, width: "100%", fontSize: 16, padding: "14px" }}
          >
            ⚔️ Сдать вариант
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>📋 Варианты ЕГЭ</h1>
        <p style={{ color: "#D5D5DC" }}>Полные варианты для тренировки в условиях экзамена</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {/* Sample variant */}
        <div className="card-samurai" style={{ cursor: "pointer" }} onClick={() => setActiveVariant(SAMPLE_VARIANT)}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="badge-samurai badge-pink">ЕГЭ</span>
            <span className="badge-samurai badge-blue">2024</span>
          </div>
          <h3 style={{ marginBottom: 8 }}>{SAMPLE_VARIANT.title}</h3>
          <p style={{ fontSize: 13, color: "#D5D5DC", marginBottom: 12 }}>
            {SAMPLE_VARIANT.tasks.length} заданий · ~90 минут
          </p>
          <button className="btn-samurai" style={{ width: "100%", fontSize: 14 }}>
            ⚔️ Начать вариант
          </button>
        </div>

        {/* More variants from DB */}
        {variants?.map((v) => (
          <div key={v.id} className="card-samurai">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="badge-samurai badge-pink">ЕГЭ</span>
              <span className="badge-samurai badge-blue">{v.type ?? "custom"}</span>
            </div>
            <h3 style={{ marginBottom: 8 }}>{v.title}</h3>
            <p style={{ fontSize: 13, color: "#D5D5DC", marginBottom: 12 }}>
              {Array.isArray(v.taskIds) ? (v.taskIds as number[]).length : 0} заданий
            </p>
            <button
              className="btn-samurai"
              style={{ width: "100%", fontSize: 14 }}
              onClick={() => toast.info("Полные варианты скоро появятся!")}
            >
              ⚔️ Начать
            </button>
          </div>
        ))}

        {/* Coming soon */}
        {[2, 3].map((i) => (
          <div key={i} className="card-samurai" style={{ opacity: 0.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="badge-samurai badge-pink">ЕГЭ</span>
              <span className="badge-samurai badge-blue">2024</span>
            </div>
            <h3 style={{ marginBottom: 8 }}>Вариант №{i + 1}</h3>
            <p style={{ fontSize: 13, color: "#D5D5DC", marginBottom: 12 }}>Скоро</p>
            <button className="btn-samurai" style={{ width: "100%", fontSize: 14 }} disabled>
              Скоро
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
