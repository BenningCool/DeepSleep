import { ModuleHeading } from "../../components/ModuleHeading";

export function DashboardSection({
  title,
  titleEn = "",
  lead = "",
  children,
  className = ""
}) {
  return (
    <article className={`progress-dashboard-card ${className}`.trim()}>
      <header className="progress-dashboard-card-head">
        <ModuleHeading as="h3" title={title} titleEn={titleEn} />
        {lead ? <p className="panel-note">{lead}</p> : null}
      </header>
      {children}
    </article>
  );
}
