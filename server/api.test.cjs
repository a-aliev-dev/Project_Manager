const request = require("supertest");
const express = require("express");
const cors = require("cors");

const prisma = require("./db/prisma.cjs");

const authRoutes = require("./routes/auth.cjs");
const projectRoutes = require("./routes/projects.cjs");
const taskRoutes = require("./routes/tasks.cjs");
const leaderboardRoutes = require("./routes/leaderboard.cjs");

function createTestApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/leaderboard", leaderboardRoutes);

  return app;
}

describe("QuestBoard API", () => {
  const app = createTestApp();

  let token;
  let userId;
  let testProjectId;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "max@test.de",
        password: "test123",
      });

    if (loginResponse.status !== 200) {
      throw new Error(
        "Testbenutzer max@test.de konnte nicht angemeldet werden. " +
          "Führe zuerst `npx prisma db seed` aus."
      );
    }

    token = loginResponse.body.token;
    userId = loginResponse.body.user.id;

    const projectResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Automatisches Testprojekt",
        status: "planned",
      });

    if (projectResponse.status !== 201) {
      throw new Error("Das Testprojekt konnte nicht erstellt werden.");
    }

    testProjectId = projectResponse.body.id;
  });

  afterAll(async () => {
    /*
     * Das Löschen des Testprojekts entfernt durch onDelete: Cascade
     * ebenfalls seine Tasks und Mitgliedschaften.
     */
    if (testProjectId) {
      await prisma.project.deleteMany({
        where: {
          id: testProjectId,
        },
      });
    }

    await prisma.$disconnect();
  });

  test("GET /api/projects liefert Projekte", async () => {
    const response = await request(app).get("/api/projects");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("POST /api/auth/login liefert einen JWT-Token", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "max@test.de",
        password: "test123",
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe("max@test.de");
  });

  test("POST /api/projects ist ohne Token geschützt", async () => {
    const response = await request(app)
      .post("/api/projects")
      .send({
        name: "Unauthorized Project",
        status: "planned",
      });

    expect(response.status).toBe(401);
  });

  test("POST /api/projects erstellt mit Token ein Projekt", async () => {
    const projectName = `API Test Projekt ${Date.now()}`;

    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: projectName,
        status: "planned",
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(projectName);
    expect(response.body.memberIds).toContain(userId);

    /*
     * Dieses zusätzliche Projekt wird direkt wieder entfernt,
     * damit der Test keine dauerhaften Daten hinterlässt.
     */
    await prisma.project.delete({
      where: {
        id: response.body.id,
      },
    });
  });

  test("POST /api/tasks erstellt mit Token einen Task", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectId: testProjectId,
        title: "Test Task",
        description: "Testbeschreibung",
        xp: 50,
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Test Task");
    expect(response.body.status).toBe("open");
    expect(response.body.projectId).toBe(testProjectId);
  });

  test("PATCH /api/tasks/:id/assign übernimmt einen Task mit JWT", async () => {
    const taskResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectId: testProjectId,
        title: "Assign Test Task",
        description: "Task für den Assign-Test",
        xp: 50,
      });

    expect(taskResponse.status).toBe(201);

    const response = await request(app)
      .patch(`/api/tasks/${taskResponse.body.id}/assign`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("in-progress");
    expect(response.body.assignedToMemberId).toBe(userId);
  });

  test("PATCH /api/tasks/:id/complete schließt einen Task mit JWT ab", async () => {
    const taskResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectId: testProjectId,
        title: "Complete Test Task",
        description: "Task für den Complete-Test",
        xp: 50,
      });

    expect(taskResponse.status).toBe(201);

    const response = await request(app)
      .patch(`/api/tasks/${taskResponse.body.id}/complete`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("done");
    expect(response.body.assignedToMemberId).toBe(userId);
  });

  test("GET /api/leaderboard liefert nach XP sortierte Benutzer", async () => {
    const response = await request(app).get("/api/leaderboard");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    for (let index = 1; index < response.body.length; index += 1) {
      expect(response.body[index - 1].xp).toBeGreaterThanOrEqual(
        response.body[index].xp
      );
    }
  });
});