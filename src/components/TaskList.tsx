import type { LeaderboardEntry, QuestTask } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: QuestTask[];
  members: LeaderboardEntry[];
  currentUserId: number;
  onAssignTask: (id: number) => void;
  onCompleteTask: (id: number) => void;
}

export function TaskList({
  tasks,
  members,
  currentUserId,
  onAssignTask,
  onCompleteTask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section className="task-list">
        <p className="empty-state">
          Für dieses Projekt sind noch keine Tasks vorhanden.
        </p>
      </section>
    );
  }

  return (
    <section className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          members={members}
          currentUserId={currentUserId}
          onAssignTask={onAssignTask}
          onCompleteTask={onCompleteTask}
        />
      ))}
    </section>
  );
}