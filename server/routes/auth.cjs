const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/database.cjs");
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

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, E-Mail und Passwort sind Pflicht." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Passwort muss mindestens 6 Zeichen haben." });
  }

  const existingUser = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email);

  if (existingUser) {
    return res.status(409).json({ message: "Diese E-Mail ist bereits registriert." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const result = db
    .prepare(
      "INSERT INTO users (name, email, password_hash, xp) VALUES (?, ?, ?, 0)"
    )
    .run(name, email, passwordHash);

  const user = db
    .prepare("SELECT id, name, email, xp FROM users WHERE id = ?")
    .get(result.lastInsertRowid);

  const token = jwt.sign(publicUser(user), JWT_SECRET, { expiresIn: "2h" });

  return res.status(201).json({
    user: publicUser(user),
    token,
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "E-Mail und Passwort sind Pflicht." });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  if (!user) {
    return res.status(401).json({ message: "Login fehlgeschlagen." });
  }

  const passwordMatches = bcrypt.compareSync(password, user.password_hash);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Login fehlgeschlagen." });
  }

  const token = jwt.sign(publicUser(user), JWT_SECRET, { expiresIn: "2h" });

  return res.json({
    user: publicUser(user),
    token,
  });
});

module.exports = router;