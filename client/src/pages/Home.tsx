import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

const SamuraiWarriorSVG = ({ rank = "ронин", count = 0 }: { rank?: string; count?: number }) => (
  <svg width="120" height="160" viewBox="0 0 120 160" className="animate-warrior-idle warrior-svg">
    {/* Body */}
    <ellipse cx="60" cy="140" rx="30" ry="10" fill="rgba(230,62,124,0.2)" />
    {/* Legs */}
    <rect x="48" y="110" width="10" height="30" rx="5" fill="#B5135A" />
    <rect x="62" y="110" width="10" height="30" rx="5" fill="#B5135A" />
    {/* Torso */}
    <rect x="40" y="65" width="40" height="50" rx="8" fill="#E63E7C" />
    {/* Armor details */}
    <rect x="40" y="65" width="40" height="12" rx="4" fill="#B5135A" />
    <line x1="60" y1="77" x2="60" y2="115" stroke="#B5135A" strokeWidth="2" />
    {/* Arms */}
    <rect x="22" y="68" width="18" height="10" rx="5" fill="#E63E7C" />
    <rect x="80" y="68" width="18" height="10" rx="5" fill="#E63E7C" />
    {/* Head */}
    <circle cx="60" cy="50" r="22" fill="#F08AB0" />
    {/* Helmet */}
    <path d="M38 45 Q60 20 82 45" fill="#B5135A" />
    <rect x="55" y="20" width="10" height="8" rx="2" fill="#E63E7C" />
    {/* Face */}
    <circle cx="52" cy="50" r="3" fill="#1A1A22" />
    <circle cx="68" cy="50" r="3" fill="#1A1A22" />
    <path d="M52 60 Q60 65 68 60" stroke="#1A1A22" strokeWidth="2" fill="none" />
    {/* Sword */}
    <rect x="84" y="40" width="4" height="60" rx="2" fill="#D5D5DC" />
    <rect x="80" y="55" width="12" height="4" rx="2" fill="#D4A82C" />
    <rect x="85" y="95" width="6" height="10" rx="2" fill="#D4A82C" />
    {/* Rank badge */}
    <text x="60" y="155" textAnchor="middle" fontSize="9" fill="#F08AB0" fontFamily="Cinzel, serif">{rank}</text>
  </svg>
);

