export function Sidebar({
  activeView,
  currentProject,
  onNavigate,
  onGoHome
}) {
  const projectNav = currentProject ? [
    { id: "detail", icon: "O", label: "Project Overview" },
    { id: "members", icon: "M", label: "Member Management" },
    { id: "workspace", icon: "W", label: "Workspace" },
    { id: "board", icon: "K", label: "Kanban" },
    { id: "progress", icon: "P", label: "Progress Board" }
  ] : [];

  const globalNav = [
    { id: "home", icon: "P", label: "Project List" },
    { id: "create", icon: "+", label: "Create Project" }
  ];

  const navItems = currentProject ? projectNav : globalNav;

  return (
    <aside className="sidebar" aria-label="Project Navigation">
      <section className="project">
        <div className="project-mark">DS</div>
        <div>
          <h1>DeepSleep</h1>
          <p>{currentProject ? (currentProject.clientName || currentProject.name) : "Engagement Platform"}</p>
        </div>
      </section>

      <nav className="nav" aria-label="Main Navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={activeView === item.id ? "active" : ""}
            type="button"
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {currentProject ? (
        <div className="sidebar-project-actions">
          <button className="sidebar-link" type="button" onClick={onGoHome}>
            ← All Projects
          </button>
        </div>
      ) : null}

    </aside>
  );
}
