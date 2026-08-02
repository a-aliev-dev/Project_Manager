const express = require("express");
const prisma = require("../db/prisma.cjs");
const { requireAuth } = require("../middleware/auth.cjs");

const router = express.Router();

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

function mapMember(member) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    xp: member.xp,
  };
}

function mapProject(project) {
  return {
    id: project.id,
    name: project.name,
    status: project.status,
    progress: project.progress,
    xpReward: project.xpReward,
    memberIds: project.members.map((membership) => membership.userId),
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

  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          (tasks.filter((task) => task.status === "done").length /
            tasks.length) *
            100
        );

  const status =
    progress === 100 ? "done" : progress > 0 ? "active" : "planned";

  return {
    progress,
    status,
  };
}

async function updateProjectProgress(projectId, transaction = prisma) {
  const state = await calculateProjectState(projectId, transaction);

  return transaction.project.update({
    where: {
      id: projectId,
    },
    data: state,
  });
}

/**
 * GET /api/projects
 * Gibt alle Projekte einschließlich ihrer Mitglieder-IDs zurück.
 */
router.get("/", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        id: "desc",
      },
      include: {
        members: {
          select: {
            userId: true,
          },
        },
      },
    });

    return res.json(projects.map(mapProject));
  } catch (error) {
    console.error("Fehler beim Laden der Projekte:", error);

    return res.status(500).json({
      message: "Projekte konnten nicht geladen werden.",
    });
  }
});

/**
 * GET /api/projects/:id
 * Gibt ein einzelnes Projekt mit Tasks und Mitgliedern zurück.
 */
router.get("/:id", async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId)) {
      return res.status(400).json({
        message: "Ungültige Projekt-ID.",
      });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        tasks: {
          orderBy: {
            id: "desc",
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Projekt nicht gefunden.",
      });
    }

    return res.json({
      project: mapProject(project),
      tasks: project.tasks.map(mapTask),
      members: project.members
        .map((membership) => mapMember(membership.user))
        .sort((first, second) =>
          first.name.localeCompare(second.name, "de")
        ),
    });
  } catch (error) {
    console.error("Fehler beim Laden des Projekts:", error);

    return res.status(500).json({
      message: "Projekt konnte nicht geladen werden.",
    });
  }
});

/**
 * POST /api/projects
 * Erstellt ein Projekt und trägt den eingeloggten Benutzer als Mitglied ein.
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, status } = req.body;

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanStatus = typeof status === "string" ? status.trim() : "";

    if (!cleanName || !cleanStatus) {
      return res.status(400).json({
        message: "Name und Status sind Pflicht.",
      });
    }

    const xpReward = cleanStatus === "done" ? 120 : 60;
    const progress = cleanStatus === "done" ? 100 : 0;

    const project = await prisma.project.create({
      data: {
        name: cleanName,
        status: cleanStatus,
        progress,
        xpReward,
        members: {
          create: {
            userId: req.user.id,
          },
        },
      },
      include: {
        members: {
          select: {
            userId: true,
          },
        },
      },
    });

    return res.status(201).json(mapProject(project));
  } catch (error) {
    console.error("Fehler beim Erstellen des Projekts:", error);

    return res.status(500).json({
      message: "Projekt konnte nicht erstellt werden.",
    });
  }
});

/**
 * POST /api/projects/:id/join
 * Fügt den eingeloggten Benutzer einem Projekt hinzu.
 */
router.post("/:id/join", requireAuth, async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId)) {
      return res.status(400).json({
        message: "Ungültige Projekt-ID.",
      });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
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

    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user.id,
        },
      },
      update: {},
      create: {
        projectId,
        userId: req.user.id,
      },
    });

    return res.json({
      message: "Projektbeitritt erfolgreich.",
    });
  } catch (error) {
    console.error("Fehler beim Projektbeitritt:", error);

    return res.status(500).json({
      message: "Projektbeitritt fehlgeschlagen.",
    });
  }
});

/**
 * POST /api/projects/:id/leave
 * Entfernt den eingeloggten Benutzer aus einem Projekt.
 */
router.post("/:id/leave", requireAuth, async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId)) {
      return res.status(400).json({
        message: "Ungültige Projekt-ID.",
      });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
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

    await prisma.$transaction(async (transaction) => {
      await transaction.projectMember.deleteMany({
        where: {
          projectId,
          userId: req.user.id,
        },
      });

      await transaction.task.updateMany({
        where: {
          projectId,
          assignedToUserId: req.user.id,
          status: {
            not: "done",
          },
        },
        data: {
          status: "open",
          assignedToUserId: null,
        },
      });

      await updateProjectProgress(projectId, transaction);
    });

    return res.json({
      message: "Projekt verlassen.",
    });
  } catch (error) {
    console.error("Fehler beim Verlassen des Projekts:", error);

    return res.status(500).json({
      message: "Projekt konnte nicht verlassen werden.",
    });
  }
});

module.exports = router;