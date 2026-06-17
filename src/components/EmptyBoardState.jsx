export function EmptyBoardState({ projectName, onGoDetail }) {
  return (
    <section className="empty-board" aria-label="Kanban Awaiting Scope">
      <div className="empty-board-inner">
        <div className="empty-board-icon">Scope</div>
        <h3>Kanban Waiting for Scope</h3>
        <p>
          Scope for project “{projectName}” has not been initialized. Define the audit scope in Project Details before managing tasks and stage progression.
        </p>
        <p className="empty-board-sub">
          Define Scope in Project Details before managing tasks.
        </p>
        <button className="button primary" type="button" onClick={onGoDetail}>
          Go to Project Details
        </button>
      </div>
    </section>
  );
}
