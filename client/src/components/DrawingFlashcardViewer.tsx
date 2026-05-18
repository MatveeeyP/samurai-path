import { useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

interface DrawingFlashcardViewerProps {
  drawingData?: string | null;
  template?: string | null;
  readOnly?: boolean;
}

export default function DrawingFlashcardViewer({ drawingData, template, readOnly = true }: DrawingFlashcardViewerProps) {
  const [initialState, setInitialState] = useState<any>(null);

  useEffect(() => {
    if (drawingData) {
      try {
        setInitialState(JSON.parse(drawingData));
      } catch (error) {
        console.error("Failed to parse drawing data:", error);
        setInitialState({ elements: [], appState: { zoom: { value: 1 } } });
      }
    } else {
      setInitialState({ elements: [], appState: { zoom: { value: 1 } } });
    }
  }, [drawingData]);

  if (!initialState) {
    return <div style={{ textAlign: "center", padding: 20, color: "#D5D5DC" }}>Загрузка рисунка...</div>;
  }

  return (
    <div style={{ width: "100%", height: "300px", border: "1px solid #33333D", borderRadius: 8, overflow: "hidden" }}>
      <Excalidraw
        initialData={initialState}
        onChange={() => {}}
        UIOptions={{
          canvasActions: {
            export: false,
            clearCanvas: false,
          },
        }}
        theme="dark"
      />
      {template && (
        <div style={{ padding: 8, background: "#1A1A22", borderTop: "1px solid #33333D", fontSize: 12, color: "#D5D5DC" }}>
          Шаблон: <span style={{ color: "#E63E7C", fontWeight: 600 }}>{template}</span>
        </div>
      )}
    </div>
  );
}
