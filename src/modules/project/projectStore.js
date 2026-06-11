import { createInviteToken } from "./inviteUtils";
import { normalizeEmail } from "./projectValidation";

export const PROJECTS_STORAGE_KEY = "deepsleep-projects-v2";
export const CURRENT_PROJECT_KEY = "deepsleep-current-project-id";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadProjects() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects) {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

export function loadCurrentProjectId() {
  return localStorage.getItem(CURRENT_PROJECT_KEY) || "";
}

export function saveCurrentProjectId(projectId) {
  if (projectId) {
    localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
  } else {
    localStorage.removeItem(CURRENT_PROJECT_KEY);
  }
}

function nextProjectId(projects) {
  const max = projects.reduce((current, project) => {
    const match = String(project.id).match(/PRJ-(\d+)/);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 100);
  return `PRJ-${max + 1}`;
}

export function buildMember(email, role, existing) {
  if (existing) {
    return existing;
  }

  return {
    id: `mem_${Math.random().toString(36).slice(2, 9)}`,
    email: normalizeEmail(email),
    role,
    inviteToken: createInviteToken(),
    status: "active",
    invitedAt: new Date().toISOString()
  };
}

export function buildMembersFromForm(form) {
  const members = [
    buildMember(form.partnerEmail, "partner"),
    buildMember(form.managerEmail, "manager"),
    buildMember(form.inChargeEmail, "in_charge")
  ];

  if (form.smEmail?.trim()) {
    members.push(buildMember(form.smEmail, "sm"));
  }

  (form.staffEmails || [])
    .map(normalizeEmail)
    .filter(Boolean)
    .forEach((email) => members.push(buildMember(email, "staff")));

  return members;
}

export function membersToForm(members) {
  const active = members.filter((member) => member.status === "active");
  const pick = (role) => active.find((member) => member.role === role)?.email || "";

  return {
    partnerEmail: pick("partner"),
    managerEmail: pick("manager"),
    inChargeEmail: pick("in_charge"),
    smEmail: pick("sm"),
    staffEmails: active.filter((member) => member.role === "staff").map((member) => member.email)
  };
}

export function createProject(form) {
  const projects = loadProjects();
  const project = {
    id: nextProjectId(projects),
    name: form.name.trim(),
    team: form.team,
    engagementType: form.engagementType,
    projectType: form.projectType,
    industry: form.industry,
    startDate: form.startDate,
    reportDate: form.reportDate || "",
    scopeStatus: "pending",
    members: buildMembersFromForm(form),
    createdAt: new Date().toISOString()
  };

  const next = [project, ...projects];
  saveProjects(next);
  saveCurrentProjectId(project.id);
  return project;
}

export function updateProject(projectId, patch) {
  const projects = loadProjects();
  const next = projects.map((project) => (
    project.id === projectId ? { ...project, ...patch } : project
  ));
  saveProjects(next);
  return next.find((project) => project.id === projectId);
}

export function updateEditableProject(projectId, payload) {
  return updateProject(projectId, {
    name: payload.name.trim(),
    startDate: payload.startDate,
    reportDate: payload.reportDate || ""
  });
}

export function getProject(projectId) {
  return loadProjects().find((project) => project.id === projectId) || null;
}

export function upsertProjectMembers(projectId, members) {
  return updateProject(projectId, { members });
}

function findActiveByRole(members, role) {
  return members.find((member) => member.role === role && member.status === "active");
}

export function reconcileMembers(project, form) {
  const previous = project.members;
  const previousActive = previous.filter((member) => member.status === "active");
  const nextActive = [];
  const invitedMembers = [];

  function assignRole(role, email, required = true) {
    const normalized = normalizeEmail(email);
    if (!normalized) {
      return required ? null : true;
    }

    const existing = findActiveByRole(previousActive, role);
    if (existing && existing.email === normalized) {
      nextActive.push(existing);
      return true;
    }

    const member = buildMember(normalized, role);
    nextActive.push(member);
    invitedMembers.push(member);
    return true;
  }

  if (!assignRole("partner", form.partnerEmail)) return null;
  if (!assignRole("manager", form.managerEmail)) return null;
  if (!assignRole("in_charge", form.inChargeEmail)) return null;
  assignRole("sm", form.smEmail, false);

  const staffEmails = (form.staffEmails || []).map(normalizeEmail).filter(Boolean);
  staffEmails.forEach((email) => {
    const existing = previousActive.find(
      (member) => member.role === "staff" && member.email === email
    );
    if (existing) {
      nextActive.push(existing);
      return;
    }
    const member = buildMember(email, "staff");
    nextActive.push(member);
    invitedMembers.push(member);
  });

  const nextActiveIds = new Set(nextActive.map((member) => member.id));
  const revoked = previous.map((member) => (
    member.status === "active" && !nextActiveIds.has(member.id)
      ? { ...member, status: "revoked" }
      : member
  ));

  const merged = [
    ...revoked.filter((member) => member.status === "revoked" || nextActiveIds.has(member.id)),
    ...nextActive.filter((member) => !revoked.some((item) => item.id === member.id))
  ];

  return { members: merged, invitedMembers };
}

export function updateProjectMembers(projectId, form) {
  const project = getProject(projectId);
  if (!project) return null;

  const reconciled = reconcileMembers(project, form);
  if (!reconciled) return null;

  const updated = updateProject(projectId, { members: reconciled.members });
  return {
    project: updated,
    invitedMembers: reconciled.invitedMembers
  };
}

export function revokeMember(projectId, memberId) {
  const project = getProject(projectId);
  if (!project) return null;

  const members = project.members.map((member) => (
    member.id === memberId ? { ...member, status: "revoked" } : member
  ));

  return updateProject(projectId, { members });
}

export function requiredRolesFilled(members) {
  const active = members.filter((member) => member.status === "active");
  return ["partner", "manager", "in_charge"].every((role) => (
    active.some((member) => member.role === role)
  ));
}

export function cloneProject(project) {
  return clone(project);
}

export function deleteProject(projectId) {
  const projects = loadProjects().filter((project) => project.id !== projectId);
  saveProjects(projects);

  if (loadCurrentProjectId() === projectId) {
    saveCurrentProjectId("");
  }

  return projects;
}