const ArmySVG = ({ count }: { count: number }) => {
  const warriors = Math.min(count, 10);
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
      {Array.from({ length: warriors }).map((_, i) => (
        <svg key={i} width="24" height="32" viewBox="0 0 24 32">
          <circle cx="12" cy="8" r="5" fill="#E63E7C" />
          <rect x="7" y="13" width="10" height="12" rx="3" fill="#B5135A" />
          <rect x="3" y="14" width="4" height="8" rx="2" fill="#B5135A" />
          <rect x="17" y="14" width="4" height="8" rx="2" fill="#B5135A" />
          <rect x="8" y="25" width="4" height="7" rx="2" fill="#B5135A" />
          <rect x="12" y="25" width="4" height="7" rx="2" fill="#B5135A" />
          <rect x="19" y="10" width="2" height="14" rx="1" fill="#D5D5DC" />
        </svg>
      ))}
      {count > 10 && (
        <span style={{ fontSize: 12, color: "#F08AB0", alignSelf: "center" }}>+{count - 10}</span>
      )}
    </div>
  );
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: warrior } = trpc.warrior.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: solvedCount } = trpc.tasks.solvedCount.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: topicScores } = trpc.diagnostics.getTopicScores.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: weeklyPlan } = trpc.plan.getWeeklyPlan.useQuery({}, {
    enabled: isAuthenticated,
  });
  const { data: quotes } = trpc.motivation.quotes.useQuery({});

  const radarData = topicScores?.length
    ? topicScores.map((s) => ({ topic: s.topic.slice(0, 8), score: s.score }))
    : [
        { topic: "Алгебра", score: 0 },
        { topic: "Геометрия", score: 0 },
        { topic: "Параметры", score: 0 },
        { topic: "Производные", score: 0 },
        { topic: "Вероятность", score: 0 },
      ];

  const today = new Date();
  const egeDate = user ? new Date("2026-06-01") : new Date("2026-06-01");
  const daysToEge = Math.max(0, Math.ceil((egeDate.getTime() - today.getTime()) / 86400000));

  const randomQuote = quotes?.[Math.floor(Math.random() * (quotes?.length || 1))];

  const avgScore =
    topicScores?.length
      ? Math.round(topicScores.reduce((s, t) => s + t.score, 0) / topicScores.length)
      : 0;
  const predictedEge = Math.round(40 + (avgScore / 100) * 60);

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32, padding: 24 }}>
        {/* Hero */}
        <div style={{ textAlign: "center", maxWidth: 600 }}>
          <div style={{ marginBottom: 24 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="40" fill="#E63E7C" />
              <rect x="38" y="12" width="4" height="56" rx="2" fill="white" />
              <rect x="24" y="36" width="32" height="4" rx="2" fill="white" />
              <rect x="34" y="16" width="12" height="6" rx="2" fill="white" opacity="0.7" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: 48, color: "#F08AB0", marginBottom: 8 }}>
            Путь самурая
          </h1>
          <p style={{ fontSize: 20, color: "#D5D5DC", marginBottom: 8 }}>
            AI-платформа подготовки к ЕГЭ по математике
          </p>
          <p style={{ fontSize: 15, color: "#D5D5DC", marginBottom: 32, lineHeight: 1.6 }}>
            Не просто проверяй знания — учись думать. AI находит пробелы, объясняет ошибки
            и строит персональный путь к результату.
          </p>
          <a
            href={getLoginUrl()}
            className="btn-samurai"
            style={{ display: "inline-block", textDecoration: "none", fontSize: 16, padding: "14px 40px" }}
          >
            ⚔️ Начать путь
          </a>
        </div>

        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, maxWidth: 900, width: "100%" }}>
          {[
            { icon: "🎯", title: "Диагностика пробелов", desc: "15 задач — и ты знаешь, где слабые места" },
            { icon: "🤖", title: "AI-разбор ошибок", desc: "Находит первую ошибку, объясняет правило" },
            { icon: "⚔️", title: "Самурай-таймер", desc: "Учишься — самурай сражается. Строй армию!" },
            { icon: "🃏", title: "Карточки формул", desc: "SM-2 алгоритм — повторяй в нужный момент" },
          ].map((f) => (
            <div key={f.title} className="card-samurai" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: 14, color: "#F08AB0", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#D5D5DC" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stagger-children" style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>Привет, {user?.name?.split(" ")[0] ?? "Самурай"}! ⚔️</h1>
        <p style={{ color: "#D5D5DC" }}>Путь к мастерству начинается с первого шага</p>
      </div>

      {/* Top row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Score card */}
        <div className="card-samurai" style={{ gridColumn: "span 1" }}>
          <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 8, fontFamily: "Cinzel, serif" }}>ПРОГНОЗ ЕГЭ</div>
          <div className="stat-number">{predictedEge}</div>
          <div style={{ fontSize: 13, color: "#D5D5DC", marginTop: 4 }}>из 100 баллов</div>
          <div className="progress-samurai" style={{ marginTop: 12 }}>
            <div className="progress-samurai-fill" style={{ width: `${predictedEge}%` }} />
          </div>
          <div style={{ fontSize: 12, color: "#F08AB0", marginTop: 6 }}>
            До 85+ ещё {Math.max(0, 85 - predictedEge)} баллов
          </div>
        </div>

        {/* Days to EGE */}
        <div className="card-samurai">
          <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 8, fontFamily: "Cinzel, serif" }}>ДО ЕГЭ</div>
          <div className="stat-number" style={{ color: daysToEge < 30 ? "#E63E7C" : "#D4A82C" }}>
            {daysToEge}
          </div>
          <div style={{ fontSize: 13, color: "#D5D5DC", marginTop: 4 }}>дней</div>
          <div style={{ fontSize: 12, color: "#D5D5DC", marginTop: 8 }}>📅 1 июня 2026</div>
          <div style={{ fontSize: 12, color: "#F08AB0", marginTop: 4 }}>Цель: 40 мин/день</div>
        </div>

        {/* Solved tasks */}
        <div className="card-samurai">
          <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 8, fontFamily: "Cinzel, serif" }}>РЕШЕНО ЗАДАЧ</div>
          <div className="stat-number" style={{ color: "#2D9D5F" }}>{solvedCount ?? 0}</div>
          <div style={{ fontSize: 13, color: "#D5D5DC", marginTop: 4 }}>из 170+</div>
          <div className="progress-samurai" style={{ marginTop: 12 }}>
            <div
              className="progress-samurai-fill"
              style={{
                width: `${Math.min(100, ((solvedCount ?? 0) / 170) * 100)}%`,
                background: "linear-gradient(90deg, #2D9D5F, #4ade80)",
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "#4ade80", marginTop: 6 }}>
            {Math.round(((solvedCount ?? 0) / 170) * 100)}% каталога
          </div>
        </div>
      </div>

      {/* Middle row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Today's plan */}
        <div className="card-samurai">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>📋 План на сегодня</h3>
            <button
              className="btn-samurai"
              style={{ fontSize: 12, padding: "6px 14px" }}
              onClick={() => navigate("/plan")}
            >
              Все задания
            </button>
          </div>
          {weeklyPlan && weeklyPlan.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {weeklyPlan.slice(0, 3).map((plan, i) => (
                <div
                  key={plan.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    background: "#242430",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/practice")}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: plan.status === "completed" ? "#2D9D5F" : "linear-gradient(135deg, #E63E7C, #B5135A)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: "white",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {plan.status === "completed" ? "✓" : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{plan.topic}</div>
                    <div style={{ fontSize: 11, color: "#D5D5DC" }}>{plan.estimatedMinutes} мин</div>
                  </div>
                  <span className={`badge-samurai ${plan.status === "completed" ? "badge-green" : "badge-pink"}`}>
                    {plan.status === "completed" ? "Готово" : "Начать"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
              <p style={{ color: "#D5D5DC", fontSize: 14, marginBottom: 12 }}>
                Пройди диагностику, чтобы получить персональный план
              </p>
              <button className="btn-samurai" style={{ fontSize: 13 }} onClick={() => navigate("/diagnostics")}>
                Пройти диагностику
              </button>
            </div>
          )}
        </div>

        {/* Radar chart */}
        <div className="card-samurai">
          <h3 style={{ marginBottom: 16 }}>🎯 Уровень по темам</h3>
          {topicScores && topicScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#33333D" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: "#D5D5DC", fontSize: 11 }} />
                <Radar
                  name="Уровень"
                  dataKey="score"
                  stroke="#E63E7C"
                  fill="#E63E7C"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <p style={{ color: "#D5D5DC", fontSize: 13, marginBottom: 12 }}>
                Карта пробелов появится после диагностики
              </p>
              <button className="btn-samurai" style={{ fontSize: 13 }} onClick={() => navigate("/diagnostics")}>
                Начать диагностику
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Warrior widget */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card-samurai" style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <SamuraiWarriorSVG rank={warrior?.warriorRank ?? "ронин"} count={warrior?.samuraiCount ?? 0} />
          <div>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 18, color: "#F08AB0", marginBottom: 8 }}>
              Армия самураев
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#D5D5DC" }}>Звание</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#E63E7C" }}>
                  {warrior?.warriorRank ?? "ронин"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#D5D5DC" }}>Самураев</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#E63E7C" }}>
                  {warrior?.samuraiCount ?? 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#D5D5DC" }}>Серия дней</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#D4A82C" }}>
                  {warrior?.currentStreak ?? 0} 🔥
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#D5D5DC" }}>Часов учёбы</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#2D9D5F" }}>
                  {Math.round((warrior?.totalMinutes ?? 0) / 60)}
                </div>
              </div>
            </div>
            {warrior && warrior.samuraiCount > 0 && (
              <ArmySVG count={warrior.samuraiCount} />
            )}
            <button
              className="btn-samurai"
              style={{ marginTop: 12, fontSize: 13 }}
              onClick={() => navigate("/timer")}
            >
              ⚔️ Начать сессию
            </button>
          </div>
        </div>

        {/* Motivation quote */}
        <div className="card-samurai" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 12, fontFamily: "Cinzel, serif" }}>
            🌸 МОТИВАЦИЯ ДНЯ
          </div>
          {randomQuote ? (
            <>
              <blockquote style={{ fontSize: 16, color: "#F08AB0", fontStyle: "italic", lineHeight: 1.6, margin: 0, marginBottom: 12 }}>
                "{randomQuote.text}"
              </blockquote>
              {randomQuote.author && (
                <div style={{ fontSize: 13, color: "#D5D5DC" }}>— {randomQuote.author}</div>
              )}
            </>
          ) : (
            <p style={{ color: "#D5D5DC", fontStyle: "italic" }}>
              "Путь воина — это решимость встретить смерть с честью. Путь ученика — решимость встретить задачу с умом."
            </p>
          )}
          <button
            className="btn-samurai"
            style={{ marginTop: 16, fontSize: 13, alignSelf: "flex-start" }}
            onClick={() => navigate("/motivation")}
          >
            Больше мотивации
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { icon: "⚔️", label: "Решать задачи", path: "/practice", color: "#E63E7C" },
          { icon: "🎯", label: "Диагностика", path: "/diagnostics", color: "#D4A82C" },
          { icon: "🃏", label: "Карточки", path: "/flashcards", color: "#2D9D5F" },
          { icon: "📋", label: "Варианты ЕГЭ", path: "/variants", color: "#7C3AED" },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            style={{
              background: "#1A1A22",
              border: `1px solid ${action.color}40`,
              borderRadius: 12,
              padding: "16px 12px",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 200ms",
              color: "white",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = `${action.color}20`;
              (e.currentTarget as HTMLButtonElement).style.borderColor = action.color;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#1A1A22";
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${action.color}40`;
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{action.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: action.color }}>{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
