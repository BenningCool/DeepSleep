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
    onToast(`已应用模板：${preset.label}`);
  }

  function handlePreview(event) {
    event.preventDefault();
    if (!form.projectName.trim()) {
      onToast("请先填写项目名称。");
      return;
    }
    setPreviewTasks(generateScopeTasks(form));
  }

  function handleImport() {
    if (!previewTasks.length) {
      onToast("请先生成 Scope 预览。");
      return;
    }
    const confirmed = window.confirm(
      `将把 ${previewTasks.length} 条初始化任务导入看板，是否继续？`
    );
    if (!confirmed) return;
    onGenerate(previewTasks, form.projectName.trim());
    onToast(`已导入 ${previewTasks.length} 条 Scope 任务，可在看板中查看。`);
    setPreviewTasks([]);
  }

  return (
    <section className="scope-init" aria-label="Scope 初始化">
      <header className="scope-hero">
        <div>
          <h2>审计 Scope 初始化</h2>
          <p>
            选择行业、审计领域、项目类型与关键系统，自动生成约 80% 的初始化任务。
            关键审计步骤在看板中受阶段门禁约束，不可跨步推进。
          </p>
        </div>
        <div className="scope-badges">
          <span className="pill p0">P0 模块</span>
          <span className="pill pc">IT 审计</span>
        </div>
      </header>

      <section className="scope-presets" aria-label="快速模板">
        <span className="label">快速模板</span>
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
          <h3>创建审计项目</h3>

          <label className="field full">
            <span className="label">项目名称</span>
            <input
              required
              maxLength="60"
              value={form.projectName}
              onChange={(event) => updateField("projectName", event.target.value)}
              placeholder="例如：某银行 2026 年度 ITGC 审计"
            />
          </label>

          <label className="field">
            <span className="label">行业</span>
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
            <span className="label">审计领域</span>
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
            <span className="label">项目类型</span>
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
            <span className="label">项目负责人</span>
            <input
              value={form.owner}
              onChange={(event) => updateField("owner", event.target.value)}
              placeholder="例如：审计经理"
            />
          </label>

          <label className="field">
            <span className="label">计划开始日期</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
            />
          </label>

          <div className="field full">
            <span className="label">关键系统（可多选）</span>
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
            <strong>当前 Scope 组合</strong>
            <p>{summary.industryLabel}</p>
            <p>{summary.auditDomainLabel}</p>
            <p>{summary.projectTypeLabel}</p>
            <p>{summary.systemsLabel}</p>
          </div>

          <div className="scope-actions full">
            <button className="button primary" type="submit">生成 Scope 预览</button>
            {previewTasks.length ? (
              <button className="button" type="button" onClick={handleImport}>
                导入看板（{previewTasks.length} 条）
              </button>
            ) : null}
          </div>
        </form>

        <aside className="scope-preview">
          <div className="scope-preview-head">
            <h3>初始化任务清单</h3>
            {previewTasks.length ? (
              <div className="scope-stats">
                <ScopeStat value={`${stats.coverage}%`} label="自动化覆盖" />
                <ScopeStat value={stats.total} label="任务数" />
                <ScopeStat value={stats.criticalCount} label="关键步骤" />
                <ScopeStat value={stats.p0Count} label="P0 任务" />
              </div>
            ) : null}
          </div>

          <section className="scope-workflow" aria-label="审计阶段路径">
            <span className="label">审计阶段路径</span>
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
            <p className="scope-workflow-note">橙色节点为关键步骤，看板中不可跨列跳转。</p>
          </section>

          {previewTasks.length ? (
            <div className="scope-phase-groups">
              {groupedTasks.map((group) => (
                <section className="scope-phase-group" key={group.phase}>
                  <header className="scope-phase-header">
                    <h4>{group.label}</h4>
                    <span>{group.tasks.length} 项</span>
                  </header>
                  <ul className="scope-task-list">
                    {group.tasks.map((task) => (
                      <li key={task.id} className="scope-task-item">
                        <div className="scope-task-head">
                          <span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                          {task.scopeCritical ? <span className="pill critical">关键</span> : null}
                          {task.systemScoped ? <span className="pill backend">系统</span> : null}
                        </div>
                        <strong>{task.title}</strong>
                        <p>{task.description.split("\n")[0]}</p>
                        <span className="scope-task-meta">
                          截止 {task.due} · {task.owner}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <div className="scope-empty">
              填写左侧表单并点击「生成 Scope 预览」，将按审计阶段分组展示任务清单。
            </div>
          )}

          <section className="scope-rules-card">
            <h4>阶段门禁规则</h4>
            <ul>
              <li>关键步骤不可跨列跳转，须按看板阶段逐步推进。</li>
              <li>推进任务前，同项目内更早阶段的关键步骤须先达到相同或更后阶段。</li>
              <li>选择关键系统后，自动追加对应系统的控制测试任务。</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
