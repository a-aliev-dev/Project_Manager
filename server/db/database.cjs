const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const db = new Database("server/db/questboard.sqlite");

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    xp_reward INTEGER NOT NULL DEFAULT 60
  );

  CREATE TABLE IF NOT EXISTS project_members (
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    xp INTEGER NOT NULL,
    assigned_to_user_id INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL
  );
`);

function seedDatabase() {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;

  if (userCount > 0) {
    return;
  }

  const passwordHash = bcrypt.hashSync("test123", 10);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, xp)
    VALUES (?, ?, ?, ?)
  `);

  insertUser.run("Max Mustermann", "max@test.de", passwordHash, 240);
  insertUser.run("Anna Schmidt", "anna@test.de", passwordHash, 210);
  insertUser.run("Lena Fischer", "lena@test.de", passwordHash, 180);

  const insertProject = db.prepare(`
    INSERT INTO projects (name, status, progress, xp_reward)
    VALUES (?, ?, ?, ?)
  `);

  const website = insertProject.run("Website Redesign", "active", 33, 120);
  const marketing = insertProject.run("Marketing Campaign", "active", 50, 90);
  const prototype = insertProject.run("App Prototype", "planned", 0, 70);

  const insertMember = db.prepare(`
    INSERT INTO project_members (project_id, user_id)
    VALUES (?, ?)
  `);

  insertMember.run(website.lastInsertRowid, 1);
  insertMember.run(website.lastInsertRowid, 2);
  insertMember.run(marketing.lastInsertRowid, 2);
  insertMember.run(marketing.lastInsertRowid, 3);

  const insertTask = db.prepare(`
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTask.run(
    website.lastInsertRowid,
    "Layout analysieren",
    "Bestehendes Design prüfen und Verbesserungen sammeln.",
    "Design",
    "done",
    "medium",
    50,
    1
  );

  insertTask.run(
    website.lastInsertRowid,
    "Startseite überarbeiten",
    "Hero-Bereich und Projektkarten visuell verbessern.",
    "Frontend",
    "in-progress",
    "high",
    70,
    2
  );

  insertTask.run(
    website.lastInsertRowid,
    "Responsives Design testen",
    "Darstellung auf Desktop und kleinen Bildschirmen prüfen.",
    "Testing",
    "open",
    "medium",
    50,
    null
  );

  insertTask.run(
    marketing.lastInsertRowid,
    "Kampagnenziele definieren",
    "Ziele und Zielgruppen für die Marketing-Kampagne festlegen.",
    "Marketing",
    "done",
    "medium",
    50,
    2
  );

  insertTask.run(
    marketing.lastInsertRowid,
    "Content planen",
    "Beiträge und Inhalte für die Kampagne vorbereiten.",
    "Content",
    "open",
    "high",
    70,
    null
  );

  insertTask.run(
    prototype.lastInsertRowid,
    "Wireframes erstellen",
    "Erste Skizzen für den App-Prototyp erstellen.",
    "UX",
    "open",
    "high",
    70,
    null
  );
}

seedDatabase();

module.exports = db;