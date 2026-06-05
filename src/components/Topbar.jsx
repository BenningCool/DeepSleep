const VIEW_LABELS = {
  board: "看板",
  "scope-init": "Scope 初始化"
};

export function Topbar({ activeView = "board", onNewTask, onReset }) {
  const viewLabel = VIEW_LABELS[activeView] || "看板";

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>项目</span>
        <span>/</span>
        <strong>DeepSleep 项目看板</strong>
        <span>/</span>
        <span>{viewLabel}</span>
      </div>
      <div className="actions">
        {activeView === "board" ? (
          <>
            <button className="button" type="button" onClick={onReset}>重置样例</button>
            <button className="button primary" type="button" onClick={onNewTask}>新建任务</button>
          </>
        ) : (
          <span className="topbar-note">完成 Scope 配置后可导入看板继续推进</span>
        )}
      </div>
    </header>
  );
}
