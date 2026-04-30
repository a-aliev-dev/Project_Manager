import type { QuestTask } from "../types";

interface TaskCardProps {
  task: QuestTask;
  onCompleteTask: (id: number) => void;
}

const statusLabels: Record<QuestTask["status"], string> = {
  open: "Offen",
  "in-progress": "In Bearbeitung",
  done: "Erledigt",
};

const priorityLabels: Record<QuestTask["priority"], string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
};

export function TaskCard({ task, onCompleteTask }: TaskCardProps) {
  const isDone = task.status === "done";

  return (
    <article className={`task-card ${isDone ? "task-card--done" : ""}`}>
      <div className="task-card__header">
        <div>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
        </div>

        <span className="task-card__xp">{task.xp} XP</span>
      </div>

      <div className="task-card__meta">
        <span>Kategorie: {task.category}</span>
        <span>Status: {statusLabels[task.status]}</span>
        <span>Priorität: {priorityLabels[task.priority]}</span>
      </div>

      <button
        className="task-card__button"
        onClick={() => onCompleteTask(task.id)}
        disabled={isDone}
      >
        {isDone ? "Quest erledigt" : "Quest abschließen"}
      </button>
    </article>
  );
}