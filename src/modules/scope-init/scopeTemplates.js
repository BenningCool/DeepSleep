import { getSystemTasks, labelOfSystem } from "./scopeSystems";
import { resolveContributorGroup } from "../project/contributorGroup";
import { normalizeTaskStatus } from "../../utils/taskStatusMigration";

export const SCOPE_DRAFT_KEY = "deepsleep-scope-draft-v1";

export const INDUSTRIES = [
  { id: "finance", label: "Financial Services / Banking", hint: "Core systems, payment clearing, regulatory reporting" },
  { id: "manufacturing", label: "Manufacturing", hint: "ERP, MES, supply chain, and production systems" },
  { id: "tech", label: "Technology / Internet", hint: "Cloud-native, DevOps, data platforms" },
  { id: "retail", label: "Retail & Consumer", hint: "POS, e-commerce, membership, and inventory systems" },
  { id: "healthcare", label: "Healthcare", hint: "GMP, clinical trials, patient data" },
  { id: "energy", label: "Energy & Utilities", hint: "SCADA, asset operations, billing systems" }
];

export const AUDIT_DOMAINS = [
  { id: "itgc", label: "ITGC", hint: "Access management, change management, operations, and backup" },
  { id: "itac", label: "ITAC", hint: "Application controls, interface reconciliation, automated controls" },
  { id: "sox404", label: "SOX 404", hint: "IT general controls related to financial reporting" },
  { id: "privacy", label: "Data Governance & Privacy", hint: "Personal information protection, data classification" },
  { id: "cyber", label: "Cybersecurity", hint: "Vulnerability management, incident response, penetration testing" }
];

export const PROJECT_TYPES = [
  { id: "annual", label: "Annual Financial Statement Audit (IT Scope)", hint: "Execute IT control testing under audit standards" },
  { id: "soc", label: "SOC 1 / SOC 2 Audit", hint: "Service organization control report" },
  { id: "special", label: "Special IT Audit", hint: "Focus on a single risk domain or regulatory requirement" },
  { id: "ipo", label: "IPO Readiness Assessment", hint: "Pre-listing IT internal control maturity assessment" },
  { id: "mna", label: "M&A IT Due Diligence", hint: "Target company IT risk and integration assessment" }
];

export const QUICK_PRESETS = [
  {
    id: "bank-itgc",
    label: "Banking ITGC Annual Audit",
    form: {
      projectName: "ABC Bank 2026 ITGC Audit",
      industry: "finance",
      auditDomain: "itgc",
      projectType: "annual",
      systems: ["core-banking", "iam", "bi"]
    }
  },
  {
    id: "tech-soc2",
    label: "Internet SOC 2",
    form: {
      projectName: "Example Technology Company SOC 2 Type II",
      industry: "tech",
      auditDomain: "cyber",
      projectType: "soc",
      systems: ["iam", "oa"]
    }
  },
  {
    id: "mfg-itac",
    label: "Manufacturing ITAC Special Audit",
    form: {
      projectName: "Example Manufacturer ITAC Special Audit",
      industry: "manufacturing",
      auditDomain: "itac",
      projectType: "special",
      systems: ["erp", "scm"]
    }
  }
];

