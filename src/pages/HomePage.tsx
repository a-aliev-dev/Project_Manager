import { AddProjectForm } from "../components/AddProjectForm";
import { DashboardStats } from "../components/DashboardStats";
import { Leaderboard } from "../components/Leaderboard";
import { ProjectList } from "../components/ProjectList";
import type { LeaderboardEntry, Project } from "../types";

interface HomePageProps {
  projects: Project[];
  leaderboardEntries: LeaderboardEntry[];
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageProgress: number;
  selectedProjectId: number | null;
  onOpenProject: (id: number) => void;
  onAddProject: (
    project: Omit<Project, "id" | "progress" | "xpReward" | "memberIds">
  ) => void;
}

export function HomePage({
  projects,
  leaderboardEntries,
  totalProjects,
  activeProjects,
  completedProjects,
  averageProgress,
  selectedProjectId,
  onOpenProject,
  onAddProject,
}: HomePageProps) {
  return (
    <main className="app">
      <header className="hero">
        <nav className="top-nav">
          <a href="#projects">Home</a>
          <a href="#create-project">Neues Projekt</a>
          <a href="#leaderboard">Leaderboard</a>
        </nav>

        <div className="hero__content">
          <p className="hero__eyebrow">QuestBoard</p>
          <h1>Projektübersicht mit Gamification</h1>
          <p className="hero__text">
            Verwalte Projekte, öffne Projektquests und mache Teamleistung durch
            XP und Leaderboards sichtbar.
          </p>
        </div>
      </header>

      <DashboardStats
        totalProjects={totalProjects}
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
          onOpenProject={onOpenProject}
        />
      </section>

      <section id="create-project" className="content-grid">
        <article className="content-section">
          <div className="section-heading">
            <p>Neue Quest starten</p>
            <h2>Projekt erstellen</h2>
          </div>

          <AddProjectForm onAddProject={onAddProject} />
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