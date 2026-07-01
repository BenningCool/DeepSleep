import { STORAGE_KEY } from "./mockData";
import { DEMO_PROJECT_IDS } from "./engagementTypeProfiles";
import { PROJECTS_STORAGE_KEY, migrateProject, saveProjects, loadProjects } from "../modules/project/projectStore";
import { WORKSPACE_PROGRESS_STORAGE_KEY, MATERIAL_CATEGORY } from "../services/workspaceProgressService";
import { enrichTaskWithFinancialContext } from "../modules/command-center/financialAuditContext";

export const DEMO_SEED_VERSION = 3;
export const DEMO_SEED_FLAG_KEY = "deepsleep-demo-seed-v1";

const DEMO_EMAILS = {
  partner: "partner.uat@firm.com",
  manager1: "manager.uat@firm.com",
  manager2: "manager2.uat@firm.com",
  ic1: "incharge.uat@firm.com",
  ic2: "incharge2.uat@firm.com",
  staff1: "staff1.uat@firm.com",
  staff2: "staff2.uat@firm.com",
  staff3: "staff3.uat@firm.com",
  itaLead: "ita-lead.uat@firm.com",
  itaStaff: "ita-staff.uat@firm.com",
  taxLead: "tax-lead.uat@firm.com"
};

const ALL_DEMO_PROJECT_IDS = new Set(Object.values(DEMO_PROJECT_IDS));

