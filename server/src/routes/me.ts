import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth); // every route in this file is protected

router.get("/", async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, avg_pace_min_per_km, city FROM users WHERE id = $1",
      [req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/", async (req: AuthRequest, res) => {
  const { avg_pace_min_per_km, city } = req.body;

  if (avg_pace_min_per_km !== null && avg_pace_min_per_km !== undefined) {
    const p = Number(avg_pace_min_per_km);
    if (isNaN(p) || p < 2 || p > 15) {
      return res.status(400).json({ error: "Pace must be between 2 and 15 min/km" });
    }
  }

  try {
    const result = await pool.query(
      `UPDATE users SET avg_pace_min_per_km = $1, city = $2 WHERE id = $3
       RETURNING id, email, name, avg_pace_min_per_km, city`,
      [avg_pace_min_per_km ?? null, city || null, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
