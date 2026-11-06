import { useEffect, useState } from "react";
import { authFetch, type User } from "./api";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import Placeholder from "./pages/Placeholder";

const TABS = [
  { id: "dashboard", label: "🏠 Dashboard" },
  { id: "runs", label: "📍 Runs" },
  { id: "goals", label: "🎯 Goals" },
  { id: "partners", label: "🤝 Partners" },
  { id: "profile", label: "👤 Profile" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("dashboard");

  const loadUser = async () => {
    if (!localStorage.getItem("token")) return setLoading(false);
    const res = await authFetch("/me");
    if (res.ok) setUser(await res.json());
    else localStorage.removeItem("token");
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setTab("dashboard");
  };

  if (loading) return <p className="muted center">Loading...</p>;
  if (!user) return <AuthPage onAuthed={loadUser} />;

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">🏃 RunTogether</span>
        <div className="user-area">
          <span className="muted">{user.name}</span>
          <button className="btn-small" onClick={logout}>Log out</button>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === "dashboard" && <Dashboard user={user} />}
        {tab === "runs" && (
          <Placeholder title="Your runs" text="Log runs and see your progress charts here." />
        )}
        {tab === "goals" && (
          <Placeholder title="Your goals" text="Set targets like a 10K under 55 minutes and track them." />
        )}
        {tab === "partners" && (
          <Placeholder title="Find running partners" text="Discover runners nearby with a similar pace and schedule." />
        )}
        {tab === "profile" && <ProfilePage user={user} onUpdate={setUser} />}
      </main>
    </div>
  );
}
