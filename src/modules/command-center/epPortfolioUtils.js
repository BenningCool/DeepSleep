import { normalizeStaffEmail } from "./staffWorkloadUtils";
import {
  buildAttentionQueue,
  buildEngagementRiskMatrix,
  buildReportWatchlist,
  countRiskTiers,
  detectReportStack,
  enrichProjectWithReport,
  sortByReportUrgency
} from "./reportDayUtils";
import { buildPersonWorkloadRows } from "./personWorkloadUtils";
import { labelOfRole } from "../../data/projectConstants";

function memberEmail(member) {
  return normalizeStaffEmail(member?.email);
}

export function getPartnerProjects(projects, partnerEmail) {
  const normalized = normalizeStaffEmail(partnerEmail);
  if (!normalized) return [];

  return projects.filter((project) => (
    (project.members || []).some((member) => (
      member.status === "active"
      && member.role === "partner"
      && memberEmail(member) === normalized
    ))
  ));
}

export function getManagerEmail(project) {
  const manager = (project.members || []).find(
    (member) => member.status === "active" && member.role === "manager"
  );
  return memberEmail(manager);
}

export function groupProjectsByManager(projects) {
  const groups = new Map();

  projects.forEach((project) => {
    const managerEmail = getManagerEmail(project) || "__unassigned__";
    const existing = groups.get(managerEmail) || {
      managerEmail,
      projects: []
    };
    existing.projects.push(project);
    groups.set(managerEmail, existing);
  });

  return [...groups.values()].sort((a, b) => {
    const aNearest = sortByReportUrgency(
      a.projects.map((p) => enrichProjectWithReport(p))
    )[0];
    const bNearest = sortByReportUrgency(
      b.projects.map((p) => enrichProjectWithReport(p))
    )[0];
    const aDays = aNearest?.urgency.days ?? Number.MAX_SAFE_INTEGER;
    const bDays = bNearest?.urgency.days ?? Number.MAX_SAFE_INTEGER;
    return aDays - bDays;
  });
}

export function buildEmGroupSnapshot(projects, tasks, managerEmail) {
  const enriched = sortByReportUrgency(projects.map((p) => enrichProjectWithReport(p, tasks)));
  const nearest = enriched[0] || null;
  const personTeams = managerEmail && managerEmail !== "__unassigned__"
    ? buildPersonWorkloadRows(projects, tasks, managerEmail, "em")
    : [];
  const assignedTotal = personTeams.reduce((sum, row) => sum + (row.assignedTotal || 0), 0);
  const highLoadCount = personTeams.filter((row) => row.loadLevelClass === "load-high").length;

  const totalOverdue = enriched.reduce((sum, entry) => sum + entry.overdueCount, 0);
  const reportStack = detectReportStack(projects);

  return {
    managerEmail,
    managerLabel: managerEmail === "__unassigned__" ? "未指定 EM" : managerEmail,
    projectCount: projects.length,
    projects: enriched,
    personTeams,
    assignedTotal,
    nearestReport: nearest,
    totalOverdue,
    highLoadCount,
    executionHeadcount: personTeams.length,
    reportStack
  };
}

export function buildEpPortfolio(projects, tasks, partnerEmail) {
  const partnerProjects = getPartnerProjects(projects, partnerEmail);
  const managerGroups = groupProjectsByManager(partnerProjects);
  const emGroups = managerGroups.map((group) => (
    buildEmGroupSnapshot(group.projects, tasks, group.managerEmail)
  ));

  const riskMatrix = buildEngagementRiskMatrix(partnerProjects, tasks, getManagerEmail);
  const attentionQueue = buildAttentionQueue(riskMatrix, 3);
  const watchlist = buildReportWatchlist(partnerProjects, tasks);
  const portfolioStack = detectReportStack(partnerProjects);
  const nearestReport = sortByReportUrgency(
    partnerProjects.map((p) => enrichProjectWithReport(p, tasks))
  )[0] || null;

  const criticalCount = watchlist.filter((entry) => (
    entry.urgency.tier === "critical" || entry.urgency.tier === "past"
  )).length;
  const warningCount = watchlist.filter((entry) => entry.urgency.tier === "warning").length;

  const riskCounts = countRiskTiers(riskMatrix);

  return {
    partnerProjects,
    emGroups,
    riskMatrix,
    attentionQueue,
    watchlist,
    portfolioStack,
    nearestReport,
    summary: {
      projectCount: partnerProjects.length,
      emCount: emGroups.length,
      watchlistCount: watchlist.length,
      criticalCount,
      warningCount,
      totalOverdue: partnerProjects.reduce(
        (sum, project) => sum + enrichProjectWithReport(project, tasks).overdueCount,
        0
      ),
      nearestReport,
      riskCounts
    }
  };
}

export function formatManagerRoleLabel() {
  return labelOfRole("manager");
}
