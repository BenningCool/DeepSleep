import { useMemo, useState } from "react";
import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS } from "../../data/pageLabels";
import {
  getEngagementTypeProfile,
  projectTypeSkinClass
} from "../../data/engagementTypeProfiles";
import { collectProjectContributorGroups } from "../../data/seedDemoProjects";
import {
  hintOfViewAs,
  labelOfViewAs,
  projectCardHighlightClass,
  sortProjectsForViewAs,
  VIEW_AS_OPTIONS,
  demoEmailOfViewAs
} from "../../data/viewAsPresets";
import { labelOfTeam, TEAMS, PROJECT_TYPES } from "../../data/projectConstants";
import { labelOfContributorGroup } from "../project/contributorGroup";
import { applyProjectListFilters } from "../project/projectSearch";
import { getProjectWorkspaceStatusOverview } from "../project/projectProgressOverview";
import {
  formatWorkspaceStatusSummary,
  WorkspaceStatusOverviewBar
} from "../progress-board/WorkspaceStatusOverviewBar";
import { getControlProgressSnapshot } from "../../services/workspaceProgressService";
import { buildTaskMap } from "../progress-board/progressBoardUtils";
import { filterOverdueControls } from "../progress-board/progressDashboardUtils";
import {
  formatReportCountdown,
  ledTeamLabel
} from "./commandCenterUtils";
import { StaffCommandView } from "./StaffCommandView";
import { TeamRollupCommandView } from "./TeamRollupCommandView";
import { EpCommandView } from "./EpCommandView";

function CommandProjectCard({
  project,
  tasks,
  viewAs,
  onOpenProgress,
  onOpenDetail
}) {
  const breakdown = getProjectWorkspaceStatusOverview(project.id, tasks);
  const profile = getEngagementTypeProfile(project.projectType);
  const contributorGroups = collectProjectContributorGroups(project.id, tasks);
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const snapshot = getControlProgressSnapshot(project.id, projectTasks);
  const overdueCount = filterOverdueControls(
    snapshot.controls || [],
    buildTaskMap(projectTasks)
  ).length;
  const staffCount = viewAs === "staff"
    ? projectTasks.filter((task) => (
      String(task.owner || "").trim().toLowerCase()
        === demoEmailOfViewAs("staff").toLowerCase()
    )).length
    : 0;
  const reportLabel = formatReportCountdown(project.reportDate);

  return (
    <article
      className={[
        "command-project-card",
        projectTypeSkinClass(project.projectType),
        projectCardHighlightClass(viewAs, project, tasks)
      ].filter(Boolean).join(" ")}
      style={{ "--type-accent": profile.color }}
    >
      <div className="command-card-accent" aria-hidden="true" />
      <div className="command-card-body">
        <div className="command-card-head">
          <span className="type-badge">{profile.badge}</span>
          <div className="command-card-metrics">
            {overdueCount ? (
              <span className="command-overdue-pill">逾期 {overdueCount}</span>
            ) : null}
            {reportLabel ? (
              <span className="command-report-pill">{reportLabel}</span>
            ) : null}
          </div>
        </div>
        <p className="command-card-client">{project.clientName || "未填写客户"}</p>
        <h3>{project.name}</h3>
        <div className="command-card-tags">
          <span className="team-pill">{ledTeamLabel(project.team)}</span>
          <span className="engagement-pill">{labelOfTeam(project.team)}</span>
        </div>
        <div className="command-card-progress">
          <WorkspaceStatusOverviewBar breakdown={breakdown} pending={!breakdown.total} />
          <p className="command-card-progress-meta">
            {breakdown.total
              ? formatWorkspaceStatusSummary(breakdown)
              : "暂无测试点"}
          </p>
        </div>
        {contributorGroups.length ? (
          <div className="command-collab-strip">
            <span className="command-collab-label">协作</span>
            {contributorGroups.map((group) => (
              <span className="contributor-pill" key={group}>
                {labelOfContributorGroup(group)}
              </span>
            ))}
          </div>
        ) : null}
        {staffCount ? (
          <p className="command-staff-note">我的待办 {staffCount} 个测试点</p>
        ) : null}
        <div className="command-card-actions">
          <button
            className="button primary"
            type="button"
            onClick={() => onOpenProgress(project.id)}
          >
            进度看板
          </button>
          <button
            className="button subtle"
            type="button"
            onClick={() => onOpenDetail(project.id)}
          >
            概览
          </button>
        </div>
      </div>
    </article>
  );
}

