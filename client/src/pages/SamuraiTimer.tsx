import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const PRESETS = [
  { label: "25 мин", minutes: 25, icon: "⚔️" },
  { label: "40 мин", minutes: 40, icon: "🏯" },
  { label: "50 мин", minutes: 50, icon: "🔥" },
  { label: "90 мин", minutes: 90, icon: "🌸" },
];

const CITY_NAMES = ["деревня", "городок", "город", "крепость", "столица"];

function SamuraiCityScene({ cityLevel, samuraiCount, isRunning }: { cityLevel: number; samuraiCount: number; isRunning: boolean }) {
  return (
    <svg width="320" height="200" viewBox="0 0 320 200" style={{ filter: "drop-shadow(0 0 20px rgba(230,62,124,0.3))" }}>
      {/* Sky */}
      <rect width="320" height="200" fill="#0F0F14" />
      {/* Stars */}
      {[20, 50, 80, 120, 160, 200, 250, 290].map((x, i) => (
        <circle key={i} cx={x} cy={10 + (i % 3) * 8} r="1" fill="white" opacity={0.6 + (i % 3) * 0.1} />
      ))}
      {/* Moon */}
      <circle cx="280" cy="25" r="15" fill="#F08AB0" opacity="0.8" />
      <circle cx="288" cy="20" r="12" fill="#0F0F14" />

      {/* Ground */}
      <rect x="0" y="160" width="320" height="40" fill="#1A1A22" />
      <line x1="0" y1="160" x2="320" y2="160" stroke="#E63E7C" strokeWidth="1" opacity="0.5" />

      {/* City buildings based on level */}
      {cityLevel >= 1 && (
        <g>
          {/* House */}
          <rect x="20" y="130" width="40" height="30" fill="#242430" />
          <polygon points="20,130 60,130 40,110" fill="#B5135A" />
          <rect x="32" y="145" width="16" height="15" fill="#E63E7C" opacity="0.5" />
        </g>
      )}
      {cityLevel >= 2 && (
        <g>
          {/* Tower */}
          <rect x="80" y="110" width="30" height="50" fill="#242430" />
          <polygon points="80,110 110,110 95,90" fill="#B5135A" />
          <rect x="88" y="120" width="14" height="14" fill="#E63E7C" opacity="0.5" />
          <rect x="88" y="140" width="14" height="14" fill="#E63E7C" opacity="0.5" />
        </g>
      )}
      {cityLevel >= 3 && (
        <g>
          {/* Castle */}
          <rect x="130" y="100" width="60" height="60" fill="#1A1A22" />
          <rect x="130" y="90" width="14" height="20" fill="#1A1A22" />
          <rect x="176" y="90" width="14" height="20" fill="#1A1A22" />
          <polygon points="130,100 190,100 160,75" fill="#B5135A" />
          <rect x="152" y="130" width="16" height="30" fill="#E63E7C" opacity="0.5" />
        </g>
      )}
      {cityLevel >= 4 && (
        <g>
          {/* Palace */}
          <rect x="210" y="95" width="80" height="65" fill="#1A1A22" />
          <polygon points="210,95 290,95 250,70" fill="#B5135A" />
          <rect x="210" y="80" width="12" height="20" fill="#1A1A22" />
          <rect x="278" y="80" width="12" height="20" fill="#1A1A22" />
          <rect x="240" y="120" width="20" height="40" fill="#E63E7C" opacity="0.5" />
          <rect x="220" y="110" width="14" height="14" fill="#E63E7C" opacity="0.4" />
          <rect x="266" y="110" width="14" height="14" fill="#E63E7C" opacity="0.4" />
        </g>
      )}

      {/* Samurai warriors */}
      {Array.from({ length: Math.min(samuraiCount, 8) }).map((_, i) => {
        const x = 20 + i * 38;
        const y = 148;
        return (
          <g key={i} transform={`translate(${x}, ${y})`} style={{ animation: isRunning ? `warrior-idle ${1.5 + i * 0.2}s ease-in-out infinite` : "none" }}>
            {/* Body */}
            <rect x="-5" y="-20" width="10" height="14" rx="2" fill="#E63E7C" />
            {/* Head */}
            <circle cx="0" cy="-24" r="6" fill="#F08AB0" />
            {/* Helmet */}
            <path d="M-6,-26 Q0,-34 6,-26" fill="#B5135A" />
            {/* Sword */}
            <rect x="6" y="-30" width="2" height="18" rx="1" fill="#D5D5DC" />
            <rect x="4" y="-22" width="6" height="2" rx="1" fill="#D4A82C" />
            {/* Legs */}
            <rect x="-4" y="-6" width="4" height="8" rx="2" fill="#B5135A" />
            <rect x="0" y="-6" width="4" height="8" rx="2" fill="#B5135A" />
          </g>
        );
      })}

      {/* Torches */}
      {[10, 310].map((x, i) => (
        <g key={i}>
          <rect x={x - 2} y="140" width="4" height="20" fill="#D4A82C" />
          <ellipse cx={x} cy="138" rx="4" ry="6" fill="#E63E7C" opacity={isRunning ? 0.9 : 0.4} />
        </g>
      ))}
    </svg>
  );
}

