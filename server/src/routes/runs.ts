import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const COLUMNS = "id, distance_km, duration_seconds, run_date::text AS run_date, notes";
type Pt = { lat: number; lng: number; t: number };
const toRad = (d: number) => (d * Math.PI) / 180;
const haversineKm = (a: Pt, b: Pt) => {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(x));
};
router.get("/", async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT ${COLUMNS} FROM runs WHERE user_id = $1
       ORDER BY run_date DESC, id DESC LIMIT 200`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  const { distance_km, duration_seconds, run_date, notes, route } = req.body;
  let distance = Number(distance_km);
  const duration = Math.round(Number(duration_seconds));

  // GPS run: the server calculates distance itself, never trusting the client
  if (Array.isArray(route)) {
    if (route.length < 2 || route.length > 20000) {
      return res.status(400).json({ error: "Invalid route" });
    }
    const ok = route.every(
      (p) =>
        Number.isFinite(p.lat) && Number.isFinite(p.lng) &&
        Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180
    );
    if (!ok) return res.status(400).json({ error: "Invalid route points" });
    let total = 0;
    for (let i = 1; i < route.length; i++) total += haversineKm(route[i - 1], route[i]);
    distance = Math.round(total * 100) / 100;
  }

  if (!(distance > 0 && distance <= 500)) {
    return res.status(400).json({ error: "Distance must be between 0 and 500 km" });
  }
  if (!(duration > 0 && duration <= 172800)) {
    return res.status(400).json({ error: "Duration must be greater than 0" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(run_date || "")) {
    return res.status(400).json({ error: "Date is required (YYYY-MM-DD)" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO runs (user_id, distance_km, duration_seconds, run_date, notes, route)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb) RETURNING ${COLUMNS}`,
      [req.userId, distance, duration, run_date, notes || null,
       Array.isArray(route) ? JSON.stringify(route) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM runs WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Run not found" });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
