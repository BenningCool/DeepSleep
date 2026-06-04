export function Topbar({ onNewTask, onReset }) {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>项目</span>
        <span>/</span>
        <strong>DeepSleep 项目看板</strong>
        <span>/</span>
        <span>看板</span>
      </div>
      <div className="actions">
        <button className="button" type="button" onClick={onReset}>重置样例</button>
        <button className="button primary" type="button" onClick={onNewTask}>新建任务</button>
      </div>
    </header>
  );
}
