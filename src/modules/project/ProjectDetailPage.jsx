import { useEffect, useMemo, useState } from "react";
import {
  labelOfEngagement,
  labelOfIndustry,
  labelOfProjectType,
  labelOfRole,
  labelOfTeam
} from "../../data/projectConstants";
import {
  labelOfSpecialistLeadRole,
  labelOfSpecialistTeam
} from "./specialistConstants";
import {
  getProject,
  updateEditableProject
} from "./projectStore";
import { validateEditableProject } from "./projectValidation";

function LockedItem({ label, value }) {
  return (
    <div className="meta-item locked">
      <span>{label}</span>
      <strong>{value}</strong>
      <em className="lock-tag">Locked</em>
    </div>
  );
}

export function ProjectDetailPage({
  projectId,
  refreshToken = 0,
  controlPointCount = 0,
  onOpenWorkspace,
  onOpenBoard,
  onOpenMembers,
  onOpenProgress,
  onBack,
  onDelete,
  onToast,
  onProjectChange
}) {
  const project = useMemo(() => getProject(projectId), [projectId, refreshToken]);

  const [basics, setBasics] = useState({
    clientName: "",
    name: "",
    startDate: "",
    reportDate: ""
  });
  const [savingBasics, setSavingBasics] = useState(false);

  useEffect(() => {
    if (!project) return;
    setBasics({
      clientName: project.clientName || "",
      name: project.name,
      startDate: project.startDate,
      reportDate: project.reportDate || ""
    });
  }, [project]);

  if (!project) {
    return (
      <section className="page-shell">
        <div className="empty-state large">
          <h3>Project Not Found</h3>
          <button className="button primary" type="button" onClick={onBack}>Back to List</button>
        </div>
      </section>
    );
  }

  const activeMembers = project.members.filter((member) => member.status === "active");
  const specialistTeams = project.specialistTeams || [];

  function refresh() {
    onProjectChange(getProject(projectId));
  }

  function updateBasicField(name, value) {
    setBasics((current) => ({ ...current, [name]: value }));
  }

  function handleSaveBasics() {
    const check = validateEditableProject(basics);
    if (!check.ok) {
      onToast(check.message);
      return;
    }

    setSavingBasics(true);
    try {
      updateEditableProject(projectId, basics);
      refresh();
      onToast("Project information updated.");
    } finally {
      setSavingBasics(false);
    }
  }

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">{labelOfTeam(project.team)} · {labelOfEngagement(project.engagementType)}</p>
          <h2>{project.name}</h2>
          <p className="page-lead">
            {project.clientName || "Client Not Provided"} · {labelOfProjectType(project.projectType)}
          </p>
        </div>
        <div className="header-actions">
          <button className="button" type="button" onClick={onBack}>Project List</button>
          <button className="button" type="button" onClick={onOpenMembers}>Member Management</button>
          <button className="button primary" type="button" onClick={onOpenWorkspace}>Go to Workspace</button>
        </div>
      </header>

      <div className="detail-grid">
        <section className="detail-panel">
          <div className="panel-toolbar">
            <h3>Basic Information</h3>
            <span className="panel-note">Team / Type / Industry cannot be changed after creation</span>
          </div>

          <div className="meta-grid">
            <LockedItem label="Team" value={labelOfTeam(project.team)} />
            <LockedItem label="Engagement" value={labelOfEngagement(project.engagementType)} />
            <LockedItem label="Type" value={labelOfProjectType(project.projectType)} />
            <LockedItem label="Industry" value={labelOfIndustry(project.industry)} />
          </div>

          <div className="editable-grid">
            <label className="field">
              <span className="label">Client Name Client Name *</span>
              <input
                value={basics.clientName}
                onChange={(e) => updateBasicField("clientName", e.target.value)}
              />
            </label>

            <label className="field">
              <span className="label">Project Name Project Name *</span>
              <input
                value={basics.name}
                onChange={(e) => updateBasicField("name", e.target.value)}
              />
            </label>

            <label className="field">
              <span className="label">Planned Start Date Start Date *</span>
              <input
                type="date"
                value={basics.startDate}
                onChange={(e) => updateBasicField("startDate", e.target.value)}
              />
            </label>

            <label className="field">
              <span className="label">Report Date Report Date</span>
              <input
                type="date"
                value={basics.reportDate}
                onChange={(e) => updateBasicField("reportDate", e.target.value)}
              />
              <span className="field-hint">Optional. Can be completed while the project is in progress.</span>
            </label>
          </div>

          <div className="panel-footer-actions">
            <button
              className="button primary"
              type="button"
              disabled={savingBasics}
              onClick={handleSaveBasics}
            >
              {savingBasics ? "Saving..." : "Save Basic Information"}
            </button>
          </div>
        </section>

        <section className="detail-panel scope-panel full">
          <div className="panel-toolbar">
            <div>
              <h3>Test Point List</h3>
              <p className="panel-note">
                Controls and test points are maintained in Workspace. After creating a project, go to Workspace to create a test point.
              </p>
            </div>
            <button className="button primary" type="button" onClick={onOpenWorkspace}>
              Go to Workspace
            </button>
          </div>

          <p className="panel-note">
            {controlPointCount
              ? `Current project has ${controlPointCount} control(s).`
              : "No controls yet. Click Create Test Point in Workspace to start maintaining the list."}
          </p>

          <div className="scope-defined-links">
            <button className="button" type="button" onClick={onOpenBoard}>View Kanban</button>
            <button className="button primary" type="button" onClick={onOpenProgress}>View Progress Board</button>
          </div>
        </section>

        <section className="detail-panel full members-summary">
          <div className="panel-toolbar">
            <div>
              <h3>Project Members</h3>
              <p className="panel-note">Total {activeMembers.length} core member(s)</p>
            </div>
            <button className="button primary" type="button" onClick={onOpenMembers}>
              Edit Members
            </button>
          </div>

          <ul className="member-summary-list">
            {activeMembers.map((member) => (
              <li key={member.id} className="member-summary-item">
                <span className="role-pill">{labelOfRole(member.role)}</span>
                <strong>{member.email}</strong>
              </li>
            ))}
          </ul>
        </section>

        {specialistTeams.length ? (
          <section className="detail-panel full members-summary">
            <div className="panel-toolbar">
              <div>
                <h3>Specialist Teams</h3>
                <p className="panel-note">
                  Audit team cross-functional collaboration · Enabled {specialistTeams.map((t) => labelOfSpecialistTeam(t.team)).join(", ")} (Lead can add Specialist team staff in Member Management after accepting the invite)
                </p>
              </div>
              <button className="button" type="button" onClick={onOpenMembers}>
                Manage Specialist
              </button>
            </div>

            <ul className="member-summary-list">
              {specialistTeams.map((team) => (
                <li key={team.id} className="member-summary-item specialist-summary-item">
                  <span className="role-pill">{labelOfSpecialistTeam(team.team)}</span>
                  <div>
                    <strong>{team.leadEmail}</strong>
                    <span className="member-subline">
                      {labelOfSpecialistLeadRole(team.leadRole)} ·
                      {" "}
                      {(team.staff || []).filter((member) => member.status === "active").length} staff
                    </span>
                  </div>
                  <span className={`status-pill ${team.status}`}>{team.status}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="detail-panel full danger-panel">
          <h3>Delete Project</h3>
          <p className="panel-note">
            Deletion cannot be undone. Project members, controls, and Kanban tasks will also be removed.
          </p>
          <button className="button danger" type="button" onClick={onDelete}>
            Delete This Project
          </button>
        </section>
      </div>
    </section>
  );
}
