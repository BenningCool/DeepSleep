import { useState } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { PersonWorkloadTable } from "./PersonWorkloadTable";
import { ProjectExecutorTable } from "./ProjectExecutorTable";
import { summarizeResourceGroups } from "./projectExecutorUtils";
import { summarizePersonTeams } from "./personWorkloadUtils";
import { resolveResourceUiConfig } from "./resourceAllocationConfig";

function emailInitials(email) {
  const local = String(email || "").split("@")[0] || "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "EM";
}

function usesPersonTable(mode) {
  return mode === "ep" || mode === "em" || mode === "ic";
}

function resolveBlockRoleLabel(mode, isPersonal) {
  if (isPersonal) return "Staff · 个人";
  if (mode === "ic") return "In-charge";
  return "Engagement Manager";
}

function EmResourceBlock({
  group,
  mode,
  uiConfig,
  defaultExpanded = false,
  collapsible = true,
  onOpenProgress
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const personCentric = usesPersonTable(mode);
  const personTeams = group.personTeams || [];
  const personStats = summarizePersonTeams(personTeams);
  const assignedTotal = group.assignedTotal ?? personStats.assignedTotal;

  const header = (
    <div className="em-resource-block-head">
      <span className="avatar em-resource-avatar">{emailInitials(group.managerLabel)}</span>
      <div className="em-resource-block-identity">
        <strong>{group.managerLabel}</strong>
        <span className="em-resource-role">
          {resolveBlockRoleLabel(mode, group.isPersonal)}
        </span>
      </div>
      <div className="em-resource-block-stats">
        {personCentric ? (
          <>
            <span><strong className="command-stat-num">{personTeams.length}</strong> 人现场</span>
            <span><strong className="command-stat-num">{group.projectCount}</strong> 个项目</span>
            <span><strong className="command-stat-num">{assignedTotal}</strong> 个控制点</span>
          </>
        ) : (
          <>
            <span><strong className="command-stat-num">{group.projectCount}</strong> 个项目</span>
            <span><strong className="command-stat-num">{assignedTotal}</strong> 个控制点</span>
          </>
        )}
        {(group.highLoadCount ?? personStats.highLoadCount) > 0 ? (
          <span className="progress-flag overdue compact">
            偏高 {(group.highLoadCount ?? personStats.highLoadCount)} 人
          </span>
        ) : null}
      </div>
    </div>
  );

  const table = personCentric ? (
    <PersonWorkloadTable
      personTeams={personTeams}
      pageSize={uiConfig.peoplePageSize ?? uiConfig.projectsPageSize}
      projectsVisible={uiConfig.projectsVisible ?? uiConfig.executorsVisible}
      onOpenProgress={onOpenProgress}
    />
  ) : (
    <ProjectExecutorTable
      projectTeams={group.projectTeams || []}
      pageSize={uiConfig.projectsPageSize}
      executorsVisible={uiConfig.executorsVisible}
      onOpenProgress={onOpenProgress}
    />
  );

  if (!collapsible) {
    return (
      <article className="em-resource-block">
        {header}
        {table}
      </article>
    );
  }

  const summary = personCentric
    ? `${personTeams.length} 人 · ${assignedTotal} 个控制点 · ${group.totalOverdue || 0} 项逾期`
    : `${group.projectCount} 个项目 · ${assignedTotal} 个控制点 · ${group.totalOverdue || 0} 项逾期`;

  return (
    <CollapsibleSection
      title={group.blockTitle || group.managerLabel}
      summary={summary}
      expanded={expanded}
      onToggle={() => setExpanded((open) => !open)}
    >
      <div className="em-resource-block">
        {header}
        {table}
      </div>
    </CollapsibleSection>
  );
}

export function ResourceAllocationSection({
  mode = "ep",
  groups = [],
  uiConfig: uiConfigOverride = null,
  onOpenProgress
}) {
  const uiConfig = uiConfigOverride || resolveResourceUiConfig(mode);
  const summary = summarizeResourceGroups(groups);
  const personCentric = usesPersonTable(mode);

  if (!groups.length) {
    return (
      <div className="empty-state compact">
        <p>当前筛选条件下暂无资源分配数据。</p>
      </div>
    );
  }

  const totalAssigned = groups.reduce(
    (sum, group) => sum + (group.assignedTotal ?? summarizePersonTeams(group.personTeams).assignedTotal),
    0
  );

  const summaryLine = mode === "staff"
    ? (() => {
      const group = groups[0];
      const assigned = group?.assignedTotal ?? 0;
      const level = group?.saturationLevel ?? "—";
      return `${summary.projectCount} 个项目 · ${assigned} 个指派控制点 · 负荷 ${level}`;
    })()
    : mode === "contributor"
      ? `${summary.projectCount} 个协作项目 · ${summary.totalOverdue} 项逾期`
      : mode === "ep"
        ? `${summary.groupCount} 位 EM · ${summary.headcount} 人现场 · ${totalAssigned} 个控制点 · 偏高 ${summary.highLoadCount} 人`
        : personCentric
          ? `${summary.headcount} 人 · ${summary.projectCount} 个项目 · ${totalAssigned} 个控制点 · 偏高 ${summary.highLoadCount} 人`
          : `${summary.projectCount} 个项目 · 现场 ${summary.headcount} 人 · 偏高 ${summary.highLoadCount} 人`;

  const useEmCollapse = mode === "ep"
    && uiConfig.collapseEmBlocks
    && groups.length > 1;

  return (
    <div className="resource-allocation-section">
      <p className="resource-allocation-summary">{summaryLine}</p>
      <div className="resource-allocation-groups">
        {groups.map((group, index) => (
          <EmResourceBlock
            key={group.managerEmail || group.managerLabel}
            mode={mode}
            group={{
              ...group,
              blockTitle: group.blockTitle
                || (group.isPersonal
                  ? uiConfig.groupTitle
                  : `${group.managerLabel} · ${group.projectCount} 个项目`)
            }}
            uiConfig={uiConfig}
            collapsible={useEmCollapse}
            defaultExpanded={
              !useEmCollapse
              || index === (uiConfig.defaultExpandedEmIndex ?? 0)
            }
            onOpenProgress={onOpenProgress}
          />
        ))}
      </div>
    </div>
  );
}
