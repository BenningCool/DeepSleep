import { formatReportStackMessage } from "./reportDayUtils";

/**
 * EP / EM 统一摘要条
 * @param {"ep"|"em"} mode
 */
export function ManagementSummaryBar({ mode, summary, reportStack }) {
  const nearest = summary.nearestReport;
  const nearestLabel = nearest?.urgency?.readableLabel || "—";

  const headline = mode === "ep"
    ? `${summary.projectCount} 个项目 · ${summary.emCount} 位下辖 EM`
    : `${summary.projectCount} 个项目 · 现场团队 ${summary.fieldworkHeadcount ?? summary.headcount ?? 0} 人`;

  return (
    <article className="team-summary-card ep-portfolio-summary">
      <div className="team-summary-grid ep-health-grid">
        <div>
          <p className="staff-summary-eyebrow">
            {mode === "ep" ? "组合概览" : "团队概览"}
            <span className="summary-eyebrow-en">
              {mode === "ep" ? "Portfolio Overview" : "Team Overview"}
            </span>
          </p>
          <h3>{headline}</h3>
        </div>
        <div className="team-summary-stat">
          <span className="team-stat-label">逾期程序</span>
          <strong className={summary.totalOverdue ? "load-high-text" : ""}>
            {summary.totalOverdue}
          </strong>
        </div>
        <div className="team-summary-stat">
          <span className="team-stat-label">最近报告日</span>
          <strong className="summary-readable-value">{nearestLabel}</strong>
        </div>
        <div className="team-summary-stat">
          <span className="team-stat-label">需立即 / 重点关注</span>
          <strong>
            <span className="load-high-text">{summary.riskCounts?.critical ?? 0}</span>
            {" / "}
            <span className="load-medium-text">{summary.riskCounts?.elevated ?? 0}</span>
          </strong>
        </div>
        <div className="team-summary-stat">
          <span className="team-stat-label">持续跟踪 · 30天内报告</span>
          <strong>
            {summary.riskCounts?.watch ?? 0}
            {" · "}
            {summary.watchlistCount ?? 0}
          </strong>
        </div>
      </div>
      {reportStack?.triggered ? (
        <p className="team-collision-note report-stack-note">
          {formatReportStackMessage(reportStack)}
        </p>
      ) : null}
    </article>
  );
}
