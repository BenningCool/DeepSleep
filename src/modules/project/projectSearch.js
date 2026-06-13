import {
  labelOfEngagement,
  labelOfIndustry,
  labelOfProjectType,
  labelOfRole,
  labelOfTeam
} from "../../data/projectConstants";
import { labelOfSpecialistLeadRole, labelOfSpecialistTeam } from "./specialistConstants";

function collectEmails(project) {
  const emails = (project.members || [])
    .filter((member) => member.status === "active")
    .map((member) => member.email);

  (project.specialistTeams || []).forEach((team) => {
    if (team.leadEmail) emails.push(team.leadEmail);
    (team.staff || [])
      .filter((member) => member.status === "active")
      .forEach((member) => emails.push(member.email));
  });

  return emails;
}

export function buildProjectSearchText(project) {
  const parts = [
    project.clientName,
    project.name,
    project.id,
    labelOfTeam(project.team),
    labelOfEngagement(project.engagementType),
    labelOfProjectType(project.projectType),
    labelOfIndustry(project.industry),
    project.startDate,
    project.reportDate,
    project.scopeStatus,
    ...collectEmails(project),
    ...(project.members || []).map((member) => labelOfRole(member.role)),
    ...(project.specialistTeams || []).flatMap((team) => [
      labelOfSpecialistTeam(team.team),
      labelOfSpecialistLeadRole(team.leadRole),
      team.leadEmail
    ])
  ];

  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function filterProjects(projects, keyword) {
  const query = keyword.trim().toLowerCase();
  if (!query) return projects;

  return projects.filter((project) => buildProjectSearchText(project).includes(query));
}

export function sortProjects(projects, sortBy) {
  const list = [...projects];

  if (sortBy === "client") {
    return list.sort((a, b) => (
      (a.clientName || "").localeCompare(b.clientName || "", "zh-CN")
    ));
  }

  if (sortBy === "industry") {
    return list.sort((a, b) => (
      labelOfIndustry(a.industry).localeCompare(labelOfIndustry(b.industry), "zh-CN")
    ));
  }

  if (sortBy === "year") {
    return list.sort((a, b) => {
      const yearA = Number((a.startDate || "").slice(0, 4)) || 0;
      const yearB = Number((b.startDate || "").slice(0, 4)) || 0;
      return yearB - yearA;
    });
  }

  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function countActiveMembers(project) {
  const core = (project.members || []).filter((member) => member.status === "active").length;
  const specialistStaff = (project.specialistTeams || []).reduce((total, team) => (
    total + (team.staff || []).filter((member) => member.status === "active").length
  ), 0);
  const specialistLeads = (project.specialistTeams || []).length;
  return core + specialistStaff + specialistLeads;
}
