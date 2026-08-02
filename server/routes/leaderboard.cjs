const express = require("express");
const prisma = require("../db/prisma.cjs");

const router = express.Router();

/**
 * GET /api/leaderboard
 * Gibt alle Benutzer nach XP absteigend sortiert zurück.
 */
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: [
        {
          xp: "desc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        id: true,
        name: true,
        xp: true,
      },
    });

    return res.json(users);
  } catch (error) {
    console.error("Fehler beim Laden des Leaderboards:", error);

    return res.status(500).json({
      message: "Leaderboard konnte nicht geladen werden.",
    });
  }
});

module.exports = router;