import { useEffect, useState } from "react";
import "./App.css";
import { initialProjects, leaderboardEntries } from "./data/initialProjects";
import { initialTasks } from "./data/initialTasks";
import { HomePage } from "./pages/HomePage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import type { LeaderboardEntry, Project, QuestTask } from "./types";

const PROJECTS_STORAGE_KEY = "questboard-projects-v4";
const TASKS_STORAGE_KEY = "questboard-tasks-v4";
const CURRENT_USER_ID = 1;

type AppView = "home" | "project-detail";

function calculateProjectProgress(projectId: number, tasks: QuestTask[]) {
  const projectTasks = tasks.filter((task) => task.projectId === projectId);

  if (projectTasks.length === 0) {
    return 0;
  }

  const completedTasks = projectTasks.filter((task) => task.status === "done");

  return Math.round((completedTasks.length / projectTasks.length) * 100);
}

function getProjectStatusFromProgress(
  currentStatus: Project["status"],
  progress: number
): Project["status"] {
  if (progress === 100) {
    return "done";
  }

  if (progress > 0) {
    return "active";
  }

  return currentStatus === "done" ? "active" : currentStatus;
}

function normalizeProjects(projects: Project[]): Project[] {
  return projects.map((project) => ({
    ...project,
    memberIds: project.memberIds ?? [],
  }));
}

function normalizeTasks(tasks: QuestTask[]): QuestTask[] {
  return tasks;
}

function loadTasksFromStorage(): QuestTask[] {
  const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);

  if (!storedTasks) {
    return initialTasks;
  }

  try {
    const parsedTasks = JSON.parse(storedTasks) as QuestTask[];

    if (parsedTasks.length === 0) {
      return initialTasks;
    }

    return normalizeTasks(parsedTasks);
  } catch {
    return initialTasks;
  }
}

function loadProjectsFromStorage(): Project[] {
  const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);

  if (!storedProjects) {
    return initialProjects;
  }

  try {
    const parsedProjects = JSON.parse(storedProjects) as Project[];

    if (parsedProjects.length === 0) {
      return initialProjects;
    }

    return normalizeProjects(parsedProjects);
  } catch {
    return initialProjects;
  }
}

function recalculateProjectsWithTasks(
  projects: Project[],
  tasks: QuestTask[]
): Project[] {
  return projects.map((project) => {
    const progress = calculateProjectProgress(project.id, tasks);

    return {
      ...project,
      progress,
      status: getProjectStatusFromProgress(project.status, progress),
    };
  });
}

function createInitialState() {
  const loadedTasks = loadTasksFromStorage();
  const loadedProjects = recalculateProjectsWithTasks(
    loadProjectsFromStorage(),
    loadedTasks
  );

  return {
    projects: loadedProjects,
    tasks: loadedTasks,
  };
}

