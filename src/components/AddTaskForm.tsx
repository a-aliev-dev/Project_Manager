import { useState } from "react";
import type { QuestTask } from "../types";

interface AddTaskFormProps {
  projectId: number;
  onAddTask: (
    task: Omit<QuestTask, "id" | "projectId" | "status" | "priority" | "category">
  ) => void;
}

export function AddTaskForm({ projectId, onAddTask }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xp, setXp] = useState(30);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim().length === 0 || description.trim().length === 0) {
      return;
    }

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      xp,
    });

    setTitle("");
    setDescription("");
    setXp(30);
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input type="hidden" value={projectId} readOnly />

      <div className="form-field">
        <label htmlFor="task-title">Taskname</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="z.B. Login-Seite bauen"
        />
      </div>

      <div className="form-field">
        <label htmlFor="task-description">Beschreibung</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Beschreibe kurz, was erledigt werden soll"
          rows={3}
        />
      </div>

      <div className="form-field">
        <label htmlFor="task-xp">XP</label>
        <select
          id="task-xp"
          value={xp}
          onChange={(event) => setXp(Number(event.target.value))}
        >
          <option value={30}>30 XP</option>
          <option value={50}>50 XP</option>
          <option value={70}>70 XP</option>
        </select>
      </div>

      <button className="primary-button" type="submit">
        Task erstellen
      </button>
    </form>
  );
}