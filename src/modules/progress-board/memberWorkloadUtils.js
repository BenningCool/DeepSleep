import { DASHBOARD_CARD_LABELS } from "../../data/progressLabels";
import { computeWorkspaceStatusBreakdown } from "./progressDashboardUtils";
import {
  isUnassignedOwner,
  normalizeOwnerEmail,
  resolveOwnerBucketKey,
  UNASSIGNED_MEMBER_KEY
} from "./progressOwnerUtils";

export { UNASSIGNED_MEMBER_KEY };
const UNASSIGNED_KEY = UNASSIGNED_MEMBER_KEY;

/** Execution members: Audit In-charge + Staff; Specialist Staff only, excluding Lead */
const EXECUTION_AUDIT_ROLES = new Set(["in_charge", "staff"]);

function normalizeEmail(value) {
  return normalizeOwnerEmail(value);
}

export function getProjectTeamIds(project) {
  const ids = ["audit"];
  (project?.specialistTeams || []).forEach((team) => {
    if (team?.team) ids.push(team.team);
  });
  return ids;
}

export function getTeamMemberEmails(project, teamId) {
  if (teamId === "audit") {
    return (project?.members || [])
      .filter((member) => member.status === "active")
      .map((member) => normalizeEmail(member.email))
      .filter(Boolean);
  }

  const specialistTeam = (project?.specialistTeams || []).find((team) => team.team === teamId);
  if (!specialistTeam) return [];

  const emails = new Set();
  const lead = normalizeEmail(specialistTeam.leadEmail);
  if (lead) emails.add(lead);

  (specialistTeam.staff || [])
    .filter((member) => member.status === "active")
    .forEach((member) => {
      const email = normalizeEmail(member.email);
      if (email) emails.add(email);
    });

  return [...emails];
}

/** Audit / Specialist execution member emails: IC + Staff */
export function getExecutionMemberEmails(project, teamId) {
  if (teamId === "audit") {
    return (project?.members || [])
      .filter((member) => (
        member.status === "active" && EXECUTION_AUDIT_ROLES.has(member.role)
      ))
      .map((member) => normalizeEmail(member.email))
      .filter(Boolean);
  }

  const specialistTeam = (project?.specialistTeams || []).find((team) => team.team === teamId);
  if (!specialistTeam) return [];

  return (specialistTeam.staff || [])
    .filter((member) => member.status === "active")
    .map((member) => normalizeEmail(member.email))
    .filter(Boolean);
}

/** All owner group: each group IC + Staff, deduplicated */
export function getAllExecutionMemberEmails(project) {
  const emails = new Set();
  getProjectTeamIds(project).forEach((teamId) => {
    getExecutionMemberEmails(project, teamId).forEach((email) => emails.add(email));
  });
  return [...emails];
}

/** All owner group: Audit plus all active members from enabled Specialist groups in this project, deduplicated */
export function getAllProjectMemberEmails(project) {
  const emails = new Set();
  getProjectTeamIds(project).forEach((teamId) => {
    getTeamMemberEmails(project, teamId).forEach((email) => emails.add(email));
  });
  return [...emails];
}

/**
 * @param teamId Top owner group; empty string means All
 * @param controls Snapshot controls under the current global filters, using Workspace workspaceStatus
 */
export function getMemberFilterOptions(project, teamId = "", controls = []) {
  const roster = teamId
    ? getTeamMemberEmails(project, teamId)
    : getAllProjectMemberEmails(project);
  const emails = new Set(roster);
  let hasUnassigned = false;

  controls.forEach((control) => {
    if (isUnassignedOwner(control.owner)) {
      hasUnassigned = true;
      return;
    }
    const email = normalizeEmail(control.owner);
    if (email) emails.add(email);
  });

  return {
    emails: [...emails].sort((a, b) => a.localeCompare(b, "zh-CN")),
    hasUnassigned
  };
}

export function computeMemberWorkloadRows(teamId, controls = [], project) {
  const isAllTeams = !teamId;
  const rosterEmails = isAllTeams
    ? getAllExecutionMemberEmails(project)
    : getExecutionMemberEmails(project, teamId);
  const executionOwnerSet = new Set(rosterEmails);

  const scopedControls = (isAllTeams
    ? controls
    : controls.filter((control) => (control.contributorGroup || "audit") === teamId)
  ).filter((control) => {
    if (isUnassignedOwner(control.owner)) return true;
    const email = normalizeEmail(control.owner);
    return email && executionOwnerSet.has(email);
  });

  const controlsByOwner = new Map();

  scopedControls.forEach((control) => {
    const ownerKey = resolveOwnerBucketKey(control.owner);
    if (!controlsByOwner.has(ownerKey)) {
      controlsByOwner.set(ownerKey, []);
    }
    controlsByOwner.get(ownerKey).push(control);
  });

  const rows = rosterEmails.map((email) => ({
    id: email,
    label: email,
    breakdown: computeWorkspaceStatusBreakdown(controlsByOwner.get(email) || []),
    isRoster: true
  }));

  rosterEmails.forEach((email) => controlsByOwner.delete(email));

  if (controlsByOwner.has(UNASSIGNED_KEY)) {
    rows.push({
      id: UNASSIGNED_KEY,
      label: DASHBOARD_CARD_LABELS.teamMemberProgressUnassigned,
      breakdown: computeWorkspaceStatusBreakdown(controlsByOwner.get(UNASSIGNED_KEY)),
      isRoster: false
    });
    controlsByOwner.delete(UNASSIGNED_KEY);
  }

  return sortMemberWorkloadRows(rows);
}

function sortMemberWorkloadRows(rows) {
  return [...rows].sort((a, b) => {
    if (a.id === UNASSIGNED_KEY && b.id !== UNASSIGNED_KEY) return 1;
    if (b.id === UNASSIGNED_KEY && a.id !== UNASSIGNED_KEY) return -1;

    const totalA = a.breakdown?.total || 0;
    const totalB = b.breakdown?.total || 0;
    if (totalA !== totalB) return totalB - totalA;

    return a.label.localeCompare(b.label, "zh-CN");
  });
}
