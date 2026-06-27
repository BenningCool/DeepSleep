import { getControlProgressSnapshot } from "../../services/workspaceProgressService";
import { computeWorkspaceStatusBreakdown } from "../progress-board/progressDashboardUtils";

/**
 * 项目列表「状态概述」：与进度看板 **KPI 四格**同一 snapshot + `computeWorkspaceStatusBreakdown` 口径（`workspaceStatus` 三态）。
 */
export function getProjectWorkspaceStatusOverview(projectId, allTasks = []) {
  if (!projectId) {
    return computeWorkspaceStatusBreakdown([]);
  }

  const projectTasks = allTasks.filter((task) => task.projectId === projectId);
  if (!projectTasks.length) {
    return computeWorkspaceStatusBreakdown([]);
  }

  const controls = getControlProgressSnapshot(projectId, projectTasks).controls || [];
  return computeWorkspaceStatusBreakdown(controls);
}
