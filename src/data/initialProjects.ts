import type { LeaderboardEntry, Project } from "../types";

export const initialProjects: Project[] = [
  {
    id: 1,
    name: "Website Redesign",
    status: "active",
    progress: 65,
    xpReward: 120,
    memberIds: [1, 2],
  },
  {
    id: 2,
    name: "Marketing Campaign",
    status: "active",
    progress: 40,
    xpReward: 90,
    memberIds: [2, 3],
  },
  {
    id: 3,
    name: "App Prototype",
    status: "planned",
    progress: 15,
    xpReward: 70,
    memberIds: [],
  },
];

export const leaderboardEntries: LeaderboardEntry[] = [
  {
    id: 1,
    name: "Max Mustermann",
    xp: 240,
  },
  {
    id: 2,
    name: "Anna Schmidt",
    xp: 210,
  },
  {
    id: 3,
    name: "Lena Fischer",
    xp: 180,
  },
];