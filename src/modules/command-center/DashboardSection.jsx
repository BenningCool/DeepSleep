import { ModuleHeading } from "../../components/ModuleHeading";

export function DashboardSection({
  title,
  titleEn = "",
  lead = "",
  headerExtra = null,
  children,
  className = ""
}) {
  const headClass = [
    "progress-dashboard-card-head",
    headerExtra ? "has-extra" : ""
  ].filter(Boolean).join(" ");

  return (
    <article className={`progress-dashboard-card ${className}`.trim()}>
      <header className={headClass}>
        <div className="progress-dashboard-card-head-main">
          <ModuleHeading as="h3" title={title} titleEn={titleEn} />
          {lead ? <p className="panel-note">{lead}</p> : null}
        </div>
        {headerExtra ? (
          <div className="progress-dashboard-card-head-extra">{headerExtra}</div>
        ) : null}
      </header>
      {children}
    </article>
  );
}
