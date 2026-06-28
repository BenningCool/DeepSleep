import { formatNearestReportHint, formatReportStackMessage } from "./reportDayUtils";
import { formatProcedureOverdue } from "./managementCopy";

function ReportDayRow({ entry, onOpenProgress, onOpenDetail }) {
  const { project, urgency, overdueCount } = entry;

  return (
    <article className={`report-day-row ${urgency.className}`}>
      <div className="report-day-row-main">
        <span className={`report-tier-pill ${urgency.className}`}>
          {urgency.compactLabel || urgency.shortLabel}
        </span>
        <div>
          <strong>{project.clientName || project.name}</strong>
          <p>{project.name}</p>
          <p className="report-readable-inline">{urgency.readableLabel}</p>
        </div>
      </div>
      <div className="report-day-row-meta">
        <span>{formatProcedureOverdue(overdueCount)}</span>
      </div>
      <div className="report-day-row-actions">
        <button
          className="button primary compact"
          type="button"
          onClick={() => onOpenProgress(project.id)}
        >
          项目进度
        </button>
        <button
          className="button subtle compact"
          type="button"
          onClick={() => onOpenDetail(project.id)}
        >
          项目概览
        </button>
      </div>
    </article>
  );
}

export function ReportDayPanel({
  title = "报告日预警 · 未来 30 天",
  watchlist = [],
  stack = null,
  nearestReport = null,
  embedded = false,
  onOpenProgress,
  onOpenDetail
}) {
  const body = (
    <>
      {!embedded && stack?.triggered ? (
        <p className="team-collision-note report-stack-note">
          {formatReportStackMessage(stack)}
        </p>
      ) : null}
      {watchlist.length ? (
        <div className="report-day-list">
          {watchlist.map((entry) => (
            <ReportDayRow
              key={entry.project.id}
              entry={entry}
              onOpenProgress={onOpenProgress}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state compact">
          <p>未来 30 天内暂无报告日预警。</p>
          {nearestReport ? (
            <p className="report-nearest-hint">{formatNearestReportHint(nearestReport)}</p>
          ) : null}
        </div>
      )}
    </>
  );

  if (embedded) {
    return body;
  }

  return (
    <section className="report-day-panel">
      <h3 className="staff-section-title">{title}</h3>
      {body}
    </section>
  );
}
