import { useMemo } from "react";
import { PortfolioKpiSection } from "./PortfolioKpiSection";
import { ResourceDispatchPanel } from "./ResourceDispatchPanel";
import { AiAuditCommandPanel } from "./AiAuditCommandPanel";
import { buildResourceDispatchInsights } from "./resourceDispatchUtils";

function CommandDetailActions({
  focusProject,
  totalProjectCount,
  visibleProjectCount,
  onOpenAllProjects,
  onOpenProgress
}) {
  const focusProjectId = focusProject?.project?.id || "";
  const focusProjectName = focusProject?.project?.clientName || focusProject?.project?.name || "";

  return (
    <section className="command-detail-actions" aria-label="明细入口">
      <div>
        <span className="ai-audit-eyebrow">Detail Access</span>
        <h3>需要明细时再进入已有页面</h3>
        <p>
          团队管理页只保留交付风险闭环；项目清单、完整进度和底稿明细继续在已有页面查看。
        </p>
      </div>
      <div className="command-detail-action-buttons">
        <button
          className="button subtle compact"
          type="button"
          disabled={!onOpenAllProjects}
          onClick={onOpenAllProjects}
        >
          查看全部项目
        </button>
        <button
          className="button primary compact"
          type="button"
          disabled={!focusProjectId}
          onClick={() => focusProjectId && onOpenProgress?.(focusProjectId)}
        >
          打开最高风险项目进度
        </button>
      </div>
      <p className="command-detail-actions-meta">
        当前视角覆盖 {visibleProjectCount} / {totalProjectCount || visibleProjectCount} 个项目
        {focusProjectName ? ` · 最高风险：${focusProjectName}` : ""}
      </p>
    </section>
  );
}

export function ManagementCommandBody({
  mode,
  summary,
  reportStack,
  filteredMatrix,
  tasks,
  attentionQueue,
  resourceGroups = null,
  totalProjectCount = 0,
  onOpenProgress,
  onOpenAllProjects
}) {
  const visibleCount = filteredMatrix.length;
  const focusProject = attentionQueue?.[0] || filteredMatrix[0] || null;
  const dispatchInsights = useMemo(() => buildResourceDispatchInsights({
    mode,
    projects: filteredMatrix.map((row) => row.project),
    tasks,
    resourceGroups: resourceGroups || []
  }), [filteredMatrix, mode, resourceGroups, tasks]);

  return (
    <section className="progress-dashboard" aria-label="组合指挥中心">
      <PortfolioKpiSection
        mode={mode}
        summary={summary}
        reportStack={reportStack}
      />

      <ResourceDispatchPanel
        insights={dispatchInsights}
        onOpenProgress={onOpenProgress}
      />

      <AiAuditCommandPanel
        projects={filteredMatrix.map((row) => row.project)}
        tasks={tasks}
        onOpenProgress={onOpenProgress}
      />

      <CommandDetailActions
        focusProject={focusProject}
        visibleProjectCount={visibleCount}
        totalProjectCount={totalProjectCount}
        onOpenAllProjects={onOpenAllProjects}
        onOpenProgress={onOpenProgress}
      />
    </section>
  );
}
