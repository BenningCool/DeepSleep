import React from "react";

const VIEW_LABELS = {
  home: "Project List",
  create: "Create Project",
  detail: "Project Overview",
  members: "Member Management",
  workspace: "Workspace",
  board: "Kanban",
  progress: "Progress Board"
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
          <button className="button primary" type="button" onClick={onNewTask}>Create Task</button>
        ) : null}
      </div>
    </header>
  );
}
