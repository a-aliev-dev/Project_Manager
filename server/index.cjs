const express = require("express");
const cors = require("cors");



const authRoutes = require("./routes/auth.cjs");
const projectRoutes = require("./routes/projects.cjs");
const taskRoutes = require("./routes/tasks.cjs");
const leaderboardRoutes = require("./routes/leaderboard.cjs");

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route nicht gefunden." });
});

app.listen(PORT, () => {
  console.log(`QuestBoard API läuft auf http://localhost:${PORT}`);
});

