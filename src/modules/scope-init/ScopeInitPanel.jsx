import { useEffect, useMemo, useState } from "react";
import {
  AUDIT_DOMAINS,
  INDUSTRIES,
  PROJECT_TYPES,
  QUICK_PRESETS,
  buildScopeSummary,
  computeScopeStats,
  generateScopeTasks,
  loadScopeDraft,
  saveScopeDraft
} from "./scopeTemplates";
import { WORKFLOW_STEPS, groupTasksByPhase } from "./scopeRules";
import { KEY_SYSTEMS } from "./scopeSystems";

const defaultForm = {
  projectName: "",
  industry: "finance",
  auditDomain: "itgc",
  projectType: "annual",
  systems: [],
  owner: "",
  startDate: new Date().toISOString().slice(0, 10)
};

function OptionHint({ options, value }) {
  const hint = options.find((item) => item.id === value)?.hint;
  if (!hint) return null;
  return <p className="scope-hint">{hint}</p>;
}

function ScopeStat({ value, label }) {
  return (
    <div className="scope-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function ScopeInitPanel({ onGenerate, onToast }) {
  const [form, setForm] = useState(() => loadScopeDraft() || defaultForm);
  const [previewTasks, setPreviewTasks] = useState([]);
  const [activePreset, setActivePreset] = useState("");

  const summary = useMemo(() => buildScopeSummary(form), [form]);
  const stats = useMemo(() => computeScopeStats(previewTasks), [previewTasks]);
  const groupedTasks = useMemo(() => groupTasksByPhase(previewTasks), [previewTasks]);

  useEffect(() => {
    saveScopeDraft(form);
  }, [form]);

  function updateField(name, value) {
    setActivePreset("");
    setForm((current) => ({ ...current, [name]: value }));
    setPreviewTasks([]);
  }

  function toggleSystem(systemId) {
    setActivePreset("");
    setForm((current) => {
      const systems = current.systems.includes(systemId)
        ? current.systems.filter((id) => id !== systemId)
        : [...current.systems, systemId];
      return { ...current, systems };
    });
    setPreviewTasks([]);
  }

  function applyPreset(preset) {
    setForm({
      ...defaultForm,
      ...preset.form,
      owner: form.owner,
      startDate: form.startDate
    });
    setActivePreset(preset.id);
    setPreviewTasks([]);
    onToast(`Applied template: ${preset.label}`);
  }

  function handlePreview(event) {
    event.preventDefault();
    if (!form.projectName.trim()) {
      onToast("Enter a project name first.");
      return;
    }
    setPreviewTasks(generateScopeTasks(form));
  }

  function handleImport() {
    if (!previewTasks.length) {
      onToast("Generate a Scope preview first.");
      return;
    }
    const confirmed = window.confirm(
      `Import ${previewTasks.length} initialization task(s) into Kanban?`
    );
    if (!confirmed) return;
    onGenerate(previewTasks, form.projectName.trim());
    onToast(`Imported ${previewTasks.length} Scope task(s). You can view them in Kanban.`);
    setPreviewTasks([]);
  }

  return (
    <section className="scope-init" aria-label="Scope Initialization">
      <header className="scope-hero">
        <div>
          <h2>Audit Scope Initialization</h2>
          <p>
            Select industry, audit domain, project type, and key systems to automatically generate about 80% of setup tasks.
            Critical audit steps are controlled by stage gates in the Kanban and cannot skip stages.
          </p>
        </div>
        <div className="scope-badges">
          <span className="pill p0">P0 Module</span>
          <span className="pill pc">IT Audit</span>
        </div>
      </header>

      <section className="scope-presets" aria-label="Quick Templates">
        <span className="label">Quick Templates</span>
        <div className="scope-preset-list">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={`scope-preset ${activePreset === preset.id ? "active" : ""}`}
              type="button"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <div className="scope-layout">
        <form className="scope-form" onSubmit={handlePreview}>
          <h3>Create Audit Project</h3>

          <label className="field full">
            <span className="label">Project Name</span>
            <input
              required
              maxLength="60"
              value={form.projectName}
              onChange={(event) => updateField("projectName", event.target.value)}
              placeholder="Example: ABC Bank 2026 ITGC Audit"
            />
          </label>

          <label className="field">
            <span className="label">Industry</span>
            <select
              value={form.industry}
              onChange={(event) => updateField("industry", event.target.value)}
            >
              {INDUSTRIES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            <OptionHint options={INDUSTRIES} value={form.industry} />
          </label>

          <label className="field">
            <span className="label">Audit Domain</span>
            <select
              value={form.auditDomain}
              onChange={(event) => updateField("auditDomain", event.target.value)}
            >
              {AUDIT_DOMAINS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            <OptionHint options={AUDIT_DOMAINS} value={form.auditDomain} />
          </label>

          <label className="field">
            <span className="label">Project Type</span>
            <select
              value={form.projectType}
              onChange={(event) => updateField("projectType", event.target.value)}
            >
              {PROJECT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            <OptionHint options={PROJECT_TYPES} value={form.projectType} />
          </label>

          <label className="field">
            <span className="label">Project Owner</span>
            <input
              value={form.owner}
              onChange={(event) => updateField("owner", event.target.value)}
              placeholder="Example: Audit Manager"
            />
          </label>

          <label className="field">
            <span className="label">Planned Start Date</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
            />
          </label>

          <div className="field full">
            <span className="label">Key Systems (multi-select)</span>
            <div className="scope-system-grid">
              {KEY_SYSTEMS.map((system) => {
                const selected = form.systems.includes(system.id);
                return (
                  <button
                    key={system.id}
                    type="button"
                    className={`scope-system ${selected ? "selected" : ""}`}
                    onClick={() => toggleSystem(system.id)}
                    title={system.hint}
                  >
                    <strong>{system.label}</strong>
                    <span>{system.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="scope-summary-card full">
            <strong>Current Scope Mix</strong>
            <p>{summary.industryLabel}</p>
            <p>{summary.auditDomainLabel}</p>
            <p>{summary.projectTypeLabel}</p>
            <p>{summary.systemsLabel}</p>
          </div>

          <div className="scope-actions full">
            <button className="button primary" type="submit">Generate Scope Preview</button>
            {previewTasks.length ? (
              <button className="button" type="button" onClick={handleImport}>
                Import to Kanban ({previewTasks.length} item(s))
              </button>
            ) : null}
          </div>
        </form>

        <aside className="scope-preview">
          <div className="scope-preview-head">
            <h3>Initial Task List</h3>
            {previewTasks.length ? (
              <div className="scope-stats">
                <ScopeStat value={`${stats.coverage}%`} label="Automation Coverage" />
                <ScopeStat value={stats.total} label="Tasks" />
                <ScopeStat value={stats.criticalCount} label="Critical Steps" />
                <ScopeStat value={stats.p0Count} label="P0 Tasks" />
              </div>
            ) : null}
          </div>

          <section className="scope-workflow" aria-label="Audit Stage Path">
            <span className="label">Audit Stage Path</span>
            <div className="scope-workflow-track">
              {WORKFLOW_STEPS.map((step, index) => (
                <div className="scope-workflow-step" key={step.id}>
                  <div className={`scope-workflow-node ${step.critical ? "critical" : ""}`}>
                    {step.label}
                  </div>
                  {index < WORKFLOW_STEPS.length - 1 ? (
                    <div className="scope-workflow-line" />
                  ) : null}
                </div>
              ))}
            </div>
            <p className="scope-workflow-note">Orange nodes are critical steps and cannot skip columns in Kanban.</p>
          </section>

          {previewTasks.length ? (
            <div className="scope-phase-groups">
              {groupedTasks.map((group) => (
                <section className="scope-phase-group" key={group.phase}>
                  <header className="scope-phase-header">
                    <h4>{group.label}</h4>
                    <span>{group.tasks.length} items</span>
                  </header>
                  <ul className="scope-task-list">
                    {group.tasks.map((task) => (
                      <li key={task.id} className="scope-task-item">
                        <div className="scope-task-head">
                          <span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                          {task.scopeCritical ? <span className="pill critical">Critical</span> : null}
                          {task.systemScoped ? <span className="pill backend">System</span> : null}
                        </div>
                        <strong>{task.title}</strong>
                        <p>{task.description.split("\n")[0]}</p>
                        <span className="scope-task-meta">
                          Due {task.due} · {task.owner}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <div className="scope-empty">
              Complete the form on the left and click Generate Scope Preview to show tasks grouped by audit stage.
            </div>
          )}

          <section className="scope-rules-card">
            <h4>Stage Gate Rules</h4>
            <ul>
              <li>Critical steps cannot skip columns and must move through Kanban stages sequentially.</li>
              <li>Before moving a task forward, earlier critical steps in the same project must reach the same or a later stage.</li>
              <li>Selecting key systems automatically adds corresponding system control testing tasks.</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
