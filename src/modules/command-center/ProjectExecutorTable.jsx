import { useMemo, useState } from "react";

function emailInitials(email) {
  const local = String(email || "").split("@")[0] || "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "?";
}

function ExecutorPills({ executors, visibleLimit, expanded, onToggle }) {
  if (!executors.length) {
    return <span className="project-executor-empty">暂无指派执行人</span>;
  }

  const visible = expanded ? executors : executors.slice(0, visibleLimit);
  const hiddenCount = Math.max(0, executors.length - visibleLimit);

  return (
    <div className="project-executor-pills">
      {visible.map((executor) => (
        <span
          key={executor.email}
          className={[
            "project-executor-pill",
            executor.overdue ? "has-overdue" : ""
          ].filter(Boolean).join(" ")}
          title={`${executor.email} · ${executor.assignedCount} 个测试点`}
        >
          <span className="avatar project-executor-avatar">{emailInitials(executor.email)}</span>
          <span className="project-executor-pill-copy">
            <strong>{executor.roleLabel || executor.role}</strong>
            <small>{executor.email}</small>
          </span>
          {executor.assignedCount ? (
            <span className="project-executor-pill-count">{executor.assignedCount}</span>
          ) : null}
        </span>
      ))}
      {!expanded && hiddenCount > 0 ? (
        <button
          className="button subtle compact project-executor-more"
          type="button"
          onClick={onToggle}
        >
          +{hiddenCount}
        </button>
      ) : null}
      {expanded && executors.length > visibleLimit ? (
        <button
          className="button subtle compact project-executor-more"
          type="button"
          onClick={onToggle}
        >
          收起
        </button>
      ) : null}
    </div>
  );
}

function ProjectExecutorRow({
  row,
  executorsVisible,
  onOpenProgress
}) {
  const [executorsExpanded, setExecutorsExpanded] = useState(false);

  return (
    <tr className="project-executor-row">
      <td className="project-executor-project">
        <button
          className="project-executor-project-btn"
          type="button"
          onClick={() => onOpenProgress(row.projectId)}
        >
          <strong>{row.clientName}</strong>
          <span>{row.projectName}</span>
        </button>
      </td>
      <td className="project-executor-report">
        <span className={`report-tier-pill compact ${row.urgency?.className || ""}`}>
          {row.urgency?.readableLabel || "—"}
        </span>
      </td>
      <td className="project-executor-overdue">
        {row.overdueCount ? (
          <span className="progress-flag overdue compact">逾期 {row.overdueCount}</span>
        ) : (
          "—"
        )}
      </td>
      <td className="project-executor-team">
        <ExecutorPills
          executors={row.executors}
          visibleLimit={executorsVisible}
          expanded={executorsExpanded}
          onToggle={() => setExecutorsExpanded((open) => !open)}
        />
        <p className="project-executor-team-meta">
          <strong className="command-stat-num">{row.executorCount}</strong> 人
          {row.assignedTotal ? (
            <>
              {" · "}
              <strong className="command-stat-num">{row.assignedTotal}</strong> 个测试点指派
            </>
          ) : null}
        </p>
      </td>
    </tr>
  );
}

export function ProjectExecutorTable({
  projectTeams = [],
  pageSize = 5,
  executorsVisible = 3,
  onOpenProgress
}) {
  const [showAll, setShowAll] = useState(false);

  const visibleRows = useMemo(
    () => (showAll ? projectTeams : projectTeams.slice(0, pageSize)),
    [projectTeams, showAll, pageSize]
  );

  const hiddenCount = Math.max(0, projectTeams.length - pageSize);

  if (!projectTeams.length) {
    return (
      <div className="empty-state compact">
        <p>当前筛选条件下暂无项目。</p>
      </div>
    );
  }

  return (
    <div className="project-executor-table-wrap">
      <table className="project-executor-table">
        <thead>
          <tr>
            <th scope="col">项目</th>
            <th scope="col">报告日</th>
            <th scope="col">逾期</th>
            <th scope="col">执行测试</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <ProjectExecutorRow
              key={row.projectId}
              row={row}
              executorsVisible={executorsVisible}
              onOpenProgress={onOpenProgress}
            />
          ))}
        </tbody>
      </table>
      {!showAll && hiddenCount > 0 ? (
        <button
          className="button subtle compact project-executor-page-toggle"
          type="button"
          onClick={() => setShowAll(true)}
        >
          显示全部 {projectTeams.length} 个项目（还有 {hiddenCount} 个）
        </button>
      ) : null}
      {showAll && projectTeams.length > pageSize ? (
        <button
          className="button subtle compact project-executor-page-toggle"
          type="button"
          onClick={() => setShowAll(false)}
        >
          收起，仅显示前 {pageSize} 个
        </button>
      ) : null}
    </div>
  );
}
