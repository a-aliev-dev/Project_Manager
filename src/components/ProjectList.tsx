import type { Project, ProjectStatus } from "../types";
import { ProjectCard } from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: number | null;
  onOpenProject: (id: number) => void;
}

const projectColumns: Array<{
  status: ProjectStatus;
  title: string;
}> = [
  {
    status: "planned",
    title: "Geplant",
  },
  {
    status: "active",
    title: "Aktiv",
  },
  {
    status: "done",
    title: "Abgeschlossen",
  },
];

export function ProjectList({
  projects,
  selectedProjectId,
  onOpenProject,
}: ProjectListProps) {
  if (projects.length === 0) {
    return <p className="empty-state">Noch keine Projekte vorhanden.</p>;
  }

  return (
    <div className="project-status-board">
      {projectColumns.map((column) => {
        const columnProjects = projects.filter(
          (project) => project.status === column.status
        );

        return (
          <section className="project-status-column" key={column.status}>
            <div className="project-status-column__header">
              <h3>{column.title}</h3>
              <span>{columnProjects.length}</span>
            </div>

            <div className="project-status-column__list">
              {columnProjects.length === 0 ? (
                <p className="empty-state">Keine Projekte in diesem Status.</p>
              ) : (
                columnProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={project.id === selectedProjectId}
                    onOpenProject={onOpenProject}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}