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
      <div className="project-card-progress" aria-label="Status Overview">
        <WorkspaceStatusOverviewBar breakdown={breakdown} pending />
        <p className="project-card-progress-meta muted">No Controls Yet</p>
      </div>
    );
  }

  return (
    <div className="project-card-progress" aria-label="Status Overview">
      <div className="project-card-progress-head">
        <span>Status Overview</span>
        <strong>{total} Controls</strong>
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
      <p className="project-card-client">{project.clientName || "Client Not Provided"}</p>
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
          {controlCount ? `${controlCount} Controls` : "No Controls Yet"}
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
          <h2>Project List</h2>
        </div>
        <button className="button primary" type="button" onClick={onCreate}>Create Project</button>
      </header>

      {projects.length ? (
        <>
          <div className="list-toolbar">
            <label className="search-field">
              <span className="label">Search Projects</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Client, project name, industry, member email, Specialist..."
              />
            </label>
            <label className="sort-field">
              <span className="label">Sort</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {PROJECT_SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>
            <span className="list-count">{visibleProjects.length} / {projects.length} projects</span>
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
              <h3>No Matching Projects</h3>
              <p>Try another keyword, or clear the search box to view all projects.</p>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state large">
          <h3>No Projects Yet</h3>
          <p>Create the first audit project, enter client and basic information, and invite Partner / Manager / In-charge.</p>
          <button className="button primary" type="button" onClick={onCreate}>Create Project</button>
        </div>
      )}
    </section>
  );
}
