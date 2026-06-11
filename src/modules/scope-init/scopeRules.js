import { COLUMNS } from "../../data/mockData";
import { columnTitle } from "../../utils/taskUtils";

export const COLUMN_ORDER = COLUMNS.map((column) => column.id);

export const AUDIT_PHASE_ORDER = {
  "scope-confirm": 0,
  "risk-assessment": 1,
  "control-design": 2,
  "industry-addon": 3,
  "control-test": 4,
  "deficiency-review": 5,
  "wrap-up": 6
};

export const CRITICAL_PHASE_LABELS = {
  "scope-confirm": "Scope 确认",
  "risk-assessment": "风险评估",
  "control-design": "控制设计",
  "industry-addon": "行业专项",
  "control-test": "控制测试",
  "deficiency-review": "缺陷评估",
  "wrap-up": "项目收尾"
};

export const WORKFLOW_STEPS = [
  { id: "scope-confirm", label: "Scope 确认", critical: true },
  { id: "risk-assessment", label: "风险评估", critical: true },
  { id: "control-design", label: "控制设计", critical: false },
  { id: "control-test", label: "控制测试", critical: false },
  { id: "deficiency-review", label: "缺陷评估", critical: true },
  { id: "wrap-up", label: "项目收尾", critical: true }
];

export function isScopeCriticalTask(task) {
  return Boolean(task?.scopeCritical);
}

export function getPhaseOrder(phase) {
  return AUDIT_PHASE_ORDER[phase] ?? 99;
}

export function statusIndex(status) {
  return COLUMN_ORDER.indexOf(status);
}

function sameScopeProject(task, target) {
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
      .join("、");

    return {
      allowed: false,
      message: `「${task.title}」为关键审计步骤，不可跳过：${skipped}。请按阶段逐步推进。`
    };
  }

  const blockers = getBlockingPredecessors(task, allTasks, nextStatus);
  if (blockers.length) {
    const names = blockers.map((item) => `「${item.title}」`).join("、");
    return {
      allowed: false,
      message: `请先完成前置关键步骤 ${names}，再推进「${task.title}」。`
    };
  }

  return { allowed: true };
}

export function getWorkflowHint(task, allTasks = []) {
  if (!task?.scopeGenerated) return null;

  const parts = [];
  if (isScopeCriticalTask(task)) {
    const phase = CRITICAL_PHASE_LABELS[task.auditPhase];
    parts.push(`关键步骤 · ${phase || task.auditPhase}`);
  }

  parts.push(`当前阶段：${columnTitle(task.status)}`);

  const blockers = getBlockingPredecessors(task, allTasks, task.status);
  if (blockers.length) {
    parts.push(`待完成前置：${blockers.map((item) => item.title).join("、")}`);
  } else if (isScopeCriticalTask(task)) {
    parts.push("不可跨列跳转");
  }

  return parts.join(" · ");
}

export function groupTasksByPhase(tasks) {
  const groups = new Map();

  tasks.forEach((task) => {
    const phase = task.auditPhase || "general";
    if (!groups.has(phase)) {
      groups.set(phase, {
        phase,
        label: CRITICAL_PHASE_LABELS[phase] || phase,
        order: getPhaseOrder(phase),
        tasks: []
      });
    }
    groups.get(phase).tasks.push(task);
  });

  return [...groups.values()].sort((a, b) => a.order - b.order);
}
