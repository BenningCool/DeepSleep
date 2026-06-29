import { useMemo, useState } from "react";

function emailInitials(email) {
  const local = String(email || "").split("@")[0] || "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "?";
}

function ProjectPills({ projects, visibleLimit, expanded, onToggle, onOpenProgress }) {
  if (!projects.length) {
    return <span className="person-workload-empty">暂无参与项目</span>;
  }

  const visible = expanded ? projects : projects.slice(0, visibleLimit);
  const hiddenCount = Math.max(0, projects.length - visibleLimit);

  return (
    <div className="person-workload-project-pills">
      {visible.map((project) => (
        <button
          key={project.projectId}
          className={[
            "person-workload-project-pill",
            project.overdue ? "has-overdue" : ""
          ].filter(Boolean).join(" ")}
          type="button"
          title={`${project.clientName} · ${project.assignedTotal} 个控制点`}
          onClick={() => onOpenProgress(project.projectId)}
        >
          <span className="person-workload-project-pill-name">{project.clientName}</span>
          {project.assignedTotal ? (
            <span className="person-workload-project-pill-count">{project.assignedTotal}</span>
          ) : null}
        </button>
      ))}
      {!expanded && hiddenCount > 0 ? (
        <button
          className="button subtle compact person-workload-more"
          type="button"
          onClick={onToggle}
        >
          +{hiddenCount}
        </button>
      ) : null}
      {expanded && projects.length > visibleLimit ? (
        <button
          className="button subtle compact person-workload-more"
          type="button"
          onClick={onToggle}
        >
          收起
        </button>
      ) : null}
    </div>
  );
}

function PersonWorkloadRow({
  row,
  projectsVisible,
  onOpenProgress
}) {
  const [projectsExpanded, setProjectsExpanded] = useState(false);

  return (
    <tr className="person-workload-row">
      <td className="person-workload-member">
        <div className="person-workload-member-cell">
          <span className="avatar person-workload-avatar">{emailInitials(row.email)}</span>
          <div className="person-workload-member-copy">
            <strong>{row.email}</strong>
            {row.isSelf ? <span className="person-workload-self-badge">我</span> : null}
          </div>
        </div>
      </td>
      <td className="person-workload-role">{row.roleLabel || "—"}</td>
      <td className="person-workload-stat">
        <strong className="command-stat-num">{row.projectCount}</strong>
      </td>
      <td className="person-workload-stat">
        <strong className="command-stat-num">{row.assignedTotal}</strong>
      </td>
      <td className="person-workload-overdue">
        {row.overdue ? (
          <span className="progress-flag overdue compact">逾期 {row.overdue}</span>
        ) : (
          "—"
        )}
      </td>
      <td className="person-workload-load">
        <span className={`person-workload-load-pill ${row.loadLevelClass || ""}`}>
          {row.loadLevel || "—"}
        </span>
      </td>
      <td className="person-workload-projects">
        <ProjectPills
          projects={row.projects}
          visibleLimit={projectsVisible}
          expanded={projectsExpanded}
          onToggle={() => setProjectsExpanded((open) => !open)}
          onOpenProgress={onOpenProgress}
        />
      </td>
    </tr>
  );
}

export function PersonWorkloadTable({
  personTeams = [],
  pageSize = 8,
  projectsVisible = 3,
  onOpenProgress
}) {
  const [showAll, setShowAll] = useState(false);

  const visibleRows = useMemo(
    () => (showAll ? personTeams : personTeams.slice(0, pageSize)),
    [personTeams, showAll, pageSize]
  );

  const hiddenCount = Math.max(0, personTeams.length - pageSize);

  if (!personTeams.length) {
    return (
      <div className="empty-state compact">
        <p>当前筛选条件下暂无 IC / Staff 成员。</p>
      </div>
    );
  }

  return (
    <div className="person-workload-table-wrap">
      <table className="person-workload-table">
        <thead>
          <tr>
            <th scope="col">成员</th>
            <th scope="col">角色</th>
            <th scope="col">项目数</th>
            <th scope="col">控制点</th>
            <th scope="col">逾期</th>
            <th scope="col">负荷</th>
            <th scope="col">参与项目</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <PersonWorkloadRow
              key={row.email}
              row={row}
              projectsVisible={projectsVisible}
              onOpenProgress={onOpenProgress}
            />
          ))}
        </tbody>
      </table>
      {!showAll && hiddenCount > 0 ? (
        <button
          className="button subtle compact person-workload-page-toggle"
          type="button"
          onClick={() => setShowAll(true)}
        >
          显示全部 {personTeams.length} 人（还有 {hiddenCount} 人）
        </button>
      ) : null}
      {showAll && personTeams.length > pageSize ? (
        <button
          className="button subtle compact person-workload-page-toggle"
          type="button"
          onClick={() => setShowAll(false)}
        >
          收起，仅显示前 {pageSize} 人
        </button>
      ) : null}
    </div>
  );
}
