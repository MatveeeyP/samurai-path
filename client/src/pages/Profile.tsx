import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [grade, setGrade] = useState("");
  const [region, setRegion] = useState("");
  const [targetScore, setTargetScore] = useState("");

  const { data: stats } = trpc.profile.stats.useQuery(undefined, { enabled: isAuthenticated });
  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => { toast.success("Профиль обновлён!"); setEditing(false); },
  });

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center", padding: "60px 0" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>👤</div>
        <h2 style={{ marginBottom: 8 }}>Войдите в аккаунт</h2>
        <p style={{ color: "#D5D5DC", marginBottom: 24 }}>Чтобы видеть свой прогресс и сохранять результаты</p>
        <a href={getLoginUrl()} className="btn-samurai" style={{ textDecoration: "none", display: "inline-block" }}>
          ⚔️ Войти
        </a>
      </div>
    );
  }

  const radarData = stats?.topicScores?.map((s) => ({ topic: s.topic.slice(0, 8), score: s.score })) ?? [];
  const avgScore = radarData.length ? Math.round(radarData.reduce((s, t) => s + t.score, 0) / radarData.length) : 0;
  const predictedEge = Math.round(40 + (avgScore / 100) * 60);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>👤 Профиль</h1>
        <p style={{ color: "#D5D5DC" }}>Твой путь самурая</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
        {/* Left: Avatar + basic info */}
        <div>
          <div className="card-samurai" style={{ textAlign: "center", marginBottom: 16 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #E63E7C, #B5135A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 700,
                color: "white",
                margin: "0 auto 12px",
              }}
            >
              {user?.name?.[0]?.toUpperCase() ?? "С"}
            </div>
            <h3 style={{ marginBottom: 4 }}>{user?.name ?? "Самурай"}</h3>
            <p style={{ color: "#D5D5DC", fontSize: 13, marginBottom: 8 }}>{user?.email}</p>
            <span className="badge-samurai badge-pink">
              {user?.role === "admin" ? "Администратор" : "Ученик"}
            </span>
          </div>

          {/* Warrior rank */}
          <div className="card-samurai" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 8, fontFamily: "Cinzel, serif" }}>САМУРАЙ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#D5D5DC" }}>Звание</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#E63E7C" }}>
                  {stats?.warrior?.warriorRank ?? "ронин"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#D5D5DC" }}>Армия</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F08AB0" }}>
                  {stats?.warrior?.samuraiCount ?? 0} ⚔️
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#D5D5DC" }}>Серия</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#D4A82C" }}>
                  {stats?.warrior?.currentStreak ?? 0} 🔥
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#D5D5DC" }}>Часов</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#2D9D5F" }}>
                  {Math.round((stats?.warrior?.totalMinutes ?? 0) / 60)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #33333D", borderRadius: 8, color: "#D5D5DC", cursor: "pointer", fontSize: 14 }}
          >
            Выйти
          </button>
        </div>

        {/* Right: Stats */}
        <div>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div className="card-samurai" style={{ textAlign: "center" }}>
              <div className="stat-number" style={{ fontSize: 32 }}>{stats?.solvedCount ?? 0}</div>
              <div style={{ fontSize: 12, color: "#D5D5DC" }}>Решено задач</div>
            </div>
            <div className="card-samurai" style={{ textAlign: "center" }}>
              <div className="stat-number" style={{ fontSize: 32 }}>{predictedEge}</div>
              <div style={{ fontSize: 12, color: "#D5D5DC" }}>Прогноз ЕГЭ</div>
            </div>
            <div className="card-samurai" style={{ textAlign: "center" }}>
              <div className="stat-number" style={{ fontSize: 32, color: "#D4A82C" }}>
                {stats?.warrior?.longestStreak ?? 0}
              </div>
              <div style={{ fontSize: 12, color: "#D5D5DC" }}>Макс. серия</div>
            </div>
          </div>

          {/* Radar */}
          {radarData.length > 0 && (
            <div className="card-samurai" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 12 }}>📊 Карта знаний</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#33333D" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: "#D5D5DC", fontSize: 11 }} />
                  <Radar name="Уровень" dataKey="score" stroke="#E63E7C" fill="#E63E7C" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Edit profile */}
          <div className="card-samurai">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>⚙️ Настройки</h3>
              <button
                onClick={() => setEditing(!editing)}
                style={{ background: "none", border: "1px solid #33333D", borderRadius: 8, padding: "6px 14px", color: "#D5D5DC", cursor: "pointer", fontSize: 13 }}
              >
                {editing ? "Отмена" : "Изменить"}
              </button>
            </div>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: "#D5D5DC", display: "block", marginBottom: 4 }}>Класс</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14 }}
                  >
                    <option value="">Выберите класс</option>
                    {["9", "10", "11"].map((g) => <option key={g} value={g}>{g} класс</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "#D5D5DC", display: "block", marginBottom: 4 }}>Регион</label>
                  <input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Москва"
                    style={{ width: "100%", padding: "8px 12px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "#D5D5DC", display: "block", marginBottom: 4 }}>Целевой балл ЕГЭ</label>
                  <input
                    type="number"
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value)}
                    placeholder="85"
                    min="40"
                    max="100"
                    style={{ width: "100%", padding: "8px 12px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
                <button
                  className="btn-samurai"
                  onClick={() => updateMutation.mutate({ grade, region, targetScore: targetScore ? parseInt(targetScore) : undefined })}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Сохраняю..." : "Сохранить"}
                </button>
              </div>
            ) : (
              <div style={{ color: "#D5D5DC", fontSize: 14 }}>
                Настройте профиль для персонализации плана
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
