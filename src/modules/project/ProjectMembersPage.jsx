import { useEffect, useMemo, useRef, useState } from "react";
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
        <p><strong>Chinese</strong></p>
        <pre>{invite.zh}</pre>
        <p><strong>English</strong></p>
        <pre>{invite.en}</pre>
      </div>
      <div className="invite-actions">
        <button className="button subtle" type="button" onClick={() => onCopy(invite.link)}>
          Copy Invite Link
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
          <h3>Project Not Found</h3>
          <button className="button primary" type="button" onClick={onBack}>Back to List</button>
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
      onToast("Invite link copied.");
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
        onToast("Member update failed.");
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
      const names = removedWithStaff.map((team) => labelOfSpecialistTeam(team.team)).join(", ");
      const confirmed = window.confirm(
        `Disabling will remove ${names} and their staff configuration. Continue?`
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      const result = updateProjectSpecialists(projectId, { specialists: specialistForm });
      if (!result) {
        onToast("Specialist update failed.");
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
        onToast("Specialist team staff update failed.");
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
          <p className="page-eyebrow">Member Management</p>
          <h2>Member Management</h2>
          <p className="page-lead">
            Project “{project.name}” · {activeCount} current core member(s).
            After editing emails and saving, invite links will be generated for new members in demo mode.
          </p>
        </div>
      </header>

      {focusedTeam ? (
        <div className="members-lead-callout">
          <strong>Specialist Lead Onboarding</strong>
          <p>
            You joined as {labelOfSpecialistLeadRole(focusedTeam.leadRole)} of {labelOfSpecialistTeam(focusedTeam.team)}.
            Add staff for this team in the <strong>Specialist team staff</strong> section below.
          </p>
        </div>
      ) : null}

      <div className="members-page-grid">
        <div className="members-edit-column">
          <section className="detail-panel members-editor">
            <h3>Edit Core Members</h3>
            <p className="panel-note">
              Partner cannot duplicate Manager / In-charge. Manager and In-charge may be the same.
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
                  placeholder="Optional"
                />
              </label>
            </div>

            <div className="staff-block">
              <div className="staff-head">
                <span className="label">Staff</span>
                <button className="button subtle" type="button" onClick={addStaffRow}>
                  + Add Staff
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
                      aria-label="Delete"
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
                {saving ? "Saving..." : "Save Core Members"}
              </button>
            </div>
          </section>

          {isAudit ? (
            <section className="detail-panel members-editor">
              <h3>Specialist Teams</h3>
              <p className="panel-note">
                Only Audit team projects can be configured. Select ITA / Tax / FRM specialist groups and assign Leads.
                After Leads accept invites, specialist team staff can be added on this page.
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
                            <span className="label">Lead Role *</span>
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
                            <span className="label">Lead Email *</span>
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
                  {saving ? "Saving..." : "Save Specialist Configuration"}
                </button>
              </div>
            </section>
          ) : null}

          {isAudit && specialistTeamsForStaff.length ? (
            <section
              className="detail-panel members-editor specialist-staff-panel"
              id="specialist-team-staff"
            >
              <h3>Specialist team staff</h3>
              <p className="panel-note">
                {focusedTeam
                  ? `Add staff for ${labelOfSpecialistTeamStaff(focusedTeam.team)}. Invite links will be generated after saving.`
                  : "Staff can be added here for selected specialist groups (ITA / Tax / FRM) in Audit team projects. Leads can fill this page after accepting invites; project admins can also fill it on their behalf."}
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
                        + Add Staff
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
                            aria-label="Delete"
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
                      {saving ? "Saving..." : `Save ${labelOfSpecialistTeamStaff(team.team)} Staff`}
                    </button>
                  </div>
                </div>
              ))}
            </section>
          ) : null}
        </div>

        <div className="members-invite-column">
          <section className="detail-panel">
            <h3>Core Member Invites</h3>
            <p className="panel-note">Demo mode: copy bilingual invite links and share them with members.</p>
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
                <h3>Specialist Lead Invites</h3>
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
                  <h3>Specialist Team Staff Invites</h3>
                  <p className="panel-note">Generate staff invite links by selected specialist group.</p>
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
