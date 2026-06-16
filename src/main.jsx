import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { Board } from "./components/Board";
import { BoardHeader } from "./components/BoardHeader";
import { ScopeGateState } from "./components/ScopeGateState";
import { Sidebar } from "./components/Sidebar";
import { TaskDrawer } from "./components/TaskDrawer";
import { Topbar } from "./components/Topbar";
import { COLUMNS, STORAGE_KEY } from "./data/mockData";
import { ProgressBoardPage } from "./modules/progress-board/ProgressBoardPage";
import { CreateProjectPage } from "./modules/project/CreateProjectPage";
import { resolveTaskContributorGroup } from "./modules/project/contributorGroup";
import { ProjectDetailPage } from "./modules/project/ProjectDetailPage";
import { ProjectMembersPage } from "./modules/project/ProjectMembersPage";
import { ProjectsHomePage } from "./modules/project/ProjectsHomePage";
import { WorkspacePage } from "./modules/workspace/WorkspacePage";
import {
  deleteProject,
  findInviteContext,
  getProject,
  loadCurrentProjectId,
  loadProjects,
  markScopeDefined,
  saveCurrentProjectId
} from "./modules/project/projectStore";
import { migrateTasks } from "./utils/taskStatusMigration";
import { validateStatusTransition } from "./modules/scope-init/scopeRules";
import { cloneTasks, columnTitle, nextTaskId } from "./utils/taskUtils";

