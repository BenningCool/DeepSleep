import { useEffect, useMemo, useState } from "react";
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
  onBack,
  onToast,
  onProjectChange
}) {
  const project = useMemo(() => getProject(projectId), [projectId, refreshToken]);

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
        onToast("Specialist Staff 更新失败。");
        return;
      }

      refresh();
      notifyMockInvites(onToast, result.invitedStaff.length);
    } finally {
      setSaving(false);
    }
  }

  const activeCount = project.members.filter((member) => member.status === "active").length;

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Member Management</p>
          <h2>成员管理</h2>
          <p className="page-lead">
            项目「{project.name}」· 当前 {activeCount} 位核心成员。
            修改邮箱后保存，新成员将生成邀请链接（演示模式）。
          </p>
        </div>
      </header>

      <div className="members-layout">
        <section className="detail-panel members-editor">
          <h3>编辑核心成员</h3>
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

        <section className="detail-panel">
          <h3>核心成员邀请</h3>
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
      </div>

      {isAudit ? (
        <>
          <div className="members-layout">
            <section className="detail-panel members-editor">
              <h3>Specialist 团队</h3>
              <p className="panel-note">
                创建后可随时增删改：勾选/取消 ITA、Tax、FRM 专家组，修改 Lead 角色与邮箱后点击保存。
                更换 Lead 邮箱将清空该组 Staff 并生成新邀请链接。
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

            <section className="detail-panel">
              <h3>Specialist Lead 邀请</h3>
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
          </div>

          {(project.specialistTeams || []).map((team) => (
            <div className="members-layout" key={`staff-${team.id}`}>
              <section className="detail-panel members-editor">
                <h3>{labelOfSpecialistTeam(team.team)} Staff</h3>
                <p className="panel-note">
                  管理员可代填，或由 Lead 通过邀请链接自行补充。
                </p>

                <div className="staff-block">
                  <div className="staff-head">
                    <span className="label">Staff</span>
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
                    {saving ? "保存中..." : `保存 ${labelOfSpecialistTeam(team.team)} Staff`}
                  </button>
                </div>
              </section>

              <section className="detail-panel">
                <h3>{labelOfSpecialistTeam(team.team)} Staff 邀请</h3>
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
              </section>
            </div>
          ))}
        </>
      ) : null}
    </section>
  );
}
