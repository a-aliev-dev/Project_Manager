import type { LeaderboardEntry, Project, QuestTask } from "../types";

const API_BASE_URL = "http://localhost:3001/api";

export interface AuthUser extends LeaderboardEntry {
  email: string;
}

export interface ProjectDetailResponse {
  project: Project;
  tasks: QuestTask[];
  members: AuthUser[];
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "API-Fehler");
  }

  return data as T;
}

export function fetchProjects() {
  return request<Project[]>("/projects");
}

export function fetchProjectDetail(projectId: number) {
  return request<ProjectDetailResponse>(`/projects/${projectId}`);
}

export function createProject(
  project: { name: string; status: Project["status"] },
  token: string
) {
  return request<Project>(
    "/projects",
    {
      method: "POST",
      body: JSON.stringify(project),
    },
    token
  );
}

export function joinProject(projectId: number, token: string) {
  return request<{ message: string }>(
    `/projects/${projectId}/join`,
    {
      method: "POST",
    },
    token
  );
}

export function leaveProject(projectId: number, token: string) {
  return request<{ message: string }>(
    `/projects/${projectId}/leave`,
    {
      method: "POST",
    },
    token
  );
}

export function createTask(
  task: {
    projectId: number;
    title: string;
    description: string;
    xp: number;
  },
  token: string
) {
  return request<QuestTask>(
    "/tasks",
    {
      method: "POST",
      body: JSON.stringify(task),
    },
    token
  );
}

export function assignTask(taskId: number, token: string) {
  return request<QuestTask>(
    `/tasks/${taskId}/assign`,
    {
      method: "PATCH",
    },
    token
  );
}

export function completeTask(taskId: number, token: string) {
  return request<QuestTask>(
    `/tasks/${taskId}/complete`,
    {
      method: "PATCH",
    },
    token
  );
}

export function login(credentials: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}