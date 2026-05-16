import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const NAV_ITEMS = [
  { path: "/", label: "Главная", icon: "⛩️" },
  { path: "/plan", label: "Путь", icon: "🗺️" },
  { path: "/practice", label: "Практика", icon: "⚔️" },
  { path: "/diagnostics", label: "Диагностика", icon: "🎯" },
  { path: "/variants", label: "Варианты ЕГЭ", icon: "📋" },
  { path: "/flashcards", label: "Карточки", icon: "🃏" },
  { path: "/homework", label: "Домашние задания", icon: "📚" },
  { path: "/theory", label: "Теория", icon: "📖" },
  { path: "/motivation", label: "Мотивация", icon: "🔥" },
  { path: "/profile", label: "Профиль", icon: "👤" },
];

const EXTRA_ITEMS = [
  { path: "/news", label: "Новости", icon: "📰" },
  { path: "/videos", label: "Видео", icon: "🎬" },
  { path: "/timer", label: "Самурай-таймер", icon: "⏱️" },
];

const SamuraiLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#E63E7C" />
    <rect x="19" y="6" width="2" height="28" rx="1" fill="white" />
    <rect x="12" y="18" width="16" height="2" rx="1" fill="white" />
    <rect x="17" y="8" width="6" height="3" rx="1" fill="white" opacity="0.7" />
  </svg>
);

interface SamuraiLayoutProps {
  children: React.ReactNode;
}

export default function SamuraiLayout({ children }: SamuraiLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: warrior } = trpc.warrior.getStatus.useQuery(undefined, { enabled: isAuthenticated });

  const isAdmin = user?.role === "admin";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0F0F14" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 39,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <SamuraiLogo />
          <div>
            <div style={{ fontFamily: "Cinzel, serif", fontWeight: 700, fontSize: 16, color: "#F08AB0" }}>
              Путь самурая
            </div>
            <div style={{ fontSize: 11, color: "#D5D5DC", marginTop: 2 }}>ЕГЭ Математика</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.path}
              className={`sidebar-nav-item ${location === item.path ? "active" : ""}`}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}

          <div style={{ height: 1, background: "#33333D", margin: "12px 20px" }} />

          {EXTRA_ITEMS.map((item) => (
            <div
              key={item.path}
              className={`sidebar-nav-item ${location === item.path ? "active" : ""}`}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}

          {isAdmin && (
            <>
              <div style={{ height: 1, background: "#33333D", margin: "12px 20px" }} />
              <div
                className={`sidebar-nav-item ${location === "/admin" ? "active" : ""}`}
                onClick={() => { navigate("/admin"); setSidebarOpen(false); }}
              >
                <span style={{ fontSize: 16 }}>🛡️</span>
                <span>Администратор</span>
              </div>
            </>
          )}
        </nav>

        {/* User section */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #33333D" }}>
          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #E63E7C, #B5135A)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {user?.name?.[0]?.toUpperCase() ?? "С"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name ?? "Самурай"}
                </div>
                <div style={{ fontSize: 11, color: "#D5D5DC" }}>
                  {warrior ? `${warrior.warriorRank} · ${warrior.currentStreak}🔥` : (user?.role === "admin" ? "Администратор" : "Ученик")}
                </div>
              </div>
            </div>
          ) : (
            <a
              href={getLoginUrl()}
              style={{
                display: "block",
                textAlign: "center",
                padding: "8px 16px",
                background: "linear-gradient(135deg, #E63E7C, #B5135A)",
                color: "white",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                fontFamily: "Cinzel, serif",
              }}
            >
              Войти
            </a>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content" style={{ flex: 1 }}>
        {/* Mobile header */}
        <div
          style={{
            display: "none",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            padding: "12px 0",
          }}
          className="mobile-header"
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#E63E7C",
              fontSize: 24,
              cursor: "pointer",
              padding: 4,
            }}
          >
            ☰
          </button>
          <span style={{ fontFamily: "Cinzel, serif", color: "#F08AB0", fontWeight: 700 }}>
            Путь самурая
          </span>
        </div>

        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
