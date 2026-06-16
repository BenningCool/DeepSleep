import { labelOfIndustry } from "../../data/projectConstants";

const INDUSTRY_PREFIX_TO_SCOPE = [
  ["finance-", "finance"],
  ["mfg-", "manufacturing"],
  ["retail-", "retail"],
  ["tmt-", "tech"],
  ["healthcare-", "healthcare"],
  ["energy-", "energy"]
];

const PROJECT_TYPE_TO_SCOPE = {
  annual: "annual",
  "special-it": "special",
  ipo: "ipo",
  soc: "soc",
  privacy: "special"
};

export function resolveScopeIndustry(projectIndustryId) {
  if (!projectIndustryId) return null;

  for (const [prefix, scopeId] of INDUSTRY_PREFIX_TO_SCOPE) {
    if (projectIndustryId.startsWith(prefix)) return scopeId;
  }

  return null;
}

export function resolveScopeProjectType(projectTypeId) {
  return PROJECT_TYPE_TO_SCOPE[projectTypeId] || "annual";
}

export function resolveScopeIndustryLabel(project) {
  const scopeIndustry = resolveScopeIndustry(project?.industry);
  if (scopeIndustry) return null;
  return labelOfIndustry(project?.industry);
}
