import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { STORAGE_KEY } from "./data/mockData";
import {
  deleteControlWorkspaceProgress,
  deleteProjectWorkspaceProgress
} from "./services/workspaceProgressService";
import { ProgressBoardPage } from "./modules/progress-board/ProgressBoardPage";
import { EngagementTypesPage } from "./modules/engagement-types/EngagementTypesPage";
import { CreateProjectPage } from "./modules/project/CreateProjectPage";
import { resolveTaskContributorGroup } from "./modules/project/contributorGroup";
import { ProjectDetailPage } from "./modules/project/ProjectDetailPage";
import { ProjectMembersPage } from "./modules/project/ProjectMembersPage";
import { EngagementHomePage } from "./modules/project/EngagementHomePage";
import { WorkspacePage } from "./modules/workspace/WorkspacePage";
import {
  deleteProject,
  findInviteContext,
  getProject,
  loadCurrentProjectId,
  loadProjects,
  saveCurrentProjectId
} from "./modules/project/projectStore";
import { migrateTasks } from "./utils/taskStatusMigration";
import { nextTaskId } from "./utils/taskUtils";
import { ensureDemoData } from "./data/seedDemoProjects";
import {
  defaultTeamForProjectType,
  getEngagementTypeProfile
} from "./data/engagementTypeProfiles";
import {
  loadViewAs,
  saveViewAs
} from "./data/viewAsPresets";

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function App() {
  const initialDemo = ensureDemoData();
  const [projects, setProjects] = useState(initialDemo.projects);
  const [currentProjectId, setCurrentProjectId] = useState(loadCurrentProjectId);
  const [activeView, setActiveView] = useState(
    loadCurrentProjectId() ? "detail" : "home"
  );
  const [tasks, setTasks] = useState(() => migrateTasks(initialDemo.tasks));
  const [viewAs, setViewAs] = useState(loadViewAs);
  const [createPrefill, setCreatePrefill] = useState({ type: "", team: "" });
  const [progressOwnerOverride, setProgressOwnerOverride] = useState("");
  const [toast, setToast] = useState("");
  const [detailTick, setDetailTick] = useState(0);
  const [specialistTeamId, setSpecialistTeamId] = useState("");
  const [focusControlId, setFocusControlId] = useState("");
  const [progressDataRefreshKey, setProgressDataRefreshKey] = useState(0);

  const currentProject = useMemo(
    () => getProject(currentProjectId),
    [currentProjectId, projects, detailTick]
  );

  const projectTasks = useMemo(() => {
    if (!currentProjectId) return [];
    return tasks.filter((task) => task.projectId === currentProjectId);
  }, [tasks, currentProjectId]);

  useEffect(() => {
    if (activeView === "progress") {
      setProgressDataRefreshKey((value) => value + 1);
    }
  }, [activeView]);

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

  function navigateTo(view) {
    if (view === "command") {
      view = "home";
    }
    if (view !== "workspace") {
      setFocusControlId("");
    }
    if (view !== "progress") {
      setProgressOwnerOverride("");
    }
    if (view === "create") {
      setCreatePrefill({ type: "", team: "" });
    }
    setActiveView(view);
  }

  function handleViewAsChange(nextViewAs) {
    setViewAs(nextViewAs);
    saveViewAs(nextViewAs);
  }

  function openProject(projectId, view = "detail") {
    setCurrentProjectId(projectId);
    saveCurrentProjectId(projectId);
    setActiveView(view);
    refreshProjects();
  }

  function openProjectProgress(projectId, ownerEmail = "") {
    setProgressOwnerOverride(ownerEmail || "");
    openProject(projectId, "progress");
  }

  function openMemberProgress(projectId, ownerEmail) {
    openProjectProgress(projectId, ownerEmail);
  }

  function startCreateWithType(projectType) {
    setCreatePrefill({
      type: projectType,
      team: defaultTeamForProjectType(projectType)
    });
    setActiveView("create");
  }

  function startCreateAnnual() {
    setCreatePrefill({ type: "annual", team: "audit" });
    setActiveView("create");
  }

  function viewDemoProject(projectType) {
    const profile = getEngagementTypeProfile(projectType);
    if (!profile.demoProjectId) return;
    openProjectProgress(profile.demoProjectId);
  }

  function goToWorkspace(controlId = "") {
    setFocusControlId(controlId);
    setActiveView("workspace");
  }

  function handleCreateWorkspaceControl(payload) {
    const controlType = String(payload.controlType || "").toUpperCase();
    const createdTask = {
      id: nextTaskId(tasks),
      title: payload.title,
      description: `${controlType} 测试点，由工作台新建。`,
      priority: "P1",
      platform: "PC 端",
      product: currentProject?.name || currentProject?.clientName || "DeepSleep",
      owner: payload.owner,
      due: payload.firstDueDate,
      status: "todo",
      comments: [],
      projectId: currentProjectId,
      auditPhase: "control-test",
      auditDomain: controlType.toLowerCase(),
      scopeGenerated: false,
      scopeMeta: {
        auditDomain: controlType.toLowerCase(),
        source: "workspace"
      },
      contributorGroup: resolveTaskContributorGroup(
        { owner: payload.owner },
        currentProject?.specialistTeams
      )
    };

    setTasks((current) => [createdTask, ...current]);
    return createdTask;
  }

  function handleDeleteWorkspaceControl(controlId) {
    if (!controlId) return false;
    const target = tasks.find((task) => task.id === controlId && task.projectId === currentProjectId);
    if (!target) return false;

    deleteControlWorkspaceProgress(currentProjectId, controlId);
    setTasks((current) => current.filter((task) => task.id !== controlId));
    if (focusControlId === controlId) {
      setFocusControlId("");
    }
    setProgressDataRefreshKey((value) => value + 1);
    return true;
  }

  function refreshProjects() {
    setProjects(loadProjects());
  }

  function goHome() {
    setCurrentProjectId("");
    saveCurrentProjectId("");
    setActiveView("home");
    refreshProjects();
  }

  function handleProjectCreated(project) {
    refreshProjects();
    openProject(project.id, "workspace");
  }

  function handleDeleteProject(projectId, projectName) {
    const confirmed = window.confirm(
      `确定要删除项目「${projectName}」吗？\n\n此操作不可恢复。项目成员、控制点与关联看板任务将一并移除。`
    );
    if (!confirmed) return;

    deleteProject(projectId);
    const controlIds = tasks
      .filter((task) => task.projectId === projectId)
      .map((task) => task.id);
    deleteProjectWorkspaceProgress(projectId, controlIds);
    setTasks((current) => current.filter((task) => task.projectId !== projectId));
    setCurrentProjectId("");
    saveCurrentProjectId("");
    setActiveView("home");
    refreshProjects();
    setToast(`项目「${projectName}」已删除。`);
  }

  function renderMain() {
    if (activeView === "home" || activeView === "command") {
      return (
        <EngagementHomePage
          projects={projects}
          tasks={tasks}
          currentProjectId={currentProjectId}
          viewAs={viewAs}
          onViewAsChange={handleViewAsChange}
          onCreate={() => navigateTo("create")}
          onOpen={(projectId) => openProject(projectId, "detail")}
          onOpenProgress={openProjectProgress}
          onOpenDetail={(projectId) => openProject(projectId, "detail")}
          onOpenMemberProgress={openMemberProgress}
          onCreateAnnual={startCreateAnnual}
          onOpenTypes={() => setActiveView("types")}
        />
      );
    }

    if (activeView === "types") {
      return (
        <EngagementTypesPage
          onViewDemo={viewDemoProject}
          onCreateWithType={startCreateWithType}
        />
      );
    }

    if (activeView === "create") {
      return (
        <CreateProjectPage
          onCreated={handleProjectCreated}
          onCancel={() => setActiveView(currentProjectId ? "detail" : "home")}
          onToast={setToast}
          prefillType={createPrefill.type}
          prefillTeam={createPrefill.team}
        />
      );
    }

    if (!currentProject) {
      return (
        <EngagementHomePage
          projects={projects}
          tasks={tasks}
          currentProjectId=""
          viewAs={viewAs}
          onViewAsChange={handleViewAsChange}
          onCreate={() => navigateTo("create")}
          onOpen={(projectId) => openProject(projectId, "detail")}
          onOpenProgress={openProjectProgress}
          onOpenDetail={(projectId) => openProject(projectId, "detail")}
          onOpenMemberProgress={openMemberProgress}
          onCreateAnnual={startCreateAnnual}
          onOpenTypes={() => setActiveView("types")}
        />
      );
    }

    if (activeView === "detail") {
      return (
        <ProjectDetailPage
          projectId={currentProjectId}
          refreshToken={detailTick}
          controlPointCount={projectTasks.length}
          onOpenWorkspace={goToWorkspace}
          onOpenProgress={() => setActiveView("progress")}
          onOpenMembers={() => setActiveView("members")}
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
      return (
        <WorkspacePage
          project={currentProject}
          tasks={projectTasks}
          focusControlId={focusControlId}
          onCreateControlTask={handleCreateWorkspaceControl}
          onDeleteControlTask={handleDeleteWorkspaceControl}
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

    if (activeView === "progress") {
      return (
        <ProgressBoardPage
          project={currentProject}
          tasks={projectTasks}
          focusControlId={focusControlId}
          dataRefreshKey={progressDataRefreshKey}
          viewAs={viewAs}
          ownerFilterOverride={progressOwnerOverride}
          onGoWorkspace={goToWorkspace}
        />
      );
    }

    return (
      <EngagementHomePage
        projects={projects}
        tasks={tasks}
        currentProjectId={currentProjectId}
        viewAs={viewAs}
        onViewAsChange={handleViewAsChange}
        onCreate={() => setActiveView("create")}
        onOpen={(projectId) => openProject(projectId, "detail")}
        onOpenProgress={openProjectProgress}
        onOpenDetail={(projectId) => openProject(projectId, "detail")}
        onOpenMemberProgress={openMemberProgress}
        onCreateAnnual={startCreateAnnual}
        onOpenTypes={() => setActiveView("types")}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        currentProject={currentProject}
        onNavigate={navigateTo}
        onGoHome={goHome}
      />
      <main className="content content-fluid">
        <Topbar
          activeView={activeView}
          project={currentProject}
        />
        <div className="content-body">
          {renderMain()}
        </div>
      </main>
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("找不到 #root 容器，无法启动 DeepSleep。");
}

const root = createRoot(rootElement);
root.render(<App />);

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    root.render(<App />);
  });
}
