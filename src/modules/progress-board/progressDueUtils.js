import { PROGRESS_STATUS } from "../../services/workspaceProgressService";

/**
 * 控制点计划完成日解析（对齐 PROGRESS_API.md）
 *
 * 优先级：看板 task.due → snapshot 预留字段 → nodeDueDates 最晚节点日 → task 预留
 * 逾期判定：未完成且（计划完成日已过期，或任一节点 nodeDueDates 已过期）
 */
const DAY_MS = 1000 * 60 * 60 * 24;

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function collectNodeDueDates(control) {
  if (!control?.nodeDueDates || typeof control.nodeDueDates !== "object") {
    return [];
  }

  return Object.values(control.nodeDueDates)
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}

/** 控制点级展示用计划完成日：取 nodeDueDates 中最晚日期 */
function resolveNodeDueDatesPlanDue(control) {
  const dates = collectNodeDueDates(control).sort();
  return dates.length ? dates[dates.length - 1] : "";
}

export function resolveControlPlanDue(control, task) {
  const candidates = [
    task?.due,
    control?.plannedDue,
    control?.dueDate,
    resolveNodeDueDatesPlanDue(control),
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

export function hasResolvablePlanDue(control, task) {
  return Boolean(resolveControlPlanDue(control, task))
    || collectNodeDueDates(control).length > 0;
}

function daysPastDue(dateValue) {
  const due = startOfDay(dateValue);
  if (Number.isNaN(due.getTime())) return 0;

  const today = startOfDay(new Date());
  const diff = today - due;
  return diff > 0 ? Math.ceil(diff / DAY_MS) : 0;
}

function earliestPastNodeOverdueDays(control) {
  const today = startOfDay(new Date());
  let maxDays = 0;

  collectNodeDueDates(control).forEach((dateValue) => {
    const due = startOfDay(dateValue);
    if (Number.isNaN(due.getTime()) || due >= today) return;
    maxDays = Math.max(maxDays, daysPastDue(dateValue));
  });

  return maxDays;
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
  const planOverdueDays = (() => {
    const until = daysUntilPlanDue(control, task);
    return until !== null && until < 0 ? Math.abs(until) : 0;
  })();

  return Math.max(planOverdueDays, earliestPastNodeOverdueDays(control));
}

export function isControlPlanOverdue(control, task) {
  if (control?.workspaceStatus === PROGRESS_STATUS.COMPLETED) return false;
  return daysOverdueForControl(control, task) > 0;
}

/** 当前筛选范围内是否已有可计算计划完成日（含 nodeDueDates） */
export function countControlsWithPlanDue(controls = [], taskMap = {}) {
  return controls.filter((control) => (
    hasResolvablePlanDue(control, taskMap[control.id])
  )).length;
}
