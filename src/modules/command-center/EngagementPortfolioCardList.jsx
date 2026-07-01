import { useMemo } from "react";
import { getProjectWorkspaceStatusOverview } from "../project/projectProgressOverview";
import {
  formatWorkspaceStatusSummary,
  WorkspaceStatusOverviewBar
} from "../progress-board/WorkspaceStatusOverviewBar";
import { formatCompletionLabel, formatProcedureOverdue } from "./managementCopy";
import { riskTierVisual } from "./portfolioVisualTokens";
import { getTopAuditChainForProject } from "./financialAuditContext";

function formatCardMeta(row) {
  const parts = [row.urgency.readableLabel || row.urgency.label];
  if (row.completion?.total) {
    parts.push(formatCompletionLabel(row.completion));
  }
  return parts.join(" · ");
}

function EngagementPortfolioCard({
  row,
  tasks,
  showEmColumn,
  attentionRank = 0,
  onOpenProgress,
  onOpenDetail
}) {
  const { project, urgency, overdueCount, risk, managerLabel } = row;
  const visual = riskTierVisual(risk.tier);
  const hasOverdue = overdueCount > 0;

  const breakdown = useMemo(
    () => getProjectWorkspaceStatusOverview(project.id, tasks),
    [project.id, tasks]
  );
  const auditChain = useMemo(
    () => getTopAuditChainForProject(project.id, tasks),
    [project.id, tasks]
  );

  const emMetaLine = showEmColumn && managerLabel
    ? `负责 EM · ${managerLabel}`
    : "";

  return (
    <article
      className={[
        "command-portfolio-card",
        attentionRank ? "is-attention-ranked" : "",
        hasOverdue ? "has-procedure-overdue" : ""
      ].filter(Boolean).join(" ")}
      style={{ "--portfolio-accent": visual.borderColor }}
    >
      {attentionRank ? (
        <div className="command-portfolio-card-rank">#{attentionRank}</div>
      ) : null}
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

      {emMetaLine ? (
        <p className="command-portfolio-card-meta">{emMetaLine}</p>
      ) : null}

      {attentionRank && hasOverdue ? (
        <div className="attention-queue-overdue-alert" role="alert">
          <span className="progress-flag overdue attention-overdue-chip">
            {overdueCount} 项程序逾期 · 需跟进
          </span>
        </div>
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

      <p className="command-portfolio-card-report-meta">{formatCardMeta(row)}</p>

      {auditChain ? (
        <div className="command-audit-chain-card">
          <span className="command-audit-chain-label">
            Audit → ITA 风险链
          </span>
          <div className="command-audit-chain-steps">
            {auditChain.chain.map((step, index) => (
              <span key={`${auditChain.task.id}-${index}`}>{step}</span>
            ))}
          </div>
        </div>
      ) : null}

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
  emptyHint = "该月暂无报告日项目。",
  onOpenProgress,
  onOpenDetail
}) {
  if (!rows.length) {
    return (
      <div className="empty-state compact">
        <p>{emptyHint}</p>
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
          attentionRank={row.attentionRank || 0}
          onOpenProgress={onOpenProgress}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  );
}
