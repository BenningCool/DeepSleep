import { useMemo, useState } from "react";
import {
  AI_AUDIT_PROMPTS,
  runAiAuditQuery
} from "./financialAuditContext";
import { formatReportCountdown } from "./commandCenterUtils";
import { labelOfContributorGroup } from "../project/contributorGroup";

function formatControlDue(days) {
  if (days === null) return "未设计划完成日";
  if (days < 0) return `测试点已逾期 ${Math.abs(days)} 天`;
  if (days === 0) return "测试点今天到期";
  return `测试点 D-${days}`;
}

function resultTone(item) {
  if (item.overdue) return "is-overdue";
  if (item.dueDays !== null && item.dueDays <= 7) return "is-warning";
  return "";
}

function ResourceSignal({ item }) {
  return (
    <li>
      <strong>{item.owner}</strong>
      <span>
        {item.projectCount} 个项目 · {item.tasks.length} 个未完成测试点 · {item.overdueCount} 个逾期
      </span>
    </li>
  );
}

function AiResultItem({ item, onOpenProgress }) {
  const { task, project, context, chain } = item;

  return (
    <article className={`ai-audit-result-item ${resultTone(item)}`}>
      <div className="ai-audit-result-head">
        <div>
          <strong>{task.id} · {task.title}</strong>
          <p>
            {project?.clientName || "未关联客户"} · {formatReportCountdown(project?.reportDate)}
          </p>
        </div>
        <span className="ai-audit-due-pill">{formatControlDue(item.dueDays)}</span>
      </div>

      <div className="ai-audit-context-grid">
        <span>科目：{context.financialStatementLine}</span>
        <span>循环：{context.businessCycle}</span>
        <span>断言：{context.assertion}</span>
        <span>系统：{context.itSystem}</span>
      </div>

      <div className="ai-audit-chain" aria-label="Audit to ITA risk chain">
        {chain.map((step, index) => (
          <span key={`${task.id}-${index}`}>{step}</span>
        ))}
      </div>

      <div className="ai-audit-result-actions">
        <span>{labelOfContributorGroup(task.contributorGroup)} · {task.owner || "未分配"}</span>
        <button
          className="button primary compact"
          type="button"
          onClick={() => onOpenProgress?.(project?.id || task.projectId)}
        >
          打开进度看板
        </button>
      </div>
    </article>
  );
}

export function AiAuditCommandPanel({
  projects = [],
  tasks = [],
  onOpenProgress
}) {
  const [query, setQuery] = useState(AI_AUDIT_PROMPTS[0]);
  const [submittedQuery, setSubmittedQuery] = useState(AI_AUDIT_PROMPTS[0]);
  const [expanded, setExpanded] = useState(false);

  const result = useMemo(
    () => runAiAuditQuery(submittedQuery, projects, tasks),
    [projects, submittedQuery, tasks]
  );

  function submitQuery(event) {
    event.preventDefault();
    const nextQuery = query.trim() || AI_AUDIT_PROMPTS[0];
    setQuery(nextQuery);
    setSubmittedQuery(nextQuery);
  }

  function usePrompt(prompt) {
    setQuery(prompt);
    setSubmittedQuery(prompt);
  }

  const primaryProjectId = result.items[0]?.project?.id || result.items[0]?.task?.projectId || "";

  return (
    <section
      className={[
        "ai-audit-command-panel",
        expanded ? "is-expanded" : "is-collapsed"
      ].join(" ")}
      aria-label="AI 审计指挥入口"
    >
      <div className="ai-audit-panel-head">
        <div>
          <span className="ai-audit-eyebrow">AI Copilot · Audit x ITA</span>
          <h3>AI 审计指挥入口</h3>
          <p>用财审语言提问，自动定位 ITA 测试点、报告日风险和资源阻塞。</p>
        </div>
        <div className="ai-audit-head-actions">
          <button
            className="button subtle compact"
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "收起" : "展开"}
          </button>
          <button
            className="button primary compact"
            type="button"
            disabled={!primaryProjectId}
            onClick={() => primaryProjectId && onOpenProgress?.(primaryProjectId)}
          >
            查看最高风险项目
          </button>
        </div>
      </div>

      {!expanded ? (
        <button
          className="ai-audit-collapsed-summary"
          type="button"
          onClick={() => setExpanded(true)}
        >
          <span>当前建议</span>
          <strong>{result.title}</strong>
          <small>{result.summary}</small>
        </button>
      ) : null}

      {expanded ? (
        <>
          <form className="ai-audit-query-form" onSubmit={submitQuery}>
            <label className="ai-audit-query-field">
              <span>自然语言搜索</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="例如：收入循环 IT 控制有哪些风险？"
              />
            </label>
            <button className="button primary" type="submit">
              生成风险摘要
            </button>
          </form>

          <div className="ai-audit-prompt-row" aria-label="推荐问题">
            {AI_AUDIT_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                className={prompt === submittedQuery ? "active" : ""}
                type="button"
                onClick={() => usePrompt(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {expanded ? (
        <div className="ai-audit-answer">
          <div className="ai-audit-answer-summary">
            <span className="ai-audit-answer-label">AI 风险摘要</span>
            <h4>{result.title}</h4>
            <p>{result.summary}</p>
            <div className="ai-audit-answer-grid">
              <div>
                <strong>财审影响</strong>
                <span>{result.auditImpact}</span>
              </div>
              <div>
                <strong>建议行动</strong>
                <span>{result.recommendedAction}</span>
              </div>
            </div>
          </div>

          <div className="ai-audit-results">
            {result.items.map((item) => (
              <AiResultItem
                key={item.task.id}
                item={item}
                onOpenProgress={onOpenProgress}
              />
            ))}
          </div>

          {result.resourceItems.length ? (
            <div className="ai-audit-resource-strip">
              <strong>资源阻塞信号</strong>
              <ul>
                {result.resourceItems.slice(0, 3).map((item) => (
                  <ResourceSignal key={item.owner} item={item} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
