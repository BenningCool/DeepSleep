import { daysUntilDate } from "./commandCenterUtils";
import { getControlProgressSnapshot, PROGRESS_STATUS } from "../../services/workspaceProgressService";
import { getProjectWorkspaceStatusOverview } from "../project/projectProgressOverview";
import { buildTaskMap } from "../progress-board/progressBoardUtils";
import { filterOverdueControls } from "../progress-board/progressDashboardUtils";

export const REPORT_WINDOWS = {
  critical: 7,
  warning: 14,
  upcoming: 30
};

const RISK_TIER_ORDER = {
  critical: 0,
  elevated: 1,
  watch: 2,
  on_track: 3
};

const TIER_SCORE = {
  missing: 900,
  past: 1000,
  critical: 800,
  warning: 500,
  upcoming: 200,
  ok: 0
};

function buildReadableReportLabel(days) {
  if (days === null) return "未填写报告日";
  if (days < 0) return `报告日已过 ${Math.abs(days)} 天`;
  if (days === 0) return "报告日为今天";
  return `报告日还有 ${days} 天`;
}

function buildCompactReportLabel(days) {
  if (days === null) return "未填";
  if (days < 0) return `过期${Math.abs(days)}天`;
  if (days === 0) return "今天";
  return `D-${days}`;
}

export function getReportUrgency(reportDate) {
  const days = daysUntilDate(reportDate);
  const readableLabel = buildReadableReportLabel(days);
  const compactLabel = buildCompactReportLabel(days);

  if (days === null) {
    return {
      tier: "missing",
      days: null,
      label: "未填写报告日",
      readableLabel,
      compactLabel,
      shortLabel: "未填",
      className: "report-missing"
    };
  }

  if (days < 0) {
    return {
      tier: "past",
      days,
      label: readableLabel,
      readableLabel,
      compactLabel,
      shortLabel: compactLabel,
      className: "report-past"
    };
  }

  if (days <= REPORT_WINDOWS.critical) {
    return {
      tier: "critical",
      days,
      label: `${readableLabel}（7 天内）`,
      readableLabel,
      compactLabel,
      shortLabel: compactLabel,
      className: "report-critical"
    };
  }

  if (days <= REPORT_WINDOWS.warning) {
    return {
      tier: "warning",
      days,
      label: `${readableLabel}（14 天内）`,
      readableLabel,
      compactLabel,
      shortLabel: compactLabel,
      className: "report-warning"
    };
  }

  if (days <= REPORT_WINDOWS.upcoming) {
    return {
      tier: "upcoming",
      days,
      label: `${readableLabel}（30 天内）`,
      readableLabel,
      compactLabel,
      shortLabel: compactLabel,
      className: "report-upcoming"
    };
  }

  return {
    tier: "ok",
    days,
    label: readableLabel,
    readableLabel,
    compactLabel,
    shortLabel: compactLabel,
    className: "report-ok"
  };
}

export function countProjectOverdue(projectId, tasks) {
  const projectTasks = tasks.filter((task) => task.projectId === projectId);
  if (!projectTasks.length) return 0;
  const snapshot = getControlProgressSnapshot(projectId, projectTasks);
  return filterOverdueControls(snapshot.controls || [], buildTaskMap(projectTasks)).length;
}

export function enrichProjectWithReport(project, tasks = []) {
  const urgency = getReportUrgency(project.reportDate);
  const overdueCount = countProjectOverdue(project.id, tasks);
  return {
    project,
    urgency,
    overdueCount,
    managementScore: TIER_SCORE[urgency.tier] + overdueCount * 50
  };
}

export function sortByReportUrgency(entries) {
  return [...entries].sort((a, b) => {
    if (a.urgency.days === null && b.urgency.days !== null) return 1;
    if (b.urgency.days === null && a.urgency.days !== null) return -1;
    if (a.urgency.days !== null && b.urgency.days !== null && a.urgency.days !== b.urgency.days) {
      return a.urgency.days - b.urgency.days;
    }
    return b.managementScore - a.managementScore;
  });
}

export function buildReportWatchlist(projects, tasks, withinDays = REPORT_WINDOWS.upcoming) {
  return sortByReportUrgency(
    projects
      .map((project) => enrichProjectWithReport(project, tasks))
      .filter((entry) => (
        entry.urgency.tier === "missing"
        || entry.urgency.tier === "past"
        || (entry.urgency.days !== null && entry.urgency.days <= withinDays)
      ))
  );
}

export function detectReportStack(projects, withinDays = REPORT_WINDOWS.warning) {
  const matched = projects.filter((project) => {
    const days = daysUntilDate(project.reportDate);
    return days !== null && days >= 0 && days <= withinDays;
  });
  return {
    count: matched.length,
    withinDays,
    triggered: matched.length >= 2,
    projects: matched
  };
}

