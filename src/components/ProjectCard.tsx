import type { Project } from "../types";

interface ProjectCardProps {
  project: Project;
  onAdvanceProject: (id: number) => void;
}

const statusLabels: Record<Project["status"], string> = {
  planned: "🟡 Geplant",
  active: "🔵 Aktiv",
  done: "✅ Fertig",
};

export function ProjectCard({ project, onAdvanceProject }: ProjectCardProps) {
  const isDone = project.status === "done";

  return (
    <article className={`project-card ${isDone ? "project-card--done" : ""}`}>
      <div className="project-card__top">
        <div>
          <p className="project-card__status">{statusLabels[project.status]}</p>
          <h3>{project.name}</h3>
        </div>

        <span className="project-card__xp">⭐ {project.xpReward} XP</span>
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

      <button
        className="secondary-button"
        onClick={() => onAdvanceProject(project.id)}
        disabled={isDone}
      >
        {isDone ? "Projekt abgeschlossen" : "Fortschritt erhöhen"}
      </button>
    </article>
  );
}