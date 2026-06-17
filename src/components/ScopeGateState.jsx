export function ScopeGateState({ title, onGoScope }) {
  return (
    <section className="scope-gate" aria-label="Scope Gate">
      <div className="scope-gate-inner">
        <div className="scope-gate-icon">Scope</div>
        <h3>{title}</h3>
        <p>Initialize audit scope and control list in Project Overview first.</p>
        <p className="scope-gate-sub">After scope is defined, Workspace, Kanban, and Progress Board unlock automatically.</p>
        <button className="button primary" type="button" onClick={onGoScope}>
          Generate Scope
        </button>
      </div>
    </section>
  );
}
