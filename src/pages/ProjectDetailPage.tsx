import { AddTaskForm } from "../components/AddTaskForm";
import { TaskList } from "../components/TaskList";
import type { LeaderboardEntry, Project, QuestTask } from "../types";

interface ProjectDetailPageProps {
  project: Project;
  tasks: QuestTask[];
  members: LeaderboardEntry[];
  currentUserId: number;
  currentUserName: string;
  onBackToHome: () => void;
  onJoinProject: (projectId: number) => void;
  onLeaveProject: (projectId: number) => void;
  onAddTask: (
    task: Omit<QuestTask, "id" | "projectId" | "status" | "priority" | "category">
  ) => void;
  onAssignTask: (taskId: number) => void;
  onCompleteTask: (taskId: number) => void;
}

const statusLabels: Record<Project["status"], string> = {
  active: "Aktiv",
  planned: "Geplant",
  done: "Abgeschlossen",
};

export function ProjectDetailPage({
  project,
  tasks,
  members,
  currentUserId,
  currentUserName,
  onBackToHome,
  onJoinProject,
  onLeaveProject,
  onAddTask,
  onAssignTask,
  onCompleteTask,
}: ProjectDetailPageProps) {
  const projectMembers = members.filter((member) =>
    project.memberIds.includes(member.id)
  );

  const isCurrentUserMember = project.memberIds.includes(currentUserId);

  const openTasks = tasks.filter((task) => task.status === "open").length;
  const activeTasks = tasks.filter((task) => task.status === "in-progress").length;
  const doneTasks = tasks.filter((task) => task.status === "done").length;

  return (
    <main className="app">
      <header className="hero project-hero">
        <nav className="top-nav">
          <button className="nav-button" type="button" onClick={onBackToHome}>
            Zurück zur Übersicht
          </button>
        </nav>

        <div className="hero__content">
          <p className="hero__eyebrow">Projektquest</p>
          <h1>{project.name}</h1>
          <p className="hero__text">
            Status: {statusLabels[project.status]} · Fortschritt:{" "}
            {project.progress}% · Belohnung: {project.xpReward} XP
          </p>
        </div>
      </header>

      <section className="detail-grid">
        <article className="content-section">
          <div className="section-heading">
            <p>Projektstatus</p>
            <h2>Quest-Fortschritt</h2>
          </div>

          <div className="progress">
            <div className="progress__label">
              <span>Fortschritt</span>
              <strong>{project.progress}%</strong>
            </div>

            <div className="progress__bar">
              <div
                className="progress__value"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="project-detail-stats">
            <span>{openTasks} offen</span>
            <span>{activeTasks} in Bearbeitung</span>
            <span>{doneTasks} erledigt</span>
          </div>
        </article>

        <article className="content-section">
          <div className="section-heading">
            <p>Team</p>
            <h2>Projektmitglieder</h2>
          </div>

          <div className="member-list">
            {projectMembers.length === 0 ? (
              <p className="empty-state">Noch keine Mitglieder im Projekt.</p>
            ) : (
              projectMembers.map((member) => (
                <div className="member-card" key={member.id}>
                  <strong>{member.name}</strong>
                  <span>{member.xp} Basis-XP</span>
                </div>
              ))
            )}
          </div>

          <div className="member-actions">
            {isCurrentUserMember ? (
              <>
                <p className="member-hint">
                  Du bist als {currentUserName} in diesem Projekt eingetragen.
                </p>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onLeaveProject(project.id)}
                >
                  Projekt verlassen
                </button>
              </>
            ) : (
              <>
                <p className="member-hint">
                  Tritt dem Projekt bei, um Quests übernehmen zu können.
                </p>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => onJoinProject(project.id)}
                >
                  Projekt beitreten
                </button>
              </>
            )}
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="content-section">
          <div className="section-heading">
            <p>Taskboard</p>
            <h2>Quests in diesem Projekt</h2>
          </div>

          <TaskList
            tasks={tasks}
            members={members}
            currentUserId={currentUserId}
            onAssignTask={onAssignTask}
            onCompleteTask={onCompleteTask}
          />
        </article>

        <article className="content-section">
          <div className="section-heading">
            <p>Neue Aufgabe</p>
            <h2>Task erstellen</h2>
          </div>

          <AddTaskForm projectId={project.id} onAddTask={onAddTask} />
        </article>
      </section>

      <footer className="footer">
        <p>QuestBoard · {project.name}</p>
      </footer>
    </main>
  );
}