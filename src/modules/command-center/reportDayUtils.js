import { daysUntilDate } from "./commandCenterUtils";
import { getControlProgressSnapshot } from "../../services/workspaceProgressService";
import { buildTaskMap } from "../progress-board/progressBoardUtils";
import { filterOverdueControls } from "../progress-board/progressDashboardUtils";

export const REPORT_WINDOWS = {
  critical: 7,
  warning: 14,
  upcoming: 30
};

const TIER_SCORE = {
  missing: 900,
  past: 1000,
  critical: 800,
  warning: 500,
  upcoming: 200,
  ok: 0
};

export function getReportUrgency(reportDate) {
  const days = daysUntilDate(reportDate);

  if (days === null) {
    return {
      tier: "missing",
      days: null,
      label: "未填 Report Date",
      shortLabel: "未填",
      className: "report-missing"
    };
  }

  if (days < 0) {
    return {
      tier: "past",
      days,
      label: `报告日已过 ${Math.abs(days)} 天`,
      shortLabel: `过期 ${Math.abs(days)}d`,
      className: "report-past"
    };
  }

  if (days <= REPORT_WINDOWS.critical) {
    return {
      tier: "critical",
      days,
      label: `D-${days} · 7 天内`,
      shortLabel: `D-${days}`,
      className: "report-critical"
    };
  }

  if (days <= REPORT_WINDOWS.warning) {
    return {
      tier: "warning",
      days,
      label: `D-${days} · 14 天内`,
      shortLabel: `D-${days}`,
      className: "report-warning"
    };
  }

  if (days <= REPORT_WINDOWS.upcoming) {
    return {
      tier: "upcoming",
      days,
      label: `D-${days} · 30 天内`,
      shortLabel: `D-${days}`,
      className: "report-upcoming"
    };
  }

  return {
    tier: "ok",
    days,
    label: `D-${days}`,
    shortLabel: `D-${days}`,
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

export function pickManagementFocusEntry(projects, tasks) {
  const sorted = sortByReportUrgency(projects.map((p) => enrichProjectWithReport(p, tasks)));
  return sorted[0] || null;
}

export function formatReportStackMessage(stack) {
  if (!stack.triggered) return "";
  return `${stack.count} 个项目 Report Date 落在未来 ${stack.withinDays} 天内，存在 last minute 堆叠风险，建议提前协调资源。`;
}
