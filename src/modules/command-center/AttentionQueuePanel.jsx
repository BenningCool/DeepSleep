import { formatCompletionLabel } from "./managementCopy";
import { riskTierVisual } from "./portfolioVisualTokens";

function formatQueueMeta(row) {
  const parts = [row.urgency.readableLabel || row.urgency.label];
  if (row.completion.total) {
    parts.push(formatCompletionLabel(row.completion));
  }
  return parts.join(" · ");
}

export function AttentionQueuePanel({
  queue = [],
  roleLabel = "EP",
  limit = 3,
  embedded = false,
  onOpenProgress,
  onOpenDetail
}) {
  if (!queue.length) return null;

  const visible = queue.slice(0, limit);

  const list = (
    <ol className={`attention-queue-list ${embedded ? "progress-attention-list" : ""}`}>
      {visible.map((row, index) => {
        const { project, risk, overdueCount } = row;
        const visual = riskTierVisual(risk.tier);
        const hasOverdue = overdueCount > 0;

        return (
          <li
            key={project.id}
            className={[
              "attention-queue-item",
              embedded ? "attention-overdue-item" : "",
              hasOverdue ? "has-procedure-overdue" : ""
            ].filter(Boolean).join(" ")}
            style={embedded ? { "--portfolio-accent": visual.borderColor } : undefined}
          >
            <div className="attention-queue-rank">#{index + 1}</div>
            <div className="attention-queue-body">
              <div className="attention-queue-title-row">
                <strong>{project.clientName || project.name}</strong>
                <span className={visual.pillClass}>{risk.labelZh}</span>
              </div>
              <p className="attention-queue-subtitle">{project.name}</p>
              <p className="attention-queue-meta">{formatQueueMeta(row)}</p>
              {hasOverdue ? (
                <div className="attention-queue-overdue-alert" role="alert">
                  <span className="progress-flag overdue attention-overdue-chip">
                    {overdueCount} 项程序逾期 · 需跟进
                  </span>
                </div>
              ) : (
                <p className="attention-queue-overdue-idle">无逾期程序</p>
              )}
              <div className="attention-queue-actions">
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
            </div>
          </li>
        );
      })}
    </ol>
  );

  if (embedded) {
    return list;
  }

  return (
    <section className="attention-queue-section">
      <div className="attention-queue-head">
        <h3 className="staff-section-title">
          优先关注 · Top {Math.min(limit, queue.length)}
        </h3>
        <p className="management-role-note">
          {roleLabel} 管理视角 · 关注报告日与测试点逾期（本人不执行现场程序）
        </p>
      </div>
      {list}
    </section>
  );
}