export function CommandCenterPage({
  projects,
  tasks,
  viewAs,
  onViewAsChange,
  onOpenProgress,
  onOpenDetail,
  onOpenMemberProgress,
  onCreateAnnual,
  onOpenTypes
}) {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const visibleProjects = useMemo(() => {
    const filtered = applyProjectListFilters(projects, {
      search,
      team: teamFilter,
      projectType: typeFilter
    });
    return sortProjectsForViewAs(filtered, viewAs, tasks);
  }, [projects, search, teamFilter, typeFilter, viewAs, tasks]);

  if (viewAs === "staff") {
    return (
      <StaffCommandView
        projects={projects}
        tasks={tasks}
        viewAs={viewAs}
        onViewAsChange={onViewAsChange}
        onOpenProgress={onOpenProgress}
        onOpenDetail={onOpenDetail}
      />
    );
  }

  if (viewAs === "ic" || viewAs === "em") {
    return (
      <TeamRollupCommandView
        projects={projects}
        tasks={tasks}
        viewAs={viewAs}
        onViewAsChange={onViewAsChange}
        onOpenProgress={onOpenProgress}
        onOpenDetail={onOpenDetail}
        onOpenMemberProgress={onOpenMemberProgress}
      />
    );
  }

  if (viewAs === "ep") {
    return (
      <EpCommandView
        projects={projects}
        tasks={tasks}
        viewAs={viewAs}
        onViewAsChange={onViewAsChange}
        onOpenProgress={onOpenProgress}
        onOpenDetail={onOpenDetail}
      />
    );
  }

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <ModuleHeading
            as="h2"
            title={PAGE_LABELS.commandCenter.title}
            titleEn={PAGE_LABELS.commandCenter.titleEn}
          />
        </div>
      </header>

      <div className="command-toolbar">
        <label className="view-as-field">
          <span className="label">View as · 查看身份</span>
          <select value={viewAs} onChange={(e) => onViewAsChange(e.target.value)}>
            {VIEW_AS_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="search-field">
          <span className="label">搜索</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="客户、项目名、行业、成员邮箱..."
          />
        </label>
        <label className="sort-field">
          <span className="label">牵头团队</span>
          <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
            <option value="">全部</option>
            {TEAMS.map((team) => (
              <option key={team.id} value={team.id}>{team.label}</option>
            ))}
          </select>
        </label>
        <label className="sort-field">
          <span className="label">项目类型</span>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">全部</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="command-view-hint">
        当前视角：<strong>{labelOfViewAs(viewAs)}</strong>
        {hintOfViewAs(viewAs) ? ` · ${hintOfViewAs(viewAs)}` : ""}
      </p>

      {!projects.length ? (
        <div className="empty-state large">
          <h3>暂无项目</h3>
          <p>建议从 Audit 年审演示项目开始，或先了解支持的项目类型。</p>
          <div className="command-empty-actions">
            <button className="button primary" type="button" onClick={onCreateAnnual}>
              新建年审项目
            </button>
            <button className="button subtle" type="button" onClick={onOpenTypes}>
              了解项目类型
            </button>
          </div>
        </div>
      ) : visibleProjects.length ? (
        <div className="command-project-grid">
          {visibleProjects.map((project) => (
            <CommandProjectCard
              key={project.id}
              project={project}
              tasks={tasks}
              viewAs={viewAs}
              onOpenProgress={onOpenProgress}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state large">
          <h3>没有匹配的项目</h3>
          <p>调整搜索或筛选条件后重试。</p>
        </div>
      )}
    </section>
  );
}
