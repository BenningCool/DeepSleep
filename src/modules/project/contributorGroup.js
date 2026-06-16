const AUDIT_COORDINATION_PHASES = new Set([
  "scope-confirm",
  "risk-assessment",
  "deficiency-review",
  "wrap-up"
]);

export const CONTRIBUTOR_GROUP_LABELS = {
  audit: "Audit team",
  ita: "ITA team",
  tax: "Tax team",
  frm: "FRM team"
};

export function labelOfContributorGroup(id) {
  return CONTRIBUTOR_GROUP_LABELS[id] || id || "—";
}

function templateContributorGroup(template, auditDomain) {
  const text = `${template.title || ""} ${template.description || ""}`.toLowerCase();

  if (AUDIT_COORDINATION_PHASES.has(template.auditPhase) && template.scopeCritical) {
    return "audit";
  }
  if (text.includes("税务") || text.includes("tax")) {
    return "tax";
  }
  if (text.includes("frm") || text.includes("金融风险")) {
    return "frm";
  }
  if (
    auditDomain === "itac"
    || text.includes("itac")
    || text.includes("应用控制")
    || text.includes("自动化控制")
  ) {
    return "ita";
  }
  return "ita";
}

export function inferContributorGroupFromOwner(ownerEmail, specialistTeams, fallback = "audit") {
  const email = String(ownerEmail || "").trim().toLowerCase();
  if (!email) return fallback;

  for (const team of specialistTeams || []) {
    const emails = [
      team.leadEmail,
      ...(team.staff || [])
        .filter((member) => member.status === "active")
        .map((member) => member.email)
    ].map((value) => String(value || "").trim().toLowerCase());

    if (emails.includes(email)) {
      return team.team;
    }
  }

  return fallback;
}

export function resolveContributorGroup(template, auditDomain, owner, specialistTeams) {
  const templateDefault = templateContributorGroup(template, auditDomain);
  return inferContributorGroupFromOwner(owner, specialistTeams, templateDefault);
}

export function resolveTaskContributorGroup(task, specialistTeams) {
  if (task?.contributorGroup) {
    return inferContributorGroupFromOwner(
      task.owner,
      specialistTeams,
      task.contributorGroup
    );
  }
  return inferContributorGroupFromOwner(task?.owner, specialistTeams, "audit");
}
