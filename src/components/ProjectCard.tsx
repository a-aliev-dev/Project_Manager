import type { Project } from "../types";

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onOpenProject: (id: number) => void;
}

const statusLabels: Record<Project["status"], string> = {
  active: "Aktiv",
  planned: "Geplant",
  done: "Abgeschlossen",
};

export function ProjectCard({
  project,
  isSelected,
  onOpenProject,
}: ProjectCardProps) {
  const isDone = project.status === "done";

  return (
    <article
      className={`project-card ${isDone ? "project-card--done" : ""} ${
        isSelected ? "project-card--selected" : ""
      }`}
    >
      <div className="project-card__top">
        <div>
          <p className="project-card__status">{statusLabels[project.status]}</p>
          <h3>{project.name}</h3>
        </div>

        <span className="project-card__xp">{project.xpReward} XP</span>
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

      <div className="project-card__meta">
        <span>{project.memberIds.length} Mitglieder</span>
      </div>

      <div className="project-card__actions">
        <button
          className="secondary-button"
          type="button"
          onClick={() => onOpenProject(project.id)}
        >
          Projekt öffnen
        </button>
      </div>
    </article>
  );
}