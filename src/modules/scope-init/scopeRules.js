import { COLUMNS } from "../../data/mockData";
import { columnTitle } from "../../utils/taskUtils";

export const COLUMN_ORDER = COLUMNS.map((column) => column.id);

export const CRITICAL_PHASE_LABELS = {
  "scope-confirm": "Scope 确认",
  "risk-assessment": "风险评估",
  "control-design": "控制设计",
  "control-test": "控制测试",
  "deficiency-review": "缺陷评估",
  "wrap-up": "项目收尾"
};

export function isScopeCriticalTask(task) {
  return Boolean(task?.scopeCritical);
}

export function validateStatusTransition(task, nextStatus) {
  if (!task || task.status === nextStatus) {
    return { allowed: true };
  }

  const currentIndex = COLUMN_ORDER.indexOf(task.status);
  const nextIndex = COLUMN_ORDER.indexOf(nextStatus);

  if (currentIndex === -1 || nextIndex === -1) {
    return { allowed: true };
  }

  if (nextIndex < currentIndex) {
    return { allowed: true };
  }

  if (!isScopeCriticalTask(task)) {
    return { allowed: true };
  }

  if (nextIndex - currentIndex > 1) {
    const skipped = COLUMNS.slice(currentIndex + 1, nextIndex)
      .map((column) => column.title)
      .join("、");

    return {
      allowed: false,
      message: `「${task.title}」为关键审计步骤，不可跳过：${skipped}。请按阶段逐步推进。`
    };
  }

  return { allowed: true };
}

export function getWorkflowHint(task) {
  if (!isScopeCriticalTask(task)) return null;

  const phase = CRITICAL_PHASE_LABELS[task.auditPhase];
  const current = columnTitle(task.status);
  return phase
    ? `关键步骤 · ${phase} · 当前阶段：${current}`
    : `关键步骤 · 当前阶段：${current}，不可跨列跳转`;
}
