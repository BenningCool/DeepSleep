import { PROJECT_TYPES } from "./projectConstants";

export const DEMO_PROJECT_IDS = {
  uatAnnual: "PRJ-UAT-DEMO",
  socIta: "PRJ-SOC-DEMO",
  ipo: "PRJ-IPO-DEMO",
  privacy: "PRJ-PRIV-DEMO",
  specialIt: "PRJ-SPECIAL-IT-DEMO",
  retailAnnual: "PRJ-RETAIL-DEMO",
  mfgAnnual: "PRJ-MFG-DEMO",
  fintechSoc: "PRJ-FINTECH-SOC-DEMO"
};

/** 五类项目视觉与叙事配置（v1.7 · 看起来不同，不驱动测试点生成） */
export const ENGAGEMENT_TYPE_PROFILES = {
  annual: {
    id: "annual",
    badge: "Annual",
    color: "#1e4d8c",
    primaryTeam: "audit",
    primaryTeamLabel: "Audit-led",
    collaboration: "Audit + ITA + Tax",
    progressFocus: "GITC / ITAC mix · Report Date",
    tagline: "Full-year statutory audit",
    demoProjectId: DEMO_PROJECT_IDS.uatAnnual
  },
  "special-it": {
    id: "special-it",
    badge: "IT Aud",
    color: "#0d7a8a",
    primaryTeam: "ita",
    primaryTeamLabel: "ITA-led",
    collaboration: "ITA standalone",
    progressFocus: "Scope scoping · Key systems",
    tagline: "Targeted IT assurance",
    demoProjectId: DEMO_PROJECT_IDS.specialIt
  },
  ipo: {
    id: "ipo",
    badge: "IPO",
    color: "#5c3d8a",
    primaryTeam: "audit",
    primaryTeamLabel: "Audit-led",
    collaboration: "Audit + ITA",
    progressFocus: "Readiness · Disclosure cycles",
    tagline: "Pre-IPO readiness",
    demoProjectId: DEMO_PROJECT_IDS.ipo
  },
  soc: {
    id: "soc",
    badge: "SOC",
    color: "#4a3f8c",
    primaryTeam: "ita",
    primaryTeamLabel: "ITA-led",
    collaboration: "ITA standalone",
    progressFocus: "Trust services criteria · Type I/II",
    tagline: "SOC 1 / SOC 2 examination",
    demoProjectId: DEMO_PROJECT_IDS.socIta
  },
  privacy: {
    id: "privacy",
    badge: "Privacy",
    color: "#2d6a4f",
    primaryTeam: "ita",
    primaryTeamLabel: "ITA-led",
    collaboration: "ITA (+ FRM optional)",
    progressFocus: "PIPL controls · Data mapping",
    tagline: "PIPL / privacy compliance",
    demoProjectId: DEMO_PROJECT_IDS.privacy
  }
};

export function getEngagementTypeProfile(projectTypeId) {
  return ENGAGEMENT_TYPE_PROFILES[projectTypeId] || {
    id: projectTypeId || "other",
    badge: "Eng",
    color: "#5e6c84",
    primaryTeam: "audit",
    primaryTeamLabel: "Audit-led",
    collaboration: "—",
    progressFocus: "—",
    tagline: "Engagement",
    demoProjectId: ""
  };
}

export function projectTypeSkinClass(projectTypeId) {
  const id = getEngagementTypeProfile(projectTypeId).id;
  return `project-type-skin project-type-${id}`;
}

export function listEngagementTypeCards() {
  return PROJECT_TYPES.map((type) => ({
    ...type,
    profile: getEngagementTypeProfile(type.id)
  }));
}

export function defaultTeamForProjectType(projectTypeId) {
  return getEngagementTypeProfile(projectTypeId).primaryTeam;
}
