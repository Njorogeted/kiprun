import { useEffect, useState } from "react";
import { authFetch, formatPace, formatDuration, type User, type Run } from "../api";
import PageHero from "../components/PageHero";
import ImageSlot from "../components/ImageSlot";

export default function Dashboard({ user }: { user: User }) {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    authFetch("/runs").then(async (res) => res.ok && setRuns(await res.json()));
  }, []);

  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7))
    .toLocaleDateString("en-CA");
  const weekKm = runs.filter((r) => r.run_date >= monday)
    .reduce((sum, r) => sum + Number(r.distance_km), 0);

  const stats = [
    { label: "This week", value: weekKm.toFixed(1), unit: "km", img: "/images/stat-distance.jpg" },
    { label: "Runs logged", value: String(runs.length), unit: "", img: "/images/stat-longest.jpg" },
    { label: "Active goals", value: "0", unit: "", img: "/images/stat-pace.jpg" },
  ];

  return (
    <div className="rp">
      <PageHero
        image="/images/dashboard.jpg"
        eyebrow="Dashboard"
        title={`Hey ${user.name.split(" ")[0]}`}
        subtitle="Ready to run? Here's where you stand."
      />

      <section className="rp-section">
        <div className="rp-highlights">
          {stats.map((s) => (
            <article className="rp-hl" key={s.label}>
              <ImageSlot src={s.img} className="rp-hl-img" />
              <div className="rp-hl-body">
                <span>{s.label}</span>
                <strong>{s.value}{s.unit && <small> {s.unit}</small>}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rp-section">
        <h2 className="rp-title">Latest activity</h2>
        {runs.length === 0 ? (
          <div className="rp-empty">No runs yet. Head to the Partners tab and start one.</div>
        ) : (
          <div className="rp-feed">
            {runs.slice(0, 3).map((r, i) => {
              const km = Number(r.distance_km);
              return (
                <article className="rp-run" key={r.id}>
                  <ImageSlot src={`/images/run-${i + 1}.jpg`} className="rp-run-img" />
                  <div className="rp-run-body">
                    <span className="rp-muted">{r.run_date}</span>
                    <h3>{km}<small> km</small></h3>
                    <div className="rp-run-stats">
                      <div><span>Time</span><strong>{formatDuration(r.duration_seconds)}</strong></div>
                      <div><span>Pace</span><strong>{formatPace(km, r.duration_seconds)}</strong></div>
                    </div>
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