import type { Project } from "../types";
import { ProjectCard } from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: number;
  onSelectProject: (id: number) => void;
  onAdvanceProject: (id: number) => void;
}

export function ProjectList({
  projects,
  selectedProjectId,
  onSelectProject,
  onAdvanceProject,
}: ProjectListProps) {
  if (projects.length === 0) {
    return <p className="empty-state">Noch keine Projekte vorhanden.</p>;
  }

  return (
    <div className="project-list">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          isSelected={project.id === selectedProjectId}
          onSelectProject={onSelectProject}
          onAdvanceProject={onAdvanceProject}
        />
      ))}
    </div>
  );
}