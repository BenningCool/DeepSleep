export const TEAMS = [
  { id: "ita", label: "ITA team", hint: "IT Audit" },
  { id: "audit", label: "Audit team", hint: "Financial Statement Audit" }
];

export const ENGAGEMENT_TYPES = [
  { id: "new", label: "New Engagement" },
  { id: "recurring", label: "Recurring" }
];

export const PROJECT_TYPES = [
  { id: "annual", label: "Annual Financial Statement Audit", labelEn: "Annual FS Audit" },
  { id: "special-it", label: "Special IT Audit", labelEn: "Special IT Audit" },
  { id: "ipo", label: "IPO Review", labelEn: "IPO Review" },
  { id: "soc", label: "SOC 1 / SOC 2 Audit", labelEn: "SOC 1 / SOC 2" },
  { id: "privacy", label: "Privacy Compliance Audit", labelEn: "PIPL / Privacy" }
];

export const INDUSTRY_GROUPS = [
  {
    label: "Financial Services",
    items: [
      { id: "finance-banking", label: "Banking" },
      { id: "finance-insurance", label: "Insurance" },
      { id: "finance-securities", label: "Securities & Asset Management" },
      { id: "finance-other", label: "Financial Services — Other" }
    ]
  },
  {
    label: "Manufacturing",
    items: [
      { id: "mfg-general", label: "Manufacturing — General" },
      { id: "mfg-automotive", label: "Manufacturing — Automotive" },
      { id: "mfg-chemicals", label: "Manufacturing — Chemicals" },
      { id: "mfg-industrial", label: "Manufacturing — Industrial Equipment" }
    ]
  },
  {
    label: "Retail & Consumer",
    items: [
      { id: "retail-general", label: "Retail — General" },
      { id: "retail-fmcg", label: "Retail — FMCG" },
      { id: "retail-ecommerce", label: "Retail — E-commerce" }
    ]
  },
  {
    label: "TMT",
    items: [
      { id: "tmt-technology", label: "TMT — Technology / Internet" },
      { id: "tmt-media", label: "TMT — Media" },
      { id: "tmt-telecom", label: "TMT — Telecom" }
    ]
  },
  {
    label: "Other Industries",
    items: [
      { id: "healthcare-pharma", label: "Healthcare — Pharma" },
      { id: "healthcare-devices", label: "Healthcare — MedTech" },
      { id: "healthcare-services", label: "Healthcare Services" },
      { id: "energy-oil-gas", label: "Energy — Oil & Gas" },
      { id: "energy-power", label: "Energy — Power & Utilities" },
      { id: "real-estate", label: "Real Estate" },
      { id: "construction", label: "Construction & Engineering" },
      { id: "transport-logistics", label: "Transport & Logistics" },
      { id: "hospitality-leisure", label: "Hospitality & Leisure" },
      { id: "education", label: "Education" },
      { id: "agriculture", label: "Agriculture" },
      { id: "mining", label: "Mining" },
      { id: "government-public", label: "Government & Public Sector" },
      { id: "private-equity", label: "Private Equity" },
      { id: "other", label: "Other" }
    ]
  }
];

export const MEMBER_ROLES = {
  partner: { id: "partner", label: "Partner", required: true },
  manager: { id: "manager", label: "Manager", required: true },
  in_charge: { id: "in_charge", label: "In-charge", required: true },
  sm: { id: "sm", label: "Senior Manager", required: false },
  staff: { id: "staff", label: "Staff", required: false, multiple: true }
};

export const ALL_INDUSTRIES = INDUSTRY_GROUPS.flatMap((group) => group.items);

export function labelOfTeam(id) {
  return TEAMS.find((item) => item.id === id)?.label || id;
}

export function labelOfEngagement(id) {
  return ENGAGEMENT_TYPES.find((item) => item.id === id)?.label || id;
}

export function labelOfProjectType(id) {
  const item = PROJECT_TYPES.find((entry) => entry.id === id);
  return item ? `${item.label} · ${item.labelEn}` : id;
}

export function labelOfIndustry(id) {
  return ALL_INDUSTRIES.find((item) => item.id === id)?.label || id;
}

export function labelOfRole(role) {
  return MEMBER_ROLES[role]?.label || role;
}
