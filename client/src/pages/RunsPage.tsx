import { useEffect, useState } from "react";
import { authFetch, formatPace, formatDuration, type Run } from "../api";

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    distance: "", hours: "", minutes: "", seconds: "", date: today(), notes: "",
  });

  const loadRuns = async () => {
    const res = await authFetch("/runs");
    if (res.ok) setRuns(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const addRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const total =
      Number(form.hours || 0) * 3600 +
      Number(form.minutes || 0) * 60 +
      Number(form.seconds || 0);

    const res = await authFetch("/runs", {
      method: "POST",
      body: JSON.stringify({
        distance_km: Number(form.distance),
        duration_seconds: total,
        run_date: form.date,
        notes: form.notes,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setForm({ distance: "", hours: "", minutes: "", seconds: "", date: today(), notes: "" });
    loadRuns();
  };

  const removeRun = async (id: number) => {
    if (!confirm("Delete this run?")) return;
    const res = await authFetch(`/runs/${id}`, { method: "DELETE" });
    if (res.ok) setRuns(runs.filter((r) => r.id !== id));
  };

  return (
    <div className="stack">
      <form className="card form wide" onSubmit={addRun}>
        <h2>Add a run manually</h2>
        <div className="row">
          <label>Distance (km)
            <input type="number" step="0.01" min="0" value={form.distance}
              onChange={(e) => setForm({ ...form, distance: e.target.value })} />
          </label>
          <label>Date
            <input type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>
        </div>
        <div className="row">
          <label>Hours
            <input type="number" min="0" value={form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })} />
          </label>
          <label>Minutes
            <input type="number" min="0" max="59" value={form.minutes}
              onChange={(e) => setForm({ ...form, minutes: e.target.value })} />
          </label>
          <label>Seconds
            <input type="number" min="0" max="59" value={form.seconds}
              onChange={(e) => setForm({ ...form, seconds: e.target.value })} />
          </label>
        </div>
        <label>Notes (optional)
          <input value={form.notes} placeholder="How did it feel?"
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">Save run</button>
      </form>

      <div>
        <h2>History</h2>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : runs.length === 0 ? (
          <div className="card empty"><p className="muted">No runs yet. Log your first one above!</p></div>
        ) : (
          <div className="run-list">
            {runs.map((r) => {
              const km = Number(r.distance_km);
              return (
                <div className="card run" key={r.id}>
                  <div>
                    <strong>{km} km</strong>
                    <div className="muted">{r.run_date}</div>
                  </div>
                  <div>
                    <div>{formatDuration(r.duration_seconds)}</div>
                    <div className="muted">{formatPace(km, r.duration_seconds)}</div>
                  </div>
                  {r.notes && <div className="muted run-notes">{r.notes}</div>}
                  <button className="btn-small" onClick={() => removeRun(r.id)}>Delete</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
