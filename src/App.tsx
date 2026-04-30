import { useEffect, useState } from "react";
import "./App.css";
import { AddProjectForm } from "./components/AddProjectForm";
import { DashboardStats } from "./components/DashboardStats";
import { Leaderboard } from "./components/Leaderboard";
import { ProjectList } from "./components/ProjectList";
import { initialProjects, leaderboardEntries } from "./data/initialProjects";
import type { Project } from "./types";

const STORAGE_KEY = "questboard-projects";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const storedProjects = localStorage.getItem(STORAGE_KEY);

    if (storedProjects) {
      setProjects(JSON.parse(storedProjects) as Project[]);
    } else {
      setProjects(initialProjects);
    }
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

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
          status: newProgress === 100 ? "done" : "active",
        };
      })
    );
  }

  return (
    <main className="app">
      <header className="hero">
        <nav className="top-nav">
          <a href="#projects">Home</a>
          <a href="#leaderboard">Leaderboard</a>
          <a href="#create-project">Neues Projekt</a>
        </nav>

        <div className="hero__content">
          <p className="hero__eyebrow">QuestBoard</p>
          <h1>Projektübersicht mit Gamification</h1>
          <p className="hero__text">
            Verwalte Projekte, erhöhe Fortschritt und mache Teamleistung durch
            XP und Leaderboards sichtbar.
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
          onAdvanceProject={handleAdvanceProject}
        />
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