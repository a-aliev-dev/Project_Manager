interface DashboardStatsProps {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageProgress: number;
}

export function DashboardStats({
  totalProjects,
  activeProjects,
  completedProjects,
  averageProgress,
}: DashboardStatsProps) {
  return (
    <section className="dashboard">
      <article className="dashboard-card">
        <span>Alle Projekte</span>
        <strong>{totalProjects}</strong>
      </article>

      <article className="dashboard-card">
        <span>Aktiv</span>
        <strong>{activeProjects}</strong>
      </article>

      <article className="dashboard-card">
        <span>Abgeschlossen</span>
        <strong>{completedProjects}</strong>
      </article>

      <article className="dashboard-card">
        <span>Ø Fortschritt</span>
        <strong>{averageProgress}%</strong>
      </article>
    </section>
  );
}