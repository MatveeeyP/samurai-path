import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageCircle, Zap, Heart, Brain } from "lucide-react";

interface AIMentorProps {
  mentorMode: "kind" | "strict" | "rude";
  currentStreak: number;
  hoursLogged: number;
}

export function AIMentor({ mentorMode, currentStreak, hoursLogged }: AIMentorProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [mentorMessage, setMentorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const mentorEmojis = {
    kind: "🤗",
    strict: "💪",
    rude: "🔥",
  };

  const mentorNames = {
    kind: "Добрый наставник",
    strict: "Строгий наставник",
    rude: "Наставник без фильтра",
  };

  // Generate mentor message based on action and personality
  const generateMentorMessage = async (action: string) => {
    setIsLoading(true);
    setSelectedAction(action);

    try {
      // Simulate LLM call - in production, this would call backend
      const messages = {
        motivate: {
          kind: `Ты молодец! ${currentStreak} дней подряд - это серьёзное достижение! Продолжай в том же духе, ты на правильном пути. Каждый день - это шаг к твоей мечте. 💪`,
          strict: `${currentStreak} дней - хорошо, но не расслабляйся! Впереди ещё много работы. Завтра нужно быть ещё лучше. Давай!`,
          rude: `${currentStreak} дней - ладно, неплохо. Но это не финиш, а только начало. Не зевай, впереди сложнее.`,
        },
        plan: {
          kind: `Давай спланируем завтра вместе! Сосредоточься на самом важном. Я верю в тебя! 📋`,
          strict: `Завтра нужно сделать ещё больше. Составь чёткий план и выполни его без отговорок.`,
          rude: `Спланируй завтра или будешь жалеть. Никаких отговорок.`,
        },
        reflect: {
          kind: `Рефлексия - это мудро! Подумай, что сегодня прошло хорошо, а что можно улучшить. Ты растёшь с каждым днём! 🌱`,
          strict: `Анализируй каждый день. Только так ты поймёшь, что работает, а что нет.`,
          rude: `Не просто делай, думай! Анализируй, учись на ошибках.`,
        },
        rest: {
          kind: `Отдых - это тоже часть пути! Позаботься о себе, восстанови силы. Завтра ты будешь ещё сильнее! 😴`,
          strict: `Отдыхай, но не слишком долго. Завтра снова в бой!`,
          rude: `Спи, восстанавливайся. Завтра нужно быть на 100%.`,
        },
      };

      const message = messages[action as keyof typeof messages]?.[mentorMode] || "Ты делаешь отлично!";
      setMentorMessage(message);
    } catch (error) {
      toast.error("Ошибка при генерации сообщения");
    } finally {
      setIsLoading(false);
    }
  };

  const actions = [
    { id: "motivate", label: "Мотивация", icon: Heart },
    { id: "plan", label: "План", icon: Brain },
    { id: "reflect", label: "Рефлексия", icon: MessageCircle },
    { id: "rest", label: "Отдых", icon: Zap },
  ];

  return (
    <Card style={{ padding: 24, background: "#fff", borderRadius: 20 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 40, marginRight: 12 }}>{mentorEmojis[mentorMode]}</div>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#333", margin: 0 }}>
            {mentorNames[mentorMode]}
          </h3>
          <p style={{ fontSize: 12, color: "#999", margin: 0 }}>Твой личный наставник</p>
        </div>
      </div>

      {/* Mentor Message */}
      {mentorMessage && (
        <div style={{
          padding: 16,
          background: "#f4f7fc",
          borderRadius: 12,
          marginBottom: 20,
          borderLeft: "4px solid #1B6DEB",
        }}>
          <p style={{ color: "#333", lineHeight: 1.6, margin: 0 }}>
            {mentorMessage}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
      }}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              onClick={() => generateMentorMessage(action.id)}
              disabled={isLoading}
              variant={selectedAction === action.id ? "default" : "outline"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: selectedAction === action.id ? "#1B6DEB" : "transparent",
                color: selectedAction === action.id ? "#fff" : "#1B6DEB",
                border: `2px solid ${selectedAction === action.id ? "#1B6DEB" : "#e0e0e0"}`,
              }}
            >
              <Icon size={16} />
              <span>{action.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Stats Display */}
      <div style={{
        marginTop: 20,
        paddingTop: 20,
        borderTop: "1px solid #e0e0e0",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>Серия</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1B6DEB" }}>🔥 {currentStreak}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>Часов сегодня</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1B6DEB" }}>{hoursLogged.toFixed(1)}ч</div>
        </div>
      </div>
    </Card>
  );
}
