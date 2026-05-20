import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Zap } from "lucide-react";

interface StreakWidgetProps {
  userId?: number;
}

export function StreakWidget({ userId }: StreakWidgetProps) {
  const streakQuery = trpc.rememberMay21.getStreakInfo.useQuery();
  const useFreezeMutation = trpc.rememberMay21.useFreeze.useMutation({
    onSuccess: (data) => {
      toast.success(`Заморозка использована! Осталось: ${data.freezesRemaining}`);
      streakQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  const streak = streakQuery.data;

  if (!streak) {
    return (
      <Card style={{ padding: 20, background: "#fff", borderRadius: 20 }}>
        <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>Серия дней</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#1B6DEB" }}>🔥 0</div>
      </Card>
    );
  }

  return (
    <Card style={{ padding: 20, background: "#fff", borderRadius: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>Серия дней</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#1B6DEB", marginBottom: 8 }}>
          🔥 {streak.currentStreak}
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          Лучший результат: {streak.longestStreak} дней
        </div>
      </div>

      <div style={{ marginBottom: 16, padding: 12, background: "#f4f7fc", borderRadius: 12 }}>
        <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>Заморозки</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#1B6DEB" }}>
          ❄️ {streak.freezeCount} осталось
        </div>
      </div>

      <Button
        onClick={() => useFreezeMutation.mutate()}
        disabled={streak.freezeCount === 0 || streak.freezeUsedToday || useFreezeMutation.isPending}
        style={{
          width: "100%",
          background: streak.freezeCount === 0 || streak.freezeUsedToday ? "#ddd" : "#1B6DEB",
        }}
      >
        <Zap size={16} style={{ marginRight: 8 }} />
        {streak.freezeUsedToday ? "Уже использована" : "Использовать заморозку"}
      </Button>
    </Card>
  );
}
