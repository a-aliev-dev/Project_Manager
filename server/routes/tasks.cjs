const express = require("express");
const prisma = require("../db/prisma.cjs");
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

function mapTask(task) {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    category: task.category,
    status: task.status,
    priority: task.priority,
    xp: task.xp,
    assignedToMemberId: task.assignedToUserId ?? undefined,
  };
}

async function calculateProjectState(projectId, transaction = prisma) {
  const tasks = await transaction.task.findMany({
    where: {
      projectId,
    },
    select: {
      status: true,
    },
  });

  if (tasks.length === 0) {
    return {
      progress: 0,
      status: "planned",
    };
  }

  const doneTasks = tasks.filter((task) => task.status === "done").length;
  const progress = Math.round((doneTasks / tasks.length) * 100);

  return {
    progress,
    status:
      progress === 100
        ? "done"
        : progress > 0
          ? "active"
          : "planned",
  };
}

async function updateProjectProgress(projectId, transaction = prisma) {
  const state = await calculateProjectState(projectId, transaction);

  await transaction.project.update({
    where: {
      id: projectId,
    },
    data: state,
  });
}

/**
 * POST /api/tasks
 * Erstellt einen neuen Task.
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { projectId, title, description, xp } = req.body;

    const parsedProjectId = Number(projectId);
    const parsedXp = Number(xp);
    const cleanTitle = typeof title === "string" ? title.trim() : "";
    const cleanDescription =
      typeof description === "string" ? description.trim() : "";

    if (
      !Number.isInteger(parsedProjectId) ||
      !cleanTitle ||
      !cleanDescription ||
      !Number.isFinite(parsedXp) ||
      parsedXp <= 0
    ) {
      return res.status(400).json({
        message: "Projekt, Titel, Beschreibung und gültige XP sind Pflicht.",
      });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: parsedProjectId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Projekt nicht gefunden.",
      });
    }

    const task = await prisma.$transaction(async (transaction) => {
      const createdTask = await transaction.task.create({
        data: {
          projectId: parsedProjectId,
          title: cleanTitle,
          description: cleanDescription,
          category: "Projekt",
          status: "open",
          priority: calculatePriority(parsedXp),
          xp: parsedXp,
          assignedToUserId: null,
        },
      });

      await updateProjectProgress(parsedProjectId, transaction);

      return createdTask;
    });

    return res.status(201).json(mapTask(task));
  } catch (error) {
    console.error("Fehler beim Erstellen des Tasks:", error);

    return res.status(500).json({
      message: "Task konnte nicht erstellt werden.",
    });
  }
});

/**
 * PATCH /api/tasks/:id/assign
 * Übernimmt einen Task für den eingeloggten Benutzer.
 */
router.patch("/:id/assign", requireAuth, async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId)) {
      return res.status(400).json({
        message: "Ungültige Task-ID.",
      });
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task nicht gefunden.",
      });
    }

    if (task.status === "done") {
      return res.status(409).json({
        message: "Erledigte Tasks können nicht übernommen werden.",
      });
    }

    const updatedTask = await prisma.$transaction(async (transaction) => {
      await transaction.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId: req.user.id,
          },
        },
        update: {},
        create: {
          projectId: task.projectId,
          userId: req.user.id,
        },
      });

      const result = await transaction.task.update({
        where: {
          id: taskId,
        },
        data: {
          status: "in-progress",
          assignedToUserId: req.user.id,
        },
      });

      await updateProjectProgress(task.projectId, transaction);

      return result;
    });

    return res.json(mapTask(updatedTask));
  } catch (error) {
    console.error("Fehler beim Übernehmen des Tasks:", error);

    return res.status(500).json({
      message: "Task konnte nicht übernommen werden.",
    });
  }
});

/**
 * PATCH /api/tasks/:id/complete
 * Schließt einen Task ab und schreibt dem Benutzer XP gut.
 */
router.patch("/:id/complete", requireAuth, async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId)) {
      return res.status(400).json({
        message: "Ungültige Task-ID.",
      });
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task nicht gefunden.",
      });
    }

    if (
      task.assignedToUserId !== null &&
      task.assignedToUserId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Dieser Task gehört einem anderen User.",
      });
    }

    if (task.status === "done") {
      return res.status(409).json({
        message: "Dieser Task wurde bereits abgeschlossen.",
      });
    }

    const updatedTask = await prisma.$transaction(async (transaction) => {
      await transaction.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId: req.user.id,
          },
        },
        update: {},
        create: {
          projectId: task.projectId,
          userId: req.user.id,
        },
      });

      const result = await transaction.task.update({
        where: {
          id: taskId,
        },
        data: {
          status: "done",
          assignedToUserId: req.user.id,
        },
      });

      await transaction.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          xp: {
            increment: task.xp,
          },
        },
      });

      await updateProjectProgress(task.projectId, transaction);

      return result;
    });

    return res.json(mapTask(updatedTask));
  } catch (error) {
    console.error("Fehler beim Abschließen des Tasks:", error);

    return res.status(500).json({
      message: "Task konnte nicht abgeschlossen werden.",
    });
  }
});

module.exports = router;