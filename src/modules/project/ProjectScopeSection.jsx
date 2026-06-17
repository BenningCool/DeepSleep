import { useMemo, useState } from "react";
import { labelOfIndustry, labelOfProjectType } from "../../data/projectConstants";
import {
  AUDIT_DOMAINS,
  QUICK_PRESETS,
  buildScopeSummary,
  computeScopeStats,
  generateScopeTasks
} from "../scope-init/scopeTemplates";
import { WORKFLOW_STEPS } from "../scope-init/scopeRules";
import { KEY_SYSTEMS } from "../scope-init/scopeSystems";
import {
  resolveScopeIndustry,
  resolveScopeIndustryLabel,
  resolveScopeProjectType
} from "../scope-init/scopeProjectMapping";
import { getDefaultOwnerEmail } from "./projectStore";

export function ProjectScopeSection({
  project,
  existingTaskCount = 0,
  startTaskId = 200,
  onGenerate,
  onToast
}) {
  const [auditDomain, setAuditDomain] = useState("itgc");
  const [systems, setSystems] = useState([]);
  const [previewTasks, setPreviewTasks] = useState([]);
  const scopeDefined = project.scopeStatus === "defined";
  const [editing, setEditing] = useState(!scopeDefined);

  const scopeIndustry = resolveScopeIndustry(project.industry);
  const scopeProjectType = resolveScopeProjectType(project.projectType);
  const scopeIndustryLabel = resolveScopeIndustryLabel(project);

  const owner = getDefaultOwnerEmail(project);
  const summary = useMemo(() => buildScopeSummary({
    industry: scopeIndustry || "finance",
    industryLabel: scopeIndustryLabel || undefined,
    auditDomain,
    projectType: scopeProjectType,
    systems
  }), [scopeIndustry, scopeIndustryLabel, auditDomain, scopeProjectType, systems]);

  const stats = useMemo(() => computeScopeStats(previewTasks), [previewTasks]);

  function toggleSystem(systemId) {
    setSystems((current) => (
      current.includes(systemId)
        ? current.filter((id) => id !== systemId)
        : [...current, systemId]
    ));
    setPreviewTasks([]);
  }

  function applyPreset(preset) {
    setAuditDomain(preset.form.auditDomain);
    setSystems(preset.form.systems || []);
    setPreviewTasks([]);
    onToast(`Applied template: ${preset.label}`);
  }

  function buildForm() {
    return {
      projectName: project.name,
      industry: scopeIndustry,
      industryLabel: scopeIndustryLabel || undefined,
      auditDomain,
      projectType: scopeProjectType,
      systems,
      owner,
      startDate: project.startDate
    };
  }

  function scopeOptions() {
    return {
      startId: startTaskId,
      projectId: project.id,
      specialistTeams: project.specialistTeams || []
    };
  }

  function handlePreview() {
    setPreviewTasks(generateScopeTasks(buildForm(), scopeOptions()));
  }

  function handleGenerate() {
    const tasks = previewTasks.length
      ? previewTasks
      : generateScopeTasks(buildForm(), scopeOptions());

    if (!tasks.length) {
      onToast("Unable to generate Scope tasks. Check the configuration.");
      return;
    }

    const message = scopeDefined
      ? `Replace the ${existingTaskCount} Scope task(s) already generated for this project?`
      : `Generate ${tasks.length} control task(s) and unlock Workspace / Kanban / Progress Board?`;

    if (!window.confirm(message)) return;

    onGenerate(tasks);
    setPreviewTasks([]);
    setEditing(false);
    onToast(`Generated ${tasks.length} control(s). Related modules are now unlocked.`);
  }

  if (scopeDefined && !editing && !previewTasks.length) {
    return (
      <div className="scope-defined-panel">
        <div className="scope-panel-head">
          <h3>Scope</h3>
          <span className="status-pill active">Defined</span>
        </div>
        <p className="panel-note">
          {existingTaskCount} control(s) have been generated. Use Kanban to move execution, Workspace to document testing, and Progress Board to monitor overall health.
        </p>
        <div className="scope-defined-actions">
          <button className="button" type="button" onClick={() => setEditing(true)}>Reconfigure Scope</button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-scope-section">
      <div className="scope-panel-head">
        <h3>Scope Initialization</h3>
        <span className={`status-pill ${scopeDefined ? "active" : "pending"}`}>
          {scopeDefined ? "Defined" : "Pending"}
        </span>
      </div>

      <p className="panel-note">
        Select audit domain and key systems to automatically generate the control list. After generation, Workspace, Kanban, and Progress Board are unlocked.
      </p>

      <div className="scope-locked-meta">
        <span>{project.clientName || project.name}</span>
        <span>{labelOfProjectType(project.projectType)}</span>
        <span>{labelOfIndustry(project.industry)}</span>
        <span>Default owner {owner || "Not set"}</span>
      </div>

      <div className="scope-presets compact">
        {QUICK_PRESETS.map((preset) => (
          <button key={preset.id} className="button subtle" type="button" onClick={() => applyPreset(preset)}>
            {preset.label}
          </button>
        ))}
      </div>

      <div className="scope-form-grid compact">
        <label className="field">
          <span className="label">Audit Domain</span>
          <select value={auditDomain} onChange={(e) => { setAuditDomain(e.target.value); setPreviewTasks([]); }}>
            {AUDIT_DOMAINS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="field full">
        <span className="label">Key Systems</span>
        <div className="scope-system-grid compact">
          {KEY_SYSTEMS.map((system) => (
            <button
              key={system.id}
              type="button"
              className={`scope-system ${systems.includes(system.id) ? "selected" : ""}`}
              onClick={() => toggleSystem(system.id)}
            >
              <strong>{system.label}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="scope-summary-card compact">
        <strong>{summary.auditDomainLabel}</strong>
        <p>{summary.systemsLabel}</p>
        {previewTasks.length ? (
          <p>Preview {stats.total} items · Critical Steps {stats.criticalCount}</p>
        ) : null}
      </div>

      <div className="scope-workflow-track compact">
        {WORKFLOW_STEPS.map((step) => (
          <span key={step.id} className={`scope-workflow-node ${step.critical ? "critical" : ""}`}>
            {step.label}
          </span>
        ))}
      </div>

      <div className="panel-footer-actions">
        {scopeDefined ? (
          <button className="button" type="button" onClick={() => { setEditing(false); setPreviewTasks([]); }}>
            Cancel
          </button>
        ) : null}
        <button className="button" type="button" onClick={handlePreview}>Preview Tasks</button>
        <button className="button primary" type="button" onClick={handleGenerate}>
          {scopeDefined ? "Regenerate Scope" : "Generate Scope"}
        </button>
      </div>
    </div>
  );
}
