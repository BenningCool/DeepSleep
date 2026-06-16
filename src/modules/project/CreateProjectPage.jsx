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
          <h2>创建审计项目</h2>
          <p className="page-lead">
            填写项目基本信息与成员邮箱。创建后生成邀请链接（演示模式），并进入项目详情页。
          </p>
        </div>
        <button className="button" type="button" onClick={onCancel}>返回项目列表</button>
      </header>

      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-panel">
          <h3>项目属性</h3>
          <div className="form-grid two-col">
            <label className="field">
              <span className="label">团队 Team *</span>
              <select value={form.team} onChange={(e) => updateField("team", e.target.value)}>
                {TEAMS.map((item) => (
                  <option key={item.id} value={item.id}>{item.label} · {item.hint}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">项目性质 Engagement *</span>
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
              <span className="label">项目类型 Type *</span>
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
              <span className="label">行业 Industry *</span>
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
              <span className="label">客户名称 Client Name *</span>
              <input
                required
                maxLength="80"
                value={form.clientName}
                onChange={(e) => updateField("clientName", e.target.value)}
                placeholder="例如：某银行股份有限公司"
              />
            </label>

            <label className="field full">
              <span className="label">项目名称 Project Name *</span>
              <input
                required
                maxLength="80"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="例如：某银行 2026 年度 IT 审计"
              />
            </label>

            <label className="field">
              <span className="label">计划开始日期 Start Date *</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
              />
            </label>

            <label className="field">
              <span className="label">项目报告日 Report Date</span>
              <input
                type="date"
                value={form.reportDate}
                onChange={(e) => updateField("reportDate", e.target.value)}
              />
              <span className="field-hint">选填，可稍后在项目详情中补充</span>
            </label>
          </div>
        </div>

        <div className="form-panel">
          <h3>项目成员 Members</h3>
          <p className="panel-note">
            Partner 邮箱不可与 Manager / In-charge 重复。创建后将生成邀请链接供复制分享。
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
            {form.staffEmails.map((email, index) => (
              <div className="staff-row" key={`staff-${index}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => updateStaff(index, e.target.value)}
                  placeholder="staff@firm.com（可选）"
                />
                {form.staffEmails.length > 1 ? (
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
        </div>

        {showSpecialists ? (
          <div className="form-panel">
            <h3>Specialist 团队</h3>
            <p className="panel-note">
              Audit team 项目可邀请 ITA / Tax / FRM 专家组。Lead 接受邀请后进入成员管理页补充 Specialist team staff。
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
          </div>
        ) : null}

        <div className="form-actions">
          <button className="button" type="button" onClick={onCancel} disabled={submitting}>取消</button>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? "创建中..." : "确认创建项目"}
          </button>
        </div>
      </form>
    </section>
  );
}
