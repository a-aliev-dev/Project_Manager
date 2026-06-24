import type { LeaderboardEntry, QuestTask } from "../types";

interface TaskCardProps {
  task: QuestTask;
  members: LeaderboardEntry[];
  currentUserId: number;
  onAssignTask: (id: number) => void;
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

export function TaskCard({
  task,
  members,
  currentUserId,
  onAssignTask,
  onCompleteTask,
}: TaskCardProps) {
  const isDone = task.status === "done";
  const isAssigned = task.assignedToMemberId != null;
  const isAssignedToCurrentUser = task.assignedToMemberId === currentUserId;

  const assignedMember = members.find(
    (member) => member.id === task.assignedToMemberId
  );

  return (
    <article className={`task-card ${isDone ? "task-card--done" : ""}`}>
      <div className="task-card__header">
        <div>
          <p className="task-card__status">{statusLabels[task.status]}</p>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
        </div>

        <span className="task-card__xp">{task.xp} XP</span>
      </div>

      <div className="task-card__meta">
        <span>Kategorie: {task.category}</span>
        <span>Priorität: {priorityLabels[task.priority]}</span>
        <span>
          Zuständig:{" "}
          {assignedMember ? assignedMember.name : "Noch niemand eingetragen"}
        </span>
      </div>

      <div className="task-card__actions">
        {!isDone && !isAssignedToCurrentUser && (
          <button
            className="secondary-button"
            type="button"
            onClick={() => onAssignTask(task.id)}
          >
            {isAssigned ? "Quest übernehmen" : "Quest übernehmen"}
          </button>
        )}

        {!isDone && isAssignedToCurrentUser && (
          <button
            className="secondary-button"
            type="button"
            onClick={() => onCompleteTask(task.id)}
          >
            Quest abschließen
          </button>
        )}

        {isDone && (
          <button className="secondary-button" type="button" disabled>
            Quest erledigt
          </button>
        )}
      </div>
    </article>
  );
}