const DOMAIN_TASKS = {
  itgc: [
    {
      title: "Scope Confirmation and Client Communication",
      description: "Confirm audit scope, key systems, outsourcing, and third-party dependencies; prepare scope memo.",
      priority: "P0",
      status: "grooming",
      auditPhase: "scope-confirm",
      scopeCritical: true
    },
    {
      title: "IT Risk Assessment and Materiality",
      description: "Identify IT risks related to financial reporting and determine control testing strategy and sample size.",
      priority: "P0",
      status: "grooming",
      auditPhase: "risk-assessment",
      scopeCritical: true
    },
    {
      title: "Access Management Control Testing",
      description: "ITGC controls over user onboarding, access review, privileged accounts, and leaver access removal.",
      priority: "P0",
      status: "design",
      auditPhase: "control-design"
    },
    {
      title: "Change Management Control Testing",
      description: "Change request, approval, testing, release process, and emergency change post-review.",
      priority: "P0",
      status: "design",
      auditPhase: "control-design"
    },
    {
      title: "Operations and Backup Control Testing",
      description: "Batch monitoring, backup recovery, data center operations, and DR drill records.",
      priority: "P1",
      status: "development",
      auditPhase: "control-test"
    }
  ],
  itac: [
    {
      title: "Business Process and Control Identification",
      description: "Identify IT application controls in key business processes such as revenue, procurement, and inventory.",
      priority: "P0",
      status: "grooming",
      auditPhase: "scope-confirm",
      scopeCritical: true
    },
    {
      title: "Interface and Data Reconciliation Testing",
      description: "Validate inter-system interface completeness, reconciliation logic, and exception handling.",
      priority: "P0",
      status: "design",
      auditPhase: "control-design"
    },
    {
      title: "Automated Control Effectiveness Testing",
      description: "Test automated controls such as system validations, approval workflows, and three-way matching.",
      priority: "P0",
      status: "development",
      auditPhase: "control-test"
    },
    {
      title: "Manual Compensating Control Assessment",
      description: "Assess the design and operating effectiveness of manual review controls when automated controls fail.",
      priority: "P1",
      status: "development",
      auditPhase: "control-test"
    }
  ],
  sox404: [
    {
      title: "IT Dependency Analysis for Financial Reporting Process",
      description: "Identify key systems, reporting engines, and closing processes used in financial reporting.",
      priority: "P0",
      status: "grooming",
      auditPhase: "scope-confirm",
      scopeCritical: true
    },
    {
      title: "Close and Journal Entry Control Testing",
      description: "Test period-end closing access, journal approval, and reversal controls.",
      priority: "P0",
      status: "design",
      auditPhase: "control-design"
    },
    {
      title: "SOX Deficiency Evaluation and Remediation Tracking",
      description: "Summarize control deficiencies, assess severity, and track management remediation.",
      priority: "P0",
      status: "review",
      auditPhase: "deficiency-review",
      scopeCritical: true
    }
  ],
  privacy: [
    {
      title: "Personal Information Inventory and Classification",
      description: "Map personal information collection, storage, and sharing scenarios; complete data classification.",
      priority: "P0",
      status: "grooming",
      auditPhase: "scope-confirm",
      scopeCritical: true
    },
    {
      title: "Consent Mechanism and Cross-border Transfer Assessment",
      description: "Review privacy policy, user consent records, and cross-border data transfer compliance.",
      priority: "P0",
      status: "design",
      auditPhase: "control-design"
    },
    {
      title: "Data Subject Rights Response Testing",
      description: "Validate response processes for data subject requests such as access, correction, and deletion.",
      priority: "P1",
      status: "development",
      auditPhase: "control-test"
    }
  ],
  cyber: [
    {
      title: "Security Governance and Threat Modeling",
      description: "Assess security organization structure, asset inventory, and threat modeling methodology.",
      priority: "P0",
      status: "grooming",
      auditPhase: "risk-assessment",
      scopeCritical: true
    },
    {
      title: "Vulnerability and Patch Management Testing",
      description: "Review vulnerability scan cadence, patch approval, and emergency fix process.",
      priority: "P0",
      status: "design",
      auditPhase: "control-design"
    },
    {
      title: "Security Incident Response Drill Review",
      description: "Review incident response plans, drill records, and post-incident review reports.",
      priority: "P1",
      status: "development",
      auditPhase: "control-test"
    }
  ]
};

const INDUSTRY_ADDONS = {
  finance: {
    title: "Regulatory Reporting and Core System Special Review",
    description: "Focus on regulatory reporting interfaces, core accounting system changes, and DR switchover.",
    priority: "P0",
    status: "design",
    auditPhase: "control-test"
  },
  manufacturing: {
    title: "ERP and Production System Integration Controls",
    description: "Review reconciliation among BOM, cost accounting, and MES work order data in ERP.",
    priority: "P1",
    status: "design",
    auditPhase: "control-test"
  },
  tech: {
    title: "CI/CD and Cloud Resource Configuration Review",
    description: "Review repository access, pipeline approvals, and least-privilege cloud IAM configuration.",
    priority: "P0",
    status: "design",
    auditPhase: "control-test"
  },
  retail: {
    title: "POS and E-commerce Order Reconciliation",
    description: "Validate end-to-end data consistency among store POS, OMS, and financial revenue recognition.",
    priority: "P0",
    status: "development",
    auditPhase: "control-test"
  },
  healthcare: {
    title: "Clinical Trial and Patient Data Segregation",
    description: "Review EDC system access, data masking, and GxP compliance requirements.",
    priority: "P0",
    status: "design",
    auditPhase: "control-test"
  },
  energy: {
    title: "OT/IT Boundary and Industrial Control Security",
    description: "Assess SCADA and office network segregation, industrial device patching, and remote operations controls.",
    priority: "P0",
    status: "design",
    auditPhase: "control-test"
  }
};