function App() {
  const [initialState] = useState(createInitialState);

  const [projects, setProjects] = useState<Project[]>(initialState.projects);
  const [tasks, setTasks] = useState<QuestTask[]>(initialState.tasks);
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  useEffect(() => {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const currentUser = leaderboardEntries.find(
    (entry) => entry.id === CURRENT_USER_ID
  );

  const selectedProject =
    selectedProjectId === null
      ? undefined
      : projects.find((project) => project.id === selectedProjectId);

  const selectedProjectTasks =
    selectedProjectId === null
      ? []
      : tasks.filter((task) => task.projectId === selectedProjectId);

  const activeProjects = projects.filter(
    (project) => project.status === "active"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "done"
  ).length;

  const averageProgress =
    projects.length === 0
      ? 0
      : Math.round(
          projects.reduce((sum, project) => sum + project.progress, 0) /
            projects.length
        );

  const calculatedLeaderboard: LeaderboardEntry[] = leaderboardEntries
    .map((entry) => {
      const completedXp = tasks
        .filter(
          (task) =>
            task.status === "done" && task.assignedToMemberId === entry.id
        )
        .reduce((sum, task) => sum + task.xp, 0);

      return {
        ...entry,
        xp: entry.xp + completedXp,
      };
    })
    .sort((firstEntry, secondEntry) => secondEntry.xp - firstEntry.xp);

  function updateProjectProgress(projectId: number, updatedTasks: QuestTask[]) {
    const newProgress = calculateProjectProgress(projectId, updatedTasks);

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        return {
          ...project,
          progress: newProgress,
          status: getProjectStatusFromProgress(project.status, newProgress),
        };
      })
    );
  }

  function handleOpenProject(projectId: number) {
    setSelectedProjectId(projectId);
    setCurrentView("project-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBackToHome() {
    setCurrentView("home");
    setSelectedProjectId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAddProject(
    projectData: Omit<Project, "id" | "progress" | "xpReward" | "memberIds">
  ) {
    const newProject: Project = {
      id: Date.now(),
      name: projectData.name,
      status: projectData.status,
      progress: projectData.status === "done" ? 100 : 0,
      xpReward: projectData.status === "done" ? 120 : 60,
      memberIds: [CURRENT_USER_ID],
    };

    setProjects((currentProjects) => [newProject, ...currentProjects]);
  }

  function handleJoinProject(projectId: number) {
    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        if (project.memberIds.includes(CURRENT_USER_ID)) {
          return project;
        }

        return {
          ...project,
          memberIds: [...project.memberIds, CURRENT_USER_ID],
          status: project.status === "planned" ? "active" : project.status,
        };
      })
    );
  }

  function handleLeaveProject(projectId: number) {
    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        return {
          ...project,
          memberIds: project.memberIds.filter(
            (memberId) => memberId !== CURRENT_USER_ID
          ),
        };
      })
    );

    const updatedTasks = tasks.map((task) => {
      if (
        task.projectId === projectId &&
        task.assignedToMemberId === CURRENT_USER_ID &&
        task.status !== "done"
      ) {
        return {
          ...task,
          status: "open" as const,
          assignedToMemberId: undefined,
        };
      }

      return task;
    });

    setTasks(updatedTasks);
    updateProjectProgress(projectId, updatedTasks);
  }

  function handleAddTask(
    taskData: Omit<
      QuestTask,
      "id" | "projectId" | "status" | "priority" | "category"
    >
  ) {
    if (!selectedProject) {
      return;
    }

    const newTask: QuestTask = {
      id: Date.now(),
      projectId: selectedProject.id,
      title: taskData.title,
      description: taskData.description,
      xp: taskData.xp,
      status: "open",
      priority: taskData.xp >= 70 ? "high" : taskData.xp >= 50 ? "medium" : "low",
      category: "Projekt",
    };

    const updatedTasks = [newTask, ...tasks];

    setTasks(updatedTasks);
    updateProjectProgress(selectedProject.id, updatedTasks);
  }

  function handleAssignTask(taskId: number) {
    const taskToAssign = tasks.find((task) => task.id === taskId);

    if (!taskToAssign) {
      return;
    }

    const project = projects.find(
      (currentProject) => currentProject.id === taskToAssign.projectId
    );

    if (!project?.memberIds.includes(CURRENT_USER_ID)) {
      handleJoinProject(taskToAssign.projectId);
    }

    const updatedTasks = tasks.map((task) => {
      if (task.id !== taskId || task.status === "done") {
        return task;
      }

      return {
        ...task,
        status: "in-progress" as const,
        assignedToMemberId: CURRENT_USER_ID,
      };
    });

    setTasks(updatedTasks);
    updateProjectProgress(taskToAssign.projectId, updatedTasks);
  }

  function handleCompleteTask(taskId: number) {
    const taskToComplete = tasks.find((task) => task.id === taskId);

    if (!taskToComplete) {
      return;
    }

    if (
      taskToComplete.assignedToMemberId !== undefined &&
      taskToComplete.assignedToMemberId !== CURRENT_USER_ID
    ) {
      return;
    }

    const updatedTasks = tasks.map((task) => {
      if (task.id !== taskId) {
        return task;
      }

      return {
        ...task,
        status: "done" as const,
        assignedToMemberId: task.assignedToMemberId ?? CURRENT_USER_ID,
      };
    });

    setTasks(updatedTasks);
    updateProjectProgress(taskToComplete.projectId, updatedTasks);
  }

  if (currentView === "project-detail" && selectedProject) {
    return (
      <ProjectDetailPage
        project={selectedProject}
        tasks={selectedProjectTasks}
        members={leaderboardEntries}
        currentUserId={CURRENT_USER_ID}
        currentUserName={currentUser?.name ?? "Aktueller Nutzer"}
        onBackToHome={handleBackToHome}
        onJoinProject={handleJoinProject}
        onLeaveProject={handleLeaveProject}
        onAddTask={handleAddTask}
        onAssignTask={handleAssignTask}
        onCompleteTask={handleCompleteTask}
      />
    );
  }

  return (
    <HomePage
      projects={projects}
      leaderboardEntries={calculatedLeaderboard}
      totalProjects={projects.length}
      activeProjects={activeProjects}
      completedProjects={completedProjects}
      averageProgress={averageProgress}
      selectedProjectId={selectedProjectId}
      onOpenProject={handleOpenProject}
      onAddProject={handleAddProject}
    />
  );
}

export default App;