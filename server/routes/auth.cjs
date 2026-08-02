const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma.cjs");
const { JWT_SECRET } = require("../middleware/auth.cjs");

const router = express.Router();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    xp: user.xp,
  };
}

/**
 * POST /api/auth/register
 * Erstellt einen neuen Benutzer und gibt direkt ein JWT zurück.
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({
        message: "Name, E-Mail und Passwort sind Pflicht.",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        message: "Passwort muss mindestens 6 Zeichen haben.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Diese E-Mail ist bereits registriert.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        xp: 0,
      },
    });

    const safeUser = publicUser(user);

    const token = jwt.sign(safeUser, JWT_SECRET, {
      expiresIn: "2h",
    });

    return res.status(201).json({
      user: safeUser,
      token,
    });
  } catch (error) {
    // Falls zwei Registrierungen mit derselben E-Mail gleichzeitig eintreffen.
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Diese E-Mail ist bereits registriert.",
      });
    }

    console.error("Fehler bei der Registrierung:", error);

    return res.status(500).json({
      message: "Registrierung fehlgeschlagen.",
    });
  }
});

/**
 * POST /api/auth/login
 * Prüft E-Mail und Passwort und gibt bei Erfolg ein JWT zurück.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanEmail || !password) {
      return res.status(400).json({
        message: "E-Mail und Passwort sind Pflicht.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Login fehlgeschlagen.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Login fehlgeschlagen.",
      });
    }

    const safeUser = publicUser(user);

    const token = jwt.sign(safeUser, JWT_SECRET, {
      expiresIn: "2h",
    });

    return res.json({
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Fehler beim Login:", error);

    return res.status(500).json({
      message: "Login fehlgeschlagen.",
    });
  }
});

module.exports = router;