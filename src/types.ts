export type TaskStatus = "open" | "in-progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export interface QuestTask {
  id: number;
  projectId: number;
  title: string;
  description: string;
  category: string;
  status: TaskStatus;
  priority: TaskPriority;
  xp: number;
}

export type ProjectStatus = "active" | "planned" | "done";

export interface Project {
  id: number;
  name: string;
  status: ProjectStatus;
  progress: number;
  xpReward: number;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  xp: number;
}