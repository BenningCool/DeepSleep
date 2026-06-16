import { PROGRESS_STATUS } from "../../services/workspaceProgressService";
import {
  daysOverdueForControl,
  daysUntilPlanDue,
  isControlPlanOverdue,
  resolveControlPlanDue
} from "./progressDueUtils";

const DAY_MS = 1000 * 60 * 60 * 24;
export const STALE_NOT_STARTED_DAYS = 14;
export const DUE_SOON_NOT_STARTED_DAYS = 7;

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

/** @deprecated 使用 daysOverdueForControl(control, task) */
export function daysOverdue(task) {
  if (!task?.due) return 0;
  const due = startOfDay(task.due);
  if (Number.isNaN(due.getTime())) return 0;
  const today = startOfDay(new Date());
  const diff = today - due;
  return diff > 0 ? Math.ceil(diff / DAY_MS) : 0;
}

export function isControlOverdue(control, task) {
  return isControlPlanOverdue(control, task);
}

function daysSinceProjectStart(projectStartDate) {
  if (!projectStartDate) return 0;
  const start = startOfDay(projectStartDate);
  if (Number.isNaN(start.getTime())) return 0;
  const today = startOfDay(new Date());
  return Math.max(0, Math.ceil((today - start) / DAY_MS));
}

export function getOverdueControls(controls, taskMap = {}) {
  return controls
    .filter((control) => isControlPlanOverdue(control, taskMap[control.id]))
    .map((control) => {
      const task = taskMap[control.id];
      return {
        control,
        task,
        planDue: resolveControlPlanDue(control, task),
        overdueDays: daysOverdueForControl(control, task)
      };
    })
    .sort((a, b) => b.overdueDays - a.overdueDays);
}

export function getStaleNotStartedControls(controls, taskMap = {}, projectStartDate = "") {
  const overdueIds = new Set(getOverdueControls(controls, taskMap).map((item) => item.control.id));
  const daysSinceStart = daysSinceProjectStart(projectStartDate);

  return controls
    .filter((control) => {
      if (overdueIds.has(control.id)) return false;
      if (control.workspaceStatus !== PROGRESS_STATUS.NOT_STARTED) return false;
      if (control.progressStatus === PROGRESS_STATUS.BLOCKED) return false;

      const task = taskMap[control.id];
      if (task?.status && task.status !== "todo") return false;

      const untilDue = daysUntilPlanDue(control, task);
      if (untilDue !== null && untilDue >= 0 && untilDue <= DUE_SOON_NOT_STARTED_DAYS) {
        return true;
      }

      if (daysSinceStart >= STALE_NOT_STARTED_DAYS) {
        return true;
      }

      return false;
    })
    .map((control) => {
      const task = taskMap[control.id];
      const untilDue = daysUntilPlanDue(control, task);
      let reason = `项目已进行 ${daysSinceStart} 天仍未启动`;
      if (untilDue !== null && untilDue >= 0 && untilDue <= DUE_SOON_NOT_STARTED_DAYS) {
        reason = `距计划完成日仅剩 ${untilDue} 天，仍未启动`;
      }
      return { control, task, reason };
    })
    .sort((a, b) => a.control.title.localeCompare(b.control.title, "zh-CN"));
}

export function hasAttentionItems(controls, taskMap = {}, projectStartDate = "") {
  return getOverdueControls(controls, taskMap).length > 0
    || getStaleNotStartedControls(controls, taskMap, projectStartDate).length > 0;
}
