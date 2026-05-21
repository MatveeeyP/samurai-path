import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageCircle, Zap, Heart, Brain, Loader } from "lucide-react";

interface AIMentorProps {
  mentorMode: "kind" | "strict" | "rude";
  currentStreak: number;
  hoursLogged: number;
}

export function AIMentor({ mentorMode, currentStreak, hoursLogged }: AIMentorProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [mentorMessage, setMentorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getMentorMessageMutation = trpc.rememberMay21Mentor.getMentorMessage.useMutation({
    onSuccess: (data) => {
      setMentorMessage(typeof data.message === 'string' ? data.message : '');
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
      setIsLoading(false);
    },
  });

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

  const generateMentorMessage = (action: string) => {
    setIsLoading(true);
    setSelectedAction(action);
    getMentorMessageMutation.mutate({
      action: action as "motivate" | "plan" | "reflect" | "rest",
      mentorMode,
    });
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
          <p style={{ fontSize: 12, color: "#999", margin: 0 }}>Твой личный наставник на основе ИИ</p>
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
          minHeight: 60,
          display: "flex",
          alignItems: "center",
        }}>
          <p style={{ color: "#333", lineHeight: 1.6, margin: 0 }}>
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
                Генерирую сообщение...
              </span>
            ) : (
              mentorMessage
            )}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
        marginBottom: 20,
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
                opacity: isLoading ? 0.6 : 1,
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Card>
  );
}
