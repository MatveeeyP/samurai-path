import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"tasks" | "theory" | "motivation" | "users">("tasks");
  const [newTask, setNewTask] = useState({ text: "", answer: "", solution: "", topic: "Алгебра", difficulty: "medium" as "easy" | "medium" | "hard", category: "ЕГЭ" });
  const [newTheory, setNewTheory] = useState({ title: "", content: "", topic: "Алгебра" });
  const [newStory, setNewStory] = useState({ heroName: "", title: "", summary: "", category: "famous" as "famous" | "student" | "quote" | "provocation" });

  const { data: tasks, refetch: refetchTasks } = trpc.tasks.list.useQuery({ limit: 20 });

  const createTaskMutation = trpc.admin.createTask.useMutation({
    onSuccess: () => { toast.success("Задача создана!"); refetchTasks(); setNewTask({ text: "", answer: "", solution: "", topic: "Алгебра", difficulty: "medium", category: "ЕГЭ" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteTaskMutation = trpc.admin.deleteTask.useMutation({
    onSuccess: () => { toast.success("Задача удалена"); refetchTasks(); },
  });
  const createTheoryMutation = trpc.admin.createArticle.useMutation({
    onSuccess: () => { toast.success("Статья создана!"); setNewTheory({ title: "", content: "", topic: "Алгебра" }); },
  });
  const createStoryMutation = trpc.admin.createStory.useMutation({
    onSuccess: () => { toast.success("История создана!"); setNewStory({ heroName: "", title: "", summary: "", category: "famous" }); },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
        <h2 style={{ marginBottom: 8 }}>Доступ запрещён</h2>
        <p style={{ color: "#D5D5DC" }}>Только для администраторов</p>
      </div>
    );
  }

  const TOPICS = ["Алгебра", "Геометрия", "Параметры", "Производные", "Теория вероятностей"];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>⚙️ Администрирование</h1>
        <p style={{ color: "#D5D5DC" }}>Управление контентом платформы</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Задач в базе", value: tasks?.length ?? 0, color: "#E63E7C" },
          { label: "Тем", value: 5, color: "#7C3AED" },
          { label: "Разделов", value: 9, color: "#2D9D5F" },
        ].map((s) => (
          <div key={s.label} className="card-samurai" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "Cinzel, serif" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#D5D5DC" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#1A1A22", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[
          { key: "tasks", label: "⚔️ Задачи" },
          { key: "theory", label: "📚 Теория" },
          { key: "motivation", label: "🔥 Мотивация" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              transition: "all 150ms",
              background: activeTab === tab.key ? "linear-gradient(135deg, #E63E7C, #B5135A)" : "transparent",
              color: activeTab === tab.key ? "white" : "#D5D5DC",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "tasks" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Create task */}
          <div className="card-samurai">
            <h3 style={{ marginBottom: 16 }}>➕ Новая задача</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <textarea
                value={newTask.text}
                onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                placeholder="Текст задачи..."
                rows={3}
                style={{ padding: "10px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14, resize: "none" }}
              />
              <input
                value={newTask.answer}
                onChange={(e) => setNewTask({ ...newTask, answer: e.target.value })}
                placeholder="Ответ"
                style={{ padding: "10px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14 }}
              />
              <textarea
                value={newTask.solution}
                onChange={(e) => setNewTask({ ...newTask, solution: e.target.value })}
                placeholder="Решение (опционально)..."
                rows={2}
                style={{ padding: "10px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14, resize: "none" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <select
                  value={newTask.topic}
                  onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })}
                  style={{ padding: "10px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14 }}
                >
                  {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={newTask.difficulty}
                  onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value as "easy" | "medium" | "hard" })}
                  style={{ padding: "10px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14 }}
                >
                  <option value="easy">Лёгкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </select>
              </div>
              <button
                className="btn-samurai"
                onClick={() => createTaskMutation.mutate({ text: newTask.text, answer: newTask.answer, solution: newTask.solution, topic: newTask.topic, difficulty: newTask.difficulty, category: newTask.category })}
                disabled={!newTask.text.trim() || !newTask.answer.trim() || createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? "Создаю..." : "Создать задачу"}
              </button>
            </div>
          </div>

          {/* Task list */}
          <div>
            <h3 style={{ marginBottom: 12 }}>Задачи ({tasks?.length ?? 0})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflowY: "auto" }}>
              {tasks?.map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: "10px 12px",
                    background: "#1A1A22",
                    border: "1px solid #33333D",
                    borderRadius: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#E63E7C", marginBottom: 2 }}>{task.topic}</div>
                    <div style={{ fontSize: 13, color: "#D5D5DC" }}>{task.text.slice(0, 60)}...</div>
                  </div>
                  <button
                    onClick={() => deleteTaskMutation.mutate({ id: task.id })}
                    style={{ background: "none", border: "none", color: "#E63E7C", cursor: "pointer", fontSize: 16 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "theory" && (
        <div className="card-samurai">
          <h3 style={{ marginBottom: 16 }}>➕ Новая статья</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              value={newTheory.title}
              onChange={(e) => setNewTheory({ ...newTheory, title: e.target.value })}
              placeholder="Заголовок"
              style={{ padding: "10px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14 }}
            />
            <select
              value={newTheory.topic}
              onChange={(e) => setNewTheory({ ...newTheory, topic: e.target.value })}
              style={{ padding: "10px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14 }}
            >
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <textarea
              value={newTheory.content}
              onChange={(e) => setNewTheory({ ...newTheory, content: e.target.value })}
              placeholder="Содержание (Markdown)..."
              rows={8}
              style={{ padding: "10px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14, resize: "vertical" }}
            />
            <button
              className="btn-samurai"
              onClick={() => createTheoryMutation.mutate({ title: newTheory.title, content: newTheory.content, topic: newTheory.topic })}
              disabled={!newTheory.title.trim() || !newTheory.content.trim() || createTheoryMutation.isPending}
            >
              {createTheoryMutation.isPending ? "Создаю..." : "Создать статью"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "motivation" && (
        <div className="card-samurai">
          <h3 style={{ marginBottom: 16 }}>➕ Новая история</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              value={newStory.heroName}
              onChange={(e) => setNewStory({ ...newStory, heroName: e.target.value })}
              placeholder="Имя героя"
              style={{ padding: "10px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14 }}
            />
            <input
              value={newStory.title}
              onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
              placeholder="Заголовок"
              style={{ padding: "10px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14 }}
            />
            <textarea
              value={newStory.summary}
              onChange={(e) => setNewStory({ ...newStory, summary: e.target.value })}
              placeholder="Краткое содержание..."
              rows={3}
              style={{ padding: "10px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14, resize: "none" }}
            />
            <select
              value={newStory.category}
              onChange={(e) => setNewStory({ ...newStory, category: e.target.value as "famous" | "student" | "quote" | "provocation" })}
              style={{ padding: "10px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14 }}
            >
              <option value="famous">Великие люди</option>
              <option value="student">Истории учеников</option>
              <option value="quote">Цитата</option>
              <option value="provocation">Провокация</option>
            </select>
            <button
              className="btn-samurai"
              onClick={() => createStoryMutation.mutate({ title: newStory.title, summary: newStory.summary, heroName: newStory.heroName, category: newStory.category })}
              disabled={!newStory.title.trim() || createStoryMutation.isPending}
            >
              {createStoryMutation.isPending ? "Создаю..." : "Создать историю"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
