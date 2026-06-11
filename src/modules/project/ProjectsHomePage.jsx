import {
  labelOfEngagement,
  labelOfIndustry,
  labelOfProjectType,
  labelOfTeam
} from "../../data/projectConstants";

function ProjectCard({ project, active, onOpen }) {
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
      <h3>{project.name}</h3>
      <p>{labelOfProjectType(project.projectType)}</p>
      <div className="project-card-meta">
        <span>{labelOfIndustry(project.industry)}</span>
        <span>Start {project.startDate}</span>
      </div>
      {project.reportDate ? (
        <div className="project-card-report">Report Date · {project.reportDate}</div>
      ) : null}
      <div className="project-card-footer">
        <span className={`scope-badge ${project.scopeStatus}`}>
          Scope {project.scopeStatus === "pending" ? "Pending" : "Defined"}
        </span>
        <span>{project.members.filter((m) => m.status === "active").length} members</span>
      </div>
    </button>
  );
}

export function ProjectsHomePage({ projects, currentProjectId, onCreate, onOpen }) {
  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Engagement Portfolio</p>
          <h2>项目列表</h2>
          <p className="page-lead">
            审计友好的项目入口：比 JIRA 更轻量，聚焦项目基本信息、成员邀请与后续 Scope 协同。
          </p>
        </div>
        <button className="button primary" type="button" onClick={onCreate}>新建项目</button>
      </header>

      {projects.length ? (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              active={project.id === currentProjectId}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state large">
          <h3>还没有项目</h3>
          <p>创建第一个审计项目，填写基本信息并邀请 Partner / Manager / In-charge。</p>
          <button className="button primary" type="button" onClick={onCreate}>创建项目</button>
        </div>
      )}
    </section>
  );
}
