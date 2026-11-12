import { useState } from "react";
import { authFetch, type User } from "../api";
import PageHero from "../components/PageHero";

export default function ProfilePage({
  user, onUpdate,
}: { user: User; onUpdate: (u: User) => void }) {
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
    <div className="rp">
      <PageHero image="/images/profile.jpg" eyebrow="Your account" title={user.name} subtitle={user.email} />

      <form className="rp-form rp-card" onSubmit={save}>
        <span className="rp-eyebrow">Runner details</span>
        <h2>Your profile</h2>
        <label>Name<input value={user.name} disabled /></label>
        <label>Email<input value={user.email} disabled /></label>
        <div className="rp-row">
          <label>Avg pace (min/km)
            <input value={pace} placeholder="e.g. 5.30" onChange={(e) => setPace(e.target.value)} />
          </label>
          <label>City
            <input value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
        </div>
        {error && <p className="rp-error">{error}</p>}
        {saved && <p className="rp-ok">Profile saved</p>}
        <button className="rp-btn" type="submit">Save profile</button>
      </form>
    </div>
  );
}