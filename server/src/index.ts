import express from "express";
import runRoutes from "./routes/runs";
import meRoutes from "./routes/me";
import authRoutes from "./routes/auth";
import cors from "cors";
import dotenv from "dotenv";
import liveRoutes from "./routes/live";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/runs", runRoutes);
app.use("/api/live", liveRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
