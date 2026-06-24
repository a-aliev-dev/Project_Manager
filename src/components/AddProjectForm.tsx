import { useState } from "react";
import type { Project, ProjectStatus } from "../types";

interface AddProjectFormProps {
  onAddProject: (
    project: Omit<Project, "id" | "progress" | "xpReward" | "memberIds">
  ) => void;
}

export function AddProjectForm({ onAddProject }: AddProjectFormProps) {
  const [projectName, setProjectName] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("planned");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (projectName.trim().length === 0) {
      return;
    }

    onAddProject({
      name: projectName.trim(),
      status: projectStatus,
    });

    setProjectName("");
    setProjectStatus("planned");
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="project-name">Projektname</label>
        <input
          id="project-name"
          type="text"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          placeholder="z.B. Mobile Dashboard"
        />
      </div>

      <div className="form-field">
        <label htmlFor="project-status">Status</label>
        <select
          id="project-status"
          value={projectStatus}
          onChange={(event) =>
            setProjectStatus(event.target.value as ProjectStatus)
          }
        >
          <option value="planned">Geplant</option>
          <option value="active">Aktiv</option>
          <option value="done">Abgeschlossen</option>
        </select>
      </div>

      <button className="primary-button" type="submit">
        Projekt erstellen
      </button>
    </form>
  );
}