import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { COLUMNS, DEFAULT_TASKS, STORAGE_KEY } from "./mockData";

const emptyTask = {
  title: "",
  description: "",
  priority: "P1",
  platform: "PC 端",
  product: "DeepSleep 项目看板",
  owner: "",
  due: "",
  status: "todo",
  comments: []
};

function cloneTasks(tasks) {
  return JSON.parse(JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return Array.isArray(saved) && saved.length ? saved : cloneTasks(DEFAULT_TASKS);
  } catch {
    return cloneTasks(DEFAULT_TASKS);
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function nextTaskId(tasks) {
  const max = tasks.reduce((current, task) => {
    const match = String(task.id).match(/DS-(\d+)/);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 100);
  return `DS-${max + 1}`;
}

function initials(name) {
  return (name || "?").trim().slice(0, 2).toUpperCase();
}

function platformClass(platform) {
  if (platform === "移动端") return "mobile";
  if (platform === "后端") return "backend";
  if (platform === "AI") return "ai";
  return "pc";
}

function columnTitle(status) {
  return COLUMNS.find((column) => column.id === status)?.title || "待办";
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    platform: "",
    product: "",
    owner: ""
  });
  const [editingTask, setEditingTask] = useState(null);
  const [draft, setDraft] = useState(emptyTask);
  const [commentDraft, setCommentDraft] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filterOptions = useMemo(() => ({
    products: [...new Set(tasks.map((task) => task.product).filter(Boolean))].sort(),
    owners: [...new Set(tasks.map((task) => task.owner).filter(Boolean))].sort()
  }), [tasks]);

  const visibleTasks = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return tasks.filter((task) => {
      const searchable = `${task.title} ${task.description}`.toLowerCase();
      return (!keyword || searchable.includes(keyword))
        && (!filters.priority || task.priority === filters.priority)
        && (!filters.platform || task.platform === filters.platform)
        && (!filters.product || task.product === filters.product)
        && (!filters.owner || task.owner === filters.owner);
    });
  }, [filters, tasks]);

  const stats = useMemo(() => {
    const done = tasks.filter((task) => task.status === "done").length;
    return {
      total: tasks.length,
      doing: tasks.length - done,
      done
    };
  }, [tasks]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function openTask(task) {
    const nextTask = task || { ...emptyTask, id: "", comments: [] };
    setEditingTask(task || null);
    setDraft(nextTask);
    setCommentDraft("");
  }

  function closeDrawer() {
    setEditingTask(null);
    setDraft(emptyTask);
    setCommentDraft("");
  }

  function updateDraft(name, value) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function handleSave(event) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) {
      setToast("请先填写任务标题。");
      return;
    }

    const existing = tasks.find((task) => task.id === draft.id);
    const comments = [...(existing?.comments || draft.comments || [])];
    const nextComment = commentDraft.trim();
    if (nextComment) {
      comments.push({ author: draft.owner.trim() || "成员", text: nextComment });
    }

    const normalizedTask = {
      ...draft,
      id: existing?.id || nextTaskId(tasks),
      title,
      description: draft.description.trim(),
      product: draft.product.trim() || "DeepSleep 项目看板",
      owner: draft.owner.trim() || "未分配",
      comments
    };

    setTasks((current) => {
      const exists = current.some((task) => task.id === normalizedTask.id);
      return exists
        ? current.map((task) => task.id === normalizedTask.id ? normalizedTask : task)
        : [normalizedTask, ...current];
    });
    setToast(existing ? "任务已更新。" : "任务已创建。");
    closeDrawer();
  }

  function deleteTask() {
    if (!draft.id) return;
    const confirmed = window.confirm(`删除任务「${draft.title}」？`);
    if (!confirmed) return;
    setTasks((current) => current.filter((task) => task.id !== draft.id));
    setToast("任务已删除。");
    closeDrawer();
  }

  function moveTask(taskId, nextStatus) {
    const target = tasks.find((task) => task.id === taskId);
    if (!target || target.status === nextStatus) return;
    setTasks((current) => current.map((task) => (
      task.id === taskId ? { ...task, status: nextStatus } : task
    )));
    setToast(`${target.id} 已移动到「${columnTitle(nextStatus)}」。`);
  }

  function resetData() {
    const confirmed = window.confirm("重置后会覆盖当前浏览器里的看板数据，确定恢复样例吗？");
    if (!confirmed) return;
    setTasks(cloneTasks(DEFAULT_TASKS));
    setFilters({ search: "", priority: "", platform: "", product: "", owner: "" });
    setToast("已恢复默认样例数据。");
  }

  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Topbar onNewTask={() => openTask()} onReset={resetData} />
        <BoardHeader
          stats={stats}
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={updateFilter}
        />
        <Board
          columns={COLUMNS}
          tasks={visibleTasks}
          onOpenTask={openTask}
          onMoveTask={moveTask}
        />
      </main>
      <TaskDrawer
        open={Boolean(editingTask) || draft.id === ""}
        editingTask={editingTask}
        draft={draft}
        commentDraft={commentDraft}
        onClose={closeDrawer}
        onChange={updateDraft}
        onCommentChange={setCommentDraft}
        onSave={handleSave}
        onDelete={deleteTask}
      />
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

