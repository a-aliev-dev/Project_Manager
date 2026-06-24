const request = require("supertest");
const express = require("express");
const cors = require("cors");

require("./db/database.cjs");

const authRoutes = require("./routes/auth.cjs");
const projectRoutes = require("./routes/projects.cjs");
const taskRoutes = require("./routes/tasks.cjs");

function createTestApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);

  return app;
}

describe("QuestBoard API", () => {
  const app = createTestApp();

  test("GET /api/projects liefert Projekte", async () => {
    const response = await request(app).get("/api/projects");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("POST /api/auth/login liefert JWT Token", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "max@test.de",
      password: "test123",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe("max@test.de");
  });

  test("POST /api/projects ist ohne Token geschützt", async () => {
    const response = await request(app).post("/api/projects").send({
      name: "Unauthorized Project",
      status: "planned",
    });

    expect(response.status).toBe(401);
  });

  test("POST /api/projects erstellt mit Token ein Projekt", async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "max@test.de",
      password: "test123",
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "API Test Projekt",
        status: "planned",
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("API Test Projekt");
    expect(response.body.memberIds).toContain(loginResponse.body.user.id);
  });

  test("POST /api/tasks erstellt mit Token einen Task", async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "max@test.de",
      password: "test123",
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectId: 1,
        title: "Test Task",
        description: "Testbeschreibung",
        xp: 50,
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Test Task");
    expect(response.body.status).toBe("open");
  });

  test("PATCH /api/tasks/:id/assign übernimmt einen Task mit JWT", async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "max@test.de",
      password: "test123",
    });

    const token = loginResponse.body.token;

    const taskResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectId: 1,
        title: "Assign Test Task",
        description: "Task für Assign-Test",
        xp: 50,
      });

    const response = await request(app)
      .patch(`/api/tasks/${taskResponse.body.id}/assign`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("in-progress");
    expect(response.body.assignedToMemberId).toBe(loginResponse.body.user.id);
  });

  test("PATCH /api/tasks/:id/complete schließt einen Task mit JWT ab", async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "max@test.de",
      password: "test123",
    });

    const token = loginResponse.body.token;

    const taskResponse = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectId: 1,
        title: "Complete Test Task",
        description: "Task für Complete-Test",
        xp: 50,
      });

    const response = await request(app)
      .patch(`/api/tasks/${taskResponse.body.id}/complete`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("done");
    expect(response.body.assignedToMemberId).toBe(loginResponse.body.user.id);
  });
});