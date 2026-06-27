import { useEffect, useMemo, useRef, useState } from "react";
import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS, PROJECT_SECTION_LABELS } from "../../data/pageLabels";
import { labelOfRole } from "../../data/projectConstants";
import { notifyMockInvites } from "./inviteService";
import {
  formatMemberInviteMessage,
  formatSpecialistLeadInviteMessage,
  formatSpecialistStaffInviteMessage
} from "./inviteUtils";
import {
  getProject,
  membersToForm,
  specialistsToForm,
  specialistStaffToForm,
  updateProjectMembers,
  updateProjectSpecialists,
  updateSpecialistStaff
} from "./projectStore";
import {
  validateMemberForm,
  validateSpecialistForm,
  validateSpecialistStaffForm
} from "./projectValidation";
import {
  labelOfSpecialistLeadRole,
  labelOfSpecialistTeam,
  labelOfSpecialistTeamStaff,
  SPECIALIST_LEAD_ROLES,
  SPECIALIST_TEAMS
} from "./specialistConstants";

function InviteCard({ title, email, invite, onCopy }) {
  return (
    <article className="invite-card">
      <div className="invite-card-head">
        <div>
          <span className="role-pill">{title}</span>
          <strong>{email}</strong>
        </div>
        <span className="status-pill active">Active</span>
      </div>
      <div className="invite-preview">
        <p><strong>中文</strong></p>
        <pre>{invite.zh}</pre>
        <p><strong>English</strong></p>
        <pre>{invite.en}</pre>
      </div>
      <div className="invite-actions">
        <button className="button subtle" type="button" onClick={() => onCopy(invite.link)}>
          复制邀请链接
        </button>
      </div>
    </article>
  );
}

