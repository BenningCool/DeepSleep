export const TEAMS = [
  { id: "ita", label: "ITA team", hint: "IT Audit" },
  { id: "audit", label: "Audit team", hint: "Financial Statement Audit" }
];

export const ENGAGEMENT_TYPES = [
  { id: "new", label: "New Engagement" },
  { id: "recurring", label: "Recurring" }
];

export const PROJECT_TYPES = [
  { id: "annual", label: "年度财务报表审计", labelEn: "Annual FS Audit" },
  { id: "special-it", label: "专项 IT 审计", labelEn: "Special IT Audit" },
  { id: "ipo", label: "IPO 核查", labelEn: "IPO Review" },
  { id: "soc", label: "SOC 1 / SOC 2 审计", labelEn: "SOC 1 / SOC 2" },
  { id: "privacy", label: "个人信息保护合规审计", labelEn: "PIPL / Privacy" }
];

export const INDUSTRY_GROUPS = [
  {
    label: "金融 Financial Services",
    items: [
      { id: "finance-banking", label: "金融 — Banking / 银行" },
      { id: "finance-insurance", label: "金融 — Insurance / 保险" },
      { id: "finance-securities", label: "金融 — Securities & Asset Mgmt / 证券资管" },
      { id: "finance-other", label: "金融 — Other / 其他" }
    ]
  },
  {
    label: "制造业 Manufacturing",
    items: [
      { id: "mfg-general", label: "制造业 — General / 通用" },
      { id: "mfg-automotive", label: "制造业 — Automotive / 汽车" },
      { id: "mfg-chemicals", label: "制造业 — Chemicals / 化工" },
      { id: "mfg-industrial", label: "制造业 — Industrial / 工业装备" }
    ]
  },
  {
    label: "零售与消费 Retail & Consumer",
    items: [
      { id: "retail-general", label: "零售 — General / 通用" },
      { id: "retail-fmcg", label: "零售 — FMCG / 快消" },
      { id: "retail-ecommerce", label: "零售 — E-commerce / 电商" }
    ]
  },
  {
    label: "TMT",
    items: [
      { id: "tmt-technology", label: "TMT — Technology / 科技互联网" },
      { id: "tmt-media", label: "TMT — Media / 传媒" },
      { id: "tmt-telecom", label: "TMT — Telecom / 电信" }
    ]
  },
  {
    label: "其他 Other Industries",
    items: [
      { id: "healthcare-pharma", label: "医药健康 — Pharma / 制药" },
      { id: "healthcare-devices", label: "医药健康 — MedTech / 医疗器械" },
      { id: "healthcare-services", label: "医药健康 — Healthcare Services / 医疗服务" },
      { id: "energy-oil-gas", label: "能源 — Oil & Gas / 石油天然气" },
      { id: "energy-power", label: "能源 — Power & Utilities / 电力公用" },
      { id: "real-estate", label: "房地产 — Real Estate" },
      { id: "construction", label: "建筑 — Construction & Engineering" },
      { id: "transport-logistics", label: "交通运输 — Transport & Logistics" },
      { id: "hospitality-leisure", label: "酒店餐饮 — Hospitality & Leisure" },
      { id: "education", label: "教育 — Education" },
      { id: "agriculture", label: "农业 — Agriculture" },
      { id: "mining", label: "采矿 — Mining" },
      { id: "government-public", label: "政府公共 — Government & Public Sector" },
      { id: "private-equity", label: "私募股权 — Private Equity" },
      { id: "other", label: "其他 — Other" }
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
