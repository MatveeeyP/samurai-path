import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DayClosingRitual } from "@/components/DayClosingRitual";
import { StreakWidget } from "@/components/StreakWidget";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { AIMentor } from "@/components/AIMentor";
import { StudyTimer } from "@/components/StudyTimer";

export default function RememberMay21() {
  const { user, isAuthenticated } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showDayClosing, setShowDayClosing] = useState(false);

  // Onboarding state
  const [displayName, setDisplayName] = useState("");
  const [mentorMode, setMentorMode] = useState<"kind" | "strict" | "rude">("kind");
  const [weeklyHours, setWeeklyHours] = useState("48");
  const [seasonGoal, setSeasonGoal] = useState("");

  // Queries
  const profileQuery = trpc.rememberMay21.getProfile.useQuery(undefined, { enabled: isAuthenticated });
  const sessionsQuery = trpc.rememberMay21.getWeeklySessions.useQuery(undefined, { enabled: isAuthenticated });
  const goalsQuery = trpc.rememberMay21.getGoals.useQuery(undefined, { enabled: isAuthenticated });
  const tasksQuery = trpc.rememberMay21.getTasks.useQuery(undefined, { enabled: isAuthenticated });
  const todaySummaryQuery = trpc.rememberMay21.getTodaySummary.useQuery(undefined, { enabled: isAuthenticated });
  const streakQuery = trpc.rememberMay21.getStreakInfo.useQuery(undefined, { enabled: isAuthenticated });
  const weekSummaryQuery = trpc.rememberMay21.getWeekSummary.useQuery(undefined, { enabled: isAuthenticated });

  // Mutations
  const setupProfileMutation = trpc.rememberMay21.setupProfile.useMutation({
    onSuccess: () => {
      toast.success("Профиль создан!");
      setShowOnboarding(false);
      profileQuery.refetch();
    },
  });

  const addSessionMutation = trpc.rememberMay21.addSession.useMutation({
    onSuccess: () => {
      toast.success("Сессия добавлена!");
      sessionsQuery.refetch();
    },
  });

  const createTaskMutation = trpc.rememberMay21.createTask.useMutation({
    onSuccess: () => {
      toast.success("Задача создана!");
      tasksQuery.refetch();
    },
  });

  const toggleTaskMutation = trpc.rememberMay21.toggleTask.useMutation({
    onSuccess: () => {
      tasksQuery.refetch();
    },
  });

  useEffect(() => {
    if (isAuthenticated && !profileQuery.data) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, profileQuery.data]);

  if (!isAuthenticated) {
    return (
      <div style={{ background: "#f4f7fc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card style={{ padding: 40, textAlign: "center", maxWidth: 400 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1B6DEB", marginBottom: 16 }}>Вспомни 21 мая</h1>
          <p style={{ color: "#666", marginBottom: 24 }}>Личная система дисциплины и трекер подготовки</p>
          <Button onClick={() => (window.location.href = getLoginUrl())} style={{ width: "100%", background: "#1B6DEB" }}>
            Войти
          </Button>
        </Card>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: 20 }}>
        <div style={{ maxWidth: 500, margin: "0 auto", marginTop: 40 }}>
          <Card style={{ padding: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1B6DEB", marginBottom: 24 }}>Настройка профиля</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#333" }}>Как тебя зовут?</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Имя" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#333" }}>Режим наставника</label>
              <Select value={mentorMode} onValueChange={(v: any) => setMentorMode(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kind">Добрый наставник 🤗</SelectItem>
                  <SelectItem value="strict">Строгий наставник 💪</SelectItem>
                  <SelectItem value="rude">Наставник, которому пофиг 🔥</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#333" }}>Недельная цель (часы)</label>
              <Input type="number" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#333" }}>Главная цель сезона</label>
              <Textarea value={seasonGoal} onChange={(e) => setSeasonGoal(e.target.value)} placeholder="Например: грант 100% или поступить на бюджет" />
            </div>

            <Button
              onClick={() =>
                setupProfileMutation.mutate({
                  displayName,
                  mentorMode,
                  weeklyHoursGoal: parseFloat(weeklyHours),
                  seasonGoal,
                })
              }
              disabled={!displayName || setupProfileMutation.isPending}
              style={{ width: "100%", background: "#1B6DEB" }}
            >
              {setupProfileMutation.isPending ? "Сохранение..." : "Начать путь"}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const totalWeeklyHours = (sessionsQuery.data || []).reduce((sum, s) => sum + s.hours, 0);
  const weeklyGoal = profileQuery.data?.weeklyHoursGoal || 48;
  const progressPercent = Math.min(100, (totalWeeklyHours / weeklyGoal) * 100);
  const todayHours = (todaySummaryQuery.data?.hoursLogged || 0);
  const todayTasks = (todaySummaryQuery.data?.tasksCompleted || 0);

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1B6DEB", marginBottom: 8 }}>Вспомни 21 мая</h1>
            <p style={{ color: "#666", fontSize: 16 }}>
              Привет, <span style={{ fontWeight: 600, color: "#1B6DEB" }}>{profileQuery.data?.displayName}</span>! 🔥
            </p>
          </div>
          <Button
            onClick={() => setShowDayClosing(true)}
            style={{
              background: "#1B6DEB",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 12,
            }}
          >
            🌙 Закрыть день
          </Button>
        </div>

        {/* Main Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 32 }}>
          <StreakWidget />

          <Card style={{ padding: 20, background: "#fff", borderRadius: 20 }}>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>Часов на неделе</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1B6DEB", marginBottom: 12 }}>
              {totalWeeklyHours.toFixed(1)} / {weeklyGoal}
            </div>
            <div style={{ height: 8, background: "#e0e7ff", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#1B6DEB", width: `${progressPercent}%`, transition: "width 300ms" }} />
            </div>
          </Card>

          <Card style={{ padding: 20, background: "#fff", borderRadius: 20 }}>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>Сегодня</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Часов</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1B6DEB" }}>{todayHours.toFixed(1)}ч</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Задач</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1B6DEB" }}>{todayTasks}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList style={{ background: "#fff", borderRadius: 20, padding: 4, marginBottom: 20 }}>
            <TabsTrigger value="dashboard">Главная</TabsTrigger>
            <TabsTrigger value="mentor">Наставник</TabsTrigger>
            <TabsTrigger value="heatmap">Активность</TabsTrigger>
            <TabsTrigger value="tracker">Трекер</TabsTrigger>
            <TabsTrigger value="tasks">Задачи</TabsTrigger>
            <TabsTrigger value="goals">Цели</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" style={{ marginTop: 20 }}>
            <Card style={{ padding: 20, background: "#fff", borderRadius: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#333" }}>Добро пожаловать! 👋</h3>
              <p style={{ color: "#666", lineHeight: 1.6, marginBottom: 16 }}>
                Это твоя личная система дисциплины. Здесь ты отслеживаешь часы учёбы, управляешь целями и получаешь поддержку от ИИ-наставника.
              </p>
              <div style={{ padding: 16, background: "#f4f7fc", borderRadius: 12, borderLeft: "4px solid #1B6DEB" }}>
                <p style={{ color: "#333", margin: 0, fontSize: 14 }}>
                  <strong>Совет:</strong> Закрывай день каждый вечер, чтобы система отслеживала твой прогресс и серию дней. Это главная фишка! 🎯
                </p>
              </div>
            </Card>

            {/* Week Summary */}
            {(weekSummaryQuery.data || []).length > 0 && (
              <Card style={{ padding: 20, background: "#fff", borderRadius: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#333" }}>Неделя в цифрах</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
                  {(weekSummaryQuery.data || []).map((day, idx) => (
                    <div key={idx} style={{ padding: 12, background: "#f4f7fc", borderRadius: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                        {new Date(day.date + "T00:00:00Z").toLocaleDateString("ru-RU", { weekday: "short" })}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#1B6DEB" }}>
                        {day.hoursLogged.toFixed(1)}ч
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>{day.mood}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mentor" style={{ marginTop: 20 }}>
            <AIMentor
              mentorMode={profileQuery.data?.mentorMode || "kind"}
              currentStreak={streakQuery.data?.currentStreak || 0}
              hoursLogged={todayHours}
            />
          </TabsContent>

          <TabsContent value="heatmap" style={{ marginTop: 20 }}>
            <ActivityHeatmap />
          </TabsContent>

          <TabsContent value="tracker" style={{ marginTop: 20 }}>
            <StudyTimer onSessionComplete={() => sessionsQuery.refetch()} />

            <Card style={{ padding: 20, background: "#fff", borderRadius: 20, marginTop: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#333" }}>Сессии на неделе</h3>
              {(sessionsQuery.data || []).length === 0 ? (
                <p style={{ color: "#999" }}>Пока нет сессий</p>
              ) : (
                <div>
                  {(sessionsQuery.data || []).map((s) => (
                    <div key={s.id} style={{ padding: 12, background: "#f9fafb", borderRadius: 12, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#333" }}>{s.sessionType}</span>
                      <span style={{ fontWeight: 600, color: "#1B6DEB" }}>{s.hours}ч</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="tasks" style={{ marginTop: 20 }}>
            <Card style={{ padding: 20, background: "#fff", borderRadius: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#333" }}>Новая задача</h3>
              <Input type="text" placeholder="Название задачи" id="taskTitle" style={{ marginBottom: 12 }} />
              <Button
                onClick={() => {
                  const title = (document.getElementById("taskTitle") as HTMLInputElement).value;
                  if (title) {
                    createTaskMutation.mutate({ title });
                    (document.getElementById("taskTitle") as HTMLInputElement).value = "";
                  }
                }}
                style={{ width: "100%", background: "#1B6DEB" }}
              >
                Создать
              </Button>
            </Card>

            <Card style={{ padding: 20, background: "#fff", borderRadius: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#333" }}>Задачи</h3>
              {(tasksQuery.data || []).length === 0 ? (
                <p style={{ color: "#999" }}>Все задачи выполнены! 🎉</p>
              ) : (
                (tasksQuery.data || []).map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: 12,
                      background: t.isCompleted ? "#e8f5e9" : "#f9fafb",
                      borderRadius: 12,
                      marginBottom: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textDecoration: t.isCompleted ? "line-through" : "none",
                      color: t.isCompleted ? "#999" : "#333",
                    }}
                  >
                    <span>{t.title}</span>
                    <Button
                      onClick={() => toggleTaskMutation.mutate({ taskId: t.id, isCompleted: !t.isCompleted })}
                      variant="outline"
                      size="sm"
                    >
                      {t.isCompleted ? "✓" : "○"}
                    </Button>
                  </div>
                ))
              )}
            </Card>
          </TabsContent>

          <TabsContent value="goals" style={{ marginTop: 20 }}>
            <Card style={{ padding: 20, background: "#fff", borderRadius: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#333" }}>Твои цели</h3>
              {(goalsQuery.data || []).length === 0 ? (
                <p style={{ color: "#999" }}>Целей нет. Создай первую! 🎯</p>
              ) : (
                (goalsQuery.data || []).map((g) => (
                  <div key={g.id} style={{ padding: 12, background: "#f9fafb", borderRadius: 12, marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, color: "#333" }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      До {new Date(g.targetDate).toLocaleDateString("ru-RU")} {g.isGrandGoal ? "🎯 Главная цель" : ""}
                    </div>
                  </div>
                ))
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Day Closing Ritual Modal */}
      <DayClosingRitual
        isOpen={showDayClosing}
        onClose={() => setShowDayClosing(false)}
        hoursLogged={todayHours}
        tasksCompleted={todayTasks}
      />
    </div>
  );
}
