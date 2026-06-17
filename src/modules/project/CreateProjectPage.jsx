import { useState } from "react";
import {
  ENGAGEMENT_TYPES,
  INDUSTRY_GROUPS,
  PROJECT_TYPES,
  TEAMS
} from "../../data/projectConstants";
import { notifyMockInvites } from "./inviteService";
import { createProject } from "./projectStore";
import { validateProjectForm } from "./projectValidation";
import {
  defaultSpecialistForm,
  SPECIALIST_LEAD_ROLES,
  SPECIALIST_TEAMS
} from "./specialistConstants";

const defaultForm = {
  clientName: "",
  name: "",
  team: "ita",
  engagementType: "new",
  projectType: "annual",
  industry: "finance-banking",
  startDate: new Date().toISOString().slice(0, 10),
  reportDate: "",
  partnerEmail: "",
  managerEmail: "",
  inChargeEmail: "",
  smEmail: "",
  staffEmails: [""],
  specialists: defaultSpecialistForm()
};

export function CreateProjectPage({ onCreated, onCancel, onToast }) {
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateStaff(index, value) {
    setForm((current) => {
      const staffEmails = [...current.staffEmails];
      staffEmails[index] = value;
      return { ...current, staffEmails };
    });
  }

  function addStaffRow() {
    setForm((current) => ({
      ...current,
      staffEmails: [...current.staffEmails, ""]
    }));
  }

  function removeStaffRow(index) {
    setForm((current) => ({
      ...current,
      staffEmails: current.staffEmails.filter((_, i) => i !== index)
    }));
  }

  function updateSpecialist(teamId, patch) {
    setForm((current) => ({
      ...current,
      specialists: {
        ...current.specialists,
        [teamId]: { ...current.specialists[teamId], ...patch }
      }
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const check = validateProjectForm(form);
    if (!check.ok) {
      onToast(check.message);
      return;
    }

    setSubmitting(true);
    try {
      const project = createProject(form);
      onCreated(project);

      const inviteCount = project.members.length + (project.specialistTeams?.length || 0);
      notifyMockInvites(onToast, inviteCount);
    } finally {
      setSubmitting(false);
    }
  }

  const showSpecialists = form.team === "audit";

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">New Engagement Setup</p>
          <h2>Create Audit Project</h2>
          <p className="page-lead">
            Enter project information and member emails. Invite links are generated in demo mode, then you will enter Project Details.
          </p>
        </div>
        <button className="button" type="button" onClick={onCancel}>Back to Project List</button>
      </header>

      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-panel">
          <h3>Project Attributes</h3>
          <div className="form-grid two-col">
            <label className="field">
              <span className="label">Team *</span>
              <select value={form.team} onChange={(e) => updateField("team", e.target.value)}>
                {TEAMS.map((item) => (
                  <option key={item.id} value={item.id}>{item.label} · {item.hint}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">Engagement Type Engagement *</span>
              <select
                value={form.engagementType}
                onChange={(e) => updateField("engagementType", e.target.value)}
              >
                {ENGAGEMENT_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">Project Type Type *</span>
              <select
                value={form.projectType}
                onChange={(e) => updateField("projectType", e.target.value)}
              >
                {PROJECT_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} · {item.labelEn}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">Industry Industry *</span>
              <select
                value={form.industry}
                onChange={(e) => updateField("industry", e.target.value)}
              >
                {INDUSTRY_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.items.map((item) => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="field full">
              <span className="label">Client Name Client Name *</span>
              <input
                required
                maxLength="80"
                value={form.clientName}
                onChange={(e) => updateField("clientName", e.target.value)}
                placeholder="Example: ABC Bank Co., Ltd."
              />
            </label>

            <label className="field full">
              <span className="label">Project Name Project Name *</span>
              <input
                required
                maxLength="80"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Example: ABC Bank 2026 IT Audit"
              />
            </label>

            <label className="field">
              <span className="label">Planned Start Date Start Date *</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
              />
            </label>

            <label className="field">
              <span className="label">Report Date Report Date</span>
              <input
                type="date"
                value={form.reportDate}
                onChange={(e) => updateField("reportDate", e.target.value)}
              />
              <span className="field-hint">Optional. Can be added later in Project Details.</span>
            </label>
          </div>
        </div>

        <div className="form-panel">
          <h3>Project Members Members</h3>
          <p className="panel-note">
            Partner email cannot duplicate Manager or In-charge. Invite links will be generated for sharing after creation.
          </p>

          <div className="form-grid two-col">
            <label className="field">
              <span className="label">Partner *</span>
              <input
                type="email"
                value={form.partnerEmail}
                onChange={(e) => updateField("partnerEmail", e.target.value)}
                placeholder="partner@firm.com"
              />
            </label>

            <label className="field">
              <span className="label">Manager *</span>
              <input
                type="email"
                value={form.managerEmail}
                onChange={(e) => updateField("managerEmail", e.target.value)}
                placeholder="manager@firm.com"
              />
            </label>

            <label className="field">
              <span className="label">In-charge *</span>
              <input
                type="email"
                value={form.inChargeEmail}
                onChange={(e) => updateField("inChargeEmail", e.target.value)}
                placeholder="incharge@firm.com"
              />
            </label>

            <label className="field">
              <span className="label">Senior Manager</span>
              <input
                type="email"
                value={form.smEmail}
                onChange={(e) => updateField("smEmail", e.target.value)}
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
            {form.staffEmails.map((email, index) => (
              <div className="staff-row" key={`staff-${index}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => updateStaff(index, e.target.value)}
                  placeholder="staff@firm.com(Optional)"
                />
                {form.staffEmails.length > 1 ? (
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
        </div>

        {showSpecialists ? (
          <div className="form-panel">
            <h3>Specialist Teams</h3>
            <p className="panel-note">
              Audit team projects can invite ITA / Tax / FRM specialist groups. After the Lead accepts the invite, they can add Specialist team staff in Member Management.
            </p>

            <div className="specialist-grid">
              {SPECIALIST_TEAMS.map((item) => {
                const entry = form.specialists[item.id];
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
          </div>
        ) : null}

        <div className="form-actions">
          <button className="button" type="button" onClick={onCancel} disabled={submitting}>Cancel</button>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </section>
  );
}
