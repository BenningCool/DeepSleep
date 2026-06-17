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

/** 占当前筛选控制点总数的百分比（整数，无分母时返回 —） */
export function formatSharePercent(count, total) {
  if (!total || total <= 0) return "—";
  const numeric = typeof count === "number" ? count : 0;
  return `${Math.round((numeric / total) * 100)}%`;
}

/** 按控制点类型筛选（ALL / GITC / ITAC） */
export const CONTROL_TYPE_FILTER_TABS = [
  { id: "ALL", label: "全部" },
  { id: "GITC", label: "GITC" },
  { id: "ITAC", label: "ITAC" }
];

export function filterControlsByControlType(controls = [], typeFilter = "ALL") {
  if (!typeFilter || typeFilter === "ALL") return controls;
  return controls.filter((control) => control.controlType === typeFilter);
}

export function countControlsByType(controls = []) {
  return {
    ALL: controls.length,
    GITC: controls.filter((control) => control.controlType === "GITC").length,
    ITAC: controls.filter((control) => control.controlType === "ITAC").length
  };
}

export const KPI_CONTROL_TYPES = ["GITC", "ITAC"];

/** 某状态桶内 GITC / ITAC 数量及占该桶比例 */
export function computeTypeSplitForControls(controls = [], bucketTotal = controls.length) {
  const total = bucketTotal || 0;
  return KPI_CONTROL_TYPES.reduce((acc, type) => {
    const count = controls.filter((control) => control.controlType === type).length;
    acc[type] = {
      count,
      percent: formatSharePercent(count, total)
    };
    return acc;
  }, {});
}

export function filterControlsByWorkspaceStatus(controls = [], status) {
  return controls.filter(
    (control) => (control.workspaceStatus || PROGRESS_STATUS.NOT_STARTED) === status
  );
}

export function filterOverdueControls(controls = [], taskMap = {}) {
  return controls.filter((control) => {
    if (control.workspaceStatus === PROGRESS_STATUS.COMPLETED) return false;
    const task = taskMap[control.id];
    return daysOverdueForControl(control, task) > 0;
  });
}

/** 各控制点节点完成度（completedNodes / totalNodes） */
export function computeControlNodeProgressRows(controls = []) {
  return controls
    .map((control) => {
      const completedNodes = control.completedNodes || 0;
      const totalNodes = control.totalNodes || 0;
      return {
        id: control.id,
        title: control.title || control.id,
        controlType: control.controlType || "TASK",
        owner: control.owner || "",
        completedNodes,
        totalNodes,
        percent: totalNodes ? Math.round((completedNodes / totalNodes) * 100) : 0
      };
    })
    .sort((left, right) => {
      if (left.percent !== right.percent) return left.percent - right.percent;
      return left.title.localeCompare(right.title, "zh-CN");
    });
}

const NODE_PROGRESS_COMPLETED_COLOR = "#00875a";
const NODE_PROGRESS_REMAINING_COLOR = "#ebecf0";

/** 汇总 snapshot 节点进度（completedNodes / totalNodes） */
export function computeAggregateNodeProgress(controls = []) {
  let completedNodes = 0;
  let totalNodes = 0;

  controls.forEach((control) => {
    completedNodes += control.completedNodes || 0;
    totalNodes += control.totalNodes || 0;
  });

  const remainingNodes = Math.max(totalNodes - completedNodes, 0);

  return {
    completedNodes,
    totalNodes,
    remainingNodes,
    percent: totalNodes ? Math.round((completedNodes / totalNodes) * 100) : 0,
    testPointCount: controls.length
  };
}

export function computeNodeProgressByControlType(controls = []) {
  return KPI_CONTROL_TYPES.reduce((acc, type) => {
    const typed = controls.filter((control) => control.controlType === type);
    acc[type] = computeAggregateNodeProgress(typed);
    return acc;
  }, {});
}

export function computeNodeProgressOverviewRows(controls = []) {
  const all = computeAggregateNodeProgress(controls);
  const byType = computeNodeProgressByControlType(controls);

  return [
    { id: "ALL", label: "全部", ...all },
    { id: "GITC", label: "GITC", ...byType.GITC },
    { id: "ITAC", label: "ITAC", ...byType.ITAC }
  ];
}

export function buildNodeProgressDonutStyle(completedNodes, totalNodes) {
  if (!totalNodes) {
    return { background: NODE_PROGRESS_REMAINING_COLOR };
  }

  const completedPct = (completedNodes / totalNodes) * 100;
  if (completedPct <= 0) {
    return { background: NODE_PROGRESS_REMAINING_COLOR };
  }
  if (completedPct >= 100) {
    return { background: NODE_PROGRESS_COMPLETED_COLOR };
  }

  return {
    background: `conic-gradient(${NODE_PROGRESS_COMPLETED_COLOR} 0% ${completedPct}%, ${NODE_PROGRESS_REMAINING_COLOR} ${completedPct}% 100%)`
  };
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
