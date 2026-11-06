import type { User } from "../api";

export default function Dashboard({ user }: { user: User }) {
  const stats = [
    { label: "This week", value: "0 km" },
    { label: "Runs logged", value: "0" },
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
      <p className="muted">These numbers will fill in once we add run logging.</p>
    </>
  );
}
