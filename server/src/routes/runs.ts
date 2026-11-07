import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const COLUMNS = "id, distance_km, duration_seconds, run_date::text AS run_date, notes";

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
  const { distance_km, duration_seconds, run_date, notes } = req.body;
  const distance = Number(distance_km);
  const duration = Math.round(Number(duration_seconds));

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
      `INSERT INTO runs (user_id, distance_km, duration_seconds, run_date, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING ${COLUMNS}`,
      [req.userId, distance, duration, run_date, notes || null]
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
