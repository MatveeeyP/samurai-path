import { useState } from "react";
import { trpc } from "@/lib/trpc";

const STATIC_STORIES = [
  {
    icon: "🏆",
    category: "famous",
    heroName: "Стив Джобс",
    title: "Уволен — и стал легендой",
    summary: "В 30 лет его уволили из Apple — компании, которую он основал. Он мог сдаться. Вместо этого он основал NeXT и Pixar, а потом вернулся и спас Apple.",
    lesson: "Поражение — это не конец пути. Это поворот.",
  },
  {
    icon: "📚",
    category: "student",
    heroName: "Аноним, 2023",
    title: "С 48 до 97 баллов за год",
    summary: "Первая диагностика — 48 баллов. Каждый день 40 минут. Разбор каждой ошибки. Через год — 97 баллов на ЕГЭ.",
    lesson: "40 минут в день × 365 дней = мастерство.",
  },
  {
    icon: "⚔️",
    category: "famous",
    heroName: "Миямото Мусаси",
    title: "60 дуэлей — 60 побед",
    summary: "Величайший самурай Японии. Не проиграл ни одного поединка. Его секрет: он изучал каждого противника, прежде чем встретиться с ним.",
    lesson: "Изучи задачу до боя. Победа начинается в голове.",
  },
  {
    icon: "🎓",
    category: "student",
    heroName: "Маша, Новосибирск",
    title: "Математика — мой враг",
    summary: "В 10 классе получала 2-3 по математике. Начала с базы, каждый день по одной теме. К ЕГЭ — 78 баллов.",
    lesson: "Нет плохих учеников. Есть неправильный метод.",
  },
  {
    icon: "🔥",
    category: "provocation",
    heroName: "Вызов",
    title: "Ты точно не сдашься?",
    summary: "Прямо сейчас кто-то в твоём городе решает ту же задачу, что и ты. Он не отвлекается. Он не смотрит в телефон. Он будет на 10 баллов выше тебя на ЕГЭ.",
    lesson: "Или ты решаешь задачу сейчас, или кто-то другой займёт твоё место.",
  },
  {
    icon: "🌸",
    category: "quote",
    heroName: "Лао-цзы",
    title: "Путь в тысячу ли",
    summary: "Путь в тысячу ли начинается с одного шага.",
    lesson: "Не думай о ЕГЭ. Думай о следующей задаче.",
  },
];

const STATIC_QUOTES = [
  { text: "Путь воина — это решимость встретить смерть с честью. Путь ученика — решимость встретить задачу с умом.", author: "Ямамото Цунэтомо" },
  { text: "Победа над собой важнее победы над тысячей врагов.", author: "Будда" },
  { text: "Не бойся медленно двигаться. Бойся стоять на месте.", author: "Китайская пословица" },
  { text: "Самурай, который не учится — это просто человек с мечом.", author: "Японская мудрость" },
  { text: "Каждая ошибка — это урок. Каждый урок — это шаг к мастерству.", author: "Миямото Мусаси" },
  { text: "Дисциплина — это мост между целью и достижением.", author: "Джим Рон" },
  { text: "Гений — это 1% вдохновения и 99% пота.", author: "Томас Эдисон" },
  { text: "Сложные задачи делают тебя сильнее. Лёгкие — только подтверждают то, что ты уже знаешь.", author: "Неизвестный самурай" },
];

