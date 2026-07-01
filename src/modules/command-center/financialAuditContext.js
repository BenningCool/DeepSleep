import { daysUntilDate } from "./commandCenterUtils";
import { labelOfContributorGroup } from "../project/contributorGroup";

export const AI_AUDIT_PROMPTS = [
  "下周报告日前，哪些财审关键循环被 IT 控制阻塞？",
  "收入循环 IT 控制有哪些风险？",
  "报告日前如何重新分配 staff 工作？"
];

const GOLDEN_CONTROL_IDS = new Set(["DS-901", "DS-902", "DS-905"]);
const GOLDEN_CONTROL_ORDER = {
  "DS-901": 0,
  "DS-902": 1,
  "DS-905": 2
};

const CONTEXT_BY_CONTROL_ID = {
  "DS-901": {
    financialStatementLine: "营业收入",
    businessCycle: "收入循环",
    assertion: "发生、准确性、截止",
    itSystem: "核心银行系统 / 总账接口",
    auditConcern: "收入确认依赖核心交易流水与总账接口完整传输",
    financialImpact: "若收入交易接口控制未完成，财审团队无法关闭收入发生与准确性测试。"
  },
  "DS-902": {
    financialStatementLine: "货币资金",
    businessCycle: "资金循环",
    assertion: "存在、完整性、准确性",
    itSystem: "资金管理系统 / 银企直连",
    auditConcern: "资金余额与流水自动对账依赖 ITAC 自动化控制",
    financialImpact: "资金自动对账控制逾期会影响银行函证差异解释与现金类科目复核。"
  },
  "DS-903": {
    financialStatementLine: "多科目",
    businessCycle: "用户访问管理",
    assertion: "权限控制、职责分离",
    itSystem: "IAM / AD",
    auditConcern: "关键系统权限变更与离职回收支撑财报系统访问可靠性",
    financialImpact: "访问管理未完成会扩大收入、资金和总账系统的权限依赖风险。"
  },
  "DS-904": {
    financialStatementLine: "多科目",
    businessCycle: "变更管理",
    assertion: "完整性、准确性",
    itSystem: "变更管理平台 / CI 发布流水线",
    auditConcern: "生产变更审批与测试记录支撑自动化控制持续有效",
    financialImpact: "变更控制缺口会削弱财审对自动化控制的依赖程度。"
  },
  "DS-905": {
    financialStatementLine: "营业收入、货币资金",
    businessCycle: "收入循环 / 资金循环",
    assertion: "完整性、准确性、截止",
    itSystem: "核心银行系统 / 需求管理平台",
    auditConcern: "程序开发与上线控制影响收入计量和资金对账自动逻辑",
    financialImpact: "程序开发 ITAC 逾期会阻塞财审对收入和资金关键自动化控制的依赖。"
  },
  "DS-906": {
    financialStatementLine: "所得税费用",
    businessCycle: "税务循环",
    assertion: "准确性、完整性",
    itSystem: "税务计提工作表",
    auditConcern: "所得税计提参数与审批复核支撑税务测算",
    financialImpact: "税务专项未完成会影响所得税费用和应交税费复核。"
  },
  "DS-907": {
    financialStatementLine: "递延所得税资产/负债",
    businessCycle: "税务循环",
    assertion: "准确性、估值",
    itSystem: "税务差异台账",
    auditConcern: "暂时性差异计算依赖税务底稿与财务数据勾稽",
    financialImpact: "递延所得税核对逾期会影响税项披露与估值判断。"
  },
  "DS-908": {
    financialStatementLine: "应付账款",
    businessCycle: "采购付款循环",
    assertion: "完整性、准确性",
    itSystem: "采购系统 / AP 模块",
    auditConcern: "采购审批与付款接口完整性影响负债确认",
    financialImpact: "采购付款控制未完成会影响应付账款完整性测试。"
  },
  "DS-909": {
    financialStatementLine: "固定资产",
    businessCycle: "固定资产循环",
    assertion: "存在、准确性、折旧",
    itSystem: "固定资产模块",
    auditConcern: "资产新增、转固和折旧自动计算依赖 ITAC",
    financialImpact: "固定资产 ITAC 未完成会影响折旧费用和资产账面价值复核。"
  },
  "DS-913": {
    financialStatementLine: "总账",
    businessCycle: "总账关账循环",
    assertion: "完整性、准确性、截止",
    itSystem: "总账系统",
    auditConcern: "月结关账权限与过账日志支撑总账完整性",
    financialImpact: "总账结账 GITC 逾期会影响财审团队关账控制依赖和后续分析程序。"
  },
  "DS-915": {
    financialStatementLine: "薪酬费用",
    businessCycle: "薪酬循环",
    assertion: "发生、准确性",
    itSystem: "HRIS / 薪酬系统",
    auditConcern: "薪资主数据和发放流程支撑薪酬费用准确性",
    financialImpact: "薪酬循环控制未完成会影响费用发生与准确性测试。"
  }
};

