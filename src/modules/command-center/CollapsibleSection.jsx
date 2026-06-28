export function CollapsibleSection({
  title,
  summary = "",
  expanded = false,
  onToggle,
  children
}) {
  return (
    <section className="progress-dashboard-card ep-em-groups-section ep-em-collapsible">
      <button
        className="ep-em-collapse-toggle"
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span className="ep-em-collapse-icon" aria-hidden="true">
          {expanded ? "▾" : "▸"}
        </span>
        <span className="staff-section-title ep-em-collapse-title">{title}</span>
      </button>
      {!expanded && summary ? (
        <p className="ep-em-collapse-summary">{summary}</p>
      ) : null}
      {expanded ? children : null}
    </section>
  );
}
