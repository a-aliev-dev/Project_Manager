import { useEffect, useState } from "react";
import "./App.css";
import { AddProjectForm } from "./components/AddProjectForm";
import { AddTaskForm } from "./components/AddTaskForm";
import { DashboardStats } from "./components/DashboardStats";
import { Leaderboard } from "./components/Leaderboard";
import { ProjectList } from "./components/ProjectList";
import { TaskList } from "./components/TaskList";
import { initialProjects, leaderboardEntries } from "./data/initialProjects";
import { initialTasks } from "./data/initialTasks";
import type { Project, QuestTask } from "./types";

const PROJECTS_STORAGE_KEY = "questboard-projects-v2";
const TASKS_STORAGE_KEY = "questboard-tasks-v2";

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

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<QuestTask[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(
    initialProjects[0]?.id ?? 0
  );

  useEffect(() => {
    const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);

    const loadedTasks = storedTasks
      ? (JSON.parse(storedTasks) as QuestTask[])
      : initialTasks;

    const loadedProjects = storedProjects
      ? (JSON.parse(storedProjects) as Project[])
      : initialProjects;

    const projectsWithTaskProgress = loadedProjects.map((project) => {
      const projectTasks = loadedTasks.filter(
        (task) => task.projectId === project.id
      );

      if (projectTasks.length === 0) {
        return project;
      }

      const progress = calculateProjectProgress(project.id, loadedTasks);

      return {
        ...project,
        progress,
        status: getProjectStatusFromProgress(project.status, progress),
      };
    });

    setTasks(loadedTasks);
    setProjects(projectsWithTaskProgress);
    setSelectedProjectId(projectsWithTaskProgress[0]?.id ?? 0);
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

  const selectedProjectTasks = tasks.filter(
    (task) => task.projectId === selectedProjectId
  );

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

  function handleAddProject(
    projectData: Omit<Project, "id" | "progress" | "xpReward">
  ) {
    const newProject: Project = {
      id: Date.now(),
      name: projectData.name,
      status: projectData.status,
      progress: projectData.status === "done" ? 100 : 0,
      xpReward: projectData.status === "done" ? 120 : 60,
    };

    setProjects((currentProjects) => [newProject, ...currentProjects]);
    setSelectedProjectId(newProject.id);
  }

  function handleAdvanceProject(id: number) {
    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== id) {
          return project;
        }

        const newProgress = Math.min(project.progress + 10, 100);

        return {
          ...project,
          progress: newProgress,
          status: getProjectStatusFromProgress(project.status, newProgress),
        };
      })
    );
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

  function handleCompleteTask(id: number) {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, status: "done" as const } : task
    );

    setTasks(updatedTasks);

    const completedTask = updatedTasks.find((task) => task.id === id);

    if (!completedTask) {
      return;
    }

    updateProjectProgress(completedTask.projectId, updatedTasks);
  }

  return (
    <main className="app">
      <header className="hero">
        <nav className="top-nav">
          <a href="#projects">Home</a>
          <a href="#tasks">Tasks</a>
          <a href="#leaderboard">Leaderboard</a>
          <a href="#create-project">Neues Projekt</a>
        </nav>

        <div className="hero__content">
          <p className="hero__eyebrow">QuestBoard</p>
          <h1>Projektübersicht mit Gamification</h1>
          <p className="hero__text">
            Verwalte Projekte, erledige Tasks und mache Teamleistung durch XP
            und Leaderboards sichtbar.
          </p>
        </div>
      </header>

      <DashboardStats
        totalProjects={projects.length}
        activeProjects={activeProjects}
        completedProjects={completedProjects}
        averageProgress={averageProgress}
      />

      <section id="projects" className="content-section">
        <div className="section-heading">
          <p>Projektübersicht</p>
          <h2>Alle Projekte</h2>
        </div>

        <ProjectList
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onAdvanceProject={handleAdvanceProject}
        />
      </section>

      <section id="tasks" className="content-grid">
        <article className="content-section">
          <div className="section-heading">
            <p>Taskboard</p>
            <h2>
              {selectedProject
                ? `Tasks für "${selectedProject.name}"`
                : "Tasks auswählen"}
            </h2>
          </div>

          <TaskList
            tasks={selectedProjectTasks}
            onCompleteTask={handleCompleteTask}
          />
        </article>

        <article className="content-section">
          <div className="section-heading">
            <p>Neue Aufgabe</p>
            <h2>Task erstellen</h2>
          </div>

          {selectedProject ? (
            <AddTaskForm
              projectId={selectedProject.id}
              onAddTask={handleAddTask}
            />
          ) : (
            <p className="empty-state">
              Wähle zuerst ein Projekt aus, um einen Task anzulegen.
            </p>
          )}
        </article>
      </section>

      <section id="create-project" className="content-grid">
        <article className="content-section">
          <div className="section-heading">
            <p>Neue Quest starten</p>
            <h2>Projekt erstellen</h2>
          </div>

          <AddProjectForm onAddProject={handleAddProject} />
        </article>

        <article id="leaderboard" className="content-section">
          <div className="section-heading">
            <p>Teamleistung</p>
            <h2>Globales Leaderboard</h2>
          </div>

          <Leaderboard entries={leaderboardEntries} />
        </article>
      </section>

      <footer className="footer">
        <p>QuestBoard</p>
      </footer>
    </main>
  );
}

export default App;