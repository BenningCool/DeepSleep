import { labelOfRole } from "../../data/projectConstants";
import {
  buildAttentionQueue,
  buildEngagementRiskMatrix,
  buildReportWatchlist,
  countRiskTiers,
  detectReportStack,
  enrichProjectWithReport,
  pickManagementFocusEntry,
  sortByReportUrgency
} from "./reportDayUtils";
import {
  buildStaffPortfolio,
  computeStaffSaturation,
  normalizeStaffEmail,
  pickFocusProjectEntry
} from "./staffWorkloadUtils";

const IC_ROSTER_ROLES = new Set(["in_charge", "staff"]);

const ROLE_SORT_ORDER = {
  manager: 0,
  in_charge: 1,
  staff: 2,
  sm: 3,
  partner: 4
};

function memberEmail(member) {
  return normalizeStaffEmail(member?.email);
}

function isSupervisorOnProject(project, supervisorEmail, viewAs) {
  const normalized = normalizeStaffEmail(supervisorEmail);
  if (!normalized || !project) return false;

  const targetRole = viewAs === "em" ? "manager" : "in_charge";
  return (project.members || []).some((member) => (
    member.status === "active"
    && member.role === targetRole
    && memberEmail(member) === normalized
  ));
}

/** IC：in_charge = 我；EM：manager = 我 */
export function getSupervisedProjects(projects, supervisorEmail, viewAs) {
  if (viewAs !== "ic" && viewAs !== "em") return [];
  return projects.filter((project) => isSupervisorOnProject(project, supervisorEmail, viewAs));
}

function pickPrimaryRole(roles) {
  const ordered = [...roles].sort(
    (a, b) => (ROLE_SORT_ORDER[a] ?? 99) - (ROLE_SORT_ORDER[b] ?? 99)
  );
  return ordered[0] || "staff";
}

export function collectTeamRoster(supervisedProjects, viewAs, supervisorEmail) {
  const allowedRoles = IC_ROSTER_ROLES;
  const supervisor = normalizeStaffEmail(supervisorEmail);
  const roster = new Map();

  supervisedProjects.forEach((project) => {
    (project.members || [])
      .filter((member) => member.status === "active" && allowedRoles.has(member.role))
      .forEach((member) => {
        const email = memberEmail(member);
        if (!email) return;

        const existing = roster.get(email) || {
          email,
          roles: new Set(),
          projectIds: new Set()
        };
        existing.roles.add(member.role);
        existing.projectIds.add(project.id);
        roster.set(email, existing);
      });
  });

  return [...roster.values()]
    .map((entry) => ({
      email: entry.email,
      roles: [...entry.roles],
      primaryRole: pickPrimaryRole(entry.roles),
      roleLabel: labelOfRole(pickPrimaryRole(entry.roles)),
      isSelf: entry.email === supervisor,
      projectIds: [...entry.projectIds]
    }))
    .sort((a, b) => {
      if (a.isSelf && !b.isSelf) return -1;
      if (b.isSelf && !a.isSelf) return 1;
      return (ROLE_SORT_ORDER[a.primaryRole] ?? 99) - (ROLE_SORT_ORDER[b.primaryRole] ?? 99);
    });
}

export function buildPersonSnapshot(projects, tasks, email, meta = {}) {
  const portfolio = buildStaffPortfolio(projects, tasks, email);
  const saturation = computeStaffSaturation(portfolio);
  const focusEntry = pickFocusProjectEntry(portfolio);

  return {
    email,
    roleLabel: meta.roleLabel || "",
    isSelf: Boolean(meta.isSelf),
    portfolio,
    saturation,
    focusProject: focusEntry?.project || null,
    focusClientName: focusEntry?.project?.clientName || "",
    focusProjectName: focusEntry?.project?.name || "",
    focusProjectId: focusEntry?.project?.id || "",
    assignedTotal: saturation.assignedTotal,
    overdue: saturation.overdue
  };
}

export function buildTeamRollup(projects, tasks, supervisorEmail, viewAs) {
  const supervisedProjects = getSupervisedProjects(projects, supervisorEmail, viewAs);
  const roster = collectTeamRoster(supervisedProjects, viewAs, supervisorEmail);

  const people = roster.map((person) => buildPersonSnapshot(projects, tasks, person.email, {
    roleLabel: person.roleLabel,
    isSelf: person.isSelf
  }));

  people.sort((a, b) => {
    if (a.isSelf && !b.isSelf) return -1;
    if (b.isSelf && !a.isSelf) return 1;
    if (b.saturation.percent !== a.saturation.percent) {
      return b.saturation.percent - a.saturation.percent;
    }
    return b.assignedTotal - a.assignedTotal;
  });

  const highLoadCount = people.filter((person) => (
    person.saturation.levelClass === "load-high"
  )).length;
  const mediumLoadCount = people.filter((person) => (
    person.saturation.levelClass === "load-medium"
  )).length;

  const focusProjects = new Map();
  people.forEach((person) => {
    if (!person.focusProjectId) return;
    focusProjects.set(
      person.focusProjectId,
      (focusProjects.get(person.focusProjectId) || 0) + 1
    );
  });
  const focusCollision = [...focusProjects.values()].some((count) => count > 1);

  const riskMatrix = buildEngagementRiskMatrix(supervisedProjects, tasks);
  const attentionQueue = buildAttentionQueue(riskMatrix, viewAs === "em" ? 1 : 3);
  const reportWatchlist = buildReportWatchlist(supervisedProjects, tasks);
  const reportStack = detectReportStack(supervisedProjects);
  const nearestReport = sortByReportUrgency(
    supervisedProjects.map((p) => enrichProjectWithReport(p, tasks))
  )[0] || null;
  const projectOverdueTotal = supervisedProjects.reduce(
    (sum, project) => sum + enrichProjectWithReport(project, tasks).overdueCount,
    0
  );

  return {
    supervisedProjects,
    people,
    riskMatrix,
    attentionQueue,
    managementFocus: pickManagementFocusEntry(supervisedProjects, tasks),
    reportWatchlist,
    reportStack,
    nearestReport,
    summary: {
      headcount: people.length,
      fieldworkHeadcount: people.length,
      projectCount: supervisedProjects.length,
      highLoadCount,
      mediumLoadCount,
      totalOverdue: projectOverdueTotal,
      focusCollision,
      watchlistCount: reportWatchlist.length,
      nearestReport,
      riskCounts: countRiskTiers(riskMatrix)
    }
  };
}

export function formatFocusLabel(person) {
  if (!person.focusProject) {
    return person.assignedTotal ? "—" : "暂无指派程序";
  }
  const client = person.focusProject.clientName || "未填写客户";
  const name = person.focusProject.name || person.focusProjectId;
  return `${client} · ${name}`;
}
