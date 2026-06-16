export function ScopeGateState({ title, onGoScope }) {
  return (
    <section className="scope-gate" aria-label="Scope 门禁">
      <div className="scope-gate-inner">
        <div className="scope-gate-icon">Scope</div>
        <h3>{title}</h3>
        <p>请先在项目概览中初始化审计范围与控制点清单。</p>
        <p className="scope-gate-sub">Scope 明确后，工作台、看板与进度将自动解锁。</p>
        <button className="button primary" type="button" onClick={onGoScope}>
          前往生成 Scope
        </button>
      </div>
    </section>
  );
}
