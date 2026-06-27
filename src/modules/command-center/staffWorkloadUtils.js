import { getControlProgressSnapshot, PROGRESS_STATUS } from "../../services/workspaceProgressService";
import { buildTaskMap } from "../progress-board/progressBoardUtils";
import {
  computeWorkspaceStatusBreakdown,
  filterOverdueControls
} from "../progress-board/progressDashboardUtils";
import { normalizeOwnerEmail } from "../progress-board/progressOwnerUtils";

export function normalizeStaffEmail(email) {
  return normalizeOwnerEmail(email);
}

/** 是否为项目成员（核心成员或 Specialist staff） */
export function isStaffOnProject(project, email) {
  const normalized = normalizeStaffEmail(email);
  if (!normalized || !project) return false;

  const inCore = (project.members || []).some((member) => (
    member.status === "active" && normalizeStaffEmail(member.email) === normalized
  ));
  if (inCore) return true;

  return (project.specialistTeams || []).some((team) => (
    (team.staff || []).some((member) => (
      member.status === "active" && normalizeStaffEmail(member.email) === normalized
    ))
  ));
}

function buildProjectEntry(project, tasks, email) {
  const normalized = normalizeStaffEmail(email);
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const assignedTasks = projectTasks.filter((task) => (
    normalizeStaffEmail(task.owner) === normalized
  ));
  const taskMap = buildTaskMap(projectTasks);
  const assignedIds = new Set(assignedTasks.map((task) => task.id));
  const snapshot = getControlProgressSnapshot(project.id, projectTasks);
  const controls = (snapshot.controls || []).filter((control) => assignedIds.has(control.id));
  const breakdown = computeWorkspaceStatusBreakdown(controls);
  const overdueControls = filterOverdueControls(controls, taskMap);

  const notStarted = breakdown[PROGRESS_STATUS.NOT_STARTED] || 0;
  const inProgress = breakdown[PROGRESS_STATUS.IN_PROGRESS] || 0;
  const completed = breakdown[PROGRESS_STATUS.COMPLETED] || 0;
  const overdue = overdueControls.length;

  return {
    project,
    isMember: isStaffOnProject(project, email),
    assignedTotal: breakdown.total,
    notStarted,
    inProgress,
    completed,
    overdue,
    breakdown,
    focusScore: assignedTasks.length
      ? overdue * 100 + inProgress * 10 + notStarted
      : -1
  };
}

export function buildStaffPortfolio(projects, tasks, email) {
  const normalized = normalizeStaffEmail(email);
  if (!normalized) return [];

  return projects
    .filter((project) => isStaffOnProject(project, normalized) || tasks.some((task) => (
      task.projectId === project.id && normalizeStaffEmail(task.owner) === normalized
    )))
    .map((project) => buildProjectEntry(project, tasks, normalized))
    .sort((a, b) => {
      if (b.focusScore !== a.focusScore) return b.focusScore - a.focusScore;
      return b.assignedTotal - a.assignedTotal;
    });
}

export function pickFocusProjectEntry(portfolio) {
  return portfolio.find((entry) => entry.assignedTotal > 0) || portfolio[0] || null;
}

/** 跨项目负荷：逾期权重 3、测试中 2、未开始 1 */
export function computeStaffSaturation(portfolio) {
  let overdue = 0;
  let inProgress = 0;
  let notStarted = 0;
  let assignedTotal = 0;
  let projectCount = portfolio.length;

  portfolio.forEach((entry) => {
    overdue += entry.overdue;
    inProgress += entry.inProgress;
    notStarted += entry.notStarted;
    assignedTotal += entry.assignedTotal;
  });

  const weightedLoad = overdue * 3 + inProgress * 2 + notStarted;
  const maxWeighted = 18;
  const percent = assignedTotal
    ? Math.min(100, Math.round((weightedLoad / maxWeighted) * 100))
    : 0;

  let level = "低";
  let levelClass = "load-low";
  if (percent >= 70 || overdue >= 2) {
    level = "高";
    levelClass = "load-high";
  } else if (percent >= 35 || overdue >= 1) {
    level = "中";
    levelClass = "load-medium";
  }

  return {
    projectCount,
    assignedTotal,
    overdue,
    inProgress,
    notStarted,
    weightedLoad,
    percent,
    level,
    levelClass
  };
}

export function formatStaffAssignmentSummary(entry) {
  if (!entry.assignedTotal) {
    return entry.isMember ? "成员身份 · 暂无指派测试点" : "暂无测试点";
  }

  const parts = [];
  if (entry.notStarted) parts.push(`未开始 ${entry.notStarted}`);
  if (entry.inProgress) parts.push(`测试中 ${entry.inProgress}`);
  if (entry.completed) parts.push(`已完成 ${entry.completed}`);
  if (entry.overdue) parts.push(`逾期 ${entry.overdue}`);
  return parts.join(" · ");
}
