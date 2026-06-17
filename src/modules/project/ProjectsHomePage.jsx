import { useMemo, useState } from "react";
import {
  labelOfEngagement,
  labelOfIndustry,
  labelOfProjectType,
  labelOfTeam
} from "../../data/projectConstants";
import {
  formatWorkspaceStatusSummary,
  WorkspaceStatusOverviewBar
} from "../progress-board/WorkspaceStatusOverviewBar";
import { countActiveMembers, filterProjects, sortProjects } from "./projectSearch";
import { getProjectWorkspaceStatusOverview } from "./projectProgressOverview";
import { PROJECT_SORT_OPTIONS } from "./specialistConstants";

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

  return (
    <button
      className={`project-card ${active ? "active" : ""}`}
      type="button"
      onClick={() => onOpen(project.id)}
    >
      <div className="project-card-top">
        <span className="team-pill">{labelOfTeam(project.team)}</span>
        <span className="engagement-pill">{labelOfEngagement(project.engagementType)}</span>
      </div>
      <p className="project-card-client">{project.clientName || "未填写客户"}</p>
      <h3>{project.name}</h3>
      <p>{labelOfProjectType(project.projectType)}</p>
      <div className="project-card-meta">
        <span>{labelOfIndustry(project.industry)}</span>
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

  const visibleProjects = useMemo(() => {
    const filtered = filterProjects(projects, search);
    return sortProjects(filtered, sortBy);
  }, [projects, search, sortBy]);

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Engagement Portfolio</p>
          <h2>项目列表</h2>
        </div>
        <button className="button primary" type="button" onClick={onCreate}>新建项目</button>
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
