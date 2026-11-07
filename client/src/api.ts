export const API = "http://localhost:4000/api";

export type User = {
  id: number;
  email: string;
  name: string;
  avg_pace_min_per_km: string | null;
  city: string | null;
};

export const authFetch = (path: string, options: RequestInit = {}) =>
  fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
export type Run = {
  id: number;
  distance_km: string;
  duration_seconds: number;
  run_date: string;
  notes: string | null;
};

export const formatPace = (distanceKm: number, seconds: number) => {
  const perKm = seconds / distanceKm;
  let m = Math.floor(perKm / 60);
  let s = Math.round(perKm % 60);
  if (s === 60) { m += 1; s = 0; }
  return `${m}:${String(s).padStart(2, "0")} /km`;
};

export const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};
