import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

type SocraticMessage = { role: "user" | "assistant"; content: string };

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const taskId = parseInt(id ?? "0");

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showSolutionInput, setShowSolutionInput] = useState(false);
  const [solutionText, setSolutionText] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<{
    step_with_error: string;
    error_type: string;
    what_went_wrong: string;
    rule_to_remember: string;
    next_question: string;
  } | null>(null);
  const [motivPhrase, setMotivPhrase] = useState("");
  const [showSocratic, setShowSocratic] = useState(false);
  const [socraticMessages, setSocraticMessages] = useState<SocraticMessage[]>([]);
  const [socraticInput, setSocraticInput] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: task, isLoading } = trpc.tasks.byId.useQuery({ id: taskId });
  const { data: similarTasks } = trpc.tasks.byTopic.useQuery(
    { topic: task?.topic ?? "", limit: 3 },
    { enabled: !!task?.topic }
  );

  const submitMutation = trpc.tasks.submit.useMutation();
  const analyzeErrorMutation = trpc.ai.analyzeError.useMutation();
  const motivMutation = trpc.ai.motivationalPhrase.useMutation();
  const socraticMutation = trpc.ai.socraticChat.useMutation();

  const handleSubmit = async () => {
    if (!answer.trim() || !isAuthenticated) return;
    setAttemptCount((c) => c + 1);

    const result = await submitMutation.mutateAsync({ taskId, userAnswer: answer });
    setIsCorrect(result.isCorrect);
    setSubmitted(true);

    // Get motivational phrase
    const phrase = await motivMutation.mutateAsync({
      isCorrect: result.isCorrect,
      attemptCount: attemptCount + 1,
      topic: task?.topic,
    });
    setMotivPhrase(phrase.phrase);

    if (!result.isCorrect) {
      setShowSolutionInput(true);
    }
  };

  const handleAnalyzeError = async () => {
    if (!solutionText.trim() || !task) return;
    const analysis = await analyzeErrorMutation.mutateAsync({
      taskId,
      userAnswer: answer,
      userSolution: solutionText,
      taskText: task.text,
    });
    setAiAnalysis(analysis);
  };

  const startSocratic = () => {
    setShowSocratic(true);
    setSocraticMessages([
      {
        role: "assistant",
        content: `Привет! Я помогу тебе разобраться с этой задачей через наводящие вопросы.\n\n**Задача:** ${task?.text}\n\nКакой первый шаг ты предложишь?`,
      },
    ]);
  };

  const sendSocraticMessage = async () => {
    if (!socraticInput.trim() || !task) return;
    const userMsg = socraticInput;
    setSocraticInput("");
    const newMessages: SocraticMessage[] = [...socraticMessages, { role: "user", content: userMsg }];
    setSocraticMessages(newMessages);

    const result = await socraticMutation.mutateAsync({
      taskText: task.text,
      taskAnswer: task.answer ?? undefined,
      messages: newMessages.slice(0, -1),
      userMessage: userMsg,
    });

    setSocraticMessages([...newMessages, { role: "assistant", content: result.reply }]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#D5D5DC" }}>
        Загрузка задачи...
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <p style={{ color: "#D5D5DC" }}>Задача не найдена</p>
        <button className="btn-samurai" onClick={() => navigate("/practice")}>
          ← Назад к каталогу
        </button>
      </div>
    );
  }

  const diffColor = task.difficulty === "easy" ? "#2D9D5F" : task.difficulty === "medium" ? "#D4A82C" : "#E63E7C";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Back */}
      <button
        onClick={() => navigate("/practice")}
        style={{ background: "none", border: "none", color: "#E63E7C", cursor: "pointer", fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}
      >
        ← Назад к каталогу
      </button>

      <div style={{ display: "grid", gridTemplateColumns: showSocratic ? "1fr 380px" : "1fr", gap: 16 }}>
        {/* Main task area */}
        <div>
          {/* Task card */}
          <div className="card-samurai" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <span className="badge-samurai badge-pink">{task.topic}</span>
              <span className="badge-samurai" style={{ background: `${diffColor}20`, color: diffColor }}>
                {task.difficulty === "easy" ? "Лёгкий" : task.difficulty === "medium" ? "Средний" : "Сложный"}
              </span>
              {task.category && <span className="badge-samurai badge-blue">{task.category}</span>}
            </div>

            <div style={{ fontSize: 16, lineHeight: 1.7, color: "#fff", marginBottom: 20 }}>
              {task.text}
            </div>

            {/* Answer input */}
            {!submitted ? (
              <div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Введите ваш ответ..."
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      background: "#242430",
                      border: "1px solid #33333D",
                      borderRadius: 8,
                      color: "white",
                      fontSize: 15,
                    }}
                  />
                  <button
                    className="btn-samurai"
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending || !answer.trim() || !isAuthenticated}
                  >
                    {submitMutation.isPending ? "..." : "Проверить"}
                  </button>
                </div>
                {!isAuthenticated && (
                  <p style={{ fontSize: 12, color: "#D5D5DC", marginTop: 8 }}>
                    Войдите, чтобы сохранять прогресс
                  </p>
                )}
              </div>
            ) : (
              <div>
                {/* Result */}
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 10,
                    background: isCorrect ? "rgba(45,157,95,0.15)" : "rgba(230,62,124,0.15)",
                    border: `1px solid ${isCorrect ? "#2D9D5F" : "#E63E7C"}`,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 700, color: isCorrect ? "#4ade80" : "#E63E7C", marginBottom: 4 }}>
                    {isCorrect ? "✅ Верно!" : "❌ Неверно"}
                  </div>
                  {motivPhrase && (
                    <div style={{ fontSize: 14, color: "#D5D5DC", fontStyle: "italic" }}>
                      {motivPhrase}
                    </div>
                  )}
                </div>

                {isCorrect && task.solution && (
                  <details style={{ marginBottom: 12 }}>
                    <summary style={{ cursor: "pointer", color: "#E63E7C", fontSize: 14, fontWeight: 600 }}>
                      Посмотреть решение
                    </summary>
                    <div style={{ marginTop: 8, padding: 12, background: "#242430", borderRadius: 8, fontSize: 14, color: "#D5D5DC" }}>
                      {task.solution}
                    </div>
                  </details>
                )}

                <button
                  onClick={() => { setSubmitted(false); setAnswer(""); setIsCorrect(null); setAiAnalysis(null); setShowSolutionInput(false); setSolutionText(""); }}
                  style={{ background: "none", border: "1px solid #33333D", borderRadius: 8, padding: "8px 16px", color: "#D5D5DC", cursor: "pointer", fontSize: 13 }}
                >
                  Попробовать ещё раз
                </button>
              </div>
            )}
          </div>

          {/* AI Error Analysis */}
          {showSolutionInput && !aiAnalysis && (
            <div className="card-samurai animate-fade-in-up" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 12 }}>🤖 Расскажи, как решал</h3>
              <p style={{ fontSize: 14, color: "#D5D5DC", marginBottom: 12 }}>
                Опиши свой ход решения — AI найдёт первую ошибку и объяснит правило
              </p>
              <textarea
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                placeholder="Например: Я подставил x=2, получил 4-6+3=1, но ответ не совпал..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#242430",
                  border: "1px solid #33333D",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 14,
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  className="btn-samurai"
                  onClick={handleAnalyzeError}
                  disabled={analyzeErrorMutation.isPending || !solutionText.trim()}
                >
                  {analyzeErrorMutation.isPending ? "⚔️ Анализирую..." : "🤖 Получить разбор от AI"}
                </button>
                <button
                  onClick={startSocratic}
                  style={{
                    padding: "10px 20px",
                    background: "transparent",
                    border: "1px solid #E63E7C",
                    borderRadius: 8,
                    color: "#E63E7C",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  💬 Сократический разбор
                </button>
              </div>
            </div>
          )}

          {/* AI Analysis Result */}
          {aiAnalysis && (
            <div className="card-samurai animate-fade-in-up" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 16, color: "#F08AB0" }}>🔍 Разбор ошибки</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ padding: 12, background: "#242430", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 4 }}>ГДЕ ОШИБКА</div>
                  <div style={{ fontSize: 14, color: "#E63E7C" }}>{aiAnalysis.step_with_error}</div>
                </div>

                <div style={{ padding: 12, background: "#242430", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 4 }}>ТИП ОШИБКИ</div>
                  <span className="badge-samurai badge-yellow">{aiAnalysis.error_type}</span>
                </div>

                <div style={{ padding: 12, background: "#242430", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 4 }}>ЧТО ПОШЛО НЕ ТАК</div>
                  <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.6 }}>{aiAnalysis.what_went_wrong}</div>
                </div>

                <div style={{ padding: 12, background: "rgba(45,157,95,0.1)", border: "1px solid #2D9D5F", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#4ade80", marginBottom: 4 }}>📌 ПРАВИЛО</div>
                  <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.6 }}>{aiAnalysis.rule_to_remember}</div>
                </div>

                <div style={{ padding: 12, background: "rgba(230,62,124,0.1)", border: "1px solid #E63E7C", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#F08AB0", marginBottom: 4 }}>❓ ВОПРОС ОТ AI</div>
                  <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.6 }}>{aiAnalysis.next_question}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <button
                  className="btn-samurai"
                  style={{ fontSize: 13 }}
                  onClick={() => navigate(`/practice?topic=${task.topic}&errorType=${aiAnalysis.error_type}`)}
                >
                  3 похожих задачи
                </button>
                <button
                  onClick={startSocratic}
                  style={{ padding: "8px 16px", background: "transparent", border: "1px solid #33333D", borderRadius: 8, color: "#D5D5DC", cursor: "pointer", fontSize: 13 }}
                >
                  💬 Спросить AI
                </button>
              </div>
            </div>
          )}

          {/* Similar tasks */}
          {similarTasks && similarTasks.length > 0 && (
            <div className="card-samurai">
              <h3 style={{ marginBottom: 12 }}>⚔️ Похожие задачи</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {similarTasks.filter((t) => t.id !== taskId).slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/task/${t.id}`)}
                    style={{
                      padding: "10px 12px",
                      background: "#242430",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#D5D5DC",
                      transition: "background 150ms",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#2A2A38")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#242430")}
                  >
                    {t.text.slice(0, 80)}...
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Socratic chat */}
        {showSocratic && (
          <div className="card-samurai animate-fade-in-up" style={{ display: "flex", flexDirection: "column", height: "fit-content", maxHeight: 600 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>💬 Сократический разбор</h3>
              <button
                onClick={() => setShowSocratic(false)}
                style={{ background: "none", border: "none", color: "#D5D5DC", cursor: "pointer", fontSize: 18 }}
              >
                ×
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, maxHeight: 400 }}>
              {socraticMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: msg.role === "assistant" ? "#242430" : "rgba(230,62,124,0.15)",
                    border: msg.role === "assistant" ? "1px solid #33333D" : "1px solid #E63E7C",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: msg.role === "assistant" ? "#D5D5DC" : "#fff",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#E63E7C", marginBottom: 4, fontWeight: 600 }}>
                    {msg.role === "assistant" ? "🤖 AI-наставник" : "👤 Ты"}
                  </div>
                  {msg.content}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={socraticInput}
                onChange={(e) => setSocraticInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendSocraticMessage()}
                placeholder="Твой ответ..."
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  background: "#242430",
                  border: "1px solid #33333D",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 13,
                }}
              />
              <button
                className="btn-samurai"
                onClick={sendSocraticMessage}
                disabled={socraticMutation.isPending || !socraticInput.trim()}
                style={{ padding: "10px 16px", fontSize: 13 }}
              >
                {socraticMutation.isPending ? "..." : "→"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
