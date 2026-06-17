import { getControlProgressSnapshot } from "../../services/workspaceProgressService";
import { computeWorkspaceStatusBreakdown } from "../progress-board/progressDashboardUtils";

/**
 * Project List Status Overview uses the same snapshot and computeWorkspaceStatusBreakdown basis as the Progress Board donut chart.
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
