import { useEffect, useMemo, useState } from "react";
import { labelOfRole } from "../../data/projectConstants";
import { sendInvitesToMembers } from "./emailService";
import { formatInviteMessage } from "./inviteUtils";
import {
  getProject,
  membersToForm,
  updateProjectMembers
} from "./projectStore";
import { validateMemberForm } from "./projectValidation";

function InviteCard({ project, member, onCopy }) {
  const invite = formatInviteMessage(project, member);
  const active = member.status === "active";

  return (
    <article className={`invite-card ${active ? "" : "revoked"}`}>
      <div className="invite-card-head">
        <div>
          <span className="role-pill">{labelOfRole(member.role)}</span>
          <strong>{member.email}</strong>
        </div>
        <span className={`status-pill ${active ? "active" : "revoked"}`}>
          {active ? "Active" : "Revoked"}
        </span>
      </div>
      {active ? (
        <div className="invite-actions">
          <button className="button subtle" type="button" onClick={() => onCopy(invite.link)}>
            复制邀请链接
          </button>
        </div>
      ) : null}
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!project) return;
    const form = membersToForm(project.members);
    setMemberForm({
      ...form,
      staffEmails: form.staffEmails.length ? form.staffEmails : [""]
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

  function handleCopy(link) {
    navigator.clipboard.writeText(link).then(() => {
      onToast("邀请链接已复制。");
    }).catch(() => {
      onToast(link);
    });
  }

  async function handleSave() {
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

      if (result.invitedMembers.length) {
        const mailResult = await sendInvitesToMembers(result.project, result.invitedMembers);
        if (mailResult.ok) {
          onToast(`成员已更新，已向 ${mailResult.sent} 位新成员发送邀请邮件。`);
        } else {
          onToast(
            mailResult.message
            || `成员已更新，但 ${mailResult.failed || 0} 封邮件发送失败。`
          );
        }
      } else {
        onToast("成员已更新。");
      }
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
            项目「{project.name}」· 当前 {activeCount} 位活跃成员。
            修改邮箱后点击保存，新成员将收到邀请邮件，被移除成员失去权限。
          </p>
        </div>
      </header>

      <div className="members-layout">
        <section className="detail-panel members-editor">
          <h3>编辑成员邮箱</h3>
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

          <div className="panel-footer-actions sticky-actions">
            <button
              className="button primary"
              type="button"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "保存并发送..." : "保存成员变更"}
            </button>
          </div>
        </section>

        <section className="detail-panel">
          <h3>当前成员与邀请链接</h3>
          <p className="panel-note">Revoked 表示已移除、无项目权限。</p>
          <div className="invite-grid single-col">
            {project.members.map((member) => (
              <InviteCard
                key={member.id}
                project={project}
                member={member}
                onCopy={handleCopy}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
