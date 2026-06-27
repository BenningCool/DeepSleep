import React from "react";

const VIEW_LABELS = {
  home: "项目列表",
  command: "指挥中心",
  types: "项目类型",
  create: "新建项目",
  detail: "项目概览",
  members: "成员管理",
  workspace: "工作台",
  board: "看板",
  progress: "进度看板"
};

export function Topbar({
  activeView = "home",
  project,
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
            <strong>{project.clientName || project.name}</strong>
            {project.clientName ? (
              <>
                <span>/</span>
                <span>{project.name}</span>
              </>
            ) : null}
          </>
        ) : null}
        <span>/</span>
        <span>{viewLabel}</span>
      </div>
      <div className="actions">
        {activeView === "board" ? (
          <button className="button primary" type="button" onClick={onNewTask}>新建任务</button>
        ) : null}
      </div>
    </header>
  );
}