const PROJECT_ADDONS = {
  annual: {
    title: "Audit Workpapers and Management Representation",
    description: "Complete workpaper review, obtain IT management representation, and archive the engagement.",
    priority: "P0",
    status: "review",
    auditPhase: "wrap-up",
    scopeCritical: true
  },
  soc: {
    title: "SOC Control Description and Assurance Opinion",
    description: "Prepare control description, testing evidence package, and draft SOC report opinion.",
    priority: "P0",
    status: "review",
    auditPhase: "wrap-up",
    scopeCritical: true
  },
  special: {
    title: "Special Findings and Remediation Recommendations",
    description: "Produce special audit findings, risk ratings, and remediation timeline.",
    priority: "P0",
    status: "review",
    auditPhase: "wrap-up"
  },
  ipo: {
    title: "IPO IT Internal Control Maturity Report",
    description: "Prepare listing-readiness gap analysis, remediation roadmap, and milestone tracking sheet.",
    priority: "P0",
    status: "review",
    auditPhase: "wrap-up",
    scopeCritical: true
  },
  mna: {
    title: "Due Diligence Risk List and Integration Recommendations",
    description: "Summarize IT risks, technical debt, and post-merger integration priorities.",
    priority: "P0",
    status: "review",
    auditPhase: "wrap-up"
  }
};

const MANUAL_TASK_ESTIMATE = 12;

function addDays(baseDate, days) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function labelOf(options, id) {
  return options.find((item) => item.id === id)?.label || id;
}

export function buildScopeSummary(selection) {
  const {
    industry,
    auditDomain,
    projectType,
    systems = [],
    industryLabel: industryLabelOverride
  } = selection;
  return {
    industryLabel: industryLabelOverride || labelOf(INDUSTRIES, industry) || "General Industry",
    auditDomainLabel: labelOf(AUDIT_DOMAINS, auditDomain),
    projectTypeLabel: labelOf(PROJECT_TYPES, projectType),
    systemsLabel: systems.length
      ? systems.map(labelOfSystem).join(", ")
      : "No Key Systems Selected"
  };
}

export function computeScopeStats(tasks) {
  const criticalCount = tasks.filter((task) => task.scopeCritical).length;
  const p0Count = tasks.filter((task) => task.priority === "P0").length;
  const systemCount = tasks.filter((task) => task.systemScoped).length;
  const coverage = Math.min(95, Math.round((tasks.length / MANUAL_TASK_ESTIMATE) * 80));

  const startDate = tasks[0]?.due;
  const estimatedDays = tasks.length && startDate
    ? Math.max(...tasks.map((task) => (
      (new Date(task.due) - new Date(startDate)) / 86400000
    ))) + 7
    : 0;

  return {
    total: tasks.length,
    criticalCount,
    p0Count,
    systemCount,
    coverage,
    estimatedDays
  };
}

export function generateScopeTasks(selection, options = {}) {
  const {
    projectName,
    industry,
    auditDomain,
    projectType,
    systems = [],
    owner = "Unassigned",
    startDate = new Date().toISOString().slice(0, 10)
  } = selection;

  const {
    startId = 200,
    projectId = "",
    specialistTeams = []
  } = options;

  const summary = buildScopeSummary(selection);
  const product = projectName.trim() || "New Audit Project";
  const baseTasks = DOMAIN_TASKS[auditDomain] || DOMAIN_TASKS.itgc;
  const industryAddon = industry ? INDUSTRY_ADDONS[industry] : null;
  const projectAddon = PROJECT_ADDONS[projectType];
  const systemTasks = getSystemTasks(systems);

  const templates = [
    ...baseTasks,
    ...(industryAddon ? [industryAddon] : []),
    ...systemTasks,
    ...(projectAddon ? [projectAddon] : [])
  ];

  return templates.map((template, index) => ({
    id: `DS-${startId + index}`,
    title: template.title,
    description: [
      template.description,
      "",
      `【Scope】${summary.industryLabel} · ${summary.auditDomainLabel} · ${summary.projectTypeLabel}`,
      summary.systemsLabel !== "No Key Systems Selected" ? `【Key Systems】${summary.systemsLabel}` : ""
    ].filter(Boolean).join("\n"),
    priority: template.priority,
    platform: "PC",
    product,
    owner: owner.trim() || "Unassigned",
    due: addDays(startDate, 7 + index * 3),
    status: normalizeTaskStatus(template.status),
    comments: [
      {
        author: "Scope Engine",
        text: `Generated automatically from Scope initialization. Audit stage: ${template.auditPhase || "general"}.`
      }
    ],
    scopeGenerated: true,
    scopeCritical: Boolean(template.scopeCritical),
    auditPhase: template.auditPhase,
    systemScoped: Boolean(template.systemScoped),
    contributorGroup: resolveContributorGroup(template, auditDomain, owner, specialistTeams),
    projectId,
    scopeMeta: {
      industry,
      auditDomain,
      projectType,
      systems,
      projectName: product,
      projectId
    }
  }));
}

export function loadScopeDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(SCOPE_DRAFT_KEY) || "null");
    return saved && typeof saved === "object" ? saved : null;
  } catch {
    return null;
  }
}

export function saveScopeDraft(form) {
  localStorage.setItem(SCOPE_DRAFT_KEY, JSON.stringify(form));
}
