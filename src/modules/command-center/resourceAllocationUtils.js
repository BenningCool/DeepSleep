import {
  enrichProjectWithReport,
  sortByReportUrgency
} from "./reportDayUtils";
import {
  buildEmGroupSnapshot,
  groupProjectsByManager
} from "./epPortfolioUtils";
import { buildProjectTeamRow } from "./projectExecutorUtils";
import { buildPersonWorkloadRows } from "./personWorkloadUtils";
import { buildStaffCommandPortfolio } from "./staffCommandPortfolio";

export function buildEmResourceGroups(projects, tasks) {
  return groupProjectsByManager(projects).map((group) => (
    buildEmGroupSnapshot(group.projects, tasks, group.managerEmail)
  ));
}

export function buildSupervisorResourceGroup(projects, tasks, supervisorEmail, viewAs) {
  const enriched = sortByReportUrgency(
    projects.map((project) => enrichProjectWithReport(project, tasks))
  );
  const personTeams = buildPersonWorkloadRows(projects, tasks, supervisorEmail, viewAs);
  const assignedTotal = personTeams.reduce((sum, row) => sum + (row.assignedTotal || 0), 0);
  const highLoadCount = personTeams.filter((row) => row.loadLevelClass === "load-high").length;

  return {
    managerEmail: supervisorEmail,
    managerLabel: supervisorEmail,
    projectCount: projects.length,
    personTeams,
    assignedTotal,
    totalOverdue: enriched.reduce((sum, entry) => sum + entry.overdueCount, 0),
    executionHeadcount: personTeams.length,
    highLoadCount,
    blockTitle: viewAs === "ic" ? "组内人力 · IC / Staff" : "所辖 IC / Staff · 人力分配"
  };
}

export function buildStaffResourceGroup(projects, tasks, email) {
  const portfolio = buildStaffCommandPortfolio(projects, tasks, email);
  const enriched = sortByReportUrgency(
    portfolio.staffProjects.map((project) => enrichProjectWithReport(project, tasks))
  );

  return {
    managerEmail: email,
    managerLabel: email,
    projectCount: portfolio.staffProjects.length,
    executionHeadcount: 1,
    highLoadCount: 0,
    totalOverdue: enriched.reduce((sum, entry) => sum + entry.overdueCount, 0),
    projectTeams: enriched.map((entry) => buildProjectTeamRow(entry, tasks)),
    isPersonal: true,
    blockTitle: "参与项目 · 我的指派",
    assignedTotal: portfolio.summary.assignedTotal,
    saturationLevel: portfolio.summary.saturationLevel
  };
}

export function buildContributorResourceGroup(projects, tasks, email, contributorLabel) {
  const enriched = sortByReportUrgency(
    projects.map((project) => enrichProjectWithReport(project, tasks))
  );

  return {
    managerEmail: email,
    managerLabel: email,
    projectCount: projects.length,
    executionHeadcount: 0,
    highLoadCount: 0,
    totalOverdue: enriched.reduce((sum, entry) => sum + entry.overdueCount, 0),
    projectTeams: enriched.map((entry) => buildProjectTeamRow(entry, tasks)),
    blockTitle: `${contributorLabel} 组协作项目`
  };
}
