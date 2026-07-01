function compactEmail(email) {
  return String(email || "").replace("@firm.com", "");
}

function LoadStat({ label, value, tone = "" }) {
  return (
    <div className={`resource-dispatch-stat ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function RecommendationCard({ item, index, onOpenProgress }) {
  const receiverLabel = item.receiver
    ? compactEmail(item.receiver.email)
    : "EM 升级协调";

  return (
    <article className="resource-dispatch-card">
      <div className="resource-dispatch-card-head">
        <span className="resource-dispatch-rank">建议 {index + 1}</span>
        <span className="resource-dispatch-report">{item.reportLabel}</span>
      </div>

      <div className="resource-dispatch-route">
        <div>
          <span>从</span>
          <strong>{compactEmail(item.source.email)}</strong>
          <small>{item.source.assignedTotal} 个测试点 · 逾期 {item.source.overdue || 0}</small>
        </div>
        <span className="resource-dispatch-arrow">→</span>
        <div>
          <span>协调给</span>
          <strong>{receiverLabel}</strong>
          <small>
            {item.receiver
              ? `${item.receiver.assignedTotal} 个测试点 · 逾期 ${item.receiver.overdue || 0}`
              : "临时加派 / 升级处理"}
          </small>
        </div>
      </div>

      <div className="resource-dispatch-task">
        <strong>{item.task.id} · {item.task.title}</strong>
        <span>{item.project?.clientName || item.project?.name || "未关联项目"}</span>
      </div>

      <p>{item.reason}</p>

      <button
        className="button primary compact"
        type="button"
        onClick={() => onOpenProgress?.({
          projectId: item.project?.id || item.task.projectId,
          controlId: item.task.id
        })}
      >
        查看测试点
      </button>
    </article>
  );
}

export function ResourceDispatchPanel({ insights, onOpenProgress }) {
  if (!insights?.recommendations?.length) return null;

  return (
    <section className="resource-dispatch-panel" aria-label="资源调度驾驶舱">
      <div className="resource-dispatch-head">
        <div>
          <span className="ai-audit-eyebrow">Resource Dispatch · EM Action</span>
          <h3>资源调度驾驶舱</h3>
          <p>识别高负荷成员、可承接成员与报告日前交付风险，给 EM 一组可执行但不自动改派的建议。</p>
        </div>
        <div className="resource-dispatch-stats">
          <LoadStat label="现场成员" value={insights.peopleCount} />
          <LoadStat label="高负荷" value={insights.highLoad} tone="is-hot" />
          <LoadStat label="可承接" value={insights.lowLoad} tone="is-cool" />
          <LoadStat label="逾期测试点" value={insights.totalOverdue} tone="is-hot" />
        </div>
      </div>

      <div className="resource-dispatch-grid">
        {insights.recommendations.map((item, index) => (
          <RecommendationCard
            key={item.id}
            item={item}
            index={index}
            onOpenProgress={onOpenProgress}
          />
        ))}
      </div>
    </section>
  );
}
