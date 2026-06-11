import type { QuestTask } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: QuestTask[];
  onCompleteTask: (id: number) => void;
}

export function TaskList({ tasks, onCompleteTask }: TaskListProps) {
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
        <TaskCard key={task.id} task={task} onCompleteTask={onCompleteTask} />
      ))}
    </section>
  );
}