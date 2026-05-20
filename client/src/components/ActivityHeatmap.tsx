import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";

export function ActivityHeatmap() {
  const heatmapQuery = trpc.rememberMay21.getHeatmapData.useQuery();

  const heatmap = heatmapQuery.data || {};

  // Generate last 7 days
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split("T")[0]);
  }

  // Get max value for color scaling
  let maxValue = 0;
  Object.values(heatmap).forEach((dayData: any) => {
    Object.values(dayData).forEach((hours: any) => {
      if (hours > maxValue) maxValue = hours;
    });
  });
  maxValue = Math.max(maxValue, 1); // Avoid division by zero

  // Generate color based on intensity
  const getColor = (value: number) => {
    if (value === 0) return "#f0f0f0";
    const intensity = Math.min(value / maxValue, 1);
    // Gradient from light blue to dark blue
    const r = Math.round(27 - 27 * intensity);
    const g = Math.round(109 - 109 * intensity);
    const b = Math.round(235 - 235 * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const dayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  return (
    <Card style={{ padding: 20, background: "#fff", borderRadius: 20, overflowX: "auto" }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#333" }}>
        Активность по часам (7 дней)
      </h3>

      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16 }}>
        {days.map((date, dayIdx) => {
          const dayData = heatmap[date] || {};
          const dayOfWeek = new Date(date + "T00:00:00Z").getDay();
          const dayLabel = dayLabels[(dayOfWeek + 6) % 7]; // Convert to Mon-Sun

          return (
            <div key={date} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 8 }}>
                {dayLabel}
              </div>
              <div style={{ fontSize: 10, color: "#999", marginBottom: 8 }}>
                {new Date(date + "T00:00:00Z").toLocaleDateString("ru-RU", { month: "short", day: "numeric" })}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {Array.from({ length: 24 }, (_, hour) => {
                  const value = dayData[hour] || 0;
                  return (
                    <div
                      key={`${date}-${hour}`}
                      style={{
                        width: 20,
                        height: 20,
                        background: getColor(value),
                        borderRadius: 4,
                        cursor: "pointer",
                        title: `${hour}:00 - ${value.toFixed(1)}ч`,
                      }}
                      title={`${hour}:00 - ${value.toFixed(1)}ч`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#666" }}>Меньше</span>
        {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
          <div
            key={intensity}
            style={{
              width: 16,
              height: 16,
              background: getColor(intensity * maxValue),
              borderRadius: 3,
            }}
          />
        ))}
        <span style={{ fontSize: 12, color: "#666" }}>Больше</span>
      </div>
    </Card>
  );
}
