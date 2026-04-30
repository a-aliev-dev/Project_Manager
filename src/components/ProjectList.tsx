import type { Project } from "../types";
import { ProjectCard } from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  onAdvanceProject: (id: number) => void;
}

export function ProjectList({ projects, onAdvanceProject }: ProjectListProps) {
  if (projects.length === 0) {
    return <p className="empty-state">Noch keine Projekte vorhanden.</p>;
  }

  return (
    <div className="project-list">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onAdvanceProject={onAdvanceProject}
        />
      ))}
    </div>
  );
}