import { labelOfContributorGroup } from "../project/contributorGroup";
import {
  buildAttentionQueue,
  buildEngagementRiskMatrix,
  buildReportWatchlist,
  countRiskTiers,
  detectReportStack,
  enrichProjectWithReport,
  sortByReportUrgency
} from "./reportDayUtils";

export function getContributorLeadProjects(projects, tasks, group) {
  const projectIds = new Set(
    tasks
      .filter((task) => task.contributorGroup === group)
      .map((task) => task.projectId)
  );
  return projects.filter((project) => projectIds.has(project.id));
}

export function buildContributorLeadPortfolio(projects, tasks, group) {
  const leadProjects = getContributorLeadProjects(projects, tasks, group);
  const riskMatrix = buildEngagementRiskMatrix(leadProjects, tasks);
  const watchlist = buildReportWatchlist(leadProjects, tasks);
  const reportStack = detectReportStack(leadProjects);
  const nearestReport = sortByReportUrgency(
    leadProjects.map((project) => enrichProjectWithReport(project, tasks))
  )[0] || null;

  return {
    leadProjects,
    contributorGroup: group,
    contributorLabel: labelOfContributorGroup(group),
    riskMatrix,
    attentionQueue: buildAttentionQueue(riskMatrix, 3),
    watchlist,
    reportStack,
    nearestReport,
    summary: {
      projectCount: leadProjects.length,
      contributorGroup: group,
      contributorLabel: labelOfContributorGroup(group),
      watchlistCount: watchlist.length,
      riskCounts: countRiskTiers(riskMatrix)
    }
  };
}
