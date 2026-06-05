import { useMemo, useState } from "react";
import {
  AUDIT_DOMAINS,
  INDUSTRIES,
  PROJECT_TYPES,
  buildScopeSummary,
  generateScopeTasks
} from "./scopeTemplates";
import { CRITICAL_PHASE_LABELS } from "./scopeRules";

const emptyForm = {
  projectName: "",
  industry: "finance",
  auditDomain: "itgc",
  projectType: "annual",
  owner: "",
  startDate: new Date().toISOString().slice(0, 10)
};

function OptionHint({ options, value }) {
  const hint = options.find((item) => item.id === value)?.hint;
  if (!hint) return null;
  return <p className="scope-hint">{hint}</p>;
}

export function ScopeInitPanel({ onGenerate, onToast }) {
  const [form, setForm] = useState(emptyForm);
  const [previewTasks, setPreviewTasks] = useState([]);

  const summary = useMemo(() => buildScopeSummary(form), [form]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
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
            选择行业、审计领域与项目类型，自动生成约 80% 的初始化任务。
            关键审计步骤在看板中不可跨阶段跳过。
          </p>
        </div>
        <div className="scope-badges">
          <span className="pill p0">P0 模块</span>
          <span className="pill pc">IT 审计</span>
        </div>
      </header>

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

          <div className="scope-summary-card full">
            <strong>当前 Scope 组合</strong>
            <p>{summary.industryLabel}</p>
            <p>{summary.auditDomainLabel}</p>
            <p>{summary.projectTypeLabel}</p>
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
          <h3>初始化任务清单</h3>
          {previewTasks.length ? (
            <ul className="scope-task-list">
              {previewTasks.map((task) => (
                <li key={task.id} className="scope-task-item">
                  <div className="scope-task-head">
                    <span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                    {task.scopeCritical ? <span className="pill critical">关键步骤</span> : null}
                    <span className="scope-phase">
                      {CRITICAL_PHASE_LABELS[task.auditPhase] || task.auditPhase}
                    </span>
                  </div>
                  <strong>{task.title}</strong>
                  <p>{task.description.split("\n")[0]}</p>
                  <span className="scope-task-meta">
                    {task.id} · 截止 {task.due} · {task.owner}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="scope-empty">
              填写左侧表单并点击「生成 Scope 预览」，将在此展示自动生成的任务清单。
            </div>
          )}

          <section className="scope-rules-card">
            <h4>关键步骤规则</h4>
            <ul>
              <li>Scope 生成的任务默认标记为关键审计步骤。</li>
              <li>看板拖拽或修改状态时，不可跳过中间阶段列。</li>
              <li>允许将任务退回到更早阶段（例如复核发现问题需返工）。</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
