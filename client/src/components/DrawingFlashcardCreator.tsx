import { useState } from "react";
import ExcalidrawEditor, { ExcalidrawTemplate } from "./ExcalidrawEditor";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface DrawingFlashcardCreatorProps {
  onCreateCard?: (card: {
    front: string;
    back: string;
    cardType: "text" | "drawing";
    frontDrawing?: string;
    backDrawing?: string;
    template?: ExcalidrawTemplate;
    topic?: string;
  }) => void;
}

const TEMPLATES: { id: ExcalidrawTemplate; name: string; description: string }[] = [
  { id: "blank", name: "Пустой холст", description: "Рисуй с нуля" },
  { id: "algebra", name: "Алгебра", description: "Координатная сетка и оси" },
  { id: "geometry", name: "Геометрия", description: "Шаблон для фигур" },
  { id: "trigonometry", name: "Тригонометрия", description: "Единичный круг" },
  { id: "derivatives", name: "Производные", description: "Графики функций" },
];

export default function DrawingFlashcardCreator({ onCreateCard }: DrawingFlashcardCreatorProps) {
  const [mode, setMode] = useState<"select" | "draw">("select");
  const [selectedTemplate, setSelectedTemplate] = useState<ExcalidrawTemplate>("blank");
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [frontDrawing, setFrontDrawing] = useState("");
  const [backDrawing, setBackDrawing] = useState("");
  const [topic, setTopic] = useState("Алгебра");
  const [drawingPhase, setDrawingPhase] = useState<"front" | "back">("front");

  const handleCreateCard = () => {
    onCreateCard?.({
      front: frontText || "Рисунок",
      back: backText || "Ответ",
      cardType: "drawing",
      frontDrawing,
      backDrawing,
      template: selectedTemplate,
      topic,
    });
    // Reset
    setFrontText("");
    setBackText("");
    setFrontDrawing("");
    setBackDrawing("");
    setMode("select");
  };

  if (mode === "select") {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ color: "#E63E7C", marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
          Создать карточку с рисунком
        </h2>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#D5D5DC", fontSize: 13, fontWeight: 600 }}>
            Тема
          </label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "#242430",
              border: "1px solid #33333D",
              borderRadius: 6,
              color: "white",
              fontSize: 14,
            }}
          >
            <option>Алгебра</option>
            <option>Геометрия</option>
            <option>Производные</option>
            <option>Параметры</option>
            <option>Теория вероятностей</option>
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 12, color: "#D5D5DC", fontSize: 13, fontWeight: 600 }}>
            Выбери шаблон
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {TEMPLATES.map((tmpl) => (
              <Card
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                style={{
                  padding: 16,
                  cursor: "pointer",
                  border: selectedTemplate === tmpl.id ? "2px solid #E63E7C" : "1px solid #33333D",
                  background: selectedTemplate === tmpl.id ? "#1A1A1E" : "#0F0F14",
                  transition: "all 150ms",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: "#E63E7C", marginBottom: 4 }}>{tmpl.name}</div>
                <div style={{ fontSize: 12, color: "#D5D5DC" }}>{tmpl.description}</div>
              </Card>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#D5D5DC", fontSize: 13, fontWeight: 600 }}>
            Текст на лицевой стороне (опционально)
          </label>
          <input
            type="text"
            value={frontText}
            onChange={(e) => setFrontText(e.target.value)}
            placeholder="Например: Решить уравнение"
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "#242430",
              border: "1px solid #33333D",
              borderRadius: 6,
              color: "white",
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#D5D5DC", fontSize: 13, fontWeight: 600 }}>
            Текст на обратной стороне (опционально)
          </label>
          <input
            type="text"
            value={backText}
            onChange={(e) => setBackText(e.target.value)}
            placeholder="Например: Ответ: x = 2"
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "#242430",
              border: "1px solid #33333D",
              borderRadius: 6,
              color: "white",
              fontSize: 14,
            }}
          />
        </div>

        <Button
          onClick={() => {
            setMode("draw");
            setDrawingPhase("front");
          }}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "linear-gradient(135deg, #E63E7C 0%, #B5135A 100%)",
            border: "none",
            borderRadius: 8,
            color: "white",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🎨 Начать рисовать
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ color: "#E63E7C", fontSize: 18, fontWeight: 600, margin: 0 }}>
          {drawingPhase === "front" ? "Рисуй лицевую сторону" : "Рисуй обратную сторону"}
        </h2>
        <span style={{ fontSize: 12, color: "#D5D5DC" }}>Тема: {topic}</span>
      </div>

      <ExcalidrawEditor
        template={selectedTemplate}
        onSave={(data) => {
          if (drawingPhase === "front") {
            setFrontDrawing(data);
            setDrawingPhase("back");
          } else {
            setBackDrawing(data);
          }
        }}
      />

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        {drawingPhase === "back" && (
          <Button
            onClick={handleCreateCard}
            style={{
              flex: 1,
              padding: "12px 16px",
              background: "linear-gradient(135deg, #E63E7C 0%, #B5135A 100%)",
              border: "none",
              borderRadius: 8,
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ✅ Сохранить карточку
          </Button>
        )}
        <Button
          onClick={() => setMode("select")}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "#242430",
            border: "1px solid #33333D",
            borderRadius: 8,
            color: "#D5D5DC",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Отмена
        </Button>
      </div>
    </div>
  );
}
