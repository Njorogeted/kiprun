import { useState } from "react";
import { API } from "../api";
import ImageSlot from "../components/ImageSlot";

export default function AuthPage({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

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
    onAuthed();
  };

  return (
    <div className="auth-split">
      <ImageSlot src="/images/auth.jpg" className="auth-img" />
      <div className="auth-panel">
        <form className="rp-form auth-form" onSubmit={submit}>
          <span className="brand">🏃 RunTogether</span>
          <h2>{mode === "login" ? "Welcome back" : "Join the run"}</h2>
          <p className="rp-muted">
            {mode === "login" ? "Log in to keep moving." : "Create your account and find your pace."}
          </p>
          {mode === "register" && (
            <input placeholder="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          )}
          <input placeholder="Email" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Password" type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="rp-error">{error}</p>}
          <button className="rp-btn" type="submit">
            {mode === "login" ? "Log in" : "Sign up"}
          </button>
          <button className="btn-link" type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Need an account? Register" : "Have an account? Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}