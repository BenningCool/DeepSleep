import { PROGRESS_STATUS } from "../../services/workspaceProgressService";

/**
 * 控制点计划完成日解析（v1.6.6）
 *
 * 当前主数据源：看板 Task.due
 * 预留字段（pull 上游后自动生效，无需改 KPI / 需关注 / 列表组件）：
 *   - control.plannedDue / control.dueDate（snapshot）
 *   - task.plannedDue / task.dueDate
 */
const DAY_MS = 1000 * 60 * 60 * 24;

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function resolveControlPlanDue(control, task) {
  const candidates = [
    task?.due,
    control?.plannedDue,
    control?.dueDate,
    task?.plannedDue,
    task?.dueDate
  ];

  for (const value of candidates) {
    if (value && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "";
}

export function daysUntilPlanDue(control, task) {
  const dueValue = resolveControlPlanDue(control, task);
  if (!dueValue) return null;

  const due = startOfDay(dueValue);
  if (Number.isNaN(due.getTime())) return null;

  const today = startOfDay(new Date());
  return Math.ceil((due - today) / DAY_MS);
}

export function daysOverdueForControl(control, task) {
  const until = daysUntilPlanDue(control, task);
  return until !== null && until < 0 ? Math.abs(until) : 0;
}

export function isControlPlanOverdue(control, task) {
  if (control?.workspaceStatus === PROGRESS_STATUS.COMPLETED) return false;
  return daysOverdueForControl(control, task) > 0;
}

/** 当前筛选范围内是否已有可计算的计划完成日 */
export function countControlsWithPlanDue(controls = [], taskMap = {}) {
  return controls.filter((control) => resolveControlPlanDue(control, taskMap[control.id])).length;
}
