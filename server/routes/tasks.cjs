const express = require("express");
const db = require("../db/database.cjs");
const { requireAuth } = require("../middleware/auth.cjs");

const router = express.Router();

function calculatePriority(xp) {
  if (xp >= 70) {
    return "high";
  }

  if (xp >= 50) {
    return "medium";
  }

  return "low";
}

function calculateProgress(projectId) {
  const tasks = db
    .prepare("SELECT status FROM tasks WHERE project_id = ?")
    .all(projectId);

  if (tasks.length === 0) {
    return 0;
  }

  const doneTasks = tasks.filter((task) => task.status === "done").length;

  return Math.round((doneTasks / tasks.length) * 100);
}

function updateProjectProgress(projectId) {
  const progress = calculateProgress(projectId);
  const status = progress === 100 ? "done" : progress > 0 ? "active" : "planned";

  db.prepare("UPDATE projects SET progress = ?, status = ? WHERE id = ?").run(
    progress,
    status,
    projectId
  );
}

function mapTask(task) {
  return {
    id: task.id,
    projectId: task.project_id,
    title: task.title,
    description: task.description,
    category: task.category,
    status: task.status,
    priority: task.priority,
    xp: task.xp,
    assignedToMemberId: task.assigned_to_user_id ?? undefined,
  };
}

router.post("/", requireAuth, (req, res) => {
  const { projectId, title, description, xp } = req.body;

  if (!projectId || !title || !description || !xp) {
    return res.status(400).json({
      message: "Projekt, Titel, Beschreibung und XP sind Pflicht.",
    });
  }

  const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId);

  if (!project) {
    return res.status(404).json({ message: "Projekt nicht gefunden." });
  }

  const result = db
    .prepare(
      `
      INSERT INTO tasks (
        project_id,
        title,
        description,
        category,
        status,
        priority,
        xp,
        assigned_to_user_id
      )
      VALUES (?, ?, ?, 'Projekt', 'open', ?, ?, NULL)
    `
    )
    .run(projectId, title, description, calculatePriority(Number(xp)), Number(xp));

  updateProjectProgress(projectId);

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);

  return res.status(201).json(mapTask(task));
});

router.patch("/:id/assign", requireAuth, (req, res) => {
  const taskId = Number(req.params.id);

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);

  if (!task) {
    return res.status(404).json({ message: "Task nicht gefunden." });
  }

  if (task.status === "done") {
    return res.status(409).json({
      message: "Erledigte Tasks können nicht übernommen werden.",
    });
  }

  db.prepare(
    `
    INSERT OR IGNORE INTO project_members (project_id, user_id)
    VALUES (?, ?)
  `
  ).run(task.project_id, req.user.id);

  db.prepare(
    `
    UPDATE tasks
    SET status = 'in-progress', assigned_to_user_id = ?
    WHERE id = ?
  `
  ).run(req.user.id, taskId);

  updateProjectProgress(task.project_id);

  const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);

  return res.json(mapTask(updatedTask));
});

router.patch("/:id/complete", requireAuth, (req, res) => {
  const taskId = Number(req.params.id);

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);

  if (!task) {
    return res.status(404).json({ message: "Task nicht gefunden." });
  }

  if (
    task.assigned_to_user_id !== null &&
    task.assigned_to_user_id !== req.user.id
  ) {
    return res.status(403).json({
      message: "Dieser Task gehört einem anderen User.",
    });
  }

  db.prepare(
    `
    INSERT OR IGNORE INTO project_members (project_id, user_id)
    VALUES (?, ?)
  `
  ).run(task.project_id, req.user.id);

  db.prepare(
    `
    UPDATE tasks
    SET status = 'done', assigned_to_user_id = ?
    WHERE id = ?
  `
  ).run(req.user.id, taskId);

  db.prepare(
    `
    UPDATE users
    SET xp = xp + ?
    WHERE id = ?
  `
  ).run(task.xp, req.user.id);

  updateProjectProgress(task.project_id);

  const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);

  return res.json(mapTask(updatedTask));
});

module.exports = router;