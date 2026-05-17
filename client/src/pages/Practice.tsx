import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const TOPICS = ["Алгебра", "Геометрия", "Параметры", "Производные", "Теория вероятностей"];
const DIFFICULTIES = [
  { value: "easy", label: "Лёгкий", color: "#2D9D5F" },
  { value: "medium", label: "Средний", color: "#D4A82C" },
  { value: "hard", label: "Сложный", color: "#E63E7C" },
];

export default function Practice() {
  const [location, navigate] = useLocation();
  const urlParams = new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
  const urlTopic = urlParams.get('topic') ?? '';
  const urlErrorType = urlParams.get('errorType') ?? '';

  const [activeTab, setActiveTab] = useState<"catalog" | "generator">("catalog");
  const [filters, setFilters] = useState({
    topic: urlTopic,
    difficulty: "",
    search: urlErrorType ? `${urlErrorType}` : "",
  });
  const [genTopic, setGenTopic] = useState(urlTopic || "Алгебра");
  const [genDifficulty, setGenDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [generatedTasks, setGeneratedTasks] = useState<
    { text: string; answer: string; solution: string }[]
  >([]);

  const { data: tasks, isLoading } = trpc.tasks.list.useQuery({
    topic: filters.topic || undefined,
    difficulty: filters.difficulty || undefined,
    search: filters.search || undefined,
    limit: 50,
  });

  const { isAuthenticated } = useAuth();
  const { data: solvedCount } = trpc.tasks.solvedCount.useQuery(undefined, { enabled: isAuthenticated });
  const { data: totalCount } = trpc.tasks.count.useQuery();

  const generateMutation = trpc.tasks.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedTasks(data.tasks);
      if (data.source === "fallback") {
        toast.info("AI недоступен — показываем задачи из базы");
      } else {
        toast.success("Задачи сгенерированы AI!");
      }
    },
    onError: () => toast.error("Ошибка генерации"),
  });

  const difficultyColor = (d: string) =>
    d === "easy" ? "#2D9D5F" : d === "medium" ? "#D4A82C" : "#E63E7C";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>⚔️ Практика</h1>
        <p style={{ color: "#D5D5DC" }}>
          Решено: <span style={{ color: "#2D9D5F", fontWeight: 700 }}>{solvedCount ?? 0}</span> / {totalCount ?? 170} задач
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#1A1A22", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[
          { key: "catalog", label: "📚 Каталог задач" },
          { key: "generator", label: "🤖 AI-генератор" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "catalog" | "generator")}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              transition: "all 150ms",
              background: activeTab === tab.key ? "linear-gradient(135deg, #E63E7C, #B5135A)" : "transparent",
              color: activeTab === tab.key ? "white" : "#D5D5DC",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "catalog" && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <input
              placeholder="🔍 Поиск задач..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{
                flex: 1,
                minWidth: 200,
                padding: "10px 16px",
                background: "#1A1A22",
                border: "1px solid #33333D",
                borderRadius: 8,
                color: "white",
                fontSize: 14,
              }}
            />
            <select
              value={filters.topic}
              onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
              style={{
                padding: "10px 16px",
                background: "#1A1A22",
                border: "1px solid #33333D",
                borderRadius: 8,
                color: filters.topic ? "white" : "#D5D5DC",
                fontSize: 14,
              }}
            >
              <option value="">Все темы</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              style={{
                padding: "10px 16px",
                background: "#1A1A22",
                border: "1px solid #33333D",
                borderRadius: 8,
                color: filters.difficulty ? "white" : "#D5D5DC",
                fontSize: 14,
              }}
            >
              <option value="">Все уровни</option>
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Task list */}
          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#D5D5DC" }}>Загрузка задач...</div>
          ) : tasks && tasks.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tasks.map((task, i) => (
                <div
                  key={task.id}
                  className="card-samurai"
                  style={{ cursor: "pointer", padding: "14px 16px" }}
                  onClick={() => navigate(`/task/${task.id}`)}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#242430",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "#D5D5DC",
                        flexShrink: 0,
                        fontWeight: 600,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.5, marginBottom: 8 }}>
                        {task.text.length > 120 ? task.text.slice(0, 120) + "..." : task.text}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className="badge-samurai badge-pink">{task.topic}</span>
                        <span
                          className="badge-samurai"
                          style={{
                            background: `${difficultyColor(task.difficulty)}20`,
                            color: difficultyColor(task.difficulty),
                          }}
                        >
                          {task.difficulty === "easy" ? "Лёгкий" : task.difficulty === "medium" ? "Средний" : "Сложный"}
                        </span>
                        {task.category && (
                          <span className="badge-samurai badge-blue">{task.category}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div
                        title="Здесь поможет AI"
                        style={{
                          fontSize: 18,
                          cursor: "pointer",
                          opacity: 0.7,
                          transition: "opacity 150ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                      >
                        ⚔️
                      </div>
                      <div style={{ color: "#E63E7C", fontSize: 20 }}>→</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚔️</div>
              <p style={{ color: "#D5D5DC" }}>Задачи не найдены. Попробуй изменить фильтры.</p>
            </div>
          )}
        </>
      )}

      {activeTab === "generator" && (
        <div style={{ maxWidth: 600 }}>
          <div className="card-samurai" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>🤖 Генератор задач на AI</h3>
            <p style={{ color: "#D5D5DC", fontSize: 14, marginBottom: 20 }}>
              AI создаёт уникальные задачи по выбранной теме и уровню сложности
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#D5D5DC", marginBottom: 6 }}>
                Тема
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setGenTopic(t)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      border: "1px solid",
                      borderColor: genTopic === t ? "#E63E7C" : "#33333D",
                      background: genTopic === t ? "rgba(230,62,124,0.2)" : "transparent",
                      color: genTopic === t ? "#F08AB0" : "#D5D5DC",
                      cursor: "pointer",
                      fontSize: 13,
                      transition: "all 150ms",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: "#D5D5DC", marginBottom: 6 }}>
                Сложность
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setGenDifficulty(d.value as "easy" | "medium" | "hard")}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 999,
                      border: "1px solid",
                      borderColor: genDifficulty === d.value ? d.color : "#33333D",
                      background: genDifficulty === d.value ? `${d.color}20` : "transparent",
                      color: genDifficulty === d.value ? d.color : "#D5D5DC",
                      cursor: "pointer",
                      fontSize: 13,
                      transition: "all 150ms",
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {!isAuthenticated ? (
              <a
                href={getLoginUrl()}
                className="btn-samurai"
                style={{ width: "100%", fontSize: 15, display: "block", textAlign: "center", textDecoration: "none" }}
              >
                🔐 Войдите, чтобы использовать AI-генератор
              </a>
            ) : (
              <button
                className="btn-samurai"
                onClick={() => generateMutation.mutate({ topic: genTopic, difficulty: genDifficulty, count: 3 })}
                disabled={generateMutation.isPending}
                style={{ width: "100%", fontSize: 15 }}
              >
                {generateMutation.isPending ? "⚔️ Генерирую..." : "🤖 Сгенерировать 3 задачи"}
              </button>
            )}
          </div>

          {/* Generated tasks */}
          {generatedTasks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {generatedTasks.map((task, i) => (
                <div key={i} className="card-samurai animate-fade-in-up">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span className="badge-samurai badge-pink">Задача {i + 1}</span>
                    <span className="badge-samurai badge-blue">{genTopic}</span>
                  </div>
                  <p style={{ fontSize: 15, color: "#fff", lineHeight: 1.6, marginBottom: 12 }}>{task.text}</p>
                  <details>
                    <summary style={{ cursor: "pointer", color: "#E63E7C", fontSize: 13, fontWeight: 600 }}>
                      Показать ответ
                    </summary>
                    <div style={{ marginTop: 8, padding: 12, background: "#242430", borderRadius: 8 }}>
                      <div style={{ fontSize: 13, color: "#4ade80", marginBottom: 4 }}>
                        <strong>Ответ:</strong> {task.answer}
                      </div>
                      <div style={{ fontSize: 13, color: "#D5D5DC" }}>
                        <strong>Решение:</strong> {task.solution}
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
