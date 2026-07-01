import { getControlProgressSnapshot } from "../services/workspaceProgressService";
import { buildTaskMap } from "../modules/progress-board/progressBoardUtils";
import { filterOverdueControls } from "../modules/progress-board/progressDashboardUtils";
import { getProgressBoardPreset } from "./viewAsProgressPresets";

export const VIEW_AS_STORAGE_KEY = "deepsleep-view-as-v2";
export const DEFAULT_VIEW_AS = "em";

export const VIEW_AS_OPTIONS = [
  {
    id: "all",
    label: "全部项目",
    hint: "浏览全部项目，点击进入项目概览"
  },
  {
    id: "ep",
    label: "EP · Partner",
    demoEmail: "partner.uat@firm.com",
    hint: "项目组合：报告日、程序逾期与下辖 EM"
  },
  {
    id: "em",
    label: "EM · Manager",
    demoEmail: "manager.uat@firm.com",
    hint: "所辖项目：报告日、程序逾期与现场团队饱和度"
  },
  {
    id: "ic",
    label: "IC · In-charge",
    demoEmail: "incharge.uat@firm.com",
    hint: "主责组进度；组内 IC/Staff 负荷与 Focus"
  },
  {
    id: "staff",
    label: "Staff",
    demoEmail: "staff1.uat@firm.com",
    hint: "跨项目负荷、主攻项目与指派测试点"
  },
  {
    id: "ita_lead",
    label: "ITA Lead",
    demoEmail: "ita-lead.uat@firm.com",
    hint: "ITA 组贡献"
  },
  {
    id: "tax_lead",
    label: "Tax Lead",
    demoEmail: "tax-lead.uat@firm.com",
    hint: "Tax 组贡献"
  }
];

export const COMMAND_VIEW_AS_OPTIONS = VIEW_AS_OPTIONS.filter((item) => item.id !== "all");

export function isPortfolioBrowseView(viewAsId) {
  return viewAsId === "all";
}

export function isCommandRoleView(viewAsId) {
  return viewAsId !== "all";
}

export function labelOfViewAs(viewAsId) {
  return VIEW_AS_OPTIONS.find((item) => item.id === viewAsId)?.label || viewAsId;
}

export function hintOfViewAs(viewAsId) {
  return VIEW_AS_OPTIONS.find((item) => item.id === viewAsId)?.hint || "";
}

export function demoEmailOfViewAs(viewAsId) {
  return VIEW_AS_OPTIONS.find((item) => item.id === viewAsId)?.demoEmail || "";
}

export function loadViewAs() {
  try {
    const saved = sessionStorage.getItem(VIEW_AS_STORAGE_KEY);
    if (saved && COMMAND_VIEW_AS_OPTIONS.some((item) => item.id === saved)) {
      return saved;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_VIEW_AS;
}

export function saveViewAs(viewAsId) {
  try {
    sessionStorage.setItem(VIEW_AS_STORAGE_KEY, viewAsId);
  } catch {
    /* ignore */
  }
}

function countOverdue(projectId, tasks) {
  const projectTasks = tasks.filter((task) => task.projectId === projectId);
  if (!projectTasks.length) return 0;
  const snapshot = getControlProgressSnapshot(projectId, projectTasks);
  const taskMap = buildTaskMap(projectTasks);
  return filterOverdueControls(snapshot.controls || [], taskMap).length;
}

function countStaffAssignments(projectId, tasks, email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return 0;
  return tasks.filter((task) => (
    task.projectId === projectId
    && String(task.owner || "").trim().toLowerCase() === normalized
  )).length;
}

function hasContributorGroup(projectId, tasks, group) {
  return tasks.some((task) => (
    task.projectId === projectId && task.contributorGroup === group
  ));
}

function reportDateSortValue(project) {
  if (!project.reportDate) return Number.MAX_SAFE_INTEGER;
  const time = new Date(project.reportDate).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function auditLedBoost(project) {
  return project.team === "audit" ? 0 : 1;
}

export function sortProjectsForViewAs(projects, viewAs, tasks = []) {
  const list = [...projects];

  if (viewAs === "ep") {
    return list.sort((a, b) => {
      const reportDiff = reportDateSortValue(a) - reportDateSortValue(b);
      if (reportDiff !== 0) return reportDiff;
      return countOverdue(b.id, tasks) - countOverdue(a.id, tasks);
    });
  }

  if (viewAs === "em") {
    return list.sort((a, b) => countOverdue(b.id, tasks) - countOverdue(a.id, tasks));
  }

  if (viewAs === "ic") {
    return list.sort((a, b) => {
      const teamDiff = auditLedBoost(a) - auditLedBoost(b);
      if (teamDiff !== 0) return teamDiff;
      return countOverdue(b.id, tasks) - countOverdue(a.id, tasks);
    });
  }

  if (viewAs === "staff") {
    const email = demoEmailOfViewAs("staff");
    return list.sort((a, b) => (
      countStaffAssignments(b.id, tasks, email) - countStaffAssignments(a.id, tasks, email)
    ));
  }

  if (viewAs === "ita_lead") {
    return list.sort((a, b) => {
      const aHas = hasContributorGroup(a.id, tasks, "ita") ? 0 : 1;
      const bHas = hasContributorGroup(b.id, tasks, "ita") ? 0 : 1;
      if (aHas !== bHas) return aHas - bHas;
      return countOverdue(b.id, tasks) - countOverdue(a.id, tasks);
    });
  }

  if (viewAs === "tax_lead") {
    return list.sort((a, b) => {
      const aHas = hasContributorGroup(a.id, tasks, "tax") ? 0 : 1;
      const bHas = hasContributorGroup(b.id, tasks, "tax") ? 0 : 1;
      if (aHas !== bHas) return aHas - bHas;
      return countOverdue(b.id, tasks) - countOverdue(a.id, tasks);
    });
  }

  return list;
}

export function projectCardHighlightClass(viewAs, project, tasks) {
  if (viewAs === "ep" && countOverdue(project.id, tasks) > 0) {
    return "command-card-attention";
  }
  if (viewAs === "em" && countOverdue(project.id, tasks) > 0) {
    return "command-card-attention";
  }
  return "";
}

export { getProgressBoardPreset, resolveDefaultGroupFilter } from "./viewAsProgressPresets";
