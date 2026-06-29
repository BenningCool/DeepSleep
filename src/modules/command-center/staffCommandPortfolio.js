import {
  buildAttentionQueue,
  buildEngagementRiskMatrix,
  buildReportWatchlist,
  countRiskTiers,
  detectReportStack,
  enrichProjectWithReport,
  sortByReportUrgency
} from "./reportDayUtils";
import {
  buildStaffPortfolio,
  computeStaffSaturation,
  pickFocusProjectEntry
} from "./staffWorkloadUtils";

export function getStaffProjects(projects, tasks, email) {
  return buildStaffPortfolio(projects, tasks, email).map((entry) => entry.project);
}

export function buildStaffCommandPortfolio(projects, tasks, email) {
  const portfolio = buildStaffPortfolio(projects, tasks, email);
  const staffProjects = portfolio.map((entry) => entry.project);
  const saturation = computeStaffSaturation(portfolio);
  const focusEntry = pickFocusProjectEntry(portfolio);
  const riskMatrix = buildEngagementRiskMatrix(staffProjects, tasks);
  const watchlist = buildReportWatchlist(staffProjects, tasks);
  const reportStack = detectReportStack(staffProjects);
  const nearestReport = sortByReportUrgency(
    staffProjects.map((project) => enrichProjectWithReport(project, tasks))
  )[0] || null;

  return {
    portfolio,
    staffProjects,
    saturation,
    focusEntry,
    riskMatrix,
    attentionQueue: buildAttentionQueue(riskMatrix, 1),
    watchlist,
    reportStack,
    nearestReport,
    summary: {
      projectCount: staffProjects.length,
      fieldworkHeadcount: 1,
      assignedTotal: saturation.assignedTotal,
      saturationLevel: saturation.level,
      saturationPercent: saturation.percent,
      watchlistCount: watchlist.length,
      riskCounts: countRiskTiers(riskMatrix)
    }
  };
}