const emptyTask = {
  title: "",
  description: "",
  priority: "P1",
  platform: "PC 端",
  product: "",
  owner: "",
  due: "",
  status: "todo",
  comments: [],
  projectId: ""
};

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return migrateTasks(Array.isArray(saved) ? saved : []);
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function App() {
  const [projects, setProjects] = useState(loadProjects);
  const [currentProjectId, setCurrentProjectId] = useState(loadCurrentProjectId);
  const [activeView, setActiveView] = useState(
    loadCurrentProjectId() ? "detail" : "home"
  );
  const [tasks, setTasks] = useState(loadTasks);
  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    platform: "",
    product: "",
    owner: ""
  });
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draft, setDraft] = useState(emptyTask);
  const [commentDraft, setCommentDraft] = useState("");
  const [toast, setToast] = useState("");
  const [detailTick, setDetailTick] = useState(0);
  const [specialistTeamId, setSpecialistTeamId] = useState("");
  const [focusControlId, setFocusControlId] = useState("");

  const currentProject = useMemo(
    () => getProject(currentProjectId),
    [currentProjectId, projects, detailTick]
  );

  const scopePending = currentProject?.scopeStatus === "pending";

  const projectTasks = useMemo(() => {
    if (!currentProjectId) return [];
    return tasks.filter((task) => task.projectId === currentProjectId);
  }, [tasks, currentProjectId]);

  const visibleTasks = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return projectTasks.filter((task) => {
      const searchable = `${task.title} ${task.description}`.toLowerCase();
      return (!keyword || searchable.includes(keyword))
        && (!filters.priority || task.priority === filters.priority)
        && (!filters.platform || task.platform === filters.platform)
        && (!filters.product || task.product === filters.product)
        && (!filters.owner || task.owner === filters.owner);
    });
  }, [filters, projectTasks]);

  const filterOptions = useMemo(() => ({
    products: [...new Set(projectTasks.map((task) => task.product).filter(Boolean))].sort(),
    owners: [...new Set(projectTasks.map((task) => task.owner).filter(Boolean))].sort()
  }), [projectTasks]);

  const stats = useMemo(() => {
    const done = projectTasks.filter((task) => task.status === "done").length;
    return {
      total: projectTasks.length,
      doing: projectTasks.length - done,
      done
    };
  }, [projectTasks]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("project");
    const inviteToken = params.get("invite");
    if (!projectId || !inviteToken) return;

    const context = findInviteContext(projectId, inviteToken);
    if (!context) return;

    setCurrentProjectId(projectId);
    saveCurrentProjectId(projectId);
    setProjects(loadProjects());

    if (context.type === "specialist_lead") {
      setSpecialistTeamId(context.specialistTeam.id);
      setActiveView("members");
      setToast("欢迎，请在成员管理中补充 Specialist team staff。");
    } else {
      setActiveView("detail");
      setToast("已通过邀请链接打开项目。");
    }

    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, "", cleanUrl);
  }, []);

  const scopeTaskCount = useMemo(
    () => projectTasks.filter((task) => task.scopeGenerated).length,
    [projectTasks]
  );

  function handleScopeGenerated(generatedTasks) {
    setTasks((current) => {
      const preserved = current.filter(
        (task) => task.projectId !== currentProjectId || !task.scopeGenerated
      );
      return [...generatedTasks, ...preserved];
    });
    markScopeDefined(currentProjectId);
    refreshProjects();
    setDetailTick((value) => value + 1);
  }

  function goToWorkspace(controlId = "") {
    setFocusControlId(controlId);
    setActiveView("workspace");
  }

  function goToBoard(controlId = "") {
    setFocusControlId(controlId);
    setActiveView("board");
  }

  function refreshProjects() {
    setProjects(loadProjects());
  }

  function openProject(projectId, view = "detail") {
    setCurrentProjectId(projectId);
    saveCurrentProjectId(projectId);
    setActiveView(view);
    refreshProjects();
  }

  function goHome() {
    setCurrentProjectId("");
    saveCurrentProjectId("");
    setActiveView("home");
    refreshProjects();
  }

  function handleProjectCreated(project) {
    refreshProjects();
    openProject(project.id, "detail");
  }

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function openTask(task) {
    if (scopePending) return;
    const nextTask = task || {
      ...emptyTask,
      id: "",
      comments: [],
      projectId: currentProjectId,
      product: currentProject?.name || ""
    };
    setEditingTask(task || null);
    setDraft(nextTask);
    setCommentDraft("");
    setTaskDrawerOpen(true);
  }

  function closeDrawer() {
    setTaskDrawerOpen(false);
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
      const check = validateStatusTransition(existing, draft.status, projectTasks);
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
      product: draft.product.trim() || currentProject?.name || "",
      owner: draft.owner.trim() || "未分配",
      projectId: currentProjectId,
      contributorGroup: resolveTaskContributorGroup(
        { ...draft, owner: draft.owner.trim() || "未分配" },
        currentProject?.specialistTeams
      ),
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
    if (scopePending) return;
    const target = tasks.find((task) => task.id === taskId);
    if (!target || target.status === nextStatus) return;

    const check = validateStatusTransition(target, nextStatus, projectTasks);
    if (!check.allowed) {
      setToast(check.message);
      return;
    }

    setTasks((current) => current.map((task) => (
      task.id === taskId ? { ...task, status: nextStatus } : task
    )));
    setToast(`${target.id} 已移动到「${columnTitle(nextStatus)}」。`);
  }

  function handleDeleteProject(projectId, projectName) {
    const confirmed = window.confirm(
      `确定要删除项目「${projectName}」吗？\n\n此操作不可恢复。项目成员、Scope 与关联看板任务将一并移除。`
    );
    if (!confirmed) return;

    deleteProject(projectId);
    setTasks((current) => current.filter((task) => task.projectId !== projectId));
    setCurrentProjectId("");
    saveCurrentProjectId("");
    setActiveView("home");
    refreshProjects();
    setToast(`项目「${projectName}」已删除。`);
  }

  function renderMain() {
    if (activeView === "home") {
      return (
        <ProjectsHomePage
          projects={projects}
          currentProjectId={currentProjectId}
          onCreate={() => setActiveView("create")}
          onOpen={(projectId) => openProject(projectId, "detail")}
        />
      );
    }

    if (activeView === "create") {
      return (
        <CreateProjectPage
          onCreated={handleProjectCreated}
          onCancel={() => setActiveView(currentProjectId ? "detail" : "home")}
          onToast={setToast}
        />
      );
    }

    if (!currentProject) {
      return (
        <ProjectsHomePage
          projects={projects}
          currentProjectId=""
          onCreate={() => setActiveView("create")}
          onOpen={(projectId) => openProject(projectId, "detail")}
        />
      );
    }

    if (activeView === "detail") {
      return (
        <ProjectDetailPage
          projectId={currentProjectId}
          refreshToken={detailTick}
          scopeTaskCount={scopeTaskCount}
          startTaskId={Number(nextTaskId(tasks).replace("DS-", ""))}
          onOpenBoard={() => setActiveView("board")}
          onOpenProgress={() => setActiveView("progress")}
          onOpenMembers={() => setActiveView("members")}
          onScopeGenerated={handleScopeGenerated}
          onBack={goHome}
          onDelete={() => handleDeleteProject(currentProjectId, currentProject.name)}
          onToast={setToast}
          onProjectChange={() => setDetailTick((value) => value + 1)}
        />
      );
    }

    if (activeView === "members") {
      return (
        <ProjectMembersPage
          projectId={currentProjectId}
          refreshToken={detailTick}
          focusSpecialistTeamId={specialistTeamId}
          onBack={goHome}
          onToast={setToast}
          onProjectChange={() => setDetailTick((value) => value + 1)}
        />
      );
    }

    if (activeView === "workspace") {
      if (scopePending) {
        return (
          <ScopeGateState
            title="工作台等待 Scope 明确"
            onGoScope={() => setActiveView("detail")}
          />
        );
      }

      return (
        <WorkspacePage
          project={currentProject}
          tasks={projectTasks}
          focusControlId={focusControlId}
          onToast={setToast}
        />
      );
    }

    if (activeView === "specialist-staff" && specialistTeamId) {
      return (
        <ProjectMembersPage
          projectId={currentProjectId}
          refreshToken={detailTick}
          focusSpecialistTeamId={specialistTeamId}
          onBack={goHome}
          onToast={setToast}
          onProjectChange={() => setDetailTick((value) => value + 1)}
        />
      );
    }

    if (activeView === "board") {
      if (scopePending) {
        return (
          <ScopeGateState
            title="看板等待 Scope 明确"
            onGoScope={() => setActiveView("detail")}
          />
        );
      }

      return (
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
      );
    }

    if (activeView === "progress") {
      if (scopePending) {
        return (
          <ScopeGateState
            title="进度看板等待 Scope 明确"
            onGoScope={() => setActiveView("detail")}
          />
        );
      }

      return (
        <ProgressBoardPage
          project={currentProject}
          tasks={projectTasks}
          focusControlId={focusControlId}
          onGoWorkspace={goToWorkspace}
          onGoBoard={goToBoard}
        />
      );
    }

    return (
      <ProjectsHomePage
        projects={projects}
        currentProjectId={currentProjectId}
        onCreate={() => setActiveView("create")}
        onOpen={(projectId) => openProject(projectId, "detail")}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        currentProject={currentProject}
        onNavigate={setActiveView}
        onGoHome={goHome}
      />
      <main className="content content-fluid">
        <Topbar
          activeView={activeView}
          project={currentProject}
          scopePending={scopePending && (activeView === "board" || activeView === "workspace" || activeView === "progress")}
          onNewTask={() => openTask()}
        />
        {renderMain()}
      </main>
      <TaskDrawer
        open={taskDrawerOpen}
        editingTask={editingTask}
        draft={draft}
        allTasks={projectTasks}
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

const rootElement = document.getElementById("root");
const root = rootElement._deepsleepRoot || createRoot(rootElement);
rootElement._deepsleepRoot = root;
root.render(<App />);
