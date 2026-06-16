export function MiniDependencyGraph({ controls, taskMap, selectedId, onSelect }) {
  const nodes = controls
    .filter((control) => control.blockers?.length || control.dependencies?.length)
    .slice(0, 12);

  if (!nodes.length) {
    return (
      <div className="dependency-graph empty">
        <p>当前筛选下暂无阻塞链可展示。</p>
      </div>
    );
  }

  return (
    <div className="dependency-graph" aria-label="阻塞链预览">
      {nodes.map((control) => (
        <div className="dependency-chain" key={control.id}>
          {(control.blockers || []).map((blockerId) => {
            const blocker = taskMap[blockerId];
            return (
              <button
                key={`${control.id}-${blockerId}`}
                type="button"
                className={`dependency-node blocker ${selectedId === blockerId ? "active" : ""}`}
                onClick={() => onSelect(blockerId)}
              >
                <span>{blocker?.title || blockerId}</span>
                <small>{blockerId}</small>
              </button>
            );
          })}
          {(control.blockers || []).length ? <span className="dependency-arrow">→</span> : null}
          <button
            type="button"
            className={`dependency-node current ${selectedId === control.id ? "active" : ""}`}
            onClick={() => onSelect(control.id)}
          >
            <span>{control.title}</span>
            <small>{control.id} · 被阻塞</small>
          </button>
        </div>
      ))}
    </div>
  );
}
