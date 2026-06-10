interface ProjectChartProps {
  planned: number;
  active: number;
  done: number;
}

export function ProjectChart({ planned, active, done }: ProjectChartProps) {
  const max = Math.max(planned, active, done, 1);

  const plannedWidth = (planned / max) * 100;
  const activeWidth = (active / max) * 100;
  const doneWidth = (done / max) * 100;

  return (
    <section className="chart-box">
      <h2>Projektverteilung</h2>

      <div className="chart-row">
        <span>🟡 Geplant</span>
        <div className="chart-bar">
          <div className="chart-fill" style={{ width: plannedWidth + "%" }} />
        </div>
        <strong>{planned}</strong>
      </div>

      <div className="chart-row">
        <span>🔵 Aktiv</span>
        <div className="chart-bar">
          <div className="chart-fill" style={{ width: activeWidth + "%" }} />
        </div>
        <strong>{active}</strong>
      </div>

      <div className="chart-row">
        <span>✅ Fertig</span>
        <div className="chart-bar">
          <div className="chart-fill" style={{ width: doneWidth + "%" }} />
        </div>
        <strong>{done}</strong>
      </div>
    </section>
  );
}