export function ProjectMembersPage({
  projectId,
  refreshToken = 0,
  focusSpecialistTeamId = "",
  onBack,
  onToast,
  onProjectChange
}) {
  const project = useMemo(() => getProject(projectId), [projectId, refreshToken]);

  const specialistTeamsForStaff = useMemo(() => {
    const teams = project?.specialistTeams || [];
    if (focusSpecialistTeamId) {
      return teams.filter((team) => team.id === focusSpecialistTeamId);
    }
    return teams;
  }, [project?.specialistTeams, focusSpecialistTeamId]);

  const showTeamStaffLabel = specialistTeamsForStaff.length > 1;

  const [memberForm, setMemberForm] = useState({
    partnerEmail: "",
    managerEmail: "",
    inChargeEmail: "",
    smEmail: "",
    staffEmails: [""]
  });
  const [specialistForm, setSpecialistForm] = useState(specialistsToForm([]));
  const [specialistStaffForms, setSpecialistStaffForms] = useState({});
  const [saving, setSaving] = useState(false);
  const specialistStaffRefs = useRef({});

  useEffect(() => {
    if (!project) return;
    const form = membersToForm(project.members);
    setMemberForm({
      ...form,
      staffEmails: form.staffEmails.length ? form.staffEmails : [""]
    });
    setSpecialistForm(specialistsToForm(project.specialistTeams));
    const staffForms = {};
    (project.specialistTeams || []).forEach((team) => {
      staffForms[team.id] = specialistStaffToForm(team);
    });
    setSpecialistStaffForms(staffForms);
  }, [project]);

  useEffect(() => {
    if (!focusSpecialistTeamId) return;
    const node = specialistStaffRefs.current[focusSpecialistTeamId];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusSpecialistTeamId, project]);

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

  const isAudit = project.team === "audit";

  function refresh() {
    onProjectChange(getProject(projectId));
  }

  function updateMemberField(name, value) {
    setMemberForm((current) => ({ ...current, [name]: value }));
  }

  function updateStaff(index, value) {
    setMemberForm((current) => {
      const staffEmails = [...current.staffEmails];
      staffEmails[index] = value;
      return { ...current, staffEmails };
    });
  }

  function addStaffRow() {
    setMemberForm((current) => ({
      ...current,
      staffEmails: [...current.staffEmails, ""]
    }));
  }

  function removeStaffRow(index) {
    setMemberForm((current) => ({
      ...current,
      staffEmails: current.staffEmails.filter((_, i) => i !== index)
    }));
  }

  function updateSpecialist(teamId, patch) {
    setSpecialistForm((current) => ({
      ...current,
      [teamId]: { ...current[teamId], ...patch }
    }));
  }

  function updateSpecialistStaffRow(teamId, index, value) {
    setSpecialistStaffForms((current) => {
      const staffEmails = [...(current[teamId] || [""])];
      staffEmails[index] = value;
      return { ...current, [teamId]: staffEmails };
    });
  }

  function addSpecialistStaffRow(teamId) {
    setSpecialistStaffForms((current) => ({
      ...current,
      [teamId]: [...(current[teamId] || [""]), ""]
    }));
  }

  function removeSpecialistStaffRow(teamId, index) {
    setSpecialistStaffForms((current) => ({
      ...current,
      [teamId]: (current[teamId] || [""]).filter((_, i) => i !== index)
    }));
  }

  function handleCopy(link) {
    navigator.clipboard.writeText(link).then(() => {
      onToast("邀请链接已复制。");
    }).catch(() => {
      onToast(link);
    });
  }

  function handleSaveMembers() {
    const payload = {
      ...memberForm,
      staffEmails: memberForm.staffEmails.filter((email) => email.trim())
    };
    const check = validateMemberForm(payload);
    if (!check.ok) {
      onToast(check.message);
      return;
    }

    setSaving(true);
    try {
      const result = updateProjectMembers(projectId, payload);
      if (!result) {
        onToast("成员更新失败。");
        return;
      }

      refresh();
      notifyMockInvites(onToast, result.invitedMembers.length);
    } finally {
      setSaving(false);
    }
  }

  function handleSaveSpecialists() {
    const check = validateSpecialistForm(specialistForm);
    if (!check.ok) {
      onToast(check.message);
      return;
    }

    const removed = (project.specialistTeams || []).filter(
      (team) => !specialistForm[team.team]?.enabled
    );
    const removedWithStaff = removed.filter(
      (team) => (team.staff || []).some((member) => member.status === "active")
    );
    if (removedWithStaff.length) {
      const names = removedWithStaff.map((team) => labelOfSpecialistTeam(team.team)).join("、");
      const confirmed = window.confirm(
        `取消勾选将移除 ${names} 及其 Staff 配置，确定继续？`
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      const result = updateProjectSpecialists(projectId, { specialists: specialistForm });
      if (!result) {
        onToast("Specialist 更新失败。");
        return;
      }

      refresh();
      notifyMockInvites(onToast, result.invitedLeads.length);
    } finally {
      setSaving(false);
    }
  }

  function handleSaveSpecialistStaff(teamId) {
    const staffEmails = (specialistStaffForms[teamId] || [])
      .map((email) => email.trim())
      .filter(Boolean);
    const check = validateSpecialistStaffForm(staffEmails);
    if (!check.ok) {
      onToast(check.message);
      return;
    }

    setSaving(true);
    try {
      const result = updateSpecialistStaff(projectId, teamId, staffEmails);
      if (!result) {
        onToast("Specialist team staff 更新失败。");
        return;
      }

      refresh();
      notifyMockInvites(onToast, result.invitedStaff.length);
    } finally {
      setSaving(false);
    }
  }

  const activeCount = project.members.filter((member) => member.status === "active").length;

  const focusedTeam = (project.specialistTeams || []).find(
    (team) => team.id === focusSpecialistTeamId
  );

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <ModuleHeading
            as="h2"
            title={PAGE_LABELS.memberManagement.title}
            titleEn={PAGE_LABELS.memberManagement.titleEn}
          />
          <p className="page-lead">
            项目「{project.name}」· 当前 {activeCount} 位核心成员。
            修改邮箱后保存，新成员将生成邀请链接（演示模式）。
          </p>
        </div>
      </header>

      {focusedTeam ? (
        <div className="members-lead-callout">
          <strong>Specialist Lead 入职</strong>
          <p>
            您以 {labelOfSpecialistTeam(focusedTeam.team)} · {labelOfSpecialistLeadRole(focusedTeam.leadRole)} 身份加入。
            请在下方 <strong>Specialist team staff</strong> 区域补充本组 Staff。
          </p>
        </div>
      ) : null}

      <div className="members-page-grid">
        <div className="members-edit-column">
          <section className="detail-panel members-editor">
            <ModuleHeading
              title={PROJECT_SECTION_LABELS.editCoreMembers.title}
              titleEn={PROJECT_SECTION_LABELS.editCoreMembers.titleEn}
            />
            <p className="panel-note">
              Partner 不可与 Manager / In-charge 重复。Manager 与 In-charge 可相同。
            </p>

            <div className="form-grid two-col compact">
              <label className="field">
                <span className="label">Partner *</span>
                <input
                  type="email"
                  value={memberForm.partnerEmail}
                  onChange={(e) => updateMemberField("partnerEmail", e.target.value)}
                  placeholder="partner@kpmg.com"
                />
              </label>
              <label className="field">
                <span className="label">Manager *</span>
                <input
                  type="email"
                  value={memberForm.managerEmail}
                  onChange={(e) => updateMemberField("managerEmail", e.target.value)}
                  placeholder="manager@kpmg.com"
                />
              </label>
              <label className="field">
                <span className="label">In-charge *</span>
                <input
                  type="email"
                  value={memberForm.inChargeEmail}
                  onChange={(e) => updateMemberField("inChargeEmail", e.target.value)}
                  placeholder="incharge@kpmg.com"
                />
              </label>
              <label className="field">
                <span className="label">Senior Manager</span>
                <input
                  type="email"
                  value={memberForm.smEmail}
                  onChange={(e) => updateMemberField("smEmail", e.target.value)}
                  placeholder="可选"
                />
              </label>
            </div>

            <div className="staff-block">
              <div className="staff-head">
                <span className="label">Staff</span>
                <button className="button subtle" type="button" onClick={addStaffRow}>
                  + 添加 Staff
                </button>
              </div>
              {memberForm.staffEmails.map((email, index) => (
                <div className="staff-row" key={`staff-edit-${index}`}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateStaff(index, e.target.value)}
                    placeholder="staff@kpmg.com"
                  />
                  {memberForm.staffEmails.length > 1 ? (
                    <button
                      className="button icon"
                      type="button"
                      aria-label="删除"
                      onClick={() => removeStaffRow(index)}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="panel-footer-actions">
              <button
                className="button primary"
                type="button"
                disabled={saving}
                onClick={handleSaveMembers}
              >
                {saving ? "保存中..." : "保存核心成员"}
              </button>
            </div>
          </section>

          {isAudit ? (
            <section className="detail-panel members-editor">
              <ModuleHeading
                title={PROJECT_SECTION_LABELS.specialistTeams.title}
                titleEn={PROJECT_SECTION_LABELS.specialistTeams.titleEn}
              />
              <p className="panel-note">
                仅 Audit team 项目可配置。勾选 ITA / Tax / FRM 专家组并指定 Lead；
                Lead 接受邀请后在本页补充 Specialist team staff。
              </p>

              <div className="specialist-grid compact">
                {SPECIALIST_TEAMS.map((item) => {
                  const entry = specialistForm[item.id];
                  return (
                    <article className={`specialist-card ${entry.enabled ? "active" : ""}`} key={item.id}>
                      <label className="specialist-toggle">
                        <input
                          type="checkbox"
                          checked={entry.enabled}
                          onChange={(e) => updateSpecialist(item.id, { enabled: e.target.checked })}
                        />
                        <div>
                          <strong>{item.label}</strong>
                          <span>{item.hint}</span>
                        </div>
                      </label>

                      {entry.enabled ? (
                        <div className="specialist-fields">
                          <label className="field">
                            <span className="label">Lead 角色 *</span>
                            <select
                              value={entry.leadRole}
                              onChange={(e) => updateSpecialist(item.id, { leadRole: e.target.value })}
                            >
                              {SPECIALIST_LEAD_ROLES.map((role) => (
                                <option key={role.id} value={role.id}>{role.label}</option>
                              ))}
                            </select>
                          </label>
                          <label className="field">
                            <span className="label">Lead 邮箱 *</span>
                            <input
                              type="email"
                              value={entry.leadEmail}
                              onChange={(e) => updateSpecialist(item.id, { leadEmail: e.target.value })}
                              placeholder={`${item.id}@firm.com`}
                            />
                          </label>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>

              <div className="panel-footer-actions">
                <button
                  className="button primary"
                  type="button"
                  disabled={saving}
                  onClick={handleSaveSpecialists}
                >
                  {saving ? "保存中..." : "保存 Specialist 配置"}
                </button>
              </div>
            </section>
          ) : null}

          {isAudit && specialistTeamsForStaff.length ? (
            <section
              className="detail-panel members-editor specialist-staff-panel"
              id="specialist-team-staff"
            >
              <ModuleHeading
                title={PROJECT_SECTION_LABELS.specialistTeamStaff.title}
                titleEn={PROJECT_SECTION_LABELS.specialistTeamStaff.titleEn}
              />
              <p className="panel-note">
                {focusedTeam
                  ? `请为 ${labelOfSpecialistTeamStaff(focusedTeam.team)} 补充 Staff；保存后将生成邀请链接。`
                  : "Audit team 项目已勾选的专家组（ITA / Tax / FRM）均可在此补充 Staff。各组 Lead 接受邀请后进入本页填写；项目管理员也可代填。"}
              </p>

              {specialistTeamsForStaff.map((team) => (
                <div
                  key={`staff-${team.id}`}
                  id={`specialist-staff-${team.id}`}
                  ref={(node) => {
                    specialistStaffRefs.current[team.id] = node;
                  }}
                  className={`specialist-staff-group ${
                    focusSpecialistTeamId === team.id ? "focused-specialist" : ""
                  }`}
                >
                  <div className="staff-block">
                    <div className="staff-head">
                      <span className="label">
                        {showTeamStaffLabel
                          ? `${labelOfSpecialistTeamStaff(team.team)} Staff`
                          : "Staff"}
                      </span>
                      <button
                        className="button subtle"
                        type="button"
                        onClick={() => addSpecialistStaffRow(team.id)}
                      >
                        + 添加 Staff
                      </button>
                    </div>
                    {(specialistStaffForms[team.id] || [""]).map((email, index) => (
                      <div className="staff-row" key={`${team.id}-staff-${index}`}>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => updateSpecialistStaffRow(team.id, index, e.target.value)}
                          placeholder="staff@firm.com"
                        />
                        {(specialistStaffForms[team.id] || [""]).length > 1 ? (
                          <button
                            className="button icon"
                            type="button"
                            aria-label="删除"
                            onClick={() => removeSpecialistStaffRow(team.id, index)}
                          >
                            ×
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="panel-footer-actions">
                    <button
                      className="button primary"
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveSpecialistStaff(team.id)}
                    >
                      {saving ? "保存中..." : `保存 ${labelOfSpecialistTeamStaff(team.team)} Staff`}
                    </button>
                  </div>
                </div>
              ))}
            </section>
          ) : null}
        </div>

        <div className="members-invite-column">
          <section className="detail-panel">
            <ModuleHeading
              title={PROJECT_SECTION_LABELS.coreMemberInvites.title}
              titleEn={PROJECT_SECTION_LABELS.coreMemberInvites.titleEn}
            />
            <p className="panel-note">演示模式：复制中英双语邀请链接分享给成员。</p>
            <div className="invite-grid single-col">
              {project.members
                .filter((member) => member.status === "active")
                .map((member) => (
                  <InviteCard
                    key={member.id}
                    title={labelOfRole(member.role)}
                    email={member.email}
                    invite={formatMemberInviteMessage(project, member)}
                    onCopy={handleCopy}
                  />
                ))}
            </div>
          </section>

          {isAudit ? (
            <>
              <section className="detail-panel">
                <ModuleHeading
                  title={PROJECT_SECTION_LABELS.specialistLeadInvites.title}
                  titleEn={PROJECT_SECTION_LABELS.specialistLeadInvites.titleEn}
                />
                <div className="invite-grid single-col">
                  {(project.specialistTeams || []).map((team) => (
                    <InviteCard
                      key={team.id}
                      title={`${labelOfSpecialistTeam(team.team)} · ${labelOfSpecialistLeadRole(team.leadRole)}`}
                      email={team.leadEmail}
                      invite={formatSpecialistLeadInviteMessage(project, team)}
                      onCopy={handleCopy}
                    />
                  ))}
                </div>
              </section>

              {(project.specialistTeams || []).length ? (
                <section className="detail-panel">
                  <ModuleHeading
                    title={PROJECT_SECTION_LABELS.specialistStaffInvites.title}
                    titleEn={PROJECT_SECTION_LABELS.specialistStaffInvites.titleEn}
                  />
                  <p className="panel-note">按已勾选专家组分别生成 Staff 邀请链接。</p>
                  {(project.specialistTeams || []).map((team) => (
                    <div className="specialist-invite-group" key={`staff-invite-${team.id}`}>
                      <h4>{labelOfSpecialistTeam(team.team)}</h4>
                      <div className="invite-grid single-col">
                        {(team.staff || [])
                          .filter((member) => member.status === "active")
                          .map((member) => (
                            <InviteCard
                              key={member.id}
                              title={`${labelOfSpecialistTeam(team.team)} Staff`}
                              email={member.email}
                              invite={formatSpecialistStaffInviteMessage(project, team, member)}
                              onCopy={handleCopy}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </section>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
