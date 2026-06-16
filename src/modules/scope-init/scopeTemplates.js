import { getSystemTasks, labelOfSystem } from "./scopeSystems";
import { resolveContributorGroup } from "../project/contributorGroup";
import { normalizeTaskStatus } from "../../utils/taskStatusMigration";

export const SCOPE_DRAFT_KEY = "deepsleep-scope-draft-v1";

export const INDUSTRIES = [
  { id: "finance", label: "金融服务 / 银行", hint: "核心系统、支付清算、监管报送" },
  { id: "manufacturing", label: "制造业", hint: "ERP、MES、供应链与生产系统" },
  { id: "tech", label: "科技 / 互联网", hint: "云原生、DevOps、数据平台" },
  { id: "retail", label: "零售与消费品", hint: "POS、电商、会员与库存系统" },
  { id: "healthcare", label: "医药健康", hint: "GMP、临床试验、患者数据" },
  { id: "energy", label: "能源与公用事业", hint: "SCADA、资产运维、计费系统" }
];

export const AUDIT_DOMAINS = [
  { id: "itgc", label: "ITGC", hint: "访问管理、变更管理、运维与备份" },
  { id: "itac", label: "ITAC", hint: "应用控制、接口勾稽、自动化控制" },
  { id: "sox404", label: "SOX 404", hint: "财务报告相关 IT 一般控制" },
  { id: "privacy", label: "数据治理与隐私", hint: "个人信息保护、数据分级分类" },
  { id: "cyber", label: "网络安全", hint: "漏洞管理、事件响应、渗透测试" }
];

export const PROJECT_TYPES = [
  { id: "annual", label: "年度财务报表审计（IT 部分）", hint: "按审计准则执行 IT 控制测试" },
  { id: "soc", label: "SOC 1 / SOC 2 审计", hint: "服务组织控制报告" },
  { id: "special", label: "专项 IT 审计", hint: "聚焦单一风险域或监管要求" },
  { id: "ipo", label: "IPO 就绪评估", hint: "上市前 IT 内控成熟度评估" },
  { id: "mna", label: "并购 IT 尽职调查", hint: "目标公司 IT 风险与整合评估" }
];

export const QUICK_PRESETS = [
  {
    id: "bank-itgc",
    label: "银行 ITGC 年报",
    form: {
      projectName: "某银行 2026 年度 ITGC 审计",
      industry: "finance",
      auditDomain: "itgc",
      projectType: "annual",
      systems: ["core-banking", "iam", "bi"]
    }
  },
  {
    id: "tech-soc2",
    label: "互联网 SOC 2",
    form: {
      projectName: "某科技公司 SOC 2 Type II",
      industry: "tech",
      auditDomain: "cyber",
      projectType: "soc",
      systems: ["iam", "oa"]
    }
  },
  {
    id: "mfg-itac",
    label: "制造业 ITAC 专项",
    form: {
      projectName: "某制造企业 ITAC 专项审计",
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
      title: "Scope 确认与客户沟通",
      description: "确认审计范围、关键系统清单、外包与第三方依赖，形成 Scope 备忘录。",
      priority: "P0",
      status: "grooming",
      auditPhase: "scope-confirm",
      scopeCritical: true
    },
    {
      title: "IT 风险评估与重要性水平",
      description: "识别与财务报告相关的 IT 风险，确定控制测试策略与样本量。",
      priority: "P0",
      status: "grooming",
      auditPhase: "risk-assessment",
      scopeCritical: true
    },
    {
      title: "访问管理控制测试",
      description: "用户准入、权限复核、特权账号与离职回收等 ITGC 控制点。",
      priority: "P0",
      status: "design",
      auditPhase: "control-design"
    },
    {
      title: "变更管理控制测试",
      description: "变更申请、审批、测试与上线流程，紧急变更事后复核。",
      priority: "P0",
      status: "design",
      auditPhase: "control-design"
    },
    {
      title: "运维与备份控制测试",
      description: "批处理监控、备份恢复、机房运维与灾备演练记录。",
      priority: "P1",
      status: "development",
      auditPhase: "control-test"
    }
  ],
  itac: [
    {
      title: "业务流程与控制点识别",
      description: "梳理收入、采购、库存等关键业务流程中的 IT 应用控制。",
      priority: "P0",
      status: "grooming",
      auditPhase: "scope-confirm",
      scopeCritical: true
    },
    {
      title: "接口与数据勾稽测试",
      description: "验证系统间接口完整性、对账逻辑与异常处理机制。",
      priority: "P0",
      status: "design",
      auditPhase: "control-design"
    },
    {
      title: "自动化控制有效性测试",
      description: "对系统内置校验、审批流、三单匹配等自动化控制执行测试。",
      priority: "P0",
      status: "development",
      auditPhase: "control-test"
    },
    {
      title: "人工补偿控制评估",
      description: "当自动化控制失效时，评估人工复核控制的设计与执行有效性。",
      priority: "P1",
      status: "development",
      auditPhase: "control-test"
    }
  ],
  sox404: [
    {
      title: "财务报告流程 IT 依赖分析",
      description: "识别财报编制所依赖的关键系统、报表引擎与关账流程。",
      priority: "P0",
      status: "grooming",
      auditPhase: "scope-confirm",
      scopeCritical: true
    },
    {
      title: "关账与分录控制测试",
      description: "测试期末关账权限、日记账审批与反冲控制。",
      priority: "P0",
      status: "design",
      auditPhase: "control-design"
    },
    {
      title: "SOX 缺陷评估与整改跟踪",
      description: "汇总控制缺陷，评估严重程度并跟踪管理层整改。",
      priority: "P0",
      status: "review",
      auditPhase: "deficiency-review",
      scopeCritical: true
    }
  ],
  privacy: [
    {
      title: "个人信息清单与分级",
      description: "梳理个人信息收集、存储、共享场景，完成数据分级分类。",
      priority: "P0",
      status: "grooming",
      auditPhase: "scope-confirm",
      scopeCritical: true
    },
    {
      title: "同意机制与跨境传输评估",
      description: "检查隐私政策、用户同意记录及跨境数据传输合规性。",
      priority: "P0",
      status: "design",
      auditPhase: "control-design"
    },
    {
      title: "数据主体权利响应测试",
      description: "验证查询、更正、删除等数据主体权利请求的响应流程。",
      priority: "P1",
      status: "development",
      auditPhase: "control-test"
    }
  ],
  cyber: [
    {
      title: "安全治理与威胁建模",
      description: "评估安全组织架构、资产清单与威胁建模方法论。",
      priority: "P0",
      status: "grooming",
      auditPhase: "risk-assessment",
      scopeCritical: true
    },
    {
      title: "漏洞与补丁管理测试",
      description: "检查漏洞扫描周期、补丁审批与紧急修复流程。",
      priority: "P0",
      status: "design",
      auditPhase: "control-design"
    },
    {
      title: "安全事件响应演练复核",
      description: "审阅事件响应预案、演练记录与事后复盘报告。",
      priority: "P1",
      status: "development",
      auditPhase: "control-test"
    }
  ]
};

