import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// Update my position (only called while I'm running AND sharing)
router.put("/", async (req: AuthRequest, res) => {
  const lat = Number(req.body.lat);
  const lng = Number(req.body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return res.status(400).json({ error: "Invalid location" });
  }
  try {
    await pool.query(
      `INSERT INTO live_locations (user_id, lat, lng, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET lat = $2, lng = $3, updated_at = NOW()`,
      [req.userId, lat, lng]
    );
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Stop sharing
router.delete("/", async (req: AuthRequest, res) => {
  try {
    await pool.query("DELETE FROM live_locations WHERE user_id = $1", [req.userId]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Other active runners (updated in the last 60 s, location rounded to ~100 m)
router.get("/", async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name,
              ROUND(l.lat::numeric, 3)::float AS lat,
              ROUND(l.lng::numeric, 3)::float AS lng
       FROM live_locations l JOIN users u ON u.id = l.user_id
       WHERE l.user_id <> $1 AND l.updated_at > NOW() - INTERVAL '60 seconds'`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