function Sidebar() {
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

function Topbar({ onNewTask, onReset }) {
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

function BoardHeader({ stats, filters, filterOptions, onFilterChange }) {
  return (
    <section className="board-header">
      <div className="title-row">
        <div>
          <h2>项目看板</h2>
          <p>按阶段推进需求、开发、测试与复核，支持直接填写卡片与批注。</p>
        </div>
        <div className="stats" aria-label="看板统计">
          <Stat value={stats.total} label="总任务" />
          <Stat value={stats.doing} label="进行中" />
          <Stat value={stats.done} label="已完成" />
        </div>
      </div>
      <div className="filters">
        <FilterField label="搜索">
          <input value={filters.search} onChange={(event) => onFilterChange("search", event.target.value)} type="search" placeholder="搜索标题或描述" />
        </FilterField>
        <FilterField label="优先级">
          <select value={filters.priority} onChange={(event) => onFilterChange("priority", event.target.value)}>
            <option value="">全部优先级</option>
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
          </select>
        </FilterField>
        <FilterField label="端">
          <select value={filters.platform} onChange={(event) => onFilterChange("platform", event.target.value)}>
            <option value="">全部端</option>
            <option value="PC 端">PC 端</option>
            <option value="移动端">移动端</option>
            <option value="后端">后端</option>
            <option value="AI">AI</option>
          </select>
        </FilterField>
        <FilterField label="产品线">
          <select value={filters.product} onChange={(event) => onFilterChange("product", event.target.value)}>
            <option value="">全部产品线</option>
            {filterOptions.products.map((product) => <option key={product} value={product}>{product}</option>)}
          </select>
        </FilterField>
        <FilterField label="负责人">
          <select value={filters.owner} onChange={(event) => onFilterChange("owner", event.target.value)}>
            <option value="">全部负责人</option>
            {filterOptions.owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
          </select>
        </FilterField>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return <div className="stat"><strong>{value}</strong><span>{label}</span></div>;
}

function FilterField({ label, children }) {
  return <label className="field"><span className="label">{label}</span>{children}</label>;
}

function Board({ columns, tasks, onOpenTask, onMoveTask }) {
  return (
    <section className="board-wrap" aria-label="JIRA 风格 Kanban 看板">
      <div className="board">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);
          return (
            <section className="column" aria-label={column.title} key={column.id}>
              <header className="column-header">
                <h3>{column.title}</h3>
                <span className="count">{columnTasks.length}</span>
              </header>
              <div
                className="card-list"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  onMoveTask(event.dataTransfer.getData("text/plain"), column.id);
                }}
              >
                {columnTasks.length ? columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onOpen={() => onOpenTask(task)}
                  />
                )) : <div className="empty">没有匹配任务<br />可拖入或新建卡片</div>}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function TaskCard({ task, onOpen }) {
  return (
    <article
      className="card"
      draggable
      tabIndex="0"
      aria-label={task.title}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.id);
      }}
    >
      <div className="card-meta">
        <span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
        <span className={`pill ${platformClass(task.platform)}`}>{task.platform}</span>
      </div>
      <h4 className="card-title">{task.title}</h4>
      <p className="card-desc">{task.description}</p>
      <div className="card-footer">
        <span>{task.id} · {task.comments?.length || 0} 批注</span>
        <span className="avatar" title={task.owner}>{initials(task.owner)}</span>
      </div>
    </article>
  );
}

