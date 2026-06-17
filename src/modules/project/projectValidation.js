const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(String(email || "").trim());
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateMemberEmails(form) {
  const partner = normalizeEmail(form.partnerEmail);
  const manager = normalizeEmail(form.managerEmail);
  const inCharge = normalizeEmail(form.inChargeEmail);

  if (!isValidEmail(partner)) {
    return { ok: false, message: "Enter a valid Partner email." };
  }
  if (!isValidEmail(manager)) {
    return { ok: false, message: "Enter a valid Manager email." };
  }
  if (!isValidEmail(inCharge)) {
    return { ok: false, message: "Enter a valid In-charge email." };
  }

  if (partner === manager || partner === inCharge) {
    return { ok: false, message: "Partner email cannot duplicate Manager or In-charge." };
  }

  const sm = normalizeEmail(form.smEmail);
  if (sm && !isValidEmail(sm)) {
    return { ok: false, message: "Senior Manager email is invalid." };
  }

  const staffEmails = (form.staffEmails || [])
    .map(normalizeEmail)
    .filter(Boolean);

  if (staffEmails.some((email) => !isValidEmail(email))) {
    return { ok: false, message: "Staff email is invalid." };
  }

  if (new Set(staffEmails).size !== staffEmails.length) {
    return { ok: false, message: "Duplicate emails exist in the Staff list." };
  }

  return { ok: true };
}

function validateSpecialists(form) {
  if (form.team !== "audit" || !form.specialists) {
    return { ok: true };
  }

  const enabled = Object.entries(form.specialists).filter(([, entry]) => entry.enabled);
  if (!enabled.length) {
    return { ok: true };
  }

  for (const [teamId, entry] of enabled) {
    const email = normalizeEmail(entry.leadEmail);
    if (!isValidEmail(email)) {
      return { ok: false, message: `Enter a valid ${teamId.toUpperCase()} Specialist Lead email.` };
    }
    if (!entry.leadRole) {
      return { ok: false, message: `Select ${teamId.toUpperCase()} Specialist Lead role.` };
    }
  }

  const leadEmails = enabled.map(([, entry]) => normalizeEmail(entry.leadEmail));
  if (new Set(leadEmails).size !== leadEmails.length) {
    return { ok: false, message: "Specialist Lead emails cannot duplicate." };
  }

  return { ok: true };
}

export function validateProjectForm(form) {
  if (!form.clientName?.trim()) {
    return { ok: false, message: "Enter client name." };
  }
  if (!form.name?.trim()) {
    return { ok: false, message: "Enter project name." };
  }
  if (!form.team) {
    return { ok: false, message: "Select a team." };
  }
  if (!form.engagementType) {
    return { ok: false, message: "Select an engagement type." };
  }
  if (!form.projectType) {
    return { ok: false, message: "Select a project type." };
  }
  if (!form.industry) {
    return { ok: false, message: "Select an industry." };
  }
  if (!form.startDate) {
    return { ok: false, message: "Select a planned start date." };
  }

  const memberCheck = validateMemberEmails(form);
  if (!memberCheck.ok) return memberCheck;

  return validateSpecialists(form);
}

export function validateEditableProject(payload) {
  if (!payload.clientName?.trim()) {
    return { ok: false, message: "Enter client name." };
  }
  if (!payload.name?.trim()) {
    return { ok: false, message: "Enter project name." };
  }
  if (!payload.startDate) {
    return { ok: false, message: "Select a planned start date." };
  }
  return { ok: true };
}

export function validateMemberForm(form) {
  return validateMemberEmails(form);
}

export function validateSpecialistForm(form) {
  return validateSpecialists({ team: "audit", specialists: form });
}

export function validateSpecialistStaffForm(staffEmails) {
  const emails = (staffEmails || []).map(normalizeEmail).filter(Boolean);

  if (!emails.length) {
    return { ok: false, message: "Enter at least one Specialist Staff email." };
  }

  if (emails.some((email) => !isValidEmail(email))) {
    return { ok: false, message: "Staff email is invalid." };
  }

  if (new Set(emails).size !== emails.length) {
    return { ok: false, message: "Duplicate emails exist in the Staff list." };
  }

  return { ok: true };
}
