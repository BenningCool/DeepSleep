import { labelOfRole, labelOfTeam } from "../../data/projectConstants";
import { labelOfSpecialistLeadRole, labelOfSpecialistTeam } from "./specialistConstants";

export function createInviteToken() {
  return `inv_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function buildInviteLink(projectId, token, extraParams = {}) {
  const base = `${window.location.origin}${window.location.pathname}`;
  const params = new URLSearchParams({
    project: projectId,
    invite: token,
    ...extraParams
  });
  return `${base}?${params.toString()}`;
}

export function formatMemberInviteMessage(project, member) {
  const team = labelOfTeam(project.team);
  const role = labelOfRole(member.role);
  const link = buildInviteLink(project.id, member.inviteToken);
  const clientLine = project.clientName ? `Client: ${project.clientName}\n` : "";

  const zh = [
    `You have been invited to join audit project “${project.name}”.`,
    clientLine.trim(),
    `Team: ${team} · Role: ${role}`,
    `Click the link to join the project: ${link}`
  ].filter(Boolean).join("\n");

  const en = [
    `You have been invited to join the engagement "${project.name}".`,
    project.clientName ? `Client: ${project.clientName}` : "",
    `Team: ${team} · Role: ${role}`,
    `Please click the link below to join: ${link}`
  ].filter(Boolean).join("\n");

  return { link, zh, en };
}

export function formatSpecialistLeadInviteMessage(project, specialistTeam) {
  const link = buildInviteLink(project.id, specialistTeam.inviteToken, {
    specialist: specialistTeam.team
  });
  const teamLabel = labelOfSpecialistTeam(specialistTeam.team);
  const roleLabel = labelOfSpecialistLeadRole(specialistTeam.leadRole);

  const zh = [
    `You have been invited to join project “${project.name}” as ${roleLabel} of ${teamLabel}.`,
    project.clientName ? `Client: ${project.clientName}` : "",
    `Please sign in and add staff for this team: ${link}`
  ].filter(Boolean).join("\n");

  const en = [
    `You have been invited as ${roleLabel} for the ${teamLabel} specialist group on "${project.name}".`,
    project.clientName ? `Client: ${project.clientName}` : "",
    `Please join and add your team staff: ${link}`
  ].filter(Boolean).join("\n");

  return { link, zh, en };
}

export function formatSpecialistStaffInviteMessage(project, specialistTeam, staffMember) {
  const link = buildInviteLink(project.id, staffMember.inviteToken);
  const teamLabel = labelOfSpecialistTeam(specialistTeam.team);

  const zh = [
    `You have been invited to join the ${teamLabel} specialist team for project “${project.name}”.`,
    project.clientName ? `Client: ${project.clientName}` : "",
    `Click the link to view the project: ${link}`
  ].filter(Boolean).join("\n");

  const en = [
    `You have been invited to join the ${teamLabel} specialist group on "${project.name}".`,
    project.clientName ? `Client: ${project.clientName}` : "",
    `Please click the link below: ${link}`
  ].filter(Boolean).join("\n");

  return { link, zh, en };
}
