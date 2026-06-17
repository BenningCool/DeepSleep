import { PROGRESS_STATUS } from "../../services/workspaceProgressService";

/**
 * Progress Board visual tokens shared by KPI cards, donut charts, legends, and pills.
 * Not Started=amber · Testing=blue · Completed=green · Overdue=red
 */
export const WORKSPACE_STATUS_VISUAL = {
  [PROGRESS_STATUS.NOT_STARTED]: {
    fill: "#ff991f",
    bg: "#fffae6",
    border: "#ffab00",
    text: "#974f0c"
  },
  [PROGRESS_STATUS.IN_PROGRESS]: {
    fill: "#0052cc",
    bg: "#deebff",
    border: "#2684ff",
    text: "#0747a6"
  },
  [PROGRESS_STATUS.COMPLETED]: {
    fill: "#00875a",
    bg: "#e3fcef",
    border: "#36b37e",
    text: "#006644"
  }
};

export const OVERDUE_VISUAL = {
  fill: "#de350b",
  bg: "#ffebe6",
  border: "#ff5630",
  text: "#bf2600"
};

export const STALE_VISUAL = {
  fill: "#ff991f",
  bg: "#fffae6",
  border: "#ffab00",
  text: "#974f0c"
};

export const BLOCKED_VISUAL = {
  fill: "#6554c0",
  bg: "#eae6ff",
  border: "#8777d9",
  text: "#403294"
};

export const KPI_TONE_VISUAL = {
  completed: {
    accent: WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.COMPLETED].fill,
    bg: WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.COMPLETED].bg
  },
  inProgress: {
    accent: WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.IN_PROGRESS].fill,
    bg: WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.IN_PROGRESS].bg
  },
  notStarted: {
    accent: WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.NOT_STARTED].fill,
    bg: WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.NOT_STARTED].bg
  },
  neutral: {
    accent: "#5e6c84",
    bg: "#fafbfc"
  },
  dueRiskOk: {
    accent: "#36b37e",
    bg: "#f4f5f7"
  },
  dueRiskWarn: {
    accent: OVERDUE_VISUAL.border,
    bg: "#fff5f2"
  },
  dueRiskAlert: {
    accent: OVERDUE_VISUAL.fill,
    bg: OVERDUE_VISUAL.bg
  }
};

export const WORKSPACE_STATUS_SEGMENTS = [
  {
    id: PROGRESS_STATUS.NOT_STARTED,
    color: WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.NOT_STARTED].fill,
    labelKey: "notStarted"
  },
  {
    id: PROGRESS_STATUS.IN_PROGRESS,
    color: WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.IN_PROGRESS].fill,
    labelKey: "inProgress"
  },
  {
    id: PROGRESS_STATUS.COMPLETED,
    color: WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.COMPLETED].fill,
    labelKey: "completed"
  }
];

export function workspaceStatusClass(status) {
  return String(status || "").replaceAll("_", "-");
}
