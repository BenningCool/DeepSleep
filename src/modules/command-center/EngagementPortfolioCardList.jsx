import { useMemo } from "react";
import { getProjectWorkspaceStatusOverview } from "../project/projectProgressOverview";
import {
  formatWorkspaceStatusSummary,
  WorkspaceStatusOverviewBar
} from "../progress-board/WorkspaceStatusOverviewBar";
import { formatProcedureOverdue } from "./managementCopy";
import { riskTierVisual } from "./portfolioVisualTokens";

function EngagementPortfolioCard({
  row,
  tasks,
  showEmColumn,
  onOpenProgress,
  onOpenDetail
}) {
  const { project, urgency, overdueCount, risk, managerLabel } = row;
  const visual = riskTierVisual(risk.tier);

  const breakdown = useMemo(
    () => getProjectWorkspaceStatusOverview(project.id, tasks),
    [project.id, tasks]
  );

  return (
    <article
      className="command-portfolio-card"
      style={{ "--portfolio-accent": visual.borderColor }}
    >
      <div className="command-portfolio-card-head">
        <div className="command-portfolio-card-title">
          <span className={visual.pillClass}>{risk.labelZh}</span>
          <div>
            <strong>{project.clientName || project.name}</strong>
            <p>{project.name}</p>
          </div>
        </div>
        <div className="command-portfolio-card-badges">
          {overdueCount ? (
            <span className="progress-flag overdue compact">
              逾期 {overdueCount}
            </span>
          ) : null}
          <span className={`report-tier-pill compact ${urgency.className}`}>
            {urgency.readableLabel}
          </span>
        </div>
      </div>

      {showEmColumn && managerLabel ? (
        <p className="command-portfolio-card-meta">负责 EM · {managerLabel}</p>
      ) : null}

      <div className="command-portfolio-card-progress">
        <div className="command-portfolio-card-progress-head">
          <span>测试点进度</span>
          <span>{formatProcedureOverdue(overdueCount)}</span>
        </div>
        <WorkspaceStatusOverviewBar breakdown={breakdown} pending={!breakdown.total} />
        <p className="command-portfolio-card-progress-meta">
          {breakdown.total
            ? formatWorkspaceStatusSummary(breakdown)
            : "暂无测试点"}
        </p>
      </div>

      <div className="command-card-actions">
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

export function EngagementPortfolioCardList({
  rows = [],
  tasks = [],
  showEmColumn = true,
  onOpenProgress,
  onOpenDetail
}) {
  if (!rows.length) {
    return (
      <div className="empty-state compact">
        <p>暂无所辖项目。</p>
      </div>
    );
  }

  return (
    <div className="command-portfolio-card-grid">
      {rows.map((row) => (
        <EngagementPortfolioCard
          key={row.project.id}
          row={row}
          tasks={tasks}
          showEmColumn={showEmColumn}
          onOpenProgress={onOpenProgress}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  );
}
