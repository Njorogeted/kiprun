import { useState } from "react";
import { authFetch, type User } from "../api";

export default function ProfilePage({
  user,
  onUpdate,
}: {
  user: User;
  onUpdate: (u: User) => void;
}) {
  const [pace, setPace] = useState(user.avg_pace_min_per_km ?? "");
  const [city, setCity] = useState(user.city ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    const res = await authFetch("/me", {
      method: "PUT",
      body: JSON.stringify({
        avg_pace_min_per_km: pace === "" ? null : Number(pace),
        city,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    onUpdate(data);
    setSaved(true);
  };

  return (
    <form className="card form" onSubmit={save}>
      <h2>Your profile</h2>
      <label>Name<input value={user.name} disabled /></label>
      <label>Email<input value={user.email} disabled /></label>
      <label>Average pace (min/km, e.g. 5.30)
        <input value={pace} onChange={(e) => setPace(e.target.value)} />
      </label>
      <label>City
        <input value={city} onChange={(e) => setCity(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      {saved && <p className="success">Profile saved</p>}
      <button className="btn" type="submit">Save profile</button>
    </form>
  );
}
