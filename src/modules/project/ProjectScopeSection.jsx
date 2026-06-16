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
    onToast(`已应用模板：${preset.label}`);
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
      onToast("未能生成 Scope 任务，请检查配置。");
      return;
    }

    const message = scopeDefined
      ? `将替换当前项目已生成的 ${existingTaskCount} 条 Scope 任务，是否继续？`
      : `将生成 ${tasks.length} 条控制点任务并解锁工作台 / 看板 / 进度，是否继续？`;

    if (!window.confirm(message)) return;

    onGenerate(tasks);
    setPreviewTasks([]);
    setEditing(false);
    onToast(`已生成 ${tasks.length} 个控制点，相关模块已解锁。`);
  }

  if (scopeDefined && !editing && !previewTasks.length) {
    return (
      <div className="scope-defined-panel">
        <div className="scope-panel-head">
          <h3>Scope</h3>
          <span className="status-pill active">Defined</span>
        </div>
        <p className="panel-note">
          已生成 {existingTaskCount} 个控制点。可在看板推进执行、在工作台记录测试，在进度页查看整体健康度。
        </p>
        <div className="scope-defined-actions">
          <button className="button" type="button" onClick={() => setEditing(true)}>重新配置 Scope</button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-scope-section">
      <div className="scope-panel-head">
        <h3>Scope 初始化</h3>
        <span className={`status-pill ${scopeDefined ? "active" : "pending"}`}>
          {scopeDefined ? "Defined" : "Pending"}
        </span>
      </div>

      <p className="panel-note">
        选择审计领域与关键系统，自动生成控制点清单。生成后解锁工作台、看板与进度。
      </p>

      <div className="scope-locked-meta">
        <span>{project.clientName || project.name}</span>
        <span>{labelOfProjectType(project.projectType)}</span>
        <span>{labelOfIndustry(project.industry)}</span>
        <span>负责人默认 {owner || "未设置"}</span>
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
          <span className="label">审计领域</span>
          <select value={auditDomain} onChange={(e) => { setAuditDomain(e.target.value); setPreviewTasks([]); }}>
            {AUDIT_DOMAINS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="field full">
        <span className="label">关键系统</span>
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
          <p>预览 {stats.total} 项 · 关键步骤 {stats.criticalCount}</p>
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
            取消
          </button>
        ) : null}
        <button className="button" type="button" onClick={handlePreview}>预览任务</button>
        <button className="button primary" type="button" onClick={handleGenerate}>
          {scopeDefined ? "重新生成 Scope" : "生成 Scope"}
        </button>
      </div>
    </div>
  );
}
