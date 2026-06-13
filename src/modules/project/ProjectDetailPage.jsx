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
  onOpenBoard,
  onOpenMembers,
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
          <h3>项目不存在</h3>
          <button className="button primary" type="button" onClick={onBack}>返回列表</button>
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
      onToast("项目基本信息已更新。");
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
            {project.clientName || "未填写客户"} · {labelOfProjectType(project.projectType)}
          </p>
        </div>
        <div className="header-actions">
          <button className="button" type="button" onClick={onBack}>项目列表</button>
          <button className="button" type="button" onClick={onOpenMembers}>成员管理</button>
          <button className="button primary" type="button" onClick={onOpenBoard}>查看看板</button>
        </div>
      </header>

      <div className="detail-grid">
        <section className="detail-panel">
          <div className="panel-toolbar">
            <h3>基本信息</h3>
            <span className="panel-note">Team / Type / Industry 创建后不可修改</span>
          </div>

          <div className="meta-grid">
            <LockedItem label="Team" value={labelOfTeam(project.team)} />
            <LockedItem label="Engagement" value={labelOfEngagement(project.engagementType)} />
            <LockedItem label="Type" value={labelOfProjectType(project.projectType)} />
            <LockedItem label="Industry" value={labelOfIndustry(project.industry)} />
          </div>

          <div className="editable-grid">
            <label className="field">
              <span className="label">客户名称 Client Name *</span>
              <input
                value={basics.clientName}
                onChange={(e) => updateBasicField("clientName", e.target.value)}
              />
            </label>

            <label className="field">
              <span className="label">项目名称 Project Name *</span>
              <input
                value={basics.name}
                onChange={(e) => updateBasicField("name", e.target.value)}
              />
            </label>

            <label className="field">
              <span className="label">计划开始日期 Start Date *</span>
              <input
                type="date"
                value={basics.startDate}
                onChange={(e) => updateBasicField("startDate", e.target.value)}
              />
            </label>

            <label className="field">
              <span className="label">项目报告日 Report Date</span>
              <input
                type="date"
                value={basics.reportDate}
                onChange={(e) => updateBasicField("reportDate", e.target.value)}
              />
              <span className="field-hint">选填，可在项目进行中补充</span>
            </label>
          </div>

          <div className="panel-footer-actions">
            <button
              className="button primary"
              type="button"
              disabled={savingBasics}
              onClick={handleSaveBasics}
            >
              {savingBasics ? "保存中..." : "保存基本信息"}
            </button>
          </div>
        </section>

        <section className="detail-panel scope-panel">
          <div className="scope-panel-head">
            <h3>Scope</h3>
            <span className="status-pill pending">Pending</span>
          </div>
          <div className="scope-placeholder">
            <strong>项目 Scope 尚未明确</strong>
            <p>
              后续将在此初始化审计范围与任务清单。Scope 明确前，看板保持为空并提示等待 Scope。
            </p>
          </div>
        </section>

        <section className="detail-panel full members-summary">
          <div className="panel-toolbar">
            <div>
              <h3>项目成员</h3>
              <p className="panel-note">共 {activeMembers.length} 位核心成员</p>
            </div>
            <button className="button primary" type="button" onClick={onOpenMembers}>
              编辑成员
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
                <h3>Specialist 团队</h3>
                <p className="panel-note">Audit 跨组协作 · 共 {specialistTeams.length} 个专家组（可在成员管理中增删改）</p>
              </div>
              <button className="button" type="button" onClick={onOpenMembers}>
                管理 Specialist
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
          <h3>删除项目</h3>
          <p className="panel-note">
            删除后不可恢复，项目成员、Scope 与看板任务将一并移除。
          </p>
          <button className="button danger" type="button" onClick={onDelete}>
            删除此项目
          </button>
        </section>
      </div>
    </section>
  );
}
