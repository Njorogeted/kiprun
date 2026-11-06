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
