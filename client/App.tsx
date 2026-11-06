import { useEffect, useState } from "react";

const API = "http://localhost:4000/api";

type User = {
  id: number;
  email: string;
  name: string;
  avg_pace_min_per_km: string | null;
  city: string | null;
};

export default function App() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ pace: "", city: "" });
  const [saved, setSaved] = useState(false);

  const authFetch = (path: string, options: RequestInit = {}) =>
    fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

  const loadUser = async () => {
    if (!localStorage.getItem("token")) return setLoading(false);
    const res = await authFetch("/me");
    if (res.ok) {
      const u: User = await res.json();
      setUser(u);
      setProfile({ pace: u.avg_pace_min_per_km ?? "", city: u.city ?? "" });
    } else {
      localStorage.removeItem("token");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`${API}/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    localStorage.setItem("token", data.token);
    loadUser();
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    const res = await authFetch("/me", {
      method: "PUT",
      body: JSON.stringify({
        avg_pace_min_per_km: profile.pace === "" ? null : Number(profile.pace),
        city: profile.city,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setUser(data);
    setSaved(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setForm({ name: "", email: "", password: "" });
  };

  if (loading) return <p>Loading...</p>;

  if (user)
    return (
      <form onSubmit={saveProfile} style={{ maxWidth: 320, margin: "40px auto", display: "grid", gap: 10 }}>
        <h2>Welcome, {user.name}! 🏃</h2>
        <p>{user.email}</p>
        <input placeholder="Average pace (min/km, e.g. 5.30)" value={profile.pace}
          onChange={(e) => setProfile({ ...profile, pace: e.target.value })} />
        <input placeholder="City" value={profile.city}
          onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
        {error && <p style={{ color: "red" }}>{error}</p>}
        {saved && <p style={{ color: "green" }}>Profile saved</p>}
        <button type="submit">Save profile</button>
        <button type="button" onClick={logout}>Log out</button>
      </form>
    );

  return (
    <form onSubmit={submit} style={{ maxWidth: 320, margin: "40px auto", display: "grid", gap: 10 }}>
      <h2>{mode === "login" ? "Log in" : "Create account"}</h2>
      {mode === "register" && (
        <input placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
      )}
      <input placeholder="Email" type="email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">{mode === "login" ? "Log in" : "Sign up"}</button>
      <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "Need an account? Register" : "Have an account? Log in"}
      </button>
    </form>
  );
}
