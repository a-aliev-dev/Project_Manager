import type { Project } from "../types";
import { ProjectCard } from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  onAdvanceProject: (id: number) => void;
}

export function ProjectList({ projects, onAdvanceProject }: ProjectListProps) {
  const plannedProjects = projects.filter((project) => project.status === "planned");
  const activeProjects = projects.filter((project) => project.status === "active");
  const doneProjects = projects.filter((project) => project.status === "done");

  if (projects.length === 0) {
    return <p className="empty-state">Noch keine Projekte vorhanden.</p>;
  }

  return (
    <div className="kanban-board">
      <div className="kanban-column">
        <h3>Geplant ({plannedProjects.length})</h3>

        {plannedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onAdvanceProject={onAdvanceProject}
          />
        ))}
      </div>

      <div className="kanban-column">
        <h3>Aktiv ({activeProjects.length})</h3>

        {activeProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onAdvanceProject={onAdvanceProject}
          />
        ))}
      </div>

      <div className="kanban-column">
        <h3>Fertig ({doneProjects.length})</h3>

        {doneProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onAdvanceProject={onAdvanceProject}
          />
        ))}
      </div>
    </div>
  );
}