const CONTEXT_RULES = [
  {
    test: /收入|revenue/i,
    context: {
      financialStatementLine: "营业收入",
      businessCycle: "收入循环",
      assertion: "发生、准确性、截止",
      itSystem: "核心业务系统 / 总账接口",
      auditConcern: "收入确认依赖交易流水、价格规则和总账接口。",
      financialImpact: "相关 IT 控制未完成时，财审团队需要扩大收入细节测试或延后结论。"
    }
  },
  {
    test: /资金|货币|银行|现金|cash/i,
    context: {
      financialStatementLine: "货币资金",
      businessCycle: "资金循环",
      assertion: "存在、完整性、准确性",
      itSystem: "资金管理系统 / 银企直连",
      auditConcern: "资金流水、余额调节和自动对账依赖系统控制。",
      financialImpact: "资金循环 IT 控制未完成会影响银行流水和现金类科目复核。"
    }
  },
  {
    test: /采购|付款|应付|供应/i,
    context: {
      financialStatementLine: "应付账款",
      businessCycle: "采购付款循环",
      assertion: "完整性、准确性",
      itSystem: "采购系统 / AP 模块",
      auditConcern: "采购订单、收货和付款接口支撑负债完整性。",
      financialImpact: "采购付款控制未完成会影响应付账款完整性测试。"
    }
  },
  {
    test: /固定资产|折旧|资产/i,
    context: {
      financialStatementLine: "固定资产",
      businessCycle: "固定资产循环",
      assertion: "存在、准确性、折旧",
      itSystem: "固定资产模块",
      auditConcern: "资产新增、转固和折旧自动计算依赖 ITAC。",
      financialImpact: "固定资产 ITAC 未完成会影响折旧费用和资产账面价值复核。"
    }
  },
  {
    test: /薪酬|工资|hr/i,
    context: {
      financialStatementLine: "薪酬费用",
      businessCycle: "薪酬循环",
      assertion: "发生、准确性",
      itSystem: "HRIS / 薪酬系统",
      auditConcern: "薪资主数据和发放流程支撑薪酬费用准确性。",
      financialImpact: "薪酬循环控制未完成会影响费用发生与准确性测试。"
    }
  },
  {
    test: /总账|关账|结账|gl/i,
    context: {
      financialStatementLine: "总账",
      businessCycle: "总账关账循环",
      assertion: "完整性、准确性、截止",
      itSystem: "总账系统",
      auditConcern: "关账权限、手工分录和过账日志支撑总账完整性。",
      financialImpact: "总账控制未完成会影响关账控制依赖和后续分析程序。"
    }
  },
  {
    test: /权限|访问|iam|用户/i,
    context: {
      financialStatementLine: "多科目",
      businessCycle: "用户访问管理",
      assertion: "权限控制、职责分离",
      itSystem: "IAM / AD",
      auditConcern: "关键财报系统权限控制支撑自动化控制可靠性。",
      financialImpact: "访问管理缺口会扩大财审对系统生成数据的不可依赖范围。"
    }
  },
  {
    test: /变更|开发|上线|程序/i,
    context: {
      financialStatementLine: "多科目",
      businessCycle: "变更管理",
      assertion: "完整性、准确性",
      itSystem: "变更管理平台 / 发布系统",
      auditConcern: "生产变更审批、测试和上线记录支撑系统控制持续有效。",
      financialImpact: "变更控制缺口会削弱财审对自动化控制的依赖程度。"
    }
  }
];

function normalize(value) {
  return String(value || "").trim();
}

function taskText(task) {
  return [
    task?.id,
    task?.title,
    task?.description,
    task?.product,
    task?.auditDomain,
    task?.contributorGroup
  ].filter(Boolean).join(" ");
}

function inferFinancialContext(task) {
  const text = taskText(task);
  const matched = CONTEXT_RULES.find((rule) => rule.test.test(text));
  if (matched) return matched.context;

  return {
    financialStatementLine: task?.auditDomain === "itac" ? "自动化控制相关科目" : "多科目",
    businessCycle: task?.auditDomain === "itac" ? "自动化应用控制" : "IT 一般控制",
    assertion: task?.auditDomain === "itac" ? "准确性、完整性" : "权限控制、变更控制",
    itSystem: "关键财报系统",
    auditConcern: "该测试点支撑财审团队对系统生成数据和自动化控制的依赖。",
    financialImpact: "若未按期完成，财审团队需调整控制依赖策略或扩大实质性测试。"
  };
}

