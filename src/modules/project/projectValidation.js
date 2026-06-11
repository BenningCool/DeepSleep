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
    return { ok: false, message: "请填写有效的 Partner 邮箱。" };
  }
  if (!isValidEmail(manager)) {
    return { ok: false, message: "请填写有效的 Manager 邮箱。" };
  }
  if (!isValidEmail(inCharge)) {
    return { ok: false, message: "请填写有效的 In-charge 邮箱。" };
  }

  if (partner === manager || partner === inCharge) {
    return { ok: false, message: "Partner 邮箱不可与 Manager 或 In-charge 重复。" };
  }

  const sm = normalizeEmail(form.smEmail);
  if (sm && !isValidEmail(sm)) {
    return { ok: false, message: "Senior Manager 邮箱格式无效。" };
  }

  const staffEmails = (form.staffEmails || [])
    .map(normalizeEmail)
    .filter(Boolean);

  if (staffEmails.some((email) => !isValidEmail(email))) {
    return { ok: false, message: "Staff 邮箱格式无效。" };
  }

  if (new Set(staffEmails).size !== staffEmails.length) {
    return { ok: false, message: "Staff 列表中存在重复邮箱。" };
  }

  return { ok: true };
}

export function validateProjectForm(form) {
  if (!form.name?.trim()) {
    return { ok: false, message: "请填写项目名称。" };
  }
  if (!form.team) {
    return { ok: false, message: "请选择团队。" };
  }
  if (!form.engagementType) {
    return { ok: false, message: "请选择项目性质。" };
  }
  if (!form.projectType) {
    return { ok: false, message: "请选择项目类型。" };
  }
  if (!form.industry) {
    return { ok: false, message: "请选择行业。" };
  }
  if (!form.startDate) {
    return { ok: false, message: "请选择计划开始日期。" };
  }

  return validateMemberEmails(form);
}

export function validateEditableProject(payload) {
  if (!payload.name?.trim()) {
    return { ok: false, message: "请填写项目名称。" };
  }
  if (!payload.startDate) {
    return { ok: false, message: "请选择计划开始日期。" };
  }
  return { ok: true };
}

export function validateMemberForm(form) {
  return validateMemberEmails(form);
}
