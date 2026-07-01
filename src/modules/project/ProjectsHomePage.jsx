import { useMemo, useState } from "react";
import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS } from "../../data/pageLabels";
import {
  labelOfEngagement,
  labelOfIndustry,
  labelOfProjectType,
  labelOfTeam,
  PROJECT_TYPES,
  TEAMS
} from "../../data/projectConstants";
import {
  getEngagementTypeProfile,
  projectTypeSkinClass
} from "../../data/engagementTypeProfiles";
import {
  formatWorkspaceStatusSummary,
  WorkspaceStatusOverviewBar
} from "../progress-board/WorkspaceStatusOverviewBar";
import {
  applyProjectListFilters,
  countActiveMembers,
  sortProjects
} from "./projectSearch";
import { getProjectWorkspaceStatusOverview } from "./projectProgressOverview";
import { PROJECT_SORT_OPTIONS } from "./specialistConstants";
import { ledTeamLabel } from "../command-center/commandCenterUtils";

function ProjectCardProgress({ project, tasks }) {
  const breakdown = getProjectWorkspaceStatusOverview(project.id, tasks);
  const { total } = breakdown;

  if (!total) {
    return (
      <div className="project-card-progress" aria-label="状态概述">
        <WorkspaceStatusOverviewBar breakdown={breakdown} pending />
        <p className="project-card-progress-meta muted">暂无控制点</p>
      </div>
    );
  }

  return (
    <div className="project-card-progress" aria-label="状态概述">
      <div className="project-card-progress-head">
        <span>状态概述</span>
        <strong>{total} 控制点</strong>
      </div>
      <WorkspaceStatusOverviewBar breakdown={breakdown} />
      <p className="project-card-progress-meta">{formatWorkspaceStatusSummary(breakdown)}</p>
    </div>
  );
}

function ProjectCard({ project, tasks, active, onOpen }) {
  const controlCount = tasks.filter((task) => task.projectId === project.id).length;
  const profile = getEngagementTypeProfile(project.projectType);

  return (
    <button
      className={[
        "project-card",
        projectTypeSkinClass(project.projectType),
        active ? "active" : ""
      ].filter(Boolean).join(" ")}
      type="button"
      onClick={() => onOpen(project.id)}
      style={{ "--type-accent": profile.color }}
    >
      <div className="project-card-accent" aria-hidden="true" />
      <div className="project-card-body">
        <div className="project-card-top">
          <span className="type-badge">{profile.badge}</span>
          <span className="team-pill">{ledTeamLabel(project.team)}</span>
          <span className="engagement-pill">{labelOfEngagement(project.engagementType)}</span>
        </div>
        <p className="project-card-client">{project.clientName || "未填写客户"}</p>
        <h3>{project.name}</h3>
        <p>{labelOfProjectType(project.projectType)}</p>
        <div className="project-card-meta">
          <span>{labelOfIndustry(project.industry)}</span>
          <span>{labelOfTeam(project.team)}</span>
          <span>Start {project.startDate}</span>
        </div>
        {project.reportDate ? (
          <div className="project-card-report">Report Date · {project.reportDate}</div>
        ) : null}
        <ProjectCardProgress project={project} tasks={tasks} />
        <div className="project-card-footer">
          <span className="scope-badge defined">
            {controlCount ? `${controlCount} 控制点` : "暂无控制点"}
          </span>
          <span>{countActiveMembers(project)} members</span>
        </div>
      </div>
    </button>
  );
}

export function ProjectsHomePage({
  projects,
  tasks = [],
  currentProjectId,
  onCreate,
  onOpen
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [teamFilter, setTeamFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const visibleProjects = useMemo(() => {
    const filtered = applyProjectListFilters(projects, {
      search,
      team: teamFilter,
      projectType: typeFilter
    });
    return sortProjects(filtered, sortBy);
  }, [projects, search, sortBy, teamFilter, typeFilter]);

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <ModuleHeading
            as="h2"
            title={PAGE_LABELS.projectList.title}
            titleEn={PAGE_LABELS.projectList.titleEn}
          />
        </div>
        <div className="page-header-actions">
          <button className="button primary" type="button" onClick={onCreate}>新建项目</button>
        </div>
      </header>

      {projects.length ? (
        <>
          <div className="list-toolbar">
            <label className="search-field">
              <span className="label">搜索项目</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="客户、项目名、行业、成员邮箱、Specialist..."
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
            <label className="sort-field">
              <span className="label">排序</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {PROJECT_SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>
            <span className="list-count">{visibleProjects.length} / {projects.length} 个项目</span>
          </div>

          {visibleProjects.length ? (
            <div className="project-grid">
              {visibleProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  tasks={tasks}
                  active={project.id === currentProjectId}
                  onOpen={onOpen}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state large">
              <h3>没有匹配的项目</h3>
              <p>试试其他关键词，或清空搜索框查看全部项目。</p>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state large">
          <h3>还没有项目</h3>
          <p>创建第一个审计项目，填写客户名称、基本信息并邀请 Partner / Manager / In-charge。</p>
          <button className="button primary" type="button" onClick={onCreate}>创建项目</button>
        </div>
      )}
    </section>
  );
}
