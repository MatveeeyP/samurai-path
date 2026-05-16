import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Homework() {
  const { isAuthenticated } = useAuth();
  const { data: homeworkList, refetch } = trpc.homework.list.useQuery(undefined, { enabled: isAuthenticated });
  const submitMutation = trpc.homework.submit.useMutation({
    onSuccess: () => { toast.success("Домашнее задание сдано!"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
        <h2 style={{ marginBottom: 8 }}>Войдите, чтобы видеть задания</h2>
        <a href={getLoginUrl()} className="btn-samurai" style={{ display: "inline-block", textDecoration: "none", marginTop: 12 }}>
          Войти
        </a>
      </div>
    );
  }

  const statusColor = (s: string | null) => s === "reviewed" ? "#2D9D5F" : s === "submitted" ? "#D4A82C" : "#E63E7C";
  const statusLabel = (s: string | null) => s === "reviewed" ? "Проверено" : s === "submitted" ? "Сдано" : "Назначено";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>📚 Домашние задания</h1>
        <p style={{ color: "#D5D5DC" }}>Задания от преподавателя</p>
      </div>

      {!homeworkList || homeworkList.length === 0 ? (
        <div className="card-samurai" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <h3 style={{ marginBottom: 8 }}>Заданий пока нет</h3>
          <p style={{ color: "#D5D5DC", fontSize: 14 }}>
            Когда преподаватель назначит задание — оно появится здесь
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {homeworkList.map((hw) => (
            <div key={hw.id} className="card-samurai">
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                onClick={() => setExpandedId(expandedId === hw.id ? null : hw.id)}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{hw.title}</h3>
                  {hw.dueDate && (
                    <div style={{ fontSize: 12, color: "#D5D5DC", marginTop: 4 }}>
                      Срок: {new Date(hw.dueDate).toLocaleDateString("ru-RU")}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    className="badge-samurai"
                    style={{ background: `${statusColor(hw.status)}20`, color: statusColor(hw.status) }}
                  >
                    {statusLabel(hw.status)}
                  </span>
                  <span style={{ color: "#D5D5DC" }}>{expandedId === hw.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {expandedId === hw.id && (
                <div style={{ marginTop: 16, borderTop: "1px solid #33333D", paddingTop: 16 }}>
                  {hw.feedback && (
                    <div style={{ padding: "12px", background: "rgba(45,157,95,0.1)", borderRadius: 8, marginBottom: 12, borderLeft: "3px solid #2D9D5F" }}>
                      <div style={{ fontSize: 12, color: "#4ade80", marginBottom: 4 }}>Комментарий преподавателя:</div>
                      <div style={{ fontSize: 14, color: "#D5D5DC" }}>{hw.feedback}</div>
                    </div>
                  )}

                  {(hw.status === "assigned" || !hw.status) && (
                    <div>
                      <textarea
                        value={answers[hw.id] ?? ""}
                        onChange={(e) => setAnswers({ ...answers, [hw.id]: e.target.value })}
                        placeholder="Напишите ваши ответы и решения..."
                        rows={4}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: "#242430",
                          border: "1px solid #33333D",
                          borderRadius: 8,
                          color: "white",
                          fontSize: 14,
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
                      />
                      <button
                        className="btn-samurai"
                        style={{ marginTop: 10 }}
                        onClick={() => submitMutation.mutate({ id: hw.id })}
                        disabled={!answers[hw.id]?.trim() || submitMutation.isPending}
                      >
                        {submitMutation.isPending ? "Отправляю..." : "Сдать задание"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
