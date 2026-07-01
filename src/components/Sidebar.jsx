export function Sidebar({
  activeView,
  currentProject,
  onNavigate,
  onGoHome
}) {
  const projectNav = currentProject ? [
    { id: "detail", icon: "O", label: "项目概览" },
    { id: "members", icon: "M", label: "成员管理" },
    { id: "workspace", icon: "W", label: "工作台" },
    { id: "progress", icon: "P", label: "进度看板" }
  ] : [];

  const globalNav = [
    { id: "home", icon: "P", label: "全部项目" },
    { id: "command", icon: "M", label: "团队管理" },
    { id: "create", icon: "+", label: "新建项目" }
  ];

  const globalViews = new Set(["home", "command", "create"]);
  const showProjectNav = currentProject && !globalViews.has(activeView);
  const navItems = showProjectNav ? projectNav : globalNav;

  return (
    <aside className="sidebar" aria-label="项目导航">
      <section className="project">
        <div className="project-mark">DS</div>
        <div>
          <h1>DeepSleep</h1>
          <p>{currentProject ? (currentProject.clientName || currentProject.name) : "Engagement Platform"}</p>
        </div>
      </section>

      <nav className="nav" aria-label="主导航">
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

      {showProjectNav ? (
        <div className="sidebar-project-actions">
          <button className="sidebar-link" type="button" onClick={onGoHome}>
            ← 全部项目
          </button>
        </div>
      ) : null}

    </aside>
  );
}
