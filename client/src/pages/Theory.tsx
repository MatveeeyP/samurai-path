import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

const THEORY_SECTIONS = [
  {
    topic: "Алгебра",
    icon: "📐",
    color: "#E63E7C",
    articles: [
      { title: "Квадратные уравнения", desc: "Дискриминант, формула корней, теорема Виета", difficulty: "easy" },
      { title: "Логарифмы", desc: "Свойства, формулы перехода, уравнения", difficulty: "medium" },
      { title: "Степени и корни", desc: "Правила действий, иррациональные уравнения", difficulty: "easy" },
      { title: "Прогрессии", desc: "Арифметическая и геометрическая прогрессии", difficulty: "medium" },
    ],
  },
  {
    topic: "Геометрия",
    icon: "📏",
    color: "#7C3AED",
    articles: [
      { title: "Треугольники", desc: "Теоремы синусов и косинусов, площади", difficulty: "medium" },
      { title: "Окружность", desc: "Хорды, касательные, вписанные углы", difficulty: "medium" },
      { title: "Стереометрия", desc: "Тела вращения, многогранники, объёмы", difficulty: "hard" },
      { title: "Координаты", desc: "Уравнения прямой, расстояния, векторы", difficulty: "easy" },
    ],
  },
  {
    topic: "Производные",
    icon: "📈",
    color: "#2D9D5F",
    articles: [
      { title: "Определение производной", desc: "Предел, геометрический смысл", difficulty: "medium" },
      { title: "Таблица производных", desc: "Все базовые формулы", difficulty: "easy" },
      { title: "Правила дифференцирования", desc: "Сумма, произведение, частное, сложная функция", difficulty: "medium" },
      { title: "Исследование функций", desc: "Монотонность, экстремумы, выпуклость", difficulty: "hard" },
    ],
  },
  {
    topic: "Параметры",
    icon: "🎯",
    color: "#D4A82C",
    articles: [
      { title: "Линейные уравнения с параметром", desc: "Метод прямой, анализ случаев", difficulty: "hard" },
      { title: "Квадратные уравнения с параметром", desc: "Дискриминант, теорема Виета", difficulty: "hard" },
      { title: "Неравенства с параметром", desc: "Графический метод", difficulty: "hard" },
    ],
  },
  {
    topic: "Теория вероятностей",
    icon: "🎲",
    color: "#3B82F6",
    articles: [
      { title: "Классическая вероятность", desc: "Формула, благоприятные исходы", difficulty: "easy" },
      { title: "Сложение и умножение", desc: "Несовместные и независимые события", difficulty: "medium" },
      { title: "Статистика", desc: "Среднее, медиана, мода, дисперсия", difficulty: "medium" },
    ],
  },
];

const ARTICLE_CONTENT: Record<string, string> = {
  "Таблица производных": `## Таблица производных

| Функция | Производная |
|---------|------------|
| C (const) | 0 |
| xⁿ | n·xⁿ⁻¹ |
| √x | 1/(2√x) |
| eˣ | eˣ |
| aˣ | aˣ·ln(a) |
| ln(x) | 1/x |
| logₐ(x) | 1/(x·ln(a)) |
| sin(x) | cos(x) |
| cos(x) | -sin(x) |
| tg(x) | 1/cos²(x) |
| ctg(x) | -1/sin²(x) |

## Правила дифференцирования

**(u + v)' = u' + v'** — производная суммы

**(Cu)' = Cu'** — константа выносится

**(uv)' = u'v + uv'** — производная произведения

**(u/v)' = (u'v - uv') / v²** — производная частного

**(f(g(x)))' = f'(g(x)) · g'(x)** — сложная функция`,

  "Квадратные уравнения": `## Квадратные уравнения

**Стандартная форма:** ax² + bx + c = 0, a ≠ 0

### Дискриминант
D = b² - 4ac

- D > 0: два различных корня
- D = 0: один корень (кратный)
- D < 0: нет действительных корней

### Формула корней
x₁,₂ = (-b ± √D) / (2a)

### Теорема Виета
Если x₁ и x₂ — корни уравнения x² + px + q = 0, то:
- x₁ + x₂ = -p
- x₁ · x₂ = q

### Разложение на множители
ax² + bx + c = a(x - x₁)(x - x₂)`,
};