export default function SamuraiTimer() {
  const { isAuthenticated } = useAuth();
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [topic, setTopic] = useState("Алгебра");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const { data: warrior, refetch: refetchWarrior } = trpc.warrior.getStatus.useQuery(undefined, { enabled: isAuthenticated });
  const addMinutesMutation = trpc.warrior.addMinutes.useMutation({
    onSuccess: (data) => {
      refetchWarrior();
      if (data?.newSamuraiHired) {
        toast.success("🎉 Новый самурай нанят в армию!");
      }
      if (data?.rankChanged) {
        toast.success(`⚔️ Новое звание: ${data.warriorRank}!`);
      }
    },
  });

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - (selectedMinutes * 60 - timeLeft) * 1000;
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setSessionComplete(true);
            const minutesStudied = selectedMinutes;
            if (isAuthenticated) {
              addMinutesMutation.mutate({ minutes: minutesStudied });
            }
            toast.success(`⚔️ Сессия завершена! +${minutesStudied} минут`);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const handleStart = () => {
    setSessionComplete(false);
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedMinutes * 60);
    setSessionComplete(false);
  };

  const handlePreset = (minutes: number) => {
    if (!isRunning) {
      setSelectedMinutes(minutes);
      setTimeLeft(minutes * 60);
      setSessionComplete(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * 100;
  const cityLevel = warrior?.cityLevel ?? 0;
  const samuraiCount = warrior?.samuraiCount ?? 0;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>⏱️ Самурай-таймер</h1>
        <p style={{ color: "#D5D5DC" }}>Учишься — самурай сражается. Каждые 3 минуты — новый воин в армии!</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Timer */}
        <div className="card-samurai">
          {/* Presets */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {PRESETS.map((p) => (
              <button
                key={p.minutes}
                onClick={() => handlePreset(p.minutes)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: selectedMinutes === p.minutes ? "#E63E7C" : "#33333D",
                  background: selectedMinutes === p.minutes ? "rgba(230,62,124,0.2)" : "transparent",
                  color: selectedMinutes === p.minutes ? "#F08AB0" : "#D5D5DC",
                  cursor: isRunning ? "not-allowed" : "pointer",
                  fontSize: 13,
                  opacity: isRunning ? 0.5 : 1,
                }}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          {/* Timer display */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                fontSize: 80,
                fontFamily: "Cinzel, serif",
                fontWeight: 700,
                color: isRunning ? "#E63E7C" : "#F08AB0",
                lineHeight: 1,
                transition: "color 300ms",
                textShadow: isRunning ? "0 0 30px rgba(230,62,124,0.5)" : "none",
              }}
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 14, color: "#D5D5DC", marginTop: 8 }}>
              {isRunning ? "⚔️ Самурай сражается..." : sessionComplete ? "🎉 Сессия завершена!" : "Готов к бою"}
            </div>
          </div>

          {/* Progress ring */}
          <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 20px" }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#33333D" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke="#E63E7C"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#E63E7C" }}>
              {Math.round(progress)}%
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {!isRunning ? (
              <button className="btn-samurai" onClick={handleStart} style={{ fontSize: 16, padding: "12px 32px" }}>
                {timeLeft === selectedMinutes * 60 ? "⚔️ Начать" : "▶ Продолжить"}
              </button>
            ) : (
              <button
                onClick={handlePause}
                style={{ padding: "12px 32px", background: "transparent", border: "1px solid #E63E7C", borderRadius: 8, color: "#E63E7C", cursor: "pointer", fontSize: 16, fontWeight: 600 }}
              >
                ⏸ Пауза
              </button>
            )}
            <button
              onClick={handleReset}
              style={{ padding: "12px 20px", background: "transparent", border: "1px solid #33333D", borderRadius: 8, color: "#D5D5DC", cursor: "pointer", fontSize: 14 }}
            >
              ↺ Сброс
            </button>
          </div>

          {/* Topic */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, color: "#D5D5DC", display: "block", marginBottom: 6 }}>Тема сессии</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14 }}
            >
              {["Алгебра", "Геометрия", "Параметры", "Производные", "Теория вероятностей"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* City scene */}
        <div className="card-samurai" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 style={{ marginBottom: 4, textAlign: "center" }}>🏯 Твоя крепость</h3>
          <div style={{ fontSize: 13, color: "#D5D5DC", marginBottom: 16 }}>
            {CITY_NAMES[cityLevel]} · {samuraiCount} самураев
          </div>

          <SamuraiCityScene cityLevel={cityLevel} samuraiCount={samuraiCount} isRunning={isRunning} />

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16, width: "100%" }}>
            <div style={{ textAlign: "center", padding: 10, background: "#242430", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#D5D5DC", marginBottom: 2 }}>Звание</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#E63E7C" }}>{warrior?.warriorRank ?? "ронин"}</div>
            </div>
            <div style={{ textAlign: "center", padding: 10, background: "#242430", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#D5D5DC", marginBottom: 2 }}>Серия</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#D4A82C" }}>{warrior?.currentStreak ?? 0} 🔥</div>
            </div>
            <div style={{ textAlign: "center", padding: 10, background: "#242430", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#D5D5DC", marginBottom: 2 }}>Часов</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#2D9D5F" }}>
                {Math.round((warrior?.totalMinutes ?? 0) / 60)}
              </div>
            </div>
            <div style={{ textAlign: "center", padding: 10, background: "#242430", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#D5D5DC", marginBottom: 2 }}>Армия</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#F08AB0" }}>{samuraiCount} ⚔️</div>
            </div>
          </div>

          {/* Progress to next samurai */}
          {isAuthenticated && (
            <div style={{ marginTop: 12, width: "100%" }}>
              <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 4 }}>
                До следующего самурая: {3 - ((warrior?.totalMinutes ?? 0) % 3)} мин
              </div>
              <div className="progress-samurai">
                <div
                  className="progress-samurai-fill"
                  style={{ width: `${(((warrior?.totalMinutes ?? 0) % 3) / 3) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="card-samurai" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 12 }}>💡 Техника самурая</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { icon: "⚔️", title: "Полное погружение", desc: "Убери телефон. Самурай не отвлекается в бою." },
            { icon: "🌸", title: "Перерыв — ритуал", desc: "5 мин после 25 мин. Встань, подвигайся." },
            { icon: "📝", title: "Одна задача", desc: "Не переключайся. Доведи до конца." },
            { icon: "🏯", title: "Строй армию", desc: "Каждые 3 минуты — новый воин. Не прерывай серию!" },
          ].map((tip) => (
            <div key={tip.title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>{tip.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F08AB0", marginBottom: 2 }}>{tip.title}</div>
                <div style={{ fontSize: 12, color: "#D5D5DC" }}>{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
