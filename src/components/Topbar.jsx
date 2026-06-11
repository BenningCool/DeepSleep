import React from "react";

const VIEW_LABELS = {
  home: "项目列表",
  create: "新建项目",
  detail: "项目概览",
  members: "成员管理",
  board: "看板"
};

export function Topbar({
  activeView = "home",
  project,
  scopePending = false,
  onNewTask
}) {
  const viewLabel = VIEW_LABELS[activeView] || "DeepSleep";

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>DeepSleep</span>
        {project ? (
          <>
            <span>/</span>
            <strong>{project.name}</strong>
          </>
        ) : null}
        <span>/</span>
        <span>{viewLabel}</span>
      </div>
      <div className="actions">
        {activeView === "board" && !scopePending ? (
          <button className="button primary" type="button" onClick={onNewTask}>新建任务</button>
        ) : null}
        {scopePending && activeView === "board" ? (
          <span className="topbar-note">Scope Pending · 看板暂不可用</span>
        ) : null}
      </div>
    </header>
  );
}