export default function Theory() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const { data: dbArticles } = trpc.theory.list.useQuery(
    { topic: selectedTopic ?? undefined },
    { enabled: !!selectedTopic }
  );

  const diffColor = (d: string) => d === "easy" ? "#2D9D5F" : d === "medium" ? "#D4A82C" : "#E63E7C";
  const diffLabel = (d: string) => d === "easy" ? "Базовый" : d === "medium" ? "Средний" : "Сложный";

  if (selectedArticle) {
    const content = ARTICLE_CONTENT[selectedArticle] ?? `## ${selectedArticle}\n\nСтатья в разработке. Скоро здесь появится полный материал по теме.`;
    return (
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <button
          onClick={() => setSelectedArticle(null)}
          style={{ background: "none", border: "none", color: "#E63E7C", cursor: "pointer", fontSize: 14, marginBottom: 16 }}
        >
          ← Назад
        </button>
        <div className="card-samurai">
          <div style={{ fontFamily: "monospace", lineHeight: 2, color: "#D5D5DC", fontSize: 14, whiteSpace: "pre-wrap" }}>
            {content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} style={{ color: "#F08AB0", fontFamily: "Cinzel, serif", marginBottom: 12 }}>{line.slice(3)}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} style={{ color: "#E63E7C", marginBottom: 8 }}>{line.slice(4)}</h3>;
              if (line.startsWith("**") && line.endsWith("**")) return <p key={i} style={{ color: "#fff", fontWeight: 700 }}>{line.slice(2, -2)}</p>;
              if (line.startsWith("| ")) return <div key={i} style={{ fontFamily: "monospace", fontSize: 13, color: "#D5D5DC" }}>{line}</div>;
              if (line.startsWith("- ")) return <li key={i} style={{ marginLeft: 16, color: "#D5D5DC" }}>{line.slice(2)}</li>;
              return <p key={i} style={{ margin: "4px 0" }}>{line}</p>;
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>📚 Теория</h1>
        <p style={{ color: "#D5D5DC" }}>Конспекты и формулы для подготовки к ЕГЭ</p>
      </div>

      {/* Topic filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => setSelectedTopic(null)}
          style={{
            padding: "6px 16px",
            borderRadius: 999,
            border: "1px solid",
            borderColor: !selectedTopic ? "#E63E7C" : "#33333D",
            background: !selectedTopic ? "rgba(230,62,124,0.2)" : "transparent",
            color: !selectedTopic ? "#F08AB0" : "#D5D5DC",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Все темы
        </button>
        {THEORY_SECTIONS.map((s) => (
          <button
            key={s.topic}
            onClick={() => setSelectedTopic(s.topic === selectedTopic ? null : s.topic)}
            style={{
              padding: "6px 16px",
              borderRadius: 999,
              border: "1px solid",
              borderColor: selectedTopic === s.topic ? s.color : "#33333D",
              background: selectedTopic === s.topic ? `${s.color}20` : "transparent",
              color: selectedTopic === s.topic ? s.color : "#D5D5DC",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {s.icon} {s.topic}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {THEORY_SECTIONS.filter((s) => !selectedTopic || s.topic === selectedTopic).map((section) => (
          <div key={section.topic}>
            <h2 style={{ marginBottom: 12, color: section.color, display: "flex", alignItems: "center", gap: 8 }}>
              {section.icon} {section.topic}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {section.articles.map((article) => (
                <div
                  key={article.title}
                  className="card-samurai"
                  style={{ cursor: "pointer", borderLeftColor: section.color }}
                  onClick={() => setSelectedArticle(article.title)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, margin: 0, color: "#fff" }}>{article.title}</h3>
                    <span
                      className="badge-samurai"
                      style={{ background: `${diffColor(article.difficulty)}20`, color: diffColor(article.difficulty), flexShrink: 0, marginLeft: 8 }}
                    >
                      {diffLabel(article.difficulty)}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#D5D5DC", margin: 0 }}>{article.desc}</p>
                  <div style={{ fontSize: 12, color: section.color, marginTop: 10 }}>Читать →</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