export function getFinancialAuditContext(task) {
  return {
    ...inferFinancialContext(task),
    ...(CONTEXT_BY_CONTROL_ID[task?.id] || {}),
    ...(task?.financialContext || {})
  };
}

export function enrichTaskWithFinancialContext(task) {
  return {
    ...task,
    financialContext: getFinancialAuditContext(task)
  };
}

export function formatAuditChain(task) {
  const context = getFinancialAuditContext(task);
  return [
    context.auditConcern,
    `${task?.id || "测试点"} · ${task?.title || "未命名测试点"}`,
    task?.status === "done" ? "底稿已完成" : task?.status === "doing" ? "底稿测试中" : "底稿未完成",
    context.financialImpact
  ];
}

function isTaskOverdue(task) {
  const days = daysUntilDate(task?.due);
  return days !== null && days < 0 && task?.status !== "done";
}

function isReportInCriticalWindow(reportDate) {
  const days = daysUntilDate(reportDate);
  return days !== null && days >= 0 && days <= 7;
}

function compareByDemoPriority(a, b) {
  const aGolden = GOLDEN_CONTROL_ORDER[a.id] ?? 99;
  const bGolden = GOLDEN_CONTROL_ORDER[b.id] ?? 99;
  if (aGolden !== bGolden) return aGolden - bGolden;

  const aDays = daysUntilDate(a.due);
  const bDays = daysUntilDate(b.due);
  if (aDays !== null && bDays !== null && aDays !== bDays) return aDays - bDays;
  if (aDays !== null) return -1;
  if (bDays !== null) return 1;
  return String(a.id).localeCompare(String(b.id));
}

function taskMatchesQuery(task, query) {
  const context = getFinancialAuditContext(task);
  const haystack = [
    taskText(task),
    context.financialStatementLine,
    context.businessCycle,
    context.assertion,
    context.itSystem,
    context.auditConcern,
    context.financialImpact,
    labelOfContributorGroup(task?.contributorGroup)
  ].join(" ").toLowerCase();

  return normalize(query)
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length >= 2)
    .some((token) => haystack.includes(token));
}

function projectById(projects) {
  return new Map((projects || []).map((project) => [project.id, project]));
}

function buildResultItem(task, projectsById) {
  const project = projectsById.get(task.projectId) || null;
  const context = getFinancialAuditContext(task);
  const dueDays = daysUntilDate(task.due);
  return {
    task,
    project,
    context,
    dueDays,
    overdue: isTaskOverdue(task),
    chain: formatAuditChain(task)
  };
}

function buildResourceItems(tasks, projectsById) {
  const byOwner = new Map();

  tasks.forEach((task) => {
    if (task.status === "done") return;
    const owner = normalize(task.owner) || "未分配";
    const current = byOwner.get(owner) || {
      owner,
      tasks: [],
      overdueCount: 0,
      reportCriticalCount: 0,
      projectIds: new Set()
    };
    const project = projectsById.get(task.projectId);
    current.tasks.push(task);
    current.projectIds.add(task.projectId);
    if (isTaskOverdue(task)) current.overdueCount += 1;
    if (isReportInCriticalWindow(project?.reportDate)) {
      current.reportCriticalCount += 1;
    }
    byOwner.set(owner, current);
  });

  return [...byOwner.values()]
    .map((item) => ({
      ...item,
      projectCount: item.projectIds.size,
      riskScore: item.overdueCount * 6 + item.reportCriticalCount * 4 + item.tasks.length
    }))
    .filter((item) => item.overdueCount || item.reportCriticalCount)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4);
}

function classifyQuery(query) {
  const normalized = normalize(query);
  if (/谁|资源|负荷|人手|工作量|重新分配|分配|调度|staff|workload|capacity/i.test(normalized)) return "resource";
  if (/收入|revenue/i.test(normalized)) return "revenue";
  if (/报告日|下周|逾期|阻塞|关键循环|财审|deadline|overdue/i.test(normalized)) return "report_blocker";
  return "general";
}

