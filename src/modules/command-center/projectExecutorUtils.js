import { labelOfRole } from "../../data/projectConstants";
import { PROGRESS_STATUS } from "../../services/workspaceProgressService";
import { buildTaskMap } from "../progress-board/progressBoardUtils";
import { filterOverdueControls } from "../progress-board/progressDashboardUtils";
import { getControlProgressSnapshot } from "../../services/workspaceProgressService";
import { normalizeStaffEmail } from "./staffWorkloadUtils";

const FIELD_ROLES = new Set(["in_charge", "staff"]);

const ROLE_SORT = {
  in_charge: 0,
  staff: 1
};

function memberRoleMap(project) {
  const map = new Map();
  (project.members || [])
    .filter((member) => member.status === "active")
    .forEach((member) => {
      const email = normalizeStaffEmail(member.email);
      if (email) map.set(email, member.role);
    });
  return map;
}

export function buildProjectExecutorRows(project, tasks = []) {
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const rolesByEmail = memberRoleMap(project);
  const byEmail = new Map();

  projectTasks.forEach((task) => {
    const email = normalizeStaffEmail(task.owner);
    if (!email) return;

    const existing = byEmail.get(email) || {
      email,
      role: rolesByEmail.get(email) || "staff",
      assignedCount: 0,
      inProgress: 0,
      overdue: 0
    };
    existing.assignedCount += 1;
    byEmail.set(email, existing);
  });

  if (byEmail.size) {
    const taskMap = buildTaskMap(projectTasks);
    const snapshot = getControlProgressSnapshot(project.id, projectTasks);
    const controls = snapshot.controls || [];

    byEmail.forEach((executor, email) => {
      const assignedIds = new Set(
        projectTasks
          .filter((task) => normalizeStaffEmail(task.owner) === email)
          .map((task) => task.id)
      );
      const assignedControls = controls.filter((control) => assignedIds.has(control.id));
      executor.inProgress = assignedControls.filter(
        (control) => taskMap[control.id]?.status === PROGRESS_STATUS.IN_PROGRESS
      ).length;
      executor.overdue = filterOverdueControls(assignedControls, taskMap).length;
      executor.roleLabel = labelOfRole(executor.role);
    });
  }

  if (!byEmail.size) {
    (project.members || [])
      .filter((member) => member.status === "active" && FIELD_ROLES.has(member.role))
      .forEach((member) => {
        const email = normalizeStaffEmail(member.email);
        if (!email || byEmail.has(email)) return;
        byEmail.set(email, {
          email,
          role: member.role,
          roleLabel: labelOfRole(member.role),
          assignedCount: 0,
          inProgress: 0,
          overdue: 0
        });
      });
  }

  return [...byEmail.values()].sort((a, b) => {
    const roleDiff = (ROLE_SORT[a.role] ?? 9) - (ROLE_SORT[b.role] ?? 9);
    if (roleDiff !== 0) return roleDiff;
    return b.assignedCount - a.assignedCount;
  });
}

export function buildProjectTeamRow(enrichedEntry, tasks) {
  const executors = buildProjectExecutorRows(enrichedEntry.project, tasks);
  return {
    projectId: enrichedEntry.project.id,
    clientName: enrichedEntry.project.clientName || enrichedEntry.project.name,
    projectName: enrichedEntry.project.name,
    urgency: enrichedEntry.urgency,
    overdueCount: enrichedEntry.overdueCount,
    executorCount: executors.length,
    assignedTotal: executors.reduce((sum, item) => sum + item.assignedCount, 0),
    executors
  };
}

export function summarizeResourceGroups(groups = []) {
  return groups.reduce((acc, group) => ({
    groupCount: acc.groupCount + 1,
    projectCount: acc.projectCount + (group.projectCount || 0),
    headcount: acc.headcount + (group.executionHeadcount || 0),
    highLoadCount: acc.highLoadCount + (group.highLoadCount || 0),
    totalOverdue: acc.totalOverdue + (group.totalOverdue || 0)
  }), {
    groupCount: 0,
    projectCount: 0,
    headcount: 0,
    highLoadCount: 0,
    totalOverdue: 0
  });
}
