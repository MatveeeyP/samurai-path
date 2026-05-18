import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import DrawingFlashcardCreator from "@/components/DrawingFlashcardCreator";

const SYSTEM_CARDS = [
  { front: "Формула дискриминанта", back: "D = b² - 4ac", topic: "Алгебра" },
  { front: "Теорема Пифагора", back: "c² = a² + b²", topic: "Геометрия" },
  { front: "Формула производной степени", back: "(xⁿ)' = n·xⁿ⁻¹", topic: "Производные" },
  { front: "Формула производной произведения", back: "(uv)' = u'v + uv'", topic: "Производные" },
  { front: "Формула производной частного", back: "(u/v)' = (u'v - uv') / v²", topic: "Производные" },
  { front: "sin²x + cos²x = ?", back: "1", topic: "Алгебра" },
  { front: "Площадь треугольника", back: "S = ½·a·h = ½·ab·sinC", topic: "Геометрия" },
  { front: "Теорема косинусов", back: "c² = a² + b² - 2ab·cosC", topic: "Геометрия" },
  { front: "Формула вероятности", back: "P(A) = m/n, где m — число благоприятных исходов", topic: "Теория вероятностей" },
  { front: "Формула суммы геометрической прогрессии", back: "Sₙ = b₁(qⁿ - 1)/(q - 1)", topic: "Алгебра" },
  { front: "Логарифм: logₐ(xy) = ?", back: "logₐx + logₐy", topic: "Алгебра" },
  { front: "Производная sin(x)", back: "cos(x)", topic: "Производные" },
  { front: "Производная cos(x)", back: "-sin(x)", topic: "Производные" },
  { front: "Производная eˣ", back: "eˣ", topic: "Производные" },
  { front: "Производная ln(x)", back: "1/x", topic: "Производные" },
  { front: "Площадь круга", back: "S = πr²", topic: "Геометрия" },
  { front: "Объём шара", back: "V = (4/3)πr³", topic: "Геометрия" },
  { front: "Формула корней квадратного уравнения", back: "x = (-b ± √D) / 2a", topic: "Алгебра" },
];

type Card = { id: number; front: string; back: string; topic?: string | null; repetitionCount?: number | null; easeFactor?: number | null; cardType?: string | null; frontDrawing?: string | null; backDrawing?: string | null; template?: string | null; };

