export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="项目导航">
      <section className="project">
        <div className="project-mark">DS</div>
        <div>
          <h1>DeepSleep 项目看板</h1>
          <p>Software project / Kanban</p>
        </div>
      </section>
      <nav className="nav" aria-label="看板菜单">
        <button className="active" type="button"><span className="nav-icon">K</span><span>看板</span></button>
        <button type="button"><span className="nav-icon">L</span><span>需求列表</span></button>
        <button type="button"><span className="nav-icon">M</span><span>成员</span></button>
        <button type="button"><span className="nav-icon">S</span><span>设置</span></button>
      </nav>
      <div className="sidebar-footer">黑客松协作原型，数据保存在当前浏览器。</div>
    </aside>
  );
}
