import { trpc } from "@/lib/trpc";

const SAMPLE_VIDEOS = [
  { id: 1, title: "Разбор задачи 19 ЕГЭ: параметры", topic: "Параметры", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: null },
  { id: 2, title: "Производная: полный разбор части 2", topic: "Производные", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: null },
  { id: 3, title: "Стереометрия от А до Я", topic: "Геометрия", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: null },
  { id: 4, title: "Теория вероятностей: все типы задач", topic: "Теория вероятностей", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: null },
  { id: 5, title: "Логарифмы и показательные уравнения", topic: "Алгебра", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: null },
  { id: 6, title: "Планиметрия: теорема синусов и косинусов", topic: "Геометрия", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: null },
];

const TOPIC_COLORS: Record<string, string> = {
  "Параметры": "#E63E7C",
  "Производные": "#7C3AED",
  "Геометрия": "#2D9D5F",
  "Алгебра": "#D4A82C",
  "Теория вероятностей": "#3B82F6",
};

export default function Videos() {
  const { data: videos } = trpc.news.videos.useQuery({});
  const items = (videos && videos.length > 0) ? videos : SAMPLE_VIDEOS;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>🎬 Видеоуроки</h1>
        <p style={{ color: "#D5D5DC" }}>Разборы задач и теоретические уроки по ЕГЭ</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {items.map((video) => {
          const color = TOPIC_COLORS[video.topic ?? ""] ?? "#E63E7C";
          return (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <div
                className="card-samurai"
                style={{ cursor: "pointer", transition: "transform 200ms" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
              >
                {/* Thumbnail placeholder */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    background: `linear-gradient(135deg, ${color}20, ${color}40)`,
                    borderRadius: 8,
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    border: `1px solid ${color}30`,
                  }}
                >
                  ▶️
                </div>
                <div style={{ marginBottom: 6 }}>
                  <span
                    className="badge-samurai"
                    style={{ background: `${color}20`, color, fontSize: 11 }}
                  >
                    {video.topic}
                  </span>
                </div>
                <h3 style={{ fontSize: 14, margin: 0, color: "#fff", lineHeight: 1.4 }}>{video.title}</h3>
                <div style={{ fontSize: 12, color: color, marginTop: 8 }}>Смотреть →</div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
