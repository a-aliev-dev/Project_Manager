import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  assignTask,
  completeTask,
  createTask,
  fetchProjectDetail,
  joinProject,
  leaveProject,
  type AuthUser,
} from "../api/questBoardApi";
import { AddTaskForm } from "../components/AddTaskForm";
import { TaskList } from "../components/TaskList";
import { useAuth } from "../context/AuthContext";
import type { Project, QuestTask } from "../types";

const statusLabels: Record<Project["status"], string> = {
  active: "Aktiv",
  planned: "Geplant",
  done: "Abgeschlossen",
};

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { user, token, isAuthenticated, logout } = useAuth();

  const projectId = Number(params.projectId);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<QuestTask[]>([]);
  const [members, setMembers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProjectDetail() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await fetchProjectDetail(projectId);

      setProject(data.project);
      setTasks(data.tasks);
      setMembers(data.members);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Projekt konnte nicht geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(projectId)) {
      navigate("/");
      return;
    }

    loadProjectDetail();
  }, [projectId]);

  async function requireToken() {
    if (!token) {
      navigate("/login");
      throw new Error("Login erforderlich.");
    }

    return token;
  }

  async function handleJoinProject() {
    if (!project) {
      return;
    }

    try {
      const activeToken = await requireToken();
      await joinProject(project.id, activeToken);
      await loadProjectDetail();
    } catch (error) {
      if (error instanceof Error && error.message === "Login erforderlich.") {
        return;
      }

      setErrorMessage(
        error instanceof Error ? error.message : "Projektbeitritt fehlgeschlagen."
      );
    }
  }

  async function handleLeaveProject() {
    if (!project) {
      return;
    }

    try {
      const activeToken = await requireToken();
      await leaveProject(project.id, activeToken);
      await loadProjectDetail();
    } catch (error) {
      if (error instanceof Error && error.message === "Login erforderlich.") {
        return;
      }

      setErrorMessage(
        error instanceof Error ? error.message : "Projekt konnte nicht verlassen werden."
      );
    }
  }

  async function handleAddTask(
    taskData: Omit<
      QuestTask,
      "id" | "projectId" | "status" | "priority" | "category"
    >
  ) {
    if (!project) {
      return;
    }

    try {
      const activeToken = await requireToken();

      await createTask(
        {
          projectId: project.id,
          title: taskData.title,
          description: taskData.description,
          xp: taskData.xp,
        },
        activeToken
      );

      await loadProjectDetail();
    } catch (error) {
      if (error instanceof Error && error.message === "Login erforderlich.") {
        return;
      }

      setErrorMessage(
        error instanceof Error ? error.message : "Task konnte nicht erstellt werden."
      );
    }
  }

  async function handleAssignTask(taskId: number) {
    try {
      const activeToken = await requireToken();
      await assignTask(taskId, activeToken);
      await loadProjectDetail();
    } catch (error) {
      if (error instanceof Error && error.message === "Login erforderlich.") {
        return;
      }

      setErrorMessage(
        error instanceof Error ? error.message : "Task konnte nicht übernommen werden."
      );
    }
  }

  async function handleCompleteTask(taskId: number) {
    try {
      const activeToken = await requireToken();
      await completeTask(taskId, activeToken);
      await loadProjectDetail();
    } catch (error) {
      if (error instanceof Error && error.message === "Login erforderlich.") {
        return;
      }

      setErrorMessage(
        error instanceof Error ? error.message : "Task konnte nicht abgeschlossen werden."
      );
    }
  }

  if (isLoading) {
    return (
      <main className="app">
        <p className="empty-state">Projekt wird geladen...</p>
      </main>
    );
  }

  if (errorMessage || !project) {
    return (
      <main className="app">
        <p className="error-state">{errorMessage || "Projekt nicht gefunden."}</p>
        <Link className="secondary-button link-button" to="/">
          Zurück zur Übersicht
        </Link>
      </main>
    );
  }

  const isCurrentUserMember =
    user !== null && project.memberIds.includes(user.id);

  const projectMembers = members;

  const openTasks = tasks.filter((task) => task.status === "open").length;
  const activeTasks = tasks.filter((task) => task.status === "in-progress").length;
  const doneTasks = tasks.filter((task) => task.status === "done").length;

  return (
    <main className="app">
      <header className="hero project-hero">
        <nav className="top-nav">
          <Link to="/">Zurück zur Übersicht</Link>
          {isAuthenticated ? (
            <button className="nav-button" type="button" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>

        <div className="hero__content">
          <p className="hero__eyebrow">Projektquest</p>
          <h1>{project.name}</h1>
          <p className="hero__text">
            Status: {statusLabels[project.status]} · Fortschritt:{" "}
            {project.progress}% · Belohnung: {project.xpReward} XP
          </p>
        </div>
      </header>

      {errorMessage && <p className="error-state">{errorMessage}</p>}

      <section className="detail-grid">
        <article className="content-section">
          <div className="section-heading">
            <p>Projektstatus</p>
            <h2>Quest-Fortschritt</h2>
          </div>

          <div className="progress">
            <div className="progress__label">
              <span>Fortschritt</span>
              <strong>{project.progress}%</strong>
            </div>

            <div className="progress__bar">
              <div
                className="progress__value"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="project-detail-stats">
            <span>{openTasks} offen</span>
            <span>{activeTasks} in Bearbeitung</span>
            <span>{doneTasks} erledigt</span>
          </div>
        </article>

        <article className="content-section">
          <div className="section-heading">
            <p>Team</p>
            <h2>Projektmitglieder</h2>
          </div>

          <div className="member-list">
            {projectMembers.length === 0 ? (
              <p className="empty-state">Noch keine Mitglieder im Projekt.</p>
            ) : (
              projectMembers.map((member) => (
                <div className="member-card" key={member.id}>
                  <strong>{member.name}</strong>
                  <span>{member.xp} XP</span>
                </div>
              ))
            )}
          </div>

          <div className="member-actions">
            {isCurrentUserMember ? (
              <>
                <p className="member-hint">
                  Du bist in diesem Projekt eingetragen.
                </p>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleLeaveProject}
                >
                  Projekt verlassen
                </button>
              </>
            ) : (
              <>
                <p className="member-hint">
                  Tritt dem Projekt bei, um Quests übernehmen zu können.
                </p>
                <button
                  className="primary-button"
                  type="button"
                  onClick={handleJoinProject}
                >
                  Projekt beitreten
                </button>
              </>
            )}
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="content-section">
          <div className="section-heading">
            <p>Taskboard</p>
            <h2>Quests in diesem Projekt</h2>
          </div>

          <TaskList
            tasks={tasks}
            members={members}
            currentUserId={user?.id ?? 0}
            onAssignTask={handleAssignTask}
            onCompleteTask={handleCompleteTask}
          />
        </article>

        <article className="content-section">
          <div className="section-heading">
            <p>Neue Aufgabe</p>
            <h2>Task erstellen</h2>
          </div>

          {isAuthenticated ? (
            <AddTaskForm projectId={project.id} onAddTask={handleAddTask} />
          ) : (
            <p className="empty-state">
              Du musst eingeloggt sein, um Tasks zu erstellen.
            </p>
          )}
        </article>
      </section>

      <footer className="footer">
        <p>QuestBoard · {project.name}</p>
      </footer>
    </main>
  );
}