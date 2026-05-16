import { trpc } from "@/lib/trpc";

export default function News() {
  const { data: newsList, isLoading } = trpc.news.list.useQuery({ limit: 20 });

  const SAMPLE_NEWS = [
    {
      id: 1,
      title: "ЕГЭ 2026: изменения в структуре экзамена по математике",
      content: "ФИПИ опубликовал обновлённые спецификации. В профильном ЕГЭ добавлены задания на теорию вероятностей в части 1.",
      createdAt: new Date("2026-04-15"),
    },
    {
      id: 2,
      title: "Средний балл ЕГЭ по математике вырос на 3 пункта",
      content: "По данным Рособрнадзора, средний балл профильной математики в 2025 году составил 54.2 — на 3.1 пункта выше прошлогоднего.",
      createdAt: new Date("2026-03-20"),
    },
    {
      id: 3,
      title: "Новые задачи на параметры в ЕГЭ-2026",
      content: "Эксперты отмечают усложнение задач с параметрами. Рекомендуем уделить особое внимание графическому методу решения.",
      createdAt: new Date("2026-03-05"),
    },
    {
      id: 4,
      title: "Как правильно распределить время на ЕГЭ",
      content: "Оптимальная стратегия: 90 минут на часть 1, 90 минут на часть 2. Не застревайте на одной задаче дольше 15 минут.",
      createdAt: new Date("2026-02-28"),
    },
  ];

  const items = (newsList && newsList.length > 0) ? newsList : SAMPLE_NEWS;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>📰 Новости ЕГЭ</h1>
        <p style={{ color: "#D5D5DC" }}>Актуальные новости о подготовке и экзаменах</p>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 100, background: "#1A1A22", borderRadius: 12, animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {items.map((item) => (
            <div key={item.id} className="card-samurai" style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: "#F08AB0" }}>{item.title}</h3>
                <span style={{ fontSize: 12, color: "#D5D5DC", flexShrink: 0, marginLeft: 12 }}>
                  {new Date(item.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "#D5D5DC", lineHeight: 1.6 }}>{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
