import { OVERDUE_VISUAL, WORKSPACE_STATUS_VISUAL } from "../progress-board/progressVisualTokens";
import { PROGRESS_STATUS } from "../../services/workspaceProgressService";

/** 关注级别 → 进度看板同款 pill / KPI tone */
export const RISK_TIER_VISUAL = {
  critical: {
    pillClass: "progress-flag overdue",
    borderColor: OVERDUE_VISUAL.border,
    kpiTone: "due-risk-alert",
    iconType: "overdue"
  },
  elevated: {
    pillClass: "progress-pill workspace-status not-started",
    borderColor: WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.NOT_STARTED].border,
    kpiTone: "status-not-started",
    iconType: "not-started"
  },
  watch: {
    pillClass: "progress-pill workspace-status in-progress",
    borderColor: WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.IN_PROGRESS].border,
    kpiTone: "status-in-progress",
    iconType: "in-progress"
  },
  on_track: {
    pillClass: "progress-pill workspace-status completed",
    borderColor: WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.COMPLETED].border,
    kpiTone: "status-completed",
    iconType: "completed"
  }
};

export const REPORT_URGENCY_ZONE_COLOR = {
  "report-critical": OVERDUE_VISUAL.fill,
  "report-past": OVERDUE_VISUAL.fill,
  "report-warning": WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.NOT_STARTED].fill,
  "report-upcoming": "#6b778c",
  "report-ok": WORKSPACE_STATUS_VISUAL[PROGRESS_STATUS.COMPLETED].fill,
  "report-missing": "#6554c0"
};

export function riskTierVisual(tier) {
  return RISK_TIER_VISUAL[tier] || RISK_TIER_VISUAL.on_track;
}
