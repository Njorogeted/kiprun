import { useEffect, useState } from "react";
import { authFetch, formatPace, formatDuration, type Run } from "../api";
import ImageSlot from "../components/ImageSlot";

const today = () => new Date().toLocaleDateString("en-CA");
const prettyDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });

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

  // Stats
  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7))
    .toLocaleDateString("en-CA");
  const weekKm = runs.filter((r) => r.run_date >= monday)
    .reduce((s, r) => s + Number(r.distance_km), 0);
  const totalKm = runs.reduce((s, r) => s + Number(r.distance_km), 0);
  const longest = runs.reduce((m, r) => Math.max(m, Number(r.distance_km)), 0);
  const best = runs.reduce<Run | null>((b, r) => {
    const pace = r.duration_seconds / Number(r.distance_km);
    return !b || pace < b.duration_seconds / Number(b.distance_km) ? r : b;
  }, null);

  return (
    <div className="rp">
      {/* HERO */}
      <section className="rp-hero">
        <ImageSlot src="/images/hero.jpg" className="rp-hero-img" />
        <div className="rp-hero-overlay" />
        <div className="rp-hero-content">
          <span className="rp-eyebrow">This week</span>
          <h1>{weekKm.toFixed(1)}<small> km</small></h1>
          <p>Every run counts. Keep moving.</p>
          <div className="rp-hero-pills">
            <span>{runs.length} runs logged</span>
            <span>{totalKm.toFixed(1)} km total</span>
          </div>
        </div>
      </section>

      {/* ADD A RUN */}
      <section className="rp-section rp-split">
        <ImageSlot src="/images/log.jpg" className="rp-split-img" />
        <form className="rp-form" onSubmit={addRun}>
          <span className="rp-eyebrow">Missed tracking?</span>
          <h2>Add a run</h2>
          <div className="rp-row">
            <label>Distance (km)
              <input type="number" step="0.01" min="0" value={form.distance}
                onChange={(e) => setForm({ ...form, distance: e.target.value })} />
            </label>
            <label>Date
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
          </div>
          <div className="rp-row three">
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
          {error && <p className="rp-error">{error}</p>}
          <button className="rp-btn" type="submit">Save run</button>
        </form>
      </section>

      {/* HIGHLIGHTS */}
      <section className="rp-section">
        <h2 className="rp-title">Your highlights</h2>
        <div className="rp-highlights">
          <article className="rp-hl">
            <ImageSlot src="/images/stat-distance.jpg" className="rp-hl-img" />
            <div className="rp-hl-body">
              <span>Total distance</span>
              <strong>{totalKm.toFixed(1)}<small> km</small></strong>
            </div>
          </article>
          <article className="rp-hl">
            <ImageSlot src="/images/stat-longest.jpg" className="rp-hl-img" />
            <div className="rp-hl-body">
              <span>Longest run</span>
              <strong>{longest.toFixed(1)}<small> km</small></strong>
            </div>
          </article>
          <article className="rp-hl">
            <ImageSlot src="/images/stat-pace.jpg" className="rp-hl-img" />
            <div className="rp-hl-body">
              <span>Best pace</span>
              <strong>{best ? formatPace(Number(best.distance_km), best.duration_seconds).replace(" /km", "") : "--"}
                <small> /km</small></strong>
            </div>
          </article>
        </div>
      </section>

      {/* HISTORY */}
      <section className="rp-section">
        <h2 className="rp-title">Activity</h2>
        {loading ? (
          <p className="rp-muted">Loading...</p>
        ) : runs.length === 0 ? (
          <div className="rp-empty">No runs yet. Hit the Partners tab to start one, or add one above.</div>
        ) : (
          <div className="rp-feed">
            {runs.map((r, i) => {
              const km = Number(r.distance_km);
              return (
                <article className="rp-run" key={r.id}>
                  <ImageSlot src={`/images/run-${(i % 4) + 1}.jpg`} className="rp-run-img" />
                  <div className="rp-run-body">
                    <span className="rp-muted">{prettyDate(r.run_date)}</span>
                    <h3>{km}<small> km</small></h3>
                    <div className="rp-run-stats">
                      <div><span>Time</span><strong>{formatDuration(r.duration_seconds)}</strong></div>
                      <div><span>Pace</span><strong>{formatPace(km, r.duration_seconds)}</strong></div>
                    </div>
                    {r.notes && <p className="rp-note">“{r.notes}”</p>}
                    <button className="rp-del" onClick={() => removeRun(r.id)}>Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}