const INDUSTRY_ADDONS = {
  finance: {
    title: "监管报送与核心系统专项",
    description: "关注人民银行/银保监会报送接口、核心账务系统变更与灾备切换。",
    priority: "P0",
    status: "design",
    auditPhase: "control-test"
  },
  manufacturing: {
    title: "ERP 与生产系统集成控制",
    description: "检查 BOM、成本核算与 MES 工单数据在 ERP 中的勾稽关系。",
    priority: "P1",
    status: "design",
    auditPhase: "control-test"
  },
  tech: {
    title: "CI/CD 与云资源配置审查",
    description: "审查代码仓库权限、流水线审批与云 IAM 最小权限配置。",
    priority: "P0",
    status: "design",
    auditPhase: "control-test"
  },
  retail: {
    title: "POS 与电商订单对账",
    description: "验证门店 POS、OMS 与财务收入确认的端到端数据一致性。",
    priority: "P0",
    status: "development",
    auditPhase: "control-test"
  },
  healthcare: {
    title: "临床试验与患者数据隔离",
    description: "检查 EDC 系统权限、数据脱敏与 GxP 合规要求。",
    priority: "P0",
    status: "design",
    auditPhase: "control-test"
  },
  energy: {
    title: "OT/IT 边界与工控安全",
    description: "评估 SCADA 与办公网隔离、工控设备补丁与远程运维控制。",
    priority: "P0",
    status: "design",
    auditPhase: "control-test"
  }
};

const PROJECT_ADDONS = {
  annual: {
    title: "审计底稿与管理层声明",
    description: "完成底稿复核、管理层 IT 声明书获取与项目归档。",
    priority: "P0",
    status: "review",
    auditPhase: "wrap-up",
    scopeCritical: true
  },
  soc: {
    title: "SOC 控制描述与鉴证意见",
    description: "编制控制描述、测试证据包并出具 SOC 报告意见草稿。",
    priority: "P0",
    status: "review",
    auditPhase: "wrap-up",
    scopeCritical: true
  },
  special: {
    title: "专项发现与整改建议",
    description: "输出专项审计发现清单、风险评级与整改时间表。",
    priority: "P0",
    status: "review",
    auditPhase: "wrap-up"
  },
  ipo: {
    title: "IPO IT 内控成熟度报告",
    description: "形成上市就绪差距分析、整改路线图与里程碑跟踪表。",
    priority: "P0",
    status: "review",
    auditPhase: "wrap-up",
    scopeCritical: true
  },
  mna: {
    title: "尽调风险清单与整合建议",
    description: "汇总 IT 风险、技术债务与并购后整合优先级建议。",
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
    industryLabel: industryLabelOverride || labelOf(INDUSTRIES, industry) || "通用行业",
    auditDomainLabel: labelOf(AUDIT_DOMAINS, auditDomain),
    projectTypeLabel: labelOf(PROJECT_TYPES, projectType),
    systemsLabel: systems.length
      ? systems.map(labelOfSystem).join("、")
      : "未选择关键系统"
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
    owner = "未分配",
    startDate = new Date().toISOString().slice(0, 10)
  } = selection;

  const {
    startId = 200,
    projectId = "",
    specialistTeams = []
  } = options;

  const summary = buildScopeSummary(selection);
  const product = projectName.trim() || "新建审计项目";
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
      summary.systemsLabel !== "未选择关键系统" ? `【关键系统】${summary.systemsLabel}` : ""
    ].filter(Boolean).join("\n"),
    priority: template.priority,
    platform: "PC 端",
    product,
    owner: owner.trim() || "未分配",
    due: addDays(startDate, 7 + index * 3),
    status: normalizeTaskStatus(template.status),
    comments: [
      {
        author: "Scope 引擎",
        text: `由 Scope 初始化自动生成。审计阶段：${template.auditPhase || "general"}。`
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
