import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { format, addDays, startOfWeek } from "date-fns";
import { ru } from "date-fns/locale";

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function Plan() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<"week" | "month">("week");
  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");

  const { data: weeklyPlan, refetch } = trpc.plan.getWeeklyPlan.useQuery({ weekStart }, { enabled: isAuthenticated });
  const generateMutation = trpc.plan.generatePlan.useMutation({
    onSuccess: () => { toast.success("Персональный план создан!"); refetch(); },
    onError: () => toast.error("Ошибка создания плана"),
  });
  const updateStatusMutation = trpc.plan.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const completedCount = weeklyPlan?.filter((p) => p.status === "completed").length ?? 0;
  const totalCount = weeklyPlan?.length ?? 0;

  const topicColors: Record<string, string> = {
    "Алгебра": "#E63E7C",
    "Геометрия": "#7C3AED",
    "Параметры": "#D4A82C",
    "Производные": "#2D9D5F",
    "Теория вероятностей": "#3B82F6",
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>🗺️ Путь подготовки</h1>
          <p style={{ color: "#D5D5DC" }}>Персональный план на основе диагностики</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-samurai"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? "⚔️ Создаю..." : "🤖 Сгенерировать план"}
          </button>
          <button
            onClick={() => navigate("/diagnostics")}
            style={{ padding: "10px 16px", background: "transparent", border: "1px solid #33333D", borderRadius: 8, color: "#D5D5DC", cursor: "pointer", fontSize: 14 }}
          >
            🎯 Диагностика
          </button>
        </div>
      </div>

      {/* Stats */}
      {weeklyPlan && weeklyPlan.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          <div className="card-samurai" style={{ textAlign: "center" }}>
            <div className="stat-number" style={{ fontSize: 32 }}>{completedCount}</div>
            <div style={{ fontSize: 13, color: "#D5D5DC" }}>Выполнено</div>
          </div>
          <div className="card-samurai" style={{ textAlign: "center" }}>
            <div className="stat-number" style={{ fontSize: 32, color: "#D4A82C" }}>{totalCount - completedCount}</div>
            <div style={{ fontSize: 13, color: "#D5D5DC" }}>Осталось</div>
          </div>
          <div className="card-samurai" style={{ textAlign: "center" }}>
            <div className="stat-number" style={{ fontSize: 32, color: "#2D9D5F" }}>
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </div>
            <div style={{ fontSize: 13, color: "#D5D5DC" }}>Прогресс</div>
          </div>
        </div>
      )}

      {/* View tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#1A1A22", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[
          { key: "week", label: "📅 Неделя" },
          { key: "month", label: "🗓️ Месяц" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key as "week" | "month")}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              transition: "all 150ms",
              background: view === tab.key ? "linear-gradient(135deg, #E63E7C, #B5135A)" : "transparent",
              color: view === tab.key ? "white" : "#D5D5DC",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!isAuthenticated ? (
        <div className="card-samurai" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
          <p style={{ color: "#D5D5DC", marginBottom: 16 }}>Войдите, чтобы получить персональный план</p>
          <a href="/api/oauth/login" className="btn-samurai" style={{ textDecoration: "none", display: "inline-block" }}>
            Войти
          </a>
        </div>
      ) : weeklyPlan && weeklyPlan.length > 0 ? (
        <div>
          {/* Weekly grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 20 }}>
            {DAY_NAMES.map((day, i) => {
              const date = format(addDays(new Date(weekStart), i), "yyyy-MM-dd");
              const plan = weeklyPlan.find((p) => p.date === date);
              const isToday = date === format(today, "yyyy-MM-dd");
              const topicColor = plan ? (topicColors[plan.topic ?? ""] ?? "#E63E7C") : "#33333D";

              return (
                <div
                  key={day}
                  style={{
                    background: "#1A1A22",
                    border: `1px solid ${isToday ? "#E63E7C" : "#33333D"}`,
                    borderRadius: 10,
                    padding: "12px 8px",
                    textAlign: "center",
                    minHeight: 100,
                    position: "relative",
                    boxShadow: isToday ? "0 0 12px rgba(230,62,124,0.3)" : "none",
                  }}
                >
                  <div style={{ fontSize: 11, color: isToday ? "#E63E7C" : "#D5D5DC", fontWeight: 600, marginBottom: 4 }}>
                    {day}
                  </div>
                  <div style={{ fontSize: 11, color: "#D5D5DC", marginBottom: 8 }}>
                    {format(addDays(new Date(weekStart), i), "d MMM", { locale: ru })}
                  </div>
                  {plan ? (
                    <div>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: topicColor,
                          margin: "0 auto 4px",
                        }}
                      />
                      <div style={{ fontSize: 10, color: topicColor, fontWeight: 600, lineHeight: 1.3 }}>
                        {(plan.topic ?? "").slice(0, 8)}
                      </div>
                      <div style={{ fontSize: 10, color: "#D5D5DC", marginTop: 4 }}>
                        {plan.estimatedMinutes} мин
                      </div>
                      {plan.status === "completed" && (
                        <div style={{ fontSize: 14, marginTop: 4 }}>✅</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: 20, color: "#33333D" }}>—</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Plan list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weeklyPlan.map((plan) => {
              const topicColor = topicColors[plan.topic ?? ""] ?? "#E63E7C";
              const isToday = plan.date === format(today, "yyyy-MM-dd");
              return (
                <div
                  key={plan.id}
                  className="card-samurai"
                  style={{
                    borderLeftColor: plan.status === "completed" ? "#2D9D5F" : topicColor,
                    opacity: plan.status === "completed" ? 0.7 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: "#D5D5DC" }}>
                          {format(new Date(plan.date), "d MMMM (EEEE)", { locale: ru })}
                        </span>
                        {isToday && <span className="badge-samurai badge-pink">Сегодня</span>}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{plan.topic ?? ""}</div>
                      <div style={{ fontSize: 13, color: "#D5D5DC", marginTop: 2 }}>
                        ⏱️ {plan.estimatedMinutes} минут
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {plan.status !== "completed" && (
                        <button
                          className="btn-samurai"
                          style={{ fontSize: 13, padding: "8px 16px" }}
                          onClick={() => navigate(`/practice?topic=${plan.topic ?? ""}`)}
                        >
                          ⚔️ Начать
                        </button>
                      )}
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({
                            planId: plan.id,
                            status: plan.status === "completed" ? "pending" : "completed",
                          })
                        }
                        style={{
                          padding: "8px 14px",
                          background: plan.status === "completed" ? "rgba(45,157,95,0.2)" : "transparent",
                          border: `1px solid ${plan.status === "completed" ? "#2D9D5F" : "#33333D"}`,
                          borderRadius: 8,
                          color: plan.status === "completed" ? "#4ade80" : "#D5D5DC",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        {plan.status === "completed" ? "✓ Готово" : "Отметить"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card-samurai" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
          <h3 style={{ marginBottom: 8 }}>Нет плана</h3>
          <p style={{ color: "#D5D5DC", marginBottom: 20 }}>
            Пройди диагностику или нажми "Сгенерировать план" для автоматического расписания
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn-samurai" onClick={() => navigate("/diagnostics")}>
              🎯 Пройти диагностику
            </button>
            <button
              className="btn-samurai"
              style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? "Создаю..." : "🤖 Создать план"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
