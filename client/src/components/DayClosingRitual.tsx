import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { X } from "lucide-react";

interface DayClosingRitualProps {
  isOpen: boolean;
  onClose: () => void;
  hoursLogged: number;
  tasksCompleted: number;
}

export function DayClosingRitual({ isOpen, onClose, hoursLogged, tasksCompleted }: DayClosingRitualProps) {
  const [mood, setMood] = useState<"excellent" | "good" | "neutral" | "tired" | "struggling">("neutral");
  const [reflection, setReflection] = useState("");
  const [nextDayFocus, setNextDayFocus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeDayRitual = trpc.rememberMay21.closeDayRitual.useMutation({
    onSuccess: () => {
      toast.success("День закрыт! Спи спокойно 😴");
      setMood("neutral");
      setReflection("");
      setNextDayFocus("");
      setIsSubmitting(false);
      onClose();
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    if (!reflection.trim() || !nextDayFocus.trim()) {
      toast.error("Заполни рефлексию и план на завтра");
      return;
    }

    setIsSubmitting(true);
    const today = new Date().toISOString().split("T")[0];

    closeDayRitual.mutate({
      date: today,
      hoursLogged,
      tasksCompleted,
      mood,
      reflection: reflection.trim(),
      nextDayFocus: nextDayFocus.trim(),
    });
  };

  if (!isOpen) return null;

  const moodEmojis: Record<string, string> = {
    excellent: "🌟",
    good: "😊",
    neutral: "😐",
    tired: "😴",
    struggling: "😤",
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "flex-end",
      zIndex: 50,
    }}>
      <Card style={{
        width: "100%",
        maxWidth: 600,
        borderRadius: "24px 24px 0 0",
        padding: 32,
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1B6DEB" }}>Закрытие дня</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={24} color="#999" />
          </button>
        </div>

        {/* Stats Summary */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 24,
          padding: 16,
          background: "#f4f7fc",
          borderRadius: 16,
        }}>
          <div>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>Часов сегодня</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1B6DEB" }}>{hoursLogged.toFixed(1)}ч</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>Задач выполнено</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1B6DEB" }}>{tasksCompleted}</div>
          </div>
        </div>

        {/* Mood Selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 12, fontWeight: 600, color: "#333" }}>
            Как ты себя чувствуешь? {moodEmojis[mood]}
          </label>
          <Select value={mood} onValueChange={(v: any) => setMood(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">🌟 Отлично! Готов горы свернуть</SelectItem>
              <SelectItem value="good">😊 Хорошо, день прошёл продуктивно</SelectItem>
              <SelectItem value="neutral">😐 Нормально, обычный день</SelectItem>
              <SelectItem value="tired">😴 Устал, нужен отдых</SelectItem>
              <SelectItem value="struggling">😤 Сложно, но я не сдаюсь</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reflection */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#333" }}>
            Что произошло сегодня? (рефлексия)
          </label>
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Напиши, что удалось, что не получилось, какие уроки ты извлёк..."
            style={{ minHeight: 100, marginBottom: 0 }}
          />
        </div>

        {/* Next Day Focus */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#333" }}>
            Фокус на завтра
          </label>
          <Textarea
            value={nextDayFocus}
            onChange={(e) => setNextDayFocus(e.target.value)}
            placeholder="Что самое важное нужно сделать завтра? На чём сконцентрироваться?"
            style={{ minHeight: 80, marginBottom: 0 }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <Button
            onClick={onClose}
            variant="outline"
            style={{ flex: 1 }}
          >
            Отложить
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ flex: 1, background: "#1B6DEB" }}
          >
            {isSubmitting ? "Сохранение..." : "Закрыть день 🌙"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
