import { useEffect, useMemo, useState } from "react";
import { labelOfTeam } from "../../data/projectConstants";
import { notifyMockInvites } from "./inviteService";
import { formatSpecialistLeadInviteMessage } from "./inviteUtils";
import {
  getProject,
  specialistStaffToForm,
  updateSpecialistStaff
} from "./projectStore";
import { validateSpecialistStaffForm } from "./projectValidation";
import { labelOfSpecialistLeadRole, labelOfSpecialistTeam } from "./specialistConstants";

export function SpecialistStaffPage({
  projectId,
  specialistTeamId,
  refreshToken = 0,
  onDone,
  onToast,
  onProjectChange
}) {
  const project = useMemo(() => getProject(projectId), [projectId, refreshToken]);
  const specialistTeam = useMemo(
    () => (project?.specialistTeams || []).find((team) => team.id === specialistTeamId) || null,
    [project, specialistTeamId]
  );

  const [staffEmails, setStaffEmails] = useState([""]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!specialistTeam) return;
    setStaffEmails(specialistStaffToForm(specialistTeam));
  }, [specialistTeam]);

  if (!project || !specialistTeam) {
    return (
      <section className="page-shell">
        <div className="empty-state large">
          <h3>邀请链接无效或已过期</h3>
          <button className="button primary" type="button" onClick={onDone}>返回项目</button>
        </div>
      </section>
    );
  }

  function refresh() {
    onProjectChange(getProject(projectId));
  }

  function updateStaff(index, value) {
    setStaffEmails((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  function addStaffRow() {
    setStaffEmails((current) => [...current, ""]);
  }

  function removeStaffRow(index) {
    setStaffEmails((current) => current.filter((_, i) => i !== index));
  }

  function handleCopy() {
    const invite = formatSpecialistLeadInviteMessage(project, specialistTeam);
    navigator.clipboard.writeText(invite.link).then(() => {
      onToast("邀请链接已复制。");
    }).catch(() => {
      onToast(invite.link);
    });
  }

  function handleSave() {
    const emails = staffEmails.map((email) => email.trim()).filter(Boolean);
    const check = validateSpecialistStaffForm(emails);
    if (!check.ok) {
      onToast(check.message);
      return;
    }

    setSaving(true);
    try {
      const result = updateSpecialistStaff(projectId, specialistTeam.id, emails);
      if (!result) {
        onToast("保存失败。");
        return;
      }

      refresh();
      notifyMockInvites(onToast, result.invitedStaff.length);
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Specialist Onboarding</p>
          <h2>补充 {labelOfSpecialistTeam(specialistTeam.team)} Staff</h2>
          <p className="page-lead">
            项目「{project.name}」· {project.clientName || "未填写客户"} ·
            {" "}
            {labelOfTeam(project.team)} ·
            {" "}
            您以 {labelOfSpecialistLeadRole(specialistTeam.leadRole)} 身份受邀。
          </p>
        </div>
      </header>

      <div className="detail-panel specialist-onboarding">
        <h3>填写本组 Staff 邮箱</h3>
        <p className="panel-note">
          保存后将为本组 Staff 生成邀请链接（演示模式）。您也可以先复制链接自行分享。
        </p>

        <div className="staff-block">
          <div className="staff-head">
            <span className="label">Staff</span>
            <button className="button subtle" type="button" onClick={addStaffRow}>
              + 添加 Staff
            </button>
          </div>
          {staffEmails.map((email, index) => (
            <div className="staff-row" key={`specialist-staff-${index}`}>
              <input
                type="email"
                value={email}
                onChange={(e) => updateStaff(index, e.target.value)}
                placeholder="staff@firm.com"
              />
              {staffEmails.length > 1 ? (
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
          <button className="button" type="button" onClick={handleCopy}>复制 Lead 邀请链接</button>
          <button
            className="button primary"
            type="button"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "保存中..." : "保存并生成 Staff 邀请"}
          </button>
        </div>
      </div>
    </section>
  );
}
