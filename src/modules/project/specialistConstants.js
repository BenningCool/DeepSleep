export const SPECIALIST_TEAMS = [
  { id: "ita", label: "ITA team", hint: "IT Audit specialist group" },
  { id: "tax", label: "Tax team", hint: "Tax specialist group" },
  { id: "frm", label: "FRM team", hint: "FRM specialist group" }
];

export const SPECIALIST_LEAD_ROLES = [
  { id: "in_charge", label: "In-charge" },
  { id: "manager", label: "Manager" },
  { id: "sm", label: "Senior Manager" }
];

export const PROJECT_SORT_OPTIONS = [
  { id: "recent", label: "最近创建" },
  { id: "client", label: "按客户名称" },
  { id: "industry", label: "按行业" },
  { id: "year", label: "按年份" }
];

export function labelOfSpecialistTeam(id) {
  return SPECIALIST_TEAMS.find((item) => item.id === id)?.label || id;
}

export function labelOfSpecialistLeadRole(id) {
  return SPECIALIST_LEAD_ROLES.find((item) => item.id === id)?.label || id;
}

export function defaultSpecialistForm() {
  return {
    ita: { enabled: false, leadRole: "in_charge", leadEmail: "" },
    tax: { enabled: false, leadRole: "manager", leadEmail: "" },
    frm: { enabled: false, leadRole: "sm", leadEmail: "" }
  };
}
