const bcrypt = require("bcryptjs");
const prisma = require("../server/db/prisma.cjs");

async function main() {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    console.log("Datenbank enthält bereits Benutzer. Seeding übersprungen.");
    return;
  }

  const passwordHash = await bcrypt.hash("test123", 10);

  const max = await prisma.user.create({
    data: {
      name: "Max Mustermann",
      email: "max@test.de",
      passwordHash,
      xp: 240,
    },
  });

  const anna = await prisma.user.create({
    data: {
      name: "Anna Schmidt",
      email: "anna@test.de",
      passwordHash,
      xp: 210,
    },
  });

  const lena = await prisma.user.create({
    data: {
      name: "Lena Fischer",
      email: "lena@test.de",
      passwordHash,
      xp: 180,
    },
  });

  const website = await prisma.project.create({
    data: {
      name: "Website Redesign",
      status: "active",
      progress: 33,
      xpReward: 120,
      members: {
        create: [
          {
            userId: max.id,
          },
          {
            userId: anna.id,
          },
        ],
      },
    },
  });

  const marketing = await prisma.project.create({
    data: {
      name: "Marketing Campaign",
      status: "active",
      progress: 50,
      xpReward: 90,
      members: {
        create: [
          {
            userId: anna.id,
          },
          {
            userId: lena.id,
          },
        ],
      },
    },
  });

  const prototype = await prisma.project.create({
    data: {
      name: "App Prototype",
      status: "planned",
      progress: 0,
      xpReward: 70,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        projectId: website.id,
        title: "Layout analysieren",
        description:
          "Bestehendes Design prüfen und Verbesserungen sammeln.",
        category: "Design",
        status: "done",
        priority: "medium",
        xp: 50,
        assignedToUserId: max.id,
      },
      {
        projectId: website.id,
        title: "Startseite überarbeiten",
        description:
          "Hero-Bereich und Projektkarten visuell verbessern.",
        category: "Frontend",
        status: "in-progress",
        priority: "high",
        xp: 70,
        assignedToUserId: anna.id,
      },
      {
        projectId: website.id,
        title: "Responsives Design testen",
        description:
          "Darstellung auf Desktop und kleinen Bildschirmen prüfen.",
        category: "Testing",
        status: "open",
        priority: "medium",
        xp: 50,
        assignedToUserId: null,
      },
      {
        projectId: marketing.id,
        title: "Kampagnenziele definieren",
        description:
          "Ziele und Zielgruppen für die Marketing-Kampagne festlegen.",
        category: "Marketing",
        status: "done",
        priority: "medium",
        xp: 50,
        assignedToUserId: anna.id,
      },
      {
        projectId: marketing.id,
        title: "Content planen",
        description:
          "Beiträge und Inhalte für die Kampagne vorbereiten.",
        category: "Content",
        status: "open",
        priority: "high",
        xp: 70,
        assignedToUserId: null,
      },
      {
        projectId: prototype.id,
        title: "Wireframes erstellen",
        description:
          "Erste Skizzen für den App-Prototyp erstellen.",
        category: "UX",
        status: "open",
        priority: "high",
        xp: 70,
        assignedToUserId: null,
      },
    ],
  });

  console.log("Prisma-Seeding erfolgreich abgeschlossen.");
}

main()
  .catch((error) => {
    console.error("Fehler beim Prisma-Seeding:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });