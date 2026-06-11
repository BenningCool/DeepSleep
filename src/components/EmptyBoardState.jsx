export function EmptyBoardState({ projectName, onGoDetail }) {
  return (
    <section className="empty-board" aria-label="看板待 Scope">
      <div className="empty-board-inner">
        <div className="empty-board-icon">Scope</div>
        <h3>看板等待 Scope 明确</h3>
        <p>
          项目「{projectName}」的 Scope 尚未初始化。请先在项目详情中明确审计范围，
          再开始任务管理与阶段推进。
        </p>
        <p className="empty-board-sub">
          请先在项目详情中明确 Scope，再开始任务管理。
        </p>
        <button className="button primary" type="button" onClick={onGoDetail}>
          前往项目详情
        </button>
      </div>
    </section>
  );
}
