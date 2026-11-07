import { useEffect, useState } from "react";
import { authFetch, type User, type Run } from "../api";

export default function Dashboard({ user }: { user: User }) {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    authFetch("/runs").then(async (res) => res.ok && setRuns(await res.json()));
  }, []);

  const now = new Date();
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday)
    .toLocaleDateString("en-CA");
  const weekKm = runs
    .filter((r) => r.run_date >= monday)
    .reduce((sum, r) => sum + Number(r.distance_km), 0);

  const stats = [
    { label: "This week", value: `${weekKm.toFixed(1)} km` },
    { label: "Runs logged", value: String(runs.length) },
    { label: "Active goals", value: "0" },
  ];

  return (
    <>
      <h2>Hey {user.name}, ready to run? 👟</h2>
      <div className="stats">
        {stats.map((s) => (
          <div className="card stat" key={s.label}>
            <span className="muted">{s.label}</span>
            <strong>{s.value}</strong>
          </div>
        ))}
      </div>
    </>
  );
}
