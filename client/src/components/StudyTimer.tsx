import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Play, Pause, RotateCcw } from "lucide-react";

interface StudyTimerProps {
  onSessionComplete?: (hours: number) => void;
}

export function StudyTimer({ onSessionComplete }: StudyTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionType, setSessionType] = useState("Учёба");

  const addSessionMutation = trpc.rememberMay21.addSession.useMutation({
    onSuccess: () => {
      toast.success("Сессия сохранена!");
      const hours = seconds / 3600;
      onSessionComplete?.(hours);
      setSeconds(0);
    },
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  // 1 samurai = 20 minutes = 1200 seconds
  const samuraiCount = Math.floor(seconds / 1200);
  const remainingSeconds = seconds % 1200;

  const formatTime = (h: number, m: number, s: number) => {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSave = () => {
    if (seconds === 0) {
      toast.error("Сессия не может быть пустой");
      return;
    }
    const hours = seconds / 3600;
    addSessionMutation.mutate({
      sessionType,
      hours,
    });
  };

  return (
    <Card style={{ padding: 24, background: "#fff", borderRadius: 20 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#333" }}>
        ⏱️ Таймер учёбы
      </h3>

      {/* Timer Display */}
      <div style={{
        textAlign: "center",
        marginBottom: 24,
        padding: 24,
        background: "#f4f7fc",
        borderRadius: 16,
      }}>
        <div style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#1B6DEB",
          marginBottom: 12,
          fontFamily: "monospace",
        }}>
          {formatTime(hours, minutes, secs)}
        </div>

        {/* Samurai Counter */}
        <div style={{
          fontSize: 14,
          color: "#666",
          marginBottom: 8,
        }}>
          🗡️ Самураев: <span style={{ fontWeight: 700, color: "#1B6DEB" }}>{samuraiCount}</span> (1 самурай = 20 мин)
        </div>

        {/* Hours Display */}
        <div style={{
          fontSize: 14,
          color: "#666",
        }}>
          ⏰ Часов: <span style={{ fontWeight: 700, color: "#1B6DEB" }}>{(seconds / 3600).toFixed(2)}</span>
        </div>
      </div>

      {/* Session Type Input */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#333", fontSize: 14 }}>
          Тип сессии
        </label>
        <input
          type="text"
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          placeholder="Например: Листочек, Веб, ДЗ"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            fontSize: 14,
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Control Buttons */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 12,
        marginBottom: 16,
      }}>
        <Button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            background: isRunning ? "#ff6b6b" : "#1B6DEB",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {isRunning ? (
            <>
              <Pause size={16} /> Пауза
            </>
          ) : (
            <>
              <Play size={16} /> Старт
            </>
          )}
        </Button>

        <Button
          onClick={() => {
            setIsRunning(false);
            setSeconds(0);
          }}
          variant="outline"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <RotateCcw size={16} /> Сброс
        </Button>

        <Button
          onClick={handleSave}
          disabled={seconds === 0 || addSessionMutation.isPending}
          style={{
            background: "#10b981",
            color: "#fff",
          }}
        >
          {addSessionMutation.isPending ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      {/* Quick Add Buttons */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e0e0e0" }}>
        <p style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>Быстрое добавление:</p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}>
          {[20, 40, 60, 120].map((mins) => (
            <Button
              key={mins}
              onClick={() => {
                setSeconds(mins * 60);
                setIsRunning(false);
              }}
              variant="outline"
              size="sm"
              style={{ fontSize: 12 }}
            >
              +{mins}м
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
