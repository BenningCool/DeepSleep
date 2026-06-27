import { formatReportStackMessage } from "./reportDayUtils";

function ReportDayRow({ entry, onOpenProgress, onOpenDetail }) {
  const { project, urgency, overdueCount } = entry;

  return (
    <article className={`report-day-row ${urgency.className}`}>
      <div className="report-day-row-main">
        <span className={`report-tier-pill ${urgency.className}`}>{urgency.shortLabel}</span>
        <div>
          <strong>{project.clientName || project.name}</strong>
          <p>{project.name}</p>
        </div>
      </div>
      <div className="report-day-row-meta">
        <span>{urgency.label}</span>
        {overdueCount ? (
          <span className="team-stat-overdue">测试点逾期 {overdueCount}</span>
        ) : (
          <span className="muted">执行层暂无逾期</span>
        )}
      </div>
      <div className="report-day-row-actions">
        <button
          className="button primary compact"
          type="button"
          onClick={() => onOpenProgress(project.id)}
        >
          进度看板
        </button>
        <button
          className="button subtle compact"
          type="button"
          onClick={() => onOpenDetail(project.id)}
        >
          概览
        </button>
      </div>
    </article>
  );
}

export function ReportDayPanel({
  title = "Report Date 预警 · 未来 30 天",
  watchlist = [],
  stack = null,
  emptyText = "未来 30 天内暂无 Report Date 预警项。",
  onOpenProgress,
  onOpenDetail
}) {
  return (
    <section className="report-day-panel">
      <h3 className="staff-section-title">{title}</h3>
      {stack?.triggered ? (
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
          <p>{emptyText}</p>
        </div>
      )}
    </section>
  );
}

export function ManagementFocusCard({ entry, roleLabel, onOpenProgress, onOpenDetail }) {
  if (!entry) return null;

  const { project, urgency, overdueCount } = entry;

  return (
    <section className="management-focus-section">
      <h3 className="staff-section-title">管理 Focus · {roleLabel}</h3>
      <article className={`management-focus-card ${urgency.className}`}>
        <div className="management-focus-head">
          <span className={`report-tier-pill ${urgency.className}`}>{urgency.shortLabel}</span>
          <span className="management-role-note">不直接执行测试 · 关注 Report 与团队进度</span>
        </div>
        <h3>{project.clientName || project.name}</h3>
        <p>{project.name}</p>
        <p className="management-focus-meta">
          {urgency.label}
          {overdueCount ? ` · 执行层逾期 ${overdueCount} 个测试点` : " · 执行层暂无逾期"}
        </p>
        <div className="command-card-actions">
          <button
            className="button primary"
            type="button"
            onClick={() => onOpenProgress(project.id)}
          >
            查看项目进度
          </button>
          <button
            className="button subtle"
            type="button"
            onClick={() => onOpenDetail(project.id)}
          >
            项目概览
          </button>
        </div>
      </article>
    </section>
  );
}