export default function Motivation() {
  const [activeCategory, setActiveCategory] = useState<"all" | "famous" | "student" | "quote" | "provocation">("all");
  const [expandedStory, setExpandedStory] = useState<number | null>(null);

  const { data: serverStories } = trpc.motivation.stories.useQuery({ category: activeCategory !== "all" ? activeCategory : undefined });
  const { data: serverQuotes } = trpc.motivation.quotes.useQuery({});

  const stories = serverStories && serverStories.length > 0 ? serverStories : STATIC_STORIES;
  const quotes = serverQuotes && serverQuotes.length > 0 ? serverQuotes : STATIC_QUOTES;

  const filteredStories = activeCategory === "all"
    ? stories
    : stories.filter((s) => (s as any).category === activeCategory);

  const categoryColors: Record<string, string> = {
    famous: "#E63E7C",
    student: "#2D9D5F",
    quote: "#7C3AED",
    provocation: "#D4A82C",
  };

  const categoryLabels: Record<string, string> = {
    all: "Всё",
    famous: "Великие люди",
    student: "Истории учеников",
    quote: "Цитаты",
    provocation: "Провокация",
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>🔥 Мотивация</h1>
        <p style={{ color: "#D5D5DC" }}>Истории, цитаты и провокации для тех, кто не сдаётся</p>
      </div>

      {/* Random quote banner */}
      <div
        className="card-samurai animate-pulse-glow"
        style={{ marginBottom: 24, textAlign: "center", padding: "24px 32px" }}
      >
        <div style={{ fontSize: 12, color: "#D5D5DC", marginBottom: 12, fontFamily: "Cinzel, serif" }}>
          🌸 ЦИТАТА ДНЯ
        </div>
        <blockquote style={{ fontSize: 18, color: "#F08AB0", fontStyle: "italic", lineHeight: 1.7, margin: 0, marginBottom: 8 }}>
          "{quotes[Math.floor(Math.random() * quotes.length)]?.text}"
        </blockquote>
        <div style={{ fontSize: 14, color: "#D5D5DC" }}>
          — {quotes[Math.floor(Math.random() * quotes.length)]?.author}
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["all", "famous", "student", "quote", "provocation"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "6px 16px",
              borderRadius: 999,
              border: "1px solid",
              borderColor: activeCategory === cat ? (categoryColors[cat] ?? "#E63E7C") : "#33333D",
              background: activeCategory === cat ? `${(categoryColors[cat] ?? "#E63E7C")}20` : "transparent",
              color: activeCategory === cat ? (categoryColors[cat] ?? "#E63E7C") : "#D5D5DC",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: activeCategory === cat ? 600 : 400,
              transition: "all 150ms",
            }}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Stories */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
        {filteredStories.map((story, i) => {
          const s = story as typeof STATIC_STORIES[0];
          const color = categoryColors[s.category] ?? "#E63E7C";
          const isExpanded = expandedStory === i;
          return (
            <div
              key={i}
              className="card-samurai"
              style={{
                borderLeftColor: color,
                cursor: "pointer",
                transition: "all 200ms",
              }}
              onClick={() => setExpandedStory(isExpanded ? null : i)}
            >
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color, marginBottom: 2, fontFamily: "Cinzel, serif" }}>
                    {s.heroName}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{s.title}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "#D5D5DC", lineHeight: 1.6, margin: 0 }}>
                {s.summary}
              </p>
              {isExpanded && (
                <div
                  className="animate-fade-in-up"
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: `${color}15`,
                    border: `1px solid ${color}40`,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: 12, color, marginBottom: 4, fontWeight: 600 }}>💡 УРОК</div>
                  <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.6 }}>{s.lesson}</div>
                </div>
              )}
              <div style={{ fontSize: 12, color, marginTop: 8 }}>
                {isExpanded ? "▲ Свернуть" : "▼ Читать урок"}
              </div>
            </div>
          );
        })}
      </div>

      {/* All quotes */}
      <div>
        <h2 style={{ marginBottom: 16 }}>📜 Мудрость самураев</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {quotes.map((q, i) => (
            <div
              key={i}
              style={{
                padding: "16px 20px",
                background: "#1A1A22",
                border: "1px solid #33333D",
                borderRadius: 10,
                borderLeft: "3px solid #7C3AED",
              }}
            >
              <blockquote style={{ fontSize: 14, color: "#D5D5DC", fontStyle: "italic", lineHeight: 1.6, margin: 0, marginBottom: 8 }}>
                "{q.text}"
              </blockquote>
              {q.author && (
                <div style={{ fontSize: 12, color: "#F08AB0" }}>— {q.author}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
