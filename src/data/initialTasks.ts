import type { QuestTask } from "../types";

export const initialTasks: QuestTask[] = [
  {
    id: 1,
    title: "Landing Page gestalten",
    description: "Startseite für QuestBoard mit klarer Struktur und Call-to-Action erstellen.",
    category: "Design",
    status: "open",
    priority: "high",
    xp: 80,
  },
  {
    id: 2,
    title: "Projektübersicht umsetzen",
    description: "Eine Übersicht für aktive Projekte und Fortschritt anzeigen.",
    category: "Frontend",
    status: "in-progress",
    priority: "medium",
    xp: 60,
  },
  {
    id: 3,
    title: "README für M2 aktualisieren",
    description: "Setup, Repository-Link und Kriterien-Zuordnung dokumentieren.",
    category: "Dokumentation",
    status: "open",
    priority: "medium",
    xp: 40,
  },
];