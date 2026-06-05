import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { Board } from "./components/Board";
import { BoardHeader } from "./components/BoardHeader";
import { Sidebar } from "./components/Sidebar";
import { TaskDrawer } from "./components/TaskDrawer";
import { Topbar } from "./components/Topbar";
import { COLUMNS, DEFAULT_TASKS, STORAGE_KEY } from "./data/mockData";
import { ScopeInitPanel } from "./modules/scope-init/ScopeInitPanel";
import { validateStatusTransition } from "./modules/scope-init/scopeRules";
import { cloneTasks, columnTitle, nextTaskId } from "./utils/taskUtils";

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
  const [activeView, setActiveView] = useState("board");

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
    if (existing && draft.status !== existing.status) {
      const check = validateStatusTransition(existing, draft.status);
      if (!check.allowed) {
        setToast(check.message);
        return;
      }
    }

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

    const check = validateStatusTransition(target, nextStatus);
    if (!check.allowed) {
      setToast(check.message);
      return;
    }

    setTasks((current) => current.map((task) => (
      task.id === taskId ? { ...task, status: nextStatus } : task
    )));
    setToast(`${target.id} 已移动到「${columnTitle(nextStatus)}」。`);
  }

  function handleGenerateScope(scopeTasks, projectName) {
    setTasks((current) => {
      let working = [...current];
      const imported = scopeTasks.map((task) => {
        const id = nextTaskId(working);
        const next = { ...task, id };
        working = [next, ...working];
        return next;
      });
      return [...imported, ...current];
    });
    setFilters((current) => ({ ...current, product: projectName }));
    setActiveView("board");
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
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="content">
        <Topbar activeView={activeView} onNewTask={() => openTask()} onReset={resetData} />
        {activeView === "scope-init" ? (
          <ScopeInitPanel onGenerate={handleGenerateScope} onToast={setToast} />
        ) : (
          <>
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
          </>
        )}
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

createRoot(document.getElementById("root")).render(<App />);
