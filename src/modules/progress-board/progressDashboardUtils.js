import { PROGRESS_STATUS } from "../../services/workspaceProgressService";
import {
  getOverdueControls,
  getStaleNotStartedControls
} from "./attentionItemsUtils";
import {
  daysOverdueForControl,
  daysUntilPlanDue
} from "./progressDueUtils";
import { WORKSPACE_STATUS_SEGMENTS } from "./progressVisualTokens";

export { WORKSPACE_STATUS_SEGMENTS };

export function computeWorkspaceStatusBreakdown(controls = []) {
  const breakdown = {
    [PROGRESS_STATUS.NOT_STARTED]: 0,
    [PROGRESS_STATUS.IN_PROGRESS]: 0,
    [PROGRESS_STATUS.COMPLETED]: 0,
    total: controls.length
  };

  controls.forEach((control) => {
    const key = control.workspaceStatus || PROGRESS_STATUS.NOT_STARTED;
    if (breakdown[key] !== undefined) {
      breakdown[key] += 1;
    } else {
      breakdown[PROGRESS_STATUS.IN_PROGRESS] += 1;
    }
  });

  return breakdown;
}

export function buildDonutStyle(breakdown) {
  const total = breakdown.total || 0;
  if (!total) {
    return { background: "#dfe1e6" };
  }

  let cursor = 0;
  const stops = [];

  WORKSPACE_STATUS_SEGMENTS.forEach((segment) => {
    const count = breakdown[segment.id] || 0;
    if (!count) return;
    const start = (cursor / total) * 100;
    cursor += count;
    const end = (cursor / total) * 100;
    stops.push(`${segment.color} ${start}% ${end}%`);
  });

  if (!stops.length) {
    return { background: "#dfe1e6" };
  }

  return { background: `conic-gradient(${stops.join(", ")})` };
}

export function computeDashboardKpis(controls = [], taskMap = {}) {
  let completedNodes = 0;
  let totalNodes = 0;
  let completed = 0;
  let inProgress = 0;
  let overdue = 0;
  let dueSoon = 0;
  let blocked = 0;

  controls.forEach((control) => {
    completedNodes += control.completedNodes || 0;
    totalNodes += control.totalNodes || 0;

    if (control.workspaceStatus === PROGRESS_STATUS.COMPLETED) {
      completed += 1;
    } else if (control.workspaceStatus === PROGRESS_STATUS.IN_PROGRESS) {
      inProgress += 1;
    }

    if (control.progressStatus === PROGRESS_STATUS.BLOCKED) {
      blocked += 1;
    }

    const task = taskMap[control.id];
    if (control.workspaceStatus === PROGRESS_STATUS.COMPLETED) return;

    const overdueDays = daysOverdueForControl(control, task);
    if (overdueDays > 0) {
      overdue += 1;
      return;
    }

    const untilDue = daysUntilPlanDue(control, task);
    if (untilDue !== null && untilDue >= 0 && untilDue <= 7) {
      dueSoon += 1;
    }
  });

  return {
    total: controls.length,
    completed,
    inProgress,
    nodeProgress: `${completedNodes}/${totalNodes || 0}`,
    overdue,
    dueSoon,
    blocked,
    dueRisk: overdue + dueSoon
  };
}

export function computeControlTypeDistribution(controls = []) {
  const buckets = new Map();

  controls.forEach((control) => {
    const type = control.controlType || "TASK";
    if (!buckets.has(type)) {
      buckets.set(type, { id: type, total: 0, completed: 0 });
    }
    const entry = buckets.get(type);
    entry.total += 1;
    if (control.workspaceStatus === PROGRESS_STATUS.COMPLETED) {
      entry.completed += 1;
    }
  });

  return [...buckets.values()]
    .map((entry) => ({
      ...entry,
      percent: entry.total ? Math.round((entry.completed / entry.total) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total);
}

export function computeAttentionBuckets(controls = [], taskMap = {}, projectStartDate = "") {
  const overdueIds = new Set(getOverdueControls(controls, taskMap).map((item) => item.control.id));
  const staleIds = new Set(
    getStaleNotStartedControls(controls, taskMap, projectStartDate).map((item) => item.control.id)
  );

  const buckets = {
    overdue: 0,
    stale: 0,
    blocked: 0,
    onTrack: 0
  };

  controls.forEach((control) => {
    if (overdueIds.has(control.id)) {
      buckets.overdue += 1;
      return;
    }
    if (staleIds.has(control.id)) {
      buckets.stale += 1;
      return;
    }
    if (control.progressStatus === PROGRESS_STATUS.BLOCKED) {
      buckets.blocked += 1;
      return;
    }
    buckets.onTrack += 1;
  });

  return buckets;
}

export function getRecentActivity(controls = [], limit = 8) {
  return [...controls]
    .filter((control) => control.updatedAt)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
    .map((control) => ({
      id: control.id,
      title: control.title,
      owner: control.owner,
      updatedAt: control.updatedAt,
      nodeLabel: `${control.completedNodes || 0}/${control.totalNodes || 0}`,
      tod: control.phaseProgress?.tod,
      toe: control.phaseProgress?.toe
    }));
}

export function formatActivityTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
