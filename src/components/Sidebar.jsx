const NAV_ITEMS = [
  { id: "board", icon: "K", label: "看板" },
  { id: "scope-init", icon: "S", label: "Scope 初始化" },
  { id: "requirements", icon: "L", label: "需求列表", disabled: true },
  { id: "members", icon: "M", label: "成员", disabled: true },
  { id: "settings", icon: "C", label: "设置", disabled: true }
];

export function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="sidebar" aria-label="项目导航">
      <section className="project">
        <div className="project-mark">DS</div>
        <div>
          <h1>DeepSleep 项目看板</h1>
          <p>IT Audit / Kanban</p>
        </div>
      </section>
      <nav className="nav" aria-label="看板菜单">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={activeView === item.id ? "active" : ""}
            type="button"
            disabled={item.disabled}
            onClick={() => !item.disabled && onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">黑客松协作原型，数据保存在当前浏览器。</div>
    </aside>
  );
}