export function pickManagementFocusEntry(projects, tasks, resolveManagerEmail) {
  const matrix = buildEngagementRiskMatrix(projects, tasks, resolveManagerEmail);
  return buildAttentionQueue(matrix, 1)[0] || null;
}

export function computeProjectCompletion(projectId, tasks) {
  const breakdown = getProjectWorkspaceStatusOverview(projectId, tasks);
  const total = breakdown.total || 0;
  const completed = breakdown[PROGRESS_STATUS.COMPLETED] || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : null;
  return { completed, total, percent };
}

export function computeEngagementRisk(entry, completion) {
  const { urgency, overdueCount } = entry;
  const days = urgency.days;
  const percent = completion.percent;

  if (
    urgency.tier === "past"
    || urgency.tier === "critical"
    || overdueCount >= 3
    || (urgency.tier === "missing" && overdueCount > 0)
  ) {
    return {
      tier: "critical",
      label: "Critical",
      labelZh: "需立即关注",
      className: "risk-critical"
    };
  }

  if (
    urgency.tier === "warning"
    || (overdueCount >= 1 && overdueCount <= 2)
    || (percent !== null && percent < 50 && days !== null && days <= 60)
  ) {
    return {
      tier: "elevated",
      label: "Elevated",
      labelZh: "需重点关注",
      className: "risk-elevated"
    };
  }

  if (
    urgency.tier === "upcoming"
    || urgency.tier === "missing"
    || (percent !== null && percent < 70)
  ) {
    return {
      tier: "watch",
      label: "Watch",
      labelZh: "持续跟踪",
      className: "risk-watch"
    };
  }

  return {
    tier: "on_track",
    label: "On track",
    labelZh: "进展正常",
    className: "risk-on-track"
  };
}

function compareRiskMatrixRows(a, b) {
  const riskDiff = RISK_TIER_ORDER[a.risk.tier] - RISK_TIER_ORDER[b.risk.tier];
  if (riskDiff !== 0) return riskDiff;

  if (a.urgency.days === null && b.urgency.days !== null) return 1;
  if (b.urgency.days === null && a.urgency.days !== null) return -1;
  if (
    a.urgency.days !== null
    && b.urgency.days !== null
    && a.urgency.days !== b.urgency.days
  ) {
    return a.urgency.days - b.urgency.days;
  }

  if (b.overdueCount !== a.overdueCount) {
    return b.overdueCount - a.overdueCount;
  }

  return b.managementScore - a.managementScore;
}

export function buildEngagementRiskMatrix(projects, tasks, resolveManagerEmail = () => "") {
  const rows = projects.map((project) => {
    const base = enrichProjectWithReport(project, tasks);
    const completion = computeProjectCompletion(project.id, tasks);
    const risk = computeEngagementRisk(base, completion);
    const managerEmail = resolveManagerEmail(project);
    return {
      ...base,
      managerEmail: managerEmail && managerEmail !== "__unassigned__" ? managerEmail : "",
      managerLabel: managerEmail && managerEmail !== "__unassigned__"
        ? managerEmail
        : "未指定 EM",
      completion,
      risk,
      managementScore: (4 - RISK_TIER_ORDER[risk.tier]) * 1000
        + base.managementScore
        + (completion.percent !== null ? Math.max(0, 70 - completion.percent) : 0)
    };
  });

  return rows.sort(compareRiskMatrixRows);
}

export function buildAttentionQueue(riskMatrixRows, limit = 3) {
  return [...riskMatrixRows].sort(compareRiskMatrixRows).slice(0, limit);
}

export function formatReportStackMessage(stack) {
  if (!stack.triggered) return "";
  return `报告日集中：未来 ${stack.withinDays} 天内有 ${stack.count} 个项目出具报告，请提前协调现场资源。`;
}

export function formatNearestReportHint(entry) {
  if (!entry) return "";
  const client = entry.project.clientName || entry.project.name;
  const overduePart = entry.overdueCount
    ? ` · ${entry.overdueCount} 项程序逾期`
    : "";
  return `最近报告日：${entry.urgency.readableLabel} · ${client}${overduePart}`;
}

export function countRiskTiers(riskMatrixRows) {
  return {
    critical: riskMatrixRows.filter((row) => row.risk.tier === "critical").length,
    elevated: riskMatrixRows.filter((row) => row.risk.tier === "elevated").length,
    watch: riskMatrixRows.filter((row) => row.risk.tier === "watch").length,
    onTrack: riskMatrixRows.filter((row) => row.risk.tier === "on_track").length
  };
}
