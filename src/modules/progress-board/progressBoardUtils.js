import { PROGRESS_STATUS } from "../../services/workspaceProgressService";
import { WORKFLOW_STEPS, labelOfAuditPhase, normalizeAuditPhase } from "../scope-init/scopeRules";

const PENDING_STATUSES = new Set([
  PROGRESS_STATUS.IN_PROGRESS,
  PROGRESS_STATUS.EVIDENCE_SUBMITTED,
  PROGRESS_STATUS.PENDING_REVIEW,
  PROGRESS_STATUS.NEEDS_REWORK
]);

export function isDelayedControl(control, task) {
  if (control.progressStatus === PROGRESS_STATUS.BLOCKED) return true;
  if (!task?.due || control.progressStatus === PROGRESS_STATUS.COMPLETED) return false;
  const due = new Date(task.due);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function computeProgressKpis(controls, taskMap = {}) {
  return controls.reduce((stats, control) => {
    stats.total += 1;
    if (control.progressStatus === PROGRESS_STATUS.COMPLETED) {
      stats.completed += 1;
    }
    if (PENDING_STATUSES.has(control.progressStatus)) {
      stats.pending += 1;
    }
    if (isDelayedControl(control, taskMap[control.id])) {
      stats.delay += 1;
    }
    return stats;
  }, { total: 0, completed: 0, pending: 0, delay: 0 });
}

export function computePhaseProgress(controls) {
  const groups = new Map(
    WORKFLOW_STEPS.map((step) => [
      step.id,
      { phase: step.id, label: step.label, total: 0, completed: 0 }
    ])
  );

  controls.forEach((control) => {
    const phase = normalizeAuditPhase(control.auditPhase);
    if (!groups.has(phase)) return;

    const entry = groups.get(phase);
    entry.total += 1;
    if (control.progressStatus === PROGRESS_STATUS.COMPLETED) {
      entry.completed += 1;
    }
  });

  return WORKFLOW_STEPS.map((step) => groups.get(step.id));
}

export { labelOfAuditPhase };

export function buildTaskMap(tasks) {
  return Object.fromEntries((tasks || []).map((task) => [task.id, task]));
}

export function isBoardProgressMismatch(control) {
  if (!control) return false;
  if (control.progressStatus === PROGRESS_STATUS.BLOCKED) return false;
  return control.taskStatus === "done"
    && control.progressStatus !== PROGRESS_STATUS.COMPLETED;
}