function buildQueryCopy(type, resultItems, resourceItems) {
  if (type === "resource") {
    const first = resourceItems[0];
    return {
      title: "资源负荷可能影响财审报告节奏",
      summary: first
        ? `${first.owner} 当前覆盖 ${first.projectCount} 个项目，含 ${first.overdueCount} 个逾期测试点。`
        : "当前未发现明显资源冲突。",
      auditImpact: "资源冲突会让关键 IT 控制复核滞后，财审团队可能无法按原计划依赖系统控制。",
      recommendedAction: first
        ? `先协调 ${first.owner} 的报告日前逾期测试点，优先转给低负荷 Staff 协助完成底稿推进。`
        : "保持现有排期，继续监控未来 14 天报告日项目。"
    };
  }

  if (type === "revenue") {
    return {
      title: "收入循环 IT 控制存在报告日前阻塞",
      summary: "某银行年审的收入 GITC 与程序开发 ITAC 已逾期，影响收入发生、准确性和截止断言。",
      auditImpact: "如果收入相关 IT 控制无法关闭，财审团队需要扩大收入细节测试或延后收入循环结论。",
      recommendedAction: "优先跟进 DS-901 与 DS-905，并让 ITA lead 明确变更记录和接口验证底稿完成时间。"
    };
  }

  if (type === "report_blocker") {
    return {
      title: "下周报告日前有财审关键循环被 IT 控制阻塞",
      summary: "某银行年审报告日已进入 D-7 窗口，收入、资金和程序开发相关测试点仍有逾期。",
      auditImpact: "这些测试点直接影响收入、货币资金和自动化控制依赖，可能阻塞财审经理签出关键循环。",
      recommendedAction: "按 DS-901 → DS-902 → DS-905 的顺序清理逾期项，并同步 Audit Manager 与 ITA Lead。"
    };
  }

  const count = resultItems.length;
  return {
    title: count ? "已根据自然语言问题定位相关审计风险" : "未找到明确命中，展示默认关注建议",
    summary: count
      ? `命中 ${count} 个测试点，已按报告日紧迫度和逾期状态排序。`
      : "建议从未来 7 天报告日、逾期测试点和高负荷执行人三个维度继续排查。",
    auditImpact: "自然语言入口将财审关注点翻译为 ITA 可执行的测试点清单。",
    recommendedAction: count
      ? "打开项目进度查看节点状态，并把结果同步给对应财审循环负责人。"
      : "尝试输入“收入”“报告日”“逾期”或“资源”等关键词。"
  };
}

export function runAiAuditQuery(query, projects = [], tasks = []) {
  const type = classifyQuery(query);
  const projectsById = projectById(projects);
  const activeTasks = (tasks || []).filter((task) => task?.projectId && task.status !== "done");

  let matchedTasks = activeTasks;
  if (type === "revenue") {
    matchedTasks = activeTasks.filter((task) => {
      const context = getFinancialAuditContext(task);
      return /收入/.test(context.businessCycle) || /收入/.test(context.financialStatementLine);
    });
  } else if (type === "report_blocker") {
    matchedTasks = activeTasks.filter((task) => {
      const project = projectsById.get(task.projectId);
      const context = getFinancialAuditContext(task);
      const isCriticalCycle = /收入|资金|总账|采购|固定资产|薪酬/.test(
        `${context.businessCycle} ${context.financialStatementLine}`
      );
      return isCriticalCycle
        && (isTaskOverdue(task) || isReportInCriticalWindow(project?.reportDate));
    });
  } else if (type === "general") {
    matchedTasks = activeTasks.filter((task) => taskMatchesQuery(task, query));
  }

  const preferredGolden = activeTasks.filter((task) => GOLDEN_CONTROL_IDS.has(task.id));
  const resultTasks = (matchedTasks.length ? matchedTasks : preferredGolden)
    .sort(compareByDemoPriority)
    .slice(0, 5);

  const resultItems = resultTasks.map((task) => buildResultItem(task, projectsById));
  const resourceItems = buildResourceItems(activeTasks, projectsById);
  const copy = buildQueryCopy(type, resultItems, resourceItems);

  return {
    query,
    type,
    ...copy,
    items: resultItems,
    resourceItems,
    generatedAt: new Date().toISOString()
  };
}

export function getTopAuditChainForProject(projectId, tasks = []) {
  return (tasks || [])
    .filter((task) => task.projectId === projectId)
    .filter((task) => GOLDEN_CONTROL_IDS.has(task.id) || isTaskOverdue(task))
    .sort(compareByDemoPriority)
    .slice(0, 1)
    .map((task) => ({
      task,
      context: getFinancialAuditContext(task),
      chain: formatAuditChain(task),
      overdue: isTaskOverdue(task)
    }))[0] || null;
}