function daysFromToday(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function member(id, email, role, now) {
  return {
    id,
    email,
    role,
    inviteToken: `invite_${id}`,
    status: "active",
    invitedAt: now
  };
}

function buildDemoProject({
  id,
  clientName,
  name,
  projectType,
  team,
  industry,
  reportOffset,
  managerEmail,
  icEmail,
  staffEmails = [],
  specialistTeams = [],
  engagementType = "recurring",
  startOffset = -30
}) {
  const now = new Date().toISOString();
  return migrateProject({
    id,
    clientName,
    name,
    team,
    engagementType,
    projectType,
    industry,
    startDate: daysFromToday(startOffset),
    reportDate: daysFromToday(reportOffset),
    scopeStatus: "defined",
    createdAt: now,
    members: [
      member(`mem_${id}_partner`, DEMO_EMAILS.partner, "partner", now),
      member(`mem_${id}_manager`, managerEmail, "manager", now),
      member(`mem_${id}_ic`, icEmail, "in_charge", now),
      ...staffEmails.map((email, index) => (
        member(`mem_${id}_staff_${index}`, email, "staff", now)
      ))
    ],
    specialistTeams
  });
}

function uatSpecialistTeams(now) {
  return [
    {
      id: "spt_uat_ita",
      team: "ita",
      leadRole: "in_charge",
      leadEmail: DEMO_EMAILS.itaLead,
      inviteToken: "invite_uat_ita_lead",
      status: "active",
      staff: [
        {
          id: "sst_uat_ita_1",
          email: DEMO_EMAILS.itaStaff,
          inviteToken: "invite_uat_ita_staff",
          status: "active",
          invitedAt: now
        }
      ]
    },
    {
      id: "spt_uat_tax",
      team: "tax",
      leadRole: "manager",
      leadEmail: DEMO_EMAILS.taxLead,
      inviteToken: "invite_uat_tax_lead",
      status: "active",
      staff: []
    }
  ];
}

function buildAllDemoProjects() {
  const now = new Date().toISOString();

  return [
    buildDemoProject({
      id: DEMO_PROJECT_IDS.uatAnnual,
      clientName: "某银行股份有限公司",
      name: "2026 年度财务报表审计（演示）",
      projectType: "annual",
      team: "audit",
      industry: "finance-banking",
      reportOffset: 5,
      managerEmail: DEMO_EMAILS.manager1,
      icEmail: DEMO_EMAILS.ic1,
      staffEmails: [DEMO_EMAILS.staff1, DEMO_EMAILS.staff2],
      specialistTeams: uatSpecialistTeams(now)
    }),
    buildDemoProject({
      id: DEMO_PROJECT_IDS.socIta,
      clientName: "某云服务股份有限公司",
      name: "2026 SOC 2 Type II 审计（演示）",
      projectType: "soc",
      team: "ita",
      industry: "tmt-technology",
      reportOffset: 10,
      startOffset: -14,
      engagementType: "new",
      managerEmail: DEMO_EMAILS.manager1,
      icEmail: DEMO_EMAILS.ic1,
      staffEmails: [DEMO_EMAILS.staff1]
    }),
    buildDemoProject({
      id: DEMO_PROJECT_IDS.ipo,
      clientName: "某科技股份有限公司",
      name: "2026 科创板 IPO 核查（演示）",
      projectType: "ipo",
      team: "audit",
      industry: "tmt-technology",
      reportOffset: 25,
      startOffset: -21,
      engagementType: "new",
      managerEmail: DEMO_EMAILS.manager1,
      icEmail: DEMO_EMAILS.ic1,
      staffEmails: [DEMO_EMAILS.staff1, DEMO_EMAILS.staff3]
    }),
    buildDemoProject({
      id: DEMO_PROJECT_IDS.mfgAnnual,
      clientName: "某装备制造集团有限公司",
      name: "2026 年度财务报表审计（演示）",
      projectType: "annual",
      team: "audit",
      industry: "mfg-industrial",
      reportOffset: 18,
      startOffset: -45,
      managerEmail: DEMO_EMAILS.manager1,
      icEmail: DEMO_EMAILS.ic1,
      staffEmails: [DEMO_EMAILS.staff2, DEMO_EMAILS.staff3]
    }),
    buildDemoProject({
      id: DEMO_PROJECT_IDS.privacy,
      clientName: "某消费互联网平台有限公司",
      name: "2026 个人信息保护合规审计（演示）",
      projectType: "privacy",
      team: "ita",
      industry: "tmt-technology",
      reportOffset: 3,
      startOffset: -10,
      engagementType: "new",
      managerEmail: DEMO_EMAILS.manager2,
      icEmail: DEMO_EMAILS.ic2,
      staffEmails: [DEMO_EMAILS.staff2, DEMO_EMAILS.staff3]
    }),
    buildDemoProject({
      id: DEMO_PROJECT_IDS.specialIt,
      clientName: "某物流科技有限责任公司",
      name: "2026 专项 IT 审计（演示）",
      projectType: "special-it",
      team: "ita",
      industry: "tmt-technology",
      reportOffset: 10,
      startOffset: -12,
      engagementType: "new",
      managerEmail: DEMO_EMAILS.manager2,
      icEmail: DEMO_EMAILS.ic2,
      staffEmails: [DEMO_EMAILS.staff3]
    }),
    buildDemoProject({
      id: DEMO_PROJECT_IDS.retailAnnual,
      clientName: "某连锁零售股份有限公司",
      name: "2026 年度财务报表审计（演示）",
      projectType: "annual",
      team: "audit",
      industry: "retail-general",
      reportOffset: 42,
      startOffset: -20,
      managerEmail: DEMO_EMAILS.manager2,
      icEmail: DEMO_EMAILS.ic2,
      staffEmails: [DEMO_EMAILS.staff2]
    }),
    buildDemoProject({
      id: DEMO_PROJECT_IDS.fintechSoc,
      clientName: "某金融科技控股有限公司",
      name: "2026 SOC 1 Type II 审计（演示）",
      projectType: "soc",
      team: "ita",
      industry: "finance-banking",
      reportOffset: 28,
      startOffset: -18,
      engagementType: "new",
      managerEmail: DEMO_EMAILS.manager2,
      icEmail: DEMO_EMAILS.ic2,
      staffEmails: [DEMO_EMAILS.staff1, DEMO_EMAILS.staff3]
    })
  ];
}

function buildDemoTask({
  id,
  projectId,
  title,
  owner,
  due,
  status = "todo",
  contributorGroup,
  auditDomain = "itgc",
  product
}) {
  return enrichTaskWithFinancialContext({
    id,
    title,
    description: `演示测试点 · ${title}`,
    priority: "P1",
    platform: "PC 端",
    product: product || title,
    owner,
    due,
    status,
    comments: [],
    projectId,
    auditPhase: "control-test",
    auditDomain,
    scopeGenerated: false,
    contributorGroup
  });
}

function buildAllDemoTasks() {
  const P = DEMO_PROJECT_IDS;

  return [
    // —— 某银行年审：多逾期 + 多执行人 ——
    buildDemoTask({ id: "DS-901", projectId: P.uatAnnual, title: "收入循环 GITC 控制测试", owner: DEMO_EMAILS.ic1, due: daysFromToday(-7), status: "doing", contributorGroup: "audit", auditDomain: "itgc", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-902", projectId: P.uatAnnual, title: "货币资金 ITAC 自动化控制", owner: DEMO_EMAILS.staff1, due: daysFromToday(-3), contributorGroup: "audit", auditDomain: "itac", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-903", projectId: P.uatAnnual, title: "访问管理 GITC", owner: DEMO_EMAILS.itaLead, due: daysFromToday(5), status: "doing", contributorGroup: "ita", auditDomain: "itgc", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-904", projectId: P.uatAnnual, title: "变更管理 GITC", owner: DEMO_EMAILS.itaStaff, due: daysFromToday(10), contributorGroup: "ita", auditDomain: "itgc", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-905", projectId: P.uatAnnual, title: "程序开发 ITAC", owner: DEMO_EMAILS.itaLead, due: daysFromToday(-5), contributorGroup: "ita", auditDomain: "itac", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-906", projectId: P.uatAnnual, title: "所得税计提 Tax 专项", owner: DEMO_EMAILS.taxLead, due: daysFromToday(14), contributorGroup: "tax", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-907", projectId: P.uatAnnual, title: "递延所得税 Tax 核对", owner: DEMO_EMAILS.taxLead, due: daysFromToday(-2), contributorGroup: "tax", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-908", projectId: P.uatAnnual, title: "采购与付款 GITC", owner: DEMO_EMAILS.ic1, due: daysFromToday(20), contributorGroup: "audit", auditDomain: "itgc", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-909", projectId: P.uatAnnual, title: "固定资产 ITAC", owner: DEMO_EMAILS.staff2, due: daysFromToday(7), contributorGroup: "audit", auditDomain: "itac", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-910", projectId: P.uatAnnual, title: "备份与恢复 GITC", owner: DEMO_EMAILS.itaStaff, due: daysFromToday(12), contributorGroup: "ita", auditDomain: "itgc", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-911", projectId: P.uatAnnual, title: "监管报送接口 ITAC", owner: DEMO_EMAILS.staff1, due: daysFromToday(3), contributorGroup: "audit", auditDomain: "itac", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-912", projectId: P.uatAnnual, title: "关联方交易 Tax 核对", owner: DEMO_EMAILS.taxLead, due: daysFromToday(18), contributorGroup: "tax", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-913", projectId: P.uatAnnual, title: "总账结账 GITC", owner: DEMO_EMAILS.staff2, due: daysFromToday(-1), contributorGroup: "audit", auditDomain: "itgc", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-914", projectId: P.uatAnnual, title: "权限复核 ITAC", owner: DEMO_EMAILS.itaLead, due: daysFromToday(8), contributorGroup: "ita", auditDomain: "itac", product: "2026 年度财务报表审计（演示）" }),
    buildDemoTask({ id: "DS-915", projectId: P.uatAnnual, title: "薪酬循环 GITC", owner: DEMO_EMAILS.staff1, due: daysFromToday(30), contributorGroup: "audit", auditDomain: "itgc", product: "2026 年度财务报表审计（演示）" }),

    // —— SOC 云：轻度逾期 ——
    buildDemoTask({ id: "DS-951", projectId: P.socIta, title: "信任服务准则范围确认", owner: DEMO_EMAILS.ic1, due: daysFromToday(21), contributorGroup: "ita", product: "2026 SOC 2 Type II 审计（演示）" }),
    buildDemoTask({ id: "DS-952", projectId: P.socIta, title: "关键系统清单与边界", owner: DEMO_EMAILS.itaLead, due: daysFromToday(-2), contributorGroup: "ita", product: "2026 SOC 2 Type II 审计（演示）" }),
    buildDemoTask({ id: "DS-953", projectId: P.socIta, title: "逻辑访问控制 GITC", owner: DEMO_EMAILS.itaStaff, due: daysFromToday(8), status: "doing", contributorGroup: "ita", product: "2026 SOC 2 Type II 审计（演示）" }),
    buildDemoTask({ id: "DS-954", projectId: P.socIta, title: "变更管理抽样 ITAC", owner: DEMO_EMAILS.staff1, due: daysFromToday(15), contributorGroup: "ita", auditDomain: "itac", product: "2026 SOC 2 Type II 审计（演示）" }),
    buildDemoTask({ id: "DS-955", projectId: P.socIta, title: "监控与告警 GITC", owner: DEMO_EMAILS.itaLead, due: daysFromToday(6), contributorGroup: "ita", product: "2026 SOC 2 Type II 审计（演示）" }),

    // —— IPO ——
    buildDemoTask({ id: "DS-961", projectId: P.ipo, title: "招股书 IT 章节复核", owner: DEMO_EMAILS.ic1, due: daysFromToday(22), contributorGroup: "audit", product: "2026 科创板 IPO 核查（演示）" }),
    buildDemoTask({ id: "DS-962", projectId: P.ipo, title: "收入确认 ITAC", owner: DEMO_EMAILS.staff1, due: daysFromToday(18), contributorGroup: "audit", auditDomain: "itac", product: "2026 科创板 IPO 核查（演示）" }),
    buildDemoTask({ id: "DS-963", projectId: P.ipo, title: "募集资金运用 GITC", owner: DEMO_EMAILS.staff3, due: daysFromToday(26), contributorGroup: "audit", product: "2026 科创板 IPO 核查（演示）" }),
    buildDemoTask({ id: "DS-964", projectId: P.ipo, title: "数据室访问 GITC", owner: DEMO_EMAILS.itaLead, due: daysFromToday(20), contributorGroup: "ita", product: "2026 科创板 IPO 核查（演示）" }),
    buildDemoTask({ id: "DS-965", projectId: P.ipo, title: "关联交易系统 ITAC", owner: DEMO_EMAILS.staff1, due: daysFromToday(24), contributorGroup: "audit", auditDomain: "itac", product: "2026 科创板 IPO 核查（演示）" }),
    buildDemoTask({ id: "DS-966", projectId: P.ipo, title: "上市前内控缺陷 GITC", owner: DEMO_EMAILS.ic1, due: daysFromToday(28), contributorGroup: "audit", product: "2026 科创板 IPO 核查（演示）" }),

    // —— 装备制造年审 ——
    buildDemoTask({ id: "DS-971", projectId: P.mfgAnnual, title: "存货循环 GITC", owner: DEMO_EMAILS.ic1, due: daysFromToday(16), contributorGroup: "audit", product: "2026 年度财务报表审计（演示）· 装备制造" }),
    buildDemoTask({ id: "DS-972", projectId: P.mfgAnnual, title: "生产成本 ITAC", owner: DEMO_EMAILS.staff2, due: daysFromToday(-4), contributorGroup: "audit", auditDomain: "itac", product: "2026 年度财务报表审计（演示）· 装备制造" }),
    buildDemoTask({ id: "DS-973", projectId: P.mfgAnnual, title: "设备台账 GITC", owner: DEMO_EMAILS.staff3, due: daysFromToday(19), contributorGroup: "audit", product: "2026 年度财务报表审计（演示）· 装备制造" }),
    buildDemoTask({ id: "DS-974", projectId: P.mfgAnnual, title: "MES 接口 ITAC", owner: DEMO_EMAILS.itaLead, due: daysFromToday(14), contributorGroup: "ita", auditDomain: "itac", product: "2026 年度财务报表审计（演示）· 装备制造" }),
    buildDemoTask({ id: "DS-975", projectId: P.mfgAnnual, title: "委外加工 GITC", owner: DEMO_EMAILS.staff2, due: daysFromToday(21), contributorGroup: "audit", product: "2026 年度财务报表审计（演示）· 装备制造" }),

    // —— 隐私合规 ——
    buildDemoTask({ id: "DS-981", projectId: P.privacy, title: "个人信息清单映射", owner: DEMO_EMAILS.ic2, due: daysFromToday(2), status: "doing", contributorGroup: "ita", product: "2026 个人信息保护合规审计（演示）" }),
    buildDemoTask({ id: "DS-982", projectId: P.privacy, title: "同意机制 GITC", owner: DEMO_EMAILS.itaLead, due: daysFromToday(-3), contributorGroup: "ita", product: "2026 个人信息保护合规审计（演示）" }),
    buildDemoTask({ id: "DS-983", projectId: P.privacy, title: "跨境传输评估", owner: DEMO_EMAILS.itaStaff, due: daysFromToday(5), contributorGroup: "ita", product: "2026 个人信息保护合规审计（演示）" }),
    buildDemoTask({ id: "DS-984", projectId: P.privacy, title: "App 权限弹窗 ITAC", owner: DEMO_EMAILS.staff2, due: daysFromToday(4), contributorGroup: "ita", auditDomain: "itac", product: "2026 个人信息保护合规审计（演示）" }),
    buildDemoTask({ id: "DS-985", projectId: P.privacy, title: "日志留存 GITC", owner: DEMO_EMAILS.staff3, due: daysFromToday(7), contributorGroup: "ita", product: "2026 个人信息保护合规审计（演示）" }),
    buildDemoTask({ id: "DS-986", projectId: P.privacy, title: "第三方 SDK 清单", owner: DEMO_EMAILS.itaLead, due: daysFromToday(9), contributorGroup: "ita", product: "2026 个人信息保护合规审计（演示）" }),

    // —— 专项 IT ——
    buildDemoTask({ id: "DS-991", projectId: P.specialIt, title: "核心系统范围界定", owner: DEMO_EMAILS.ic2, due: daysFromToday(9), contributorGroup: "ita", product: "2026 专项 IT 审计（演示）" }),
    buildDemoTask({ id: "DS-992", projectId: P.specialIt, title: "接口清单 GITC", owner: DEMO_EMAILS.itaLead, due: daysFromToday(-1), contributorGroup: "ita", product: "2026 专项 IT 审计（演示）" }),
    buildDemoTask({ id: "DS-993", projectId: P.specialIt, title: "运维权限 ITAC", owner: DEMO_EMAILS.itaStaff, due: daysFromToday(11), contributorGroup: "ita", auditDomain: "itac", product: "2026 专项 IT 审计（演示）" }),
    buildDemoTask({ id: "DS-994", projectId: P.specialIt, title: "灾备演练 GITC", owner: DEMO_EMAILS.staff3, due: daysFromToday(13), contributorGroup: "ita", product: "2026 专项 IT 审计（演示）" }),
    buildDemoTask({ id: "DS-995", projectId: P.specialIt, title: "供应商管理 ITAC", owner: DEMO_EMAILS.itaLead, due: daysFromToday(8), status: "doing", contributorGroup: "ita", auditDomain: "itac", product: "2026 专项 IT 审计（演示）" }),

    // —— 零售年审 ——
    buildDemoTask({ id: "DS-1001", projectId: P.retailAnnual, title: "门店收银 GITC", owner: DEMO_EMAILS.ic2, due: daysFromToday(38), contributorGroup: "audit", product: "2026 年度财务报表审计（演示）· 零售" }),
    buildDemoTask({ id: "DS-1002", projectId: P.retailAnnual, title: "会员积分 ITAC", owner: DEMO_EMAILS.staff2, due: daysFromToday(40), contributorGroup: "audit", auditDomain: "itac", product: "2026 年度财务报表审计（演示）· 零售" }),
    buildDemoTask({ id: "DS-1003", projectId: P.retailAnnual, title: "电商订单 GITC", owner: DEMO_EMAILS.staff2, due: daysFromToday(35), contributorGroup: "audit", product: "2026 年度财务报表审计（演示）· 零售" }),
    buildDemoTask({ id: "DS-1004", projectId: P.retailAnnual, title: "供应链接口 ITAC", owner: DEMO_EMAILS.itaLead, due: daysFromToday(41), contributorGroup: "ita", auditDomain: "itac", product: "2026 年度财务报表审计（演示）· 零售" }),

    // —— 金融科技 SOC ——
    buildDemoTask({ id: "DS-1011", projectId: P.fintechSoc, title: "支付通道 GITC", owner: DEMO_EMAILS.ic2, due: daysFromToday(26), contributorGroup: "ita", product: "2026 SOC 1 Type II 审计（演示）" }),
    buildDemoTask({ id: "DS-1012", projectId: P.fintechSoc, title: "反洗钱监控 ITAC", owner: DEMO_EMAILS.itaLead, due: daysFromToday(24), contributorGroup: "ita", auditDomain: "itac", product: "2026 SOC 1 Type II 审计（演示）" }),
    buildDemoTask({ id: "DS-1013", projectId: P.fintechSoc, title: "密钥管理 GITC", owner: DEMO_EMAILS.itaStaff, due: daysFromToday(27), contributorGroup: "ita", product: "2026 SOC 1 Type II 审计（演示）" }),
    buildDemoTask({ id: "DS-1014", projectId: P.fintechSoc, title: "清算对账 ITAC", owner: DEMO_EMAILS.staff1, due: daysFromToday(29), contributorGroup: "ita", auditDomain: "itac", product: "2026 SOC 1 Type II 审计（演示）" }),
    buildDemoTask({ id: "DS-1015", projectId: P.fintechSoc, title: "灾备切换 GITC", owner: DEMO_EMAILS.staff3, due: daysFromToday(30), contributorGroup: "ita", product: "2026 SOC 1 Type II 审计（演示）" })
  ];
}

const ALL_DEMO_TASK_IDS = new Set(buildAllDemoTasks().map((task) => task.id));

function seedInProgressRecord(controlId) {
  return {
    materials: [
      {
        id: `seed_${controlId}_mm`,
        category: MATERIAL_CATEGORY.MEETING_MINUTES,
        phaseId: "tod",
        nodeId: "",
        name: "演示会议纪要.docx",
        uploadedBy: "演示种子",
        uploadedAt: new Date().toISOString(),
        status: "submitted"
      }
    ],
    updatedAt: new Date().toISOString()
  };
}

function mergeDemoProjects(existingProjects) {
  const demoProjects = buildAllDemoProjects();
  const byId = new Map(existingProjects.map((project) => [project.id, project]));
  demoProjects.forEach((project) => {
    byId.set(project.id, project);
  });
  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function mergeDemoTasks(existingTasks) {
  const demoTasks = buildAllDemoTasks();
  const nonDemo = existingTasks.filter((task) => !ALL_DEMO_TASK_IDS.has(task.id));
  return [...nonDemo, ...demoTasks];
}

function seedWorkspaceProgress(tasks) {
  try {
    const saved = JSON.parse(localStorage.getItem(WORKSPACE_PROGRESS_STORAGE_KEY) || "{}");
    const store = {
      schemaVersion: saved.schemaVersion || 2,
      updatedAt: new Date().toISOString(),
      projects: saved.projects && typeof saved.projects === "object" ? { ...saved.projects } : {},
      records: saved.records
    };

    const inProgressIds = ["DS-901", "DS-903", "DS-953", "DS-981", "DS-995"];
    let changed = false;

    inProgressIds.forEach((controlId) => {
      const task = tasks.find((item) => item.id === controlId);
      if (!task?.projectId) return;
      if (!store.projects[task.projectId]) {
        store.projects[task.projectId] = { records: {} };
      }
      if (!store.projects[task.projectId].records) {
        store.projects[task.projectId].records = {};
      }
      store.projects[task.projectId].records[controlId] = seedInProgressRecord(controlId);
      changed = true;
    });

    if (changed) {
      localStorage.setItem(WORKSPACE_PROGRESS_STORAGE_KEY, JSON.stringify(store));
    }
  } catch {
    /* ignore seed errors */
  }
}

/**
 * 注入演示种子（幂等）：8 个演示项目、2 位 EM、多 Staff 与跨组测试点。
 * 升级 DEMO_SEED_VERSION 后会覆盖演示项目字段并刷新演示测试点。
 * @returns {{ projects: array, tasks: array, seeded: boolean }}
 */
export function ensureDemoData() {
  try {
    const flag = Number(localStorage.getItem(DEMO_SEED_FLAG_KEY) || 0);
    const needsReseed = !flag || flag < DEMO_SEED_VERSION;

    if (!needsReseed) {
      return { projects: loadProjects(), tasks: loadTasksRaw(), seeded: false };
    }

    const projects = mergeDemoProjects(loadProjects());
    saveProjects(projects);

    const tasks = mergeDemoTasks(loadTasksRaw());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    seedWorkspaceProgress(tasks);

    localStorage.setItem(DEMO_SEED_FLAG_KEY, String(DEMO_SEED_VERSION));
    return { projects, tasks, seeded: true };
  } catch {
    return { projects: loadProjects(), tasks: loadTasksRaw(), seeded: false };
  }
}

function loadTasksRaw() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function collectProjectContributorGroups(projectId, tasks = []) {
  const groups = new Set();
  tasks
    .filter((task) => task.projectId === projectId && task.contributorGroup)
    .forEach((task) => groups.add(task.contributorGroup));
  return [...groups];
}

export function isDemoProjectId(projectId) {
  return ALL_DEMO_PROJECT_IDS.has(projectId);
}
