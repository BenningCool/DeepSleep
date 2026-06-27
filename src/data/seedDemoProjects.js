import { STORAGE_KEY } from "./mockData";
import { DEMO_PROJECT_IDS } from "./engagementTypeProfiles";
import { PROJECTS_STORAGE_KEY, migrateProject, saveProjects, loadProjects } from "../modules/project/projectStore";
import { WORKSPACE_PROGRESS_STORAGE_KEY, MATERIAL_CATEGORY } from "../services/workspaceProgressService";

export const DEMO_SEED_VERSION = 1;
export const DEMO_SEED_FLAG_KEY = "deepsleep-demo-seed-v1";

const UAT_PRODUCT = "2026 年度财务报表审计（演示）";
const SOC_PRODUCT = "2026 SOC 2 Type II 审计（演示）";

function daysFromToday(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function buildUatProject() {
  const now = new Date().toISOString();
  return migrateProject({
    id: DEMO_PROJECT_IDS.uatAnnual,
    clientName: "某银行股份有限公司",
    name: "2026 年度财务报表审计（演示）",
    team: "audit",
    engagementType: "recurring",
    projectType: "annual",
    industry: "finance-banking",
    startDate: daysFromToday(-30),
    reportDate: daysFromToday(6),
    scopeStatus: "defined",
    createdAt: now,
    members: [
      {
        id: "mem_uat_partner",
        email: "partner.uat@firm.com",
        role: "partner",
        inviteToken: "invite_uat_partner",
        status: "active",
        invitedAt: now
      },
      {
        id: "mem_uat_manager",
        email: "manager.uat@firm.com",
        role: "manager",
        inviteToken: "invite_uat_manager",
        status: "active",
        invitedAt: now
      },
      {
        id: "mem_uat_ic",
        email: "incharge.uat@firm.com",
        role: "in_charge",
        inviteToken: "invite_uat_ic",
        status: "active",
        invitedAt: now
      },
      {
        id: "mem_uat_staff",
        email: "staff1.uat@firm.com",
        role: "staff",
        inviteToken: "invite_uat_staff",
        status: "active",
        invitedAt: now
      }
    ],
    specialistTeams: [
      {
        id: "spt_uat_ita",
        team: "ita",
        leadRole: "in_charge",
        leadEmail: "ita-lead.uat@firm.com",
        inviteToken: "invite_uat_ita_lead",
        status: "active",
        staff: [
          {
            id: "sst_uat_ita_1",
            email: "ita-staff.uat@firm.com",
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
        leadEmail: "tax-lead.uat@firm.com",
        inviteToken: "invite_uat_tax_lead",
        status: "active",
        staff: []
      }
    ]
  });
}

function buildSocProject() {
  const now = new Date().toISOString();
  return migrateProject({
    id: DEMO_PROJECT_IDS.socIta,
    clientName: "某云服务股份有限公司",
    name: "2026 SOC 2 Type II 审计（演示）",
    team: "ita",
    engagementType: "new",
    projectType: "soc",
    industry: "tmt-technology",
    startDate: daysFromToday(-14),
    reportDate: daysFromToday(12),
    scopeStatus: "defined",
    createdAt: now,
    members: [
      {
        id: "mem_soc_partner",
        email: "partner.uat@firm.com",
        role: "partner",
        inviteToken: "invite_soc_partner",
        status: "active",
        invitedAt: now
      },
      {
        id: "mem_soc_manager",
        email: "manager.uat@firm.com",
        role: "manager",
        inviteToken: "invite_soc_manager",
        status: "active",
        invitedAt: now
      },
      {
        id: "mem_soc_ic",
        email: "incharge.uat@firm.com",
        role: "in_charge",
        inviteToken: "invite_soc_ic",
        status: "active",
        invitedAt: now
      }
    ],
    specialistTeams: []
  });
}

function buildDemoTask({
  id,
  projectId,
  title,
  owner,
  due,
  status = "todo",
  contributorGroup,
  auditDomain = "itgc"
}) {
  const product = projectId === DEMO_PROJECT_IDS.socIta ? SOC_PRODUCT : UAT_PRODUCT;
  return {
    id,
    title,
    description: `演示测试点 · ${title}`,
    priority: "P1",
    platform: "PC 端",
    product,
    owner,
    due,
    status,
    comments: [],
    projectId,
    auditPhase: "control-test",
    auditDomain,
    scopeGenerated: false,
    contributorGroup
  };
}

function buildUatTasks() {
  return [
    buildDemoTask({
      id: "DS-901",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "收入循环 GITC 控制测试",
      owner: "incharge.uat@firm.com",
      due: daysFromToday(-7),
      status: "doing",
      contributorGroup: "audit",
      auditDomain: "itgc"
    }),
    buildDemoTask({
      id: "DS-902",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "货币资金 ITAC 自动化控制",
      owner: "staff1.uat@firm.com",
      due: daysFromToday(-3),
      status: "todo",
      contributorGroup: "audit",
      auditDomain: "itac"
    }),
    buildDemoTask({
      id: "DS-903",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "访问管理 GITC",
      owner: "ita-lead.uat@firm.com",
      due: daysFromToday(5),
      status: "doing",
      contributorGroup: "ita",
      auditDomain: "itgc"
    }),
    buildDemoTask({
      id: "DS-904",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "变更管理 GITC",
      owner: "ita-staff.uat@firm.com",
      due: daysFromToday(10),
      status: "todo",
      contributorGroup: "ita",
      auditDomain: "itgc"
    }),
    buildDemoTask({
      id: "DS-905",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "程序开发 ITAC",
      owner: "ita-lead.uat@firm.com",
      due: daysFromToday(-5),
      status: "todo",
      contributorGroup: "ita",
      auditDomain: "itac"
    }),
    buildDemoTask({
      id: "DS-906",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "所得税计提 Tax 专项",
      owner: "tax-lead.uat@firm.com",
      due: daysFromToday(14),
      status: "todo",
      contributorGroup: "tax"
    }),
    buildDemoTask({
      id: "DS-907",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "递延所得税 Tax 专项",
      owner: "tax-lead.uat@firm.com",
      due: daysFromToday(-2),
      status: "todo",
      contributorGroup: "tax"
    }),
    buildDemoTask({
      id: "DS-908",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "采购与付款 GITC",
      owner: "incharge.uat@firm.com",
      due: daysFromToday(20),
      status: "todo",
      contributorGroup: "audit",
      auditDomain: "itgc"
    }),
    buildDemoTask({
      id: "DS-909",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "固定资产 ITAC",
      owner: "staff1.uat@firm.com",
      due: daysFromToday(7),
      status: "todo",
      contributorGroup: "audit",
      auditDomain: "itac"
    }),
    buildDemoTask({
      id: "DS-910",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "备份与恢复 GITC",
      owner: "ita-staff.uat@firm.com",
      due: daysFromToday(12),
      status: "todo",
      contributorGroup: "ita",
      auditDomain: "itgc"
    }),
    buildDemoTask({
      id: "DS-911",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "监管报送接口 ITAC",
      owner: "staff1.uat@firm.com",
      due: daysFromToday(3),
      status: "todo",
      contributorGroup: "audit",
      auditDomain: "itac"
    }),
    buildDemoTask({
      id: "DS-912",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "关联方交易 Tax 核对",
      owner: "tax-lead.uat@firm.com",
      due: daysFromToday(18),
      status: "todo",
      contributorGroup: "tax"
    }),
    buildDemoTask({
      id: "DS-913",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "总账结账 GITC",
      owner: "incharge.uat@firm.com",
      due: daysFromToday(25),
      status: "todo",
      contributorGroup: "audit",
      auditDomain: "itgc"
    }),
    buildDemoTask({
      id: "DS-914",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "权限复核 ITAC",
      owner: "ita-lead.uat@firm.com",
      due: daysFromToday(8),
      status: "todo",
      contributorGroup: "ita",
      auditDomain: "itac"
    }),
    buildDemoTask({
      id: "DS-915",
      projectId: DEMO_PROJECT_IDS.uatAnnual,
      title: "薪酬循环 GITC",
      owner: "staff1.uat@firm.com",
      due: daysFromToday(30),
      status: "todo",
      contributorGroup: "audit",
      auditDomain: "itgc"
    })
  ];
}

function buildSocTasks() {
  return [
    buildDemoTask({
      id: "DS-951",
      projectId: DEMO_PROJECT_IDS.socIta,
      title: "信任服务准则范围确认",
      owner: "incharge.uat@firm.com",
      due: daysFromToday(21),
      status: "todo",
      contributorGroup: "ita",
      auditDomain: "itgc"
    }),
    buildDemoTask({
      id: "DS-952",
      projectId: DEMO_PROJECT_IDS.socIta,
      title: "关键系统清单与边界",
      owner: "incharge.uat@firm.com",
      due: daysFromToday(35),
      status: "todo",
      contributorGroup: "ita",
      auditDomain: "itgc"
    })
  ];
}

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
  const demoProjects = [buildUatProject(), buildSocProject()];
  const byId = new Map(existingProjects.map((project) => [project.id, project]));
  demoProjects.forEach((project) => {
    if (!byId.has(project.id)) {
      byId.set(project.id, project);
    }
  });
  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function mergeDemoTasks(existingTasks) {
  const demoTasks = [...buildUatTasks(), ...buildSocTasks()];
  const byId = new Map(existingTasks.map((task) => [task.id, task]));
  demoTasks.forEach((task) => {
    if (!byId.has(task.id)) {
      byId.set(task.id, task);
    }
  });
  return [...byId.values()];
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

    const inProgressIds = ["DS-901", "DS-903"];
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
      if (store.projects[task.projectId].records[controlId]) return;
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
 * 注入演示种子（幂等）：PRJ-UAT-DEMO、PRJ-SOC-DEMO 及关联测试点。
 * @returns {{ projects: array, tasks: array, seeded: boolean }}
 */
export function ensureDemoData() {
  try {
    const flag = localStorage.getItem(DEMO_SEED_FLAG_KEY);
    if (flag && Number(flag) >= DEMO_SEED_VERSION) {
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
