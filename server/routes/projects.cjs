const express = require("express");
const db = require("../db/database.cjs");
const { requireAuth } = require("../middleware/auth.cjs");

const router = express.Router();

function getMembersForProject(projectId) {
  return db
    .prepare(
      `
      SELECT users.id, users.name, users.email, users.xp
      FROM project_members
      JOIN users ON users.id = project_members.user_id
      WHERE project_members.project_id = ?
      ORDER BY users.name
    `
    )
    .all(projectId);
}

function getTasksForProject(projectId) {
  return db
    .prepare(
      `
      SELECT
        id,
        project_id AS projectId,
        title,
        description,
        category,
        status,
        priority,
        xp,
        assigned_to_user_id AS assignedToMemberId
      FROM tasks
      WHERE project_id = ?
      ORDER BY id DESC
    `
    )
    .all(projectId)
    .map((task) => ({
      ...task,
      assignedToMemberId: task.assignedToMemberId ?? undefined,
    }));
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

function mapProject(project) {
  return {
    id: project.id,
    name: project.name,
    status: project.status,
    progress: project.progress,
    xpReward: project.xp_reward,
    memberIds: getMembersForProject(project.id).map((member) => member.id),
  };
}

router.get("/", (req, res) => {
  const projects = db
    .prepare(
      `
      SELECT id, name, status, progress, xp_reward
      FROM projects
      ORDER BY id DESC
    `
    )
    .all()
    .map(mapProject);

  return res.json(projects);
});

router.get("/:id", (req, res) => {
  const projectId = Number(req.params.id);

  const project = db
    .prepare(
      `
      SELECT id, name, status, progress, xp_reward
      FROM projects
      WHERE id = ?
    `
    )
    .get(projectId);

  if (!project) {
    return res.status(404).json({ message: "Projekt nicht gefunden." });
  }

  return res.json({
    project: mapProject(project),
    tasks: getTasksForProject(projectId),
    members: getMembersForProject(projectId),
  });
});

router.post("/", requireAuth, (req, res) => {
  const { name, status } = req.body;

  if (!name || !status) {
    return res.status(400).json({ message: "Name und Status sind Pflicht." });
  }

  const xpReward = status === "done" ? 120 : 60;
  const progress = status === "done" ? 100 : 0;

  const result = db
    .prepare(
      `
      INSERT INTO projects (name, status, progress, xp_reward)
      VALUES (?, ?, ?, ?)
    `
    )
    .run(name, status, progress, xpReward);

  db.prepare(
    "INSERT INTO project_members (project_id, user_id) VALUES (?, ?)"
  ).run(result.lastInsertRowid, req.user.id);

  const project = db
    .prepare(
      `
      SELECT id, name, status, progress, xp_reward
      FROM projects
      WHERE id = ?
    `
    )
    .get(result.lastInsertRowid);

  return res.status(201).json(mapProject(project));
});

router.post("/:id/join", requireAuth, (req, res) => {
  const projectId = Number(req.params.id);

  const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId);

  if (!project) {
    return res.status(404).json({ message: "Projekt nicht gefunden." });
  }

  db.prepare(
    `
    INSERT OR IGNORE INTO project_members (project_id, user_id)
    VALUES (?, ?)
  `
  ).run(projectId, req.user.id);

  return res.json({ message: "Projektbeitritt erfolgreich." });
});

router.post("/:id/leave", requireAuth, (req, res) => {
  const projectId = Number(req.params.id);

  db.prepare(
    `
    DELETE FROM project_members
    WHERE project_id = ? AND user_id = ?
  `
  ).run(projectId, req.user.id);

  db.prepare(
    `
    UPDATE tasks
    SET status = 'open', assigned_to_user_id = NULL
    WHERE project_id = ?
      AND assigned_to_user_id = ?
      AND status != 'done'
  `
  ).run(projectId, req.user.id);

  updateProjectProgress(projectId);

  return res.json({ message: "Projekt verlassen." });
});

module.exports = router;