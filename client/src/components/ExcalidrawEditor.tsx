import { useEffect, useRef, useState } from "react";
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

export type ExcalidrawTemplate = "algebra" | "geometry" | "trigonometry" | "derivatives" | "blank";

interface ExcalidrawEditorProps {
  template?: ExcalidrawTemplate;
  onSave?: (data: string) => void;
  initialData?: string;
  readOnly?: boolean;
}

const TEMPLATE_DATA: Record<ExcalidrawTemplate, any> = {
  blank: {
    elements: [],
    appState: {
      zoom: { value: 1 },
      scrollX: 0,
      scrollY: 0,
      gridSize: 20,
    },
  },
  algebra: {
    elements: [
      // Coordinate axes
      {
        type: "line",
        x: 100,
        y: 300,
        width: 400,
        height: 0,
        angle: 0,
        strokeColor: "#D5D5DC",
        backgroundColor: "transparent",
        fillStyle: "hachure",
        strokeWidth: 2,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        groupIds: [],
        frameId: null,
        index: "a0" as const,
        roundness: null,
        seed: 12345,
        versionNonce: 1,
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
      },
      {
        type: "line",
        x: 100,
        y: 100,
        width: 0,
        height: 400,
        angle: 0,
        strokeColor: "#D5D5DC",
        backgroundColor: "transparent",
        fillStyle: "hachure",
        strokeWidth: 2,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        groupIds: [],
        frameId: null,
        index: "a1" as const,
        roundness: null,
        seed: 12346,
        versionNonce: 1,
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
      },
      // Labels
      {
        type: "text",
        x: 480,
        y: 290,
        width: 30,
        height: 25,
        angle: 0,
        strokeColor: "#D5D5DC",
        backgroundColor: "transparent",
        fillStyle: "hachure",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        groupIds: [],
        frameId: null,
        index: "a2" as const,
        roundness: null,
        seed: 12347,
        versionNonce: 1,
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        text: "x",
        fontSize: 20,
        fontFamily: 1,
        textAlign: "center",
        verticalAlign: "middle",
        containerId: null,
        originalText: "x",
      },
      {
        type: "text",
        x: 90,
        y: 70,
        width: 30,
        height: 25,
        angle: 0,
        strokeColor: "#D5D5DC",
        backgroundColor: "transparent",
        fillStyle: "hachure",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        groupIds: [],
        frameId: null,
        index: "a3" as const,
        roundness: null,
        seed: 12348,
        versionNonce: 1,
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        text: "y",
        fontSize: 20,
        fontFamily: 1,
        textAlign: "center",
        verticalAlign: "middle",
        containerId: null,
        originalText: "y",
      },
    ],
    appState: {
      zoom: { value: 1 },
      scrollX: 0,
      scrollY: 0,
      gridSize: 20,
    },
  },
  geometry: {
    elements: [],
    appState: {
      zoom: { value: 1 },
      scrollX: 0,
      scrollY: 0,
      gridSize: 20,
    },
  },
  trigonometry: {
    elements: [],
    appState: {
      zoom: { value: 1 },
      scrollX: 0,
      scrollY: 0,
      gridSize: 20,
    },
  },
  derivatives: {
    elements: [],
    appState: {
      zoom: { value: 1 },
      scrollX: 0,
      scrollY: 0,
      gridSize: 20,
    },
  },
};

export default function ExcalidrawEditor({
  template = "blank",
  onSave,
  initialData,
  readOnly = false,
}: ExcalidrawEditorProps) {
  const excalidrawAPI = useRef<any>(null);
  const [initialState, setInitialState] = useState<any>(null);

  useEffect(() => {
    if (initialData) {
      try {
        setInitialState(JSON.parse(initialData));
      } catch {
        setInitialState(TEMPLATE_DATA[template]);
      }
    } else {
      setInitialState(TEMPLATE_DATA[template]);
    }
  }, [template, initialData]);

  const handleSave = () => {
    if (excalidrawAPI.current) {
      const elements = excalidrawAPI.current.getSceneElements();
      const appState = excalidrawAPI.current.getAppState();
      const data = JSON.stringify({ elements, appState });
      onSave?.(data);
    }
  };

  if (!initialState) {
    return <div style={{ textAlign: "center", padding: 40, color: "#D5D5DC" }}>Загрузка редактора...</div>;
  }

  return (
    <div style={{ width: "100%", height: "500px", border: "1px solid #33333D", borderRadius: 8, overflow: "hidden" }}>
      <Excalidraw
        initialData={initialState}
        onChange={(elements, appState, files) => {
          // Auto-save on change
        }}
        UIOptions={{
          canvasActions: {
            export: false,
            clearCanvas: true,
          },
        }}
        theme="dark"
      />
      {!readOnly && (
        <div style={{ padding: 12, background: "#1A1A1E", borderTop: "1px solid #33333D", display: "flex", gap: 10 }}>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              background: "#E63E7C",
              border: "none",
              borderRadius: 6,
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            💾 Сохранить
          </button>
        </div>
      )}
    </div>
  );
}