function TaskDrawer({ open, editingTask, draft, commentDraft, onClose, onChange, onCommentChange, onSave, onDelete }) {
  return (
    <>
      <div className={`overlay ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-label="任务详情" aria-hidden={!open}>
        <header className="drawer-header">
          <div>
            <h2>{editingTask ? editingTask.title : "新建任务"}</h2>
            <p>{editingTask ? `${editingTask.id} · 当前阶段：${columnTitle(editingTask.status)}` : "填写任务内容、字段和批注。"}</p>
          </div>
          <button className="button icon" type="button" aria-label="关闭" onClick={onClose}>×</button>
        </header>

        <section className="drawer-body">
          <form id="taskForm" className="form-grid" onSubmit={onSave}>
            <FormField label="标题" full>
              <input required maxLength="90" value={draft.title} onChange={(event) => onChange("title", event.target.value)} placeholder="例如：审计定制化的逻辑/勾稽关系" />
            </FormField>
            <FormField label="描述" full>
              <textarea value={draft.description} onChange={(event) => onChange("description", event.target.value)} placeholder="填写需求正文、业务背景或验收要点" />
            </FormField>
            <FormField label="优先级">
              <select value={draft.priority} onChange={(event) => onChange("priority", event.target.value)}>
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
              </select>
            </FormField>
            <FormField label="状态">
              <select value={draft.status} onChange={(event) => onChange("status", event.target.value)}>
                {COLUMNS.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}
              </select>
            </FormField>
            <FormField label="端">
              <select value={draft.platform} onChange={(event) => onChange("platform", event.target.value)}>
                <option value="PC 端">PC 端</option>
                <option value="移动端">移动端</option>
                <option value="后端">后端</option>
                <option value="AI">AI</option>
              </select>
            </FormField>
            <FormField label="产品线">
              <input value={draft.product} onChange={(event) => onChange("product", event.target.value)} placeholder="DeepSleep 项目看板" />
            </FormField>
            <FormField label="负责人">
              <input value={draft.owner} onChange={(event) => onChange("owner", event.target.value)} placeholder="负责人" />
            </FormField>
            <FormField label="截止日期">
              <input value={draft.due} onChange={(event) => onChange("due", event.target.value)} type="date" />
            </FormField>
            <FormField label="批注" full>
              <textarea value={commentDraft} onChange={(event) => onCommentChange(event.target.value)} placeholder="添加新的批注，保存后会追加到任务" />
            </FormField>
          </form>

          <section aria-label="历史批注">
            <span className="label">历史批注</span>
            <div className="comments">
              {draft.comments?.length ? draft.comments.map((comment, index) => (
                <div className="comment" key={`${comment.author}-${index}`}>
                  <strong>{comment.author || "成员"}</strong>
                  <p>{comment.text}</p>
                </div>
              )) : <div className="empty">暂无批注，保存时可追加新的批注。</div>}
            </div>
          </section>
        </section>

        <footer className="drawer-footer">
          <div className="footer-group">
            {editingTask ? <button className="button danger" type="button" onClick={onDelete}>删除</button> : null}
          </div>
          <div className="footer-group">
            <button className="button" type="button" onClick={onClose}>取消</button>
            <button className="button primary" form="taskForm" type="submit">保存</button>
          </div>
        </footer>
      </aside>
    </>
  );
}

function FormField({ label, full = false, children }) {
  return <label className={`field ${full ? "full" : ""}`}><span className="label">{label}</span>{children}</label>;
}

createRoot(document.getElementById("root")).render(<App />);
