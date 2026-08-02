import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createProject,
  fetchLeaderboard,
  fetchProjects,
} from "../api/questBoardApi";
import { AddProjectForm } from "../components/AddProjectForm";
import { DashboardStats } from "../components/DashboardStats";
import { Leaderboard } from "../components/Leaderboard";
import { ProjectList } from "../components/ProjectList";
import { useAuth } from "../context/AuthContext";
import type { LeaderboardEntry, Project } from "../types";

export function HomePage() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [leaderboardEntries, setLeaderboardEntries] = useState<
    LeaderboardEntry[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [loadedProjects, loadedLeaderboard] = await Promise.all([
        fetchProjects(),
        fetchLeaderboard(),
      ]);

      setProjects(loadedProjects);
      setLeaderboardEntries(loadedLeaderboard);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Dashboard konnte nicht geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

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

  async function handleAddProject(
    projectData: Omit<Project, "id" | "progress" | "xpReward" | "memberIds">
  ) {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setErrorMessage("");

      const createdProject = await createProject(projectData, token);

      setProjects((currentProjects) => [
        createdProject,
        ...currentProjects,
      ]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Projekt konnte nicht erstellt werden."
      );
    }
  }

  return (
    <main className="app">
      <header className="hero">
        <nav className="top-nav">
          <Link to="/">Home</Link>
          <a href="#create-project">Neues Projekt</a>
          <a href="#leaderboard">Leaderboard</a>

          {isAuthenticated ? (
            <button className="nav-button" type="button" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>

        <div className="hero__content">
          <p className="hero__eyebrow">QuestBoard</p>
          <h1>Projektübersicht mit Gamification</h1>

          <p className="hero__text">
            Verwalte Projekte, öffne Projektquests und mache Teamleistung durch
            XP und Leaderboards sichtbar.
          </p>

          {user && (
            <p className="hero__text">
              Eingeloggt als {user.name}
            </p>
          )}
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

        {isLoading && (
          <p className="empty-state">
            Dashboard wird geladen...
          </p>
        )}

        {errorMessage && (
          <p className="error-state">
            {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && (
          <ProjectList
            projects={projects}
            selectedProjectId={null}
            onOpenProject={(id) => navigate(`/projects/${id}`)}
          />
        )}
      </section>

      <section id="create-project" className="content-grid">
        <article className="content-section">
          <div className="section-heading">
            <p>Neue Quest starten</p>
            <h2>Projekt erstellen</h2>
          </div>

          {isAuthenticated ? (
            <AddProjectForm onAddProject={handleAddProject} />
          ) : (
            <p className="empty-state">
              Du musst eingeloggt sein, um ein Projekt zu erstellen.
            </p>
          )}
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