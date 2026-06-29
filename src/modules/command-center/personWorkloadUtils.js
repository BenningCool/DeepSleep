import { buildTeamRollup } from "./teamRollupUtils";

export function buildPersonWorkloadRows(projects, tasks, supervisorEmail, viewAs) {
  const rollup = buildTeamRollup(projects, tasks, supervisorEmail, viewAs);

  return rollup.people.map((person) => ({
    email: person.email,
    roleLabel: person.roleLabel,
    isSelf: person.isSelf,
    projectCount: person.portfolio.filter((entry) => entry.assignedTotal > 0).length
      || person.portfolio.length,
    assignedTotal: person.assignedTotal,
    overdue: person.overdue,
    loadLevel: person.saturation.level,
    loadLevelClass: person.saturation.levelClass,
    projects: person.portfolio
      .filter((entry) => entry.assignedTotal > 0 || entry.isMember)
      .map((entry) => ({
        projectId: entry.project.id,
        clientName: entry.project.clientName || entry.project.name,
        projectName: entry.project.name,
        assignedTotal: entry.assignedTotal,
        overdue: entry.overdue
      }))
  }));
}

export function summarizePersonTeams(personTeams = []) {
  return personTeams.reduce((acc, row) => ({
    headcount: acc.headcount + 1,
    projectCount: acc.projectCount + (row.projectCount || 0),
    assignedTotal: acc.assignedTotal + (row.assignedTotal || 0),
    overdue: acc.overdue + (row.overdue || 0),
    highLoadCount: acc.highLoadCount + (row.loadLevelClass === "load-high" ? 1 : 0)
  }), {
    headcount: 0,
    projectCount: 0,
    assignedTotal: 0,
    overdue: 0,
    highLoadCount: 0
  });
}
