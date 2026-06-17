import { COLUMNS } from "../../data/mockData";
import { columnTitle } from "../../utils/taskUtils";

export const COLUMN_ORDER = COLUMNS.map((column) => column.id);

export const AUDIT_PHASE_ORDER = {
  "scope-confirm": 0,
  "risk-assessment": 1,
  "control-design": 2,
  "control-test": 3,
  "deficiency-review": 4,
  "wrap-up": 5
};

export const LEGACY_AUDIT_PHASE_MAP = {
  "industry-addon": "control-test"
};

export const CRITICAL_PHASE_LABELS = {
  "scope-confirm": "Scope Confirmation",
  "risk-assessment": "Risk Assessment",
  "control-design": "Control Design",
  "control-test": "Control Testing",
  "deficiency-review": "Deficiency Evaluation",
  "wrap-up": "Project Wrap-up"
};

export function normalizeAuditPhase(phase) {
  return LEGACY_AUDIT_PHASE_MAP[phase] || phase || "";
}

export function labelOfAuditPhase(phase) {
  const normalized = normalizeAuditPhase(phase);
  return CRITICAL_PHASE_LABELS[normalized] || normalized || "—";
}

export const WORKFLOW_STEPS = [
  { id: "scope-confirm", label: "Scope Confirmation", critical: true },
  { id: "risk-assessment", label: "Risk Assessment", critical: true },
  { id: "control-design", label: "Control Design", critical: false },
  { id: "control-test", label: "Control Testing", critical: false },
  { id: "deficiency-review", label: "Deficiency Evaluation", critical: true },
  { id: "wrap-up", label: "Project Wrap-up", critical: true }
];

export function isScopeCriticalTask(task) {
  return Boolean(task?.scopeCritical);
}

export function getPhaseOrder(phase) {
  return AUDIT_PHASE_ORDER[normalizeAuditPhase(phase)] ?? 99;
}

export function statusIndex(status) {
  return COLUMN_ORDER.indexOf(status);
}

function sameScopeProject(task, target) {
  if (task?.projectId && target?.projectId) {
    return task.projectId === target.projectId;
  }
  if (!task?.scopeMeta?.projectName || !target?.scopeMeta?.projectName) return false;
  return task.scopeMeta.projectName === target.scopeMeta.projectName;
}

function getBlockingPredecessors(task, allTasks, nextStatus) {
  if (!task?.scopeGenerated || !task.auditPhase) return [];

  const nextIndex = statusIndex(nextStatus);
  const taskPhaseOrder = getPhaseOrder(task.auditPhase);
  if (nextIndex < 0) return [];

  return allTasks.filter((candidate) => {
    if (candidate.id === task.id) return false;
    if (!sameScopeProject(task, candidate)) return false;
    if (!candidate.scopeCritical) return false;

    const candidatePhaseOrder = getPhaseOrder(candidate.auditPhase);
    if (candidatePhaseOrder >= taskPhaseOrder) return false;

    const candidateIndex = statusIndex(candidate.status);
    return candidateIndex < nextIndex;
  });
}

export function validateStatusTransition(task, nextStatus, allTasks = []) {
  if (!task || task.status === nextStatus) {
    return { allowed: true };
  }

  const currentIndex = statusIndex(task.status);
  const nextIndex = statusIndex(nextStatus);

  if (currentIndex === -1 || nextIndex === -1) {
    return { allowed: true };
  }

  if (nextIndex < currentIndex) {
    return { allowed: true };
  }

  if (isScopeCriticalTask(task) && nextIndex - currentIndex > 1) {
    const skipped = COLUMNS.slice(currentIndex + 1, nextIndex)
      .map((column) => column.title)
      .join(", ");

    return {
      allowed: false,
      message: `"${task.title}" is a critical audit step and cannot skip: ${skipped}. Move through stages sequentially.`
    };
  }

  const blockers = getBlockingPredecessors(task, allTasks, nextStatus);
  if (blockers.length) {
    const names = blockers.map((item) => `"${item.title}"`).join(", ");
    return {
      allowed: false,
      message: `Complete prerequisite critical steps first: ${names} before moving "${task.title}".`
    };
  }

  return { allowed: true };
}

export function getWorkflowHint(task, allTasks = []) {
  if (!task?.scopeGenerated) return null;

  const parts = [];
  if (isScopeCriticalTask(task)) {
    parts.push(`Critical step · ${labelOfAuditPhase(task.auditPhase)}`);
  }

  parts.push(`Current stage: ${columnTitle(task.status)}`);

  const blockers = getBlockingPredecessors(task, allTasks, task.status);
  if (blockers.length) {
    parts.push(`Pending prerequisites: ${blockers.map((item) => item.title).join(", ")}`);
  } else if (isScopeCriticalTask(task)) {
    parts.push("Cannot skip columns");
  }

  return parts.join(" · ");
}

export function groupTasksByPhase(tasks) {
  const groups = new Map();

  tasks.forEach((task) => {
    const phase = normalizeAuditPhase(task.auditPhase) || "general";
    if (!groups.has(phase)) {
      groups.set(phase, {
        phase,
        label: labelOfAuditPhase(phase),
        order: getPhaseOrder(phase),
        tasks: []
      });
    }
    groups.get(phase).tasks.push(task);
  });

  return [...groups.values()].sort((a, b) => a.order - b.order);
}