export default function Flashcards() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<"browse" | "study" | "create" | "draw">("browse");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filterTopic, setFilterTopic] = useState("");
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newTopic, setNewTopic] = useState("Алгебра");
  const [studyCards, setStudyCards] = useState<Card[]>([]);

  const { data: userCards, refetch } = trpc.flashcards.list.useQuery(
    { topic: filterTopic || undefined },
    { enabled: isAuthenticated }
  );
  const createMutation = trpc.flashcards.create.useMutation({
    onSuccess: () => { toast.success("Карточка создана!"); refetch(); setNewFront(""); setNewBack(""); setMode("browse"); },
  });
  const reviewMutation = trpc.flashcards.review.useMutation();

  const allCards: Card[] = [
    ...SYSTEM_CARDS.filter((c) => !filterTopic || c.topic === filterTopic).map((c, i) => ({ id: -(i + 1), ...c })),
    ...(userCards ?? []),
  ];

  const startStudy = () => {
    const cards = allCards.sort(() => Math.random() - 0.5);
    setStudyCards(cards);
    setCurrentIdx(0);
    setFlipped(false);
    setMode("study");
  };

  const handleReview = async (quality: number) => {
    const card = studyCards[currentIdx];
    if (card && card.id > 0 && isAuthenticated) {
      await reviewMutation.mutateAsync({
        cardId: card.id,
        quality,
        currentRepetitions: card.repetitionCount ?? 0,
        currentEaseFactor: card.easeFactor ?? 2.5,
        currentInterval: 1,
      });
    }
    setFlipped(false);
    if (currentIdx < studyCards.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      toast.success("🎉 Все карточки пройдены!");
      setMode("browse");
    }
  };

  const topics = ["Алгебра", "Геометрия", "Параметры", "Производные", "Теория вероятностей"];
  const currentCard = studyCards[currentIdx];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>🃏 Карточки формул</h1>
        <p style={{ color: "#D5D5DC" }}>Интервальное повторение по алгоритму SM-2</p>
      </div>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#1A1A22", borderRadius: 10, padding: 4, width: "fit-content", overflowX: "auto" }}>
        {[
          { key: "browse", label: "📚 Все карточки" },
          { key: "create", label: "✏️ Текст" },
          { key: "draw", label: "🎨 Рисунок" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key as "browse" | "create" | "draw")}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              transition: "all 150ms",
              background: mode === tab.key ? "linear-gradient(135deg, #E63E7C, #B5135A)" : "transparent",
              color: mode === tab.key ? "white" : "#D5D5DC",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "study" && currentCard ? (
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          {/* Progress */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#D5D5DC", marginBottom: 12 }}>
            <span>Карточка {currentIdx + 1} из {studyCards.length}</span>
            <span style={{ color: "#E63E7C" }}>{currentCard.topic}</span>
          </div>
          <div className="progress-samurai" style={{ marginBottom: 20 }}>
            <div className="progress-samurai-fill" style={{ width: `${(currentIdx / studyCards.length) * 100}%` }} />
          </div>

          {/* Card */}
          <div
            onClick={() => setFlipped(!flipped)}
            style={{
              background: flipped ? "#242430" : "#1A1A22",
              border: `2px solid ${flipped ? "#E63E7C" : "#33333D"}`,
              borderRadius: 16,
              padding: "40px 32px",
              textAlign: "center",
              cursor: "pointer",
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 300ms",
              marginBottom: 20,
              boxShadow: flipped ? "0 0 24px rgba(230,62,124,0.2)" : "none",
            }}
          >
            <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 16, fontFamily: "Cinzel, serif" }}>
              {currentCard.cardType === "drawing" ? (flipped ? "РИСУНОК ОТВЕТА" : "РИСУНОК ВОПРОСА") : (flipped ? "ОТВЕТ" : "ВОПРОС")}
            </div>
            <div style={{ fontSize: flipped ? 28 : 18, color: flipped ? "#E63E7C" : "#fff", fontWeight: flipped ? 700 : 400, lineHeight: 1.5 }}>
              {currentCard.cardType === "drawing" ? (
                <div style={{ fontSize: 14, color: "#D5D5DC", fontStyle: "italic" }}>
                  {flipped ? "[Рисунок ответа]" : `[Рисунок вопроса - шаблон: ${currentCard.template}]`}
                </div>
              ) : (
                flipped ? currentCard.back : currentCard.front
              )}
            </div>
            {!flipped && (
              <div style={{ fontSize: 12, color: "#D5D5DC", marginTop: 16 }}>Нажми, чтобы увидеть ответ</div>
            )}
          </div>

          {flipped && (
            <div className="animate-fade-in-up">
              <div style={{ fontSize: 13, color: "#D5D5DC", textAlign: "center", marginBottom: 12 }}>
                Насколько хорошо ты знал?
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { q: 1, label: "Не знал", color: "#E63E7C" },
                  { q: 3, label: "С трудом", color: "#D4A82C" },
                  { q: 5, label: "Отлично!", color: "#2D9D5F" },
                ].map(({ q, label, color }) => (
                  <button
                    key={q}
                    onClick={() => handleReview(q)}
                    style={{
                      padding: "12px 8px",
                      background: `${color}20`,
                      border: `1px solid ${color}`,
                      borderRadius: 10,
                      color,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 14,
                      transition: "all 150ms",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = `${color}40`)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = `${color}20`)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setMode("browse")}
            style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", color: "#D5D5DC", cursor: "pointer", fontSize: 13 }}
          >
            ← Выйти из режима изучения
          </button>
        </div>
      ) : mode === "browse" ? (
        <div>
          {/* Filter + Start */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              style={{ padding: "10px 16px", background: "#1A1A22", border: "1px solid #33333D", borderRadius: 8, color: filterTopic ? "white" : "#D5D5DC", fontSize: 14 }}
            >
              <option value="">Все темы</option>
              {topics.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button className="btn-samurai" onClick={startStudy} style={{ fontSize: 14 }}>
              ⚔️ Начать изучение ({allCards.length} карточек)
            </button>
            <button
              onClick={() => window.print()}
              style={{
                padding: "10px 16px",
                background: "transparent",
                border: "1px solid #33333D",
                borderRadius: 8,
                color: "#D5D5DC",
                cursor: "pointer",
                fontSize: 14,
                transition: "all 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(230,62,124,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              🗸️ Распечатать
            </button>
          </div>

          {/* Cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {allCards.map((card) => (
              <div
                key={card.id}
                className="card-samurai"
                style={{ cursor: "default" }}
              >
                <div style={{ fontSize: 11, color: "#D5D5DC", marginBottom: 8, fontFamily: "Cinzel, serif" }}>
                  {card.topic ?? "Общее"}
                  {card.id < 0 && <span className="badge-samurai badge-blue" style={{ marginLeft: 6, fontSize: 10 }}>Система</span>}
                  {card.id > 0 && <span className="badge-samurai badge-green" style={{ marginLeft: 6, fontSize: 10 }}>Моя</span>}
                </div>
                {card.cardType === "drawing" && card.frontDrawing ? (
                  <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 8, fontStyle: "italic" }}>Рисунок (шаблон: {card.template})</div>
                ) : (
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{card.front}</div>
                )}
                <div style={{ fontSize: 13, color: "#E63E7C" }}>{card.cardType === "drawing" ? "[Рисунок на обороте]" : card.back}</div>
              </div>
            ))}
          </div>
        </div>
      ) : mode === "draw" ? (
        <DrawingFlashcardCreator
          onCreateCard={(card) => {
            if (isAuthenticated) {
              createMutation.mutate({
                front: card.front,
                back: card.back,
                topic: card.topic,
                cardType: card.cardType,
                frontDrawing: card.frontDrawing,
                backDrawing: card.backDrawing,
                template: card.template,
              });
            } else {
              toast.error("Войдите, чтобы сохранять карточки");
            }
          }}
        />
      ) : (
        /* Create Text */
        <div style={{ maxWidth: 500 }}>
          <div className="card-samurai">
            <h3 style={{ marginBottom: 16 }}>✏️ Новая текстовая карточка</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: "#D5D5DC", display: "block", marginBottom: 6 }}>Вопрос / Понятие</label>
              <textarea
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                placeholder="Например: Формула дискриминанта"
                rows={2}
                style={{ width: "100%", padding: "10px 14px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14, resize: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: "#D5D5DC", display: "block", marginBottom: 6 }}>Ответ / Определение</label>
              <textarea
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                placeholder="Например: D = b² - 4ac"
                rows={2}
                style={{ width: "100%", padding: "10px 14px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14, resize: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#D5D5DC", display: "block", marginBottom: 6 }}>Тема</label>
              <select
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", background: "#242430", border: "1px solid #33333D", borderRadius: 8, color: "white", fontSize: 14 }}
              >
                {topics.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button
              className="btn-samurai"
              onClick={() => createMutation.mutate({ front: newFront, back: newBack, topic: newTopic })}
              disabled={!newFront.trim() || !newBack.trim() || createMutation.isPending || !isAuthenticated}
              style={{ width: "100%" }}
            >
              {createMutation.isPending ? "Создаю..." : "Создать карточку"}
            </button>
            {!isAuthenticated && (
              <p style={{ fontSize: 12, color: "#D5D5DC", marginTop: 8, textAlign: "center" }}>Войдите, чтобы сохранять карточки</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
