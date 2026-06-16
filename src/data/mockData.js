export const STORAGE_KEY = "deepsleep-project-kanban-v1";

export const COLUMNS = [
  { id: "todo", title: "待开始" },
  { id: "doing", title: "进行中" },
  { id: "review", title: "待复核" },
  { id: "done", title: "已完成" }
];

export const DEFAULT_TASKS = [
  {
    id: "DS-101",
    title: "审计定制化的逻辑/勾稽关系",
    description: "根据项目类型初始化 scope，创建项目时选择行业和审计领域以及项目类型，自动完成 80% 的初始化。审计阶段预设流转路径，不允许跳过关键步骤。",
    priority: "P0",
    platform: "PC 端",
    product: "DeepSleep 项目看板",
    owner: "Cody",
    due: "2026-06-12",
    status: "grooming",
    comments: [
      { author: "PM", text: "需要在卡片详情中体现关键步骤和不可跳过的规则。" },
      { author: "Audit", text: "Scope 初始化要能按行业、审计领域和项目类型快速选择。" }
    ]
  },
  {
    id: "DS-102",
    title: "协同办公（1.0 先不考虑权限）",
    description: "个人工作台聚合显示该成员参与的所有项目及其负荷，方便审计团队快速看到自己负责的任务。",
    priority: "P0",
    platform: "PC 端",
    product: "DeepSleep 项目看板",
    owner: "Mia",
    due: "2026-06-14",
    status: "todo",
    comments: [
      { author: "Team", text: "黑客松阶段先展示工作台入口和成员字段，权限以后再做。" }
    ]
  },
  {
    id: "DS-103",
    title: "进度看板",
    description: "分为 ITGC/ITAC 依赖关系可视化，卡片按阶段分列，帮助团队看到需求从梳理到完成的流转状态。",
    priority: "P0",
    platform: "PC 端",
    product: "DeepSleep 项目看板",
    owner: "Alex",
    due: "2026-06-15",
    status: "development",
    comments: [
      { author: "Design", text: "界面参考 JIRA：左侧项目导航、顶部筛选、横向看板列。" }
    ]
  },
  {
    id: "DS-104",
    title: "每个卡片中的正文、批注功能",
    description: "卡片详情需要支持正文编辑和批注追加，让需求讨论沉淀在对应任务下。",
    priority: "P0",
    platform: "PC 端",
    product: "DeepSleep 项目看板",
    owner: "Nina",
    due: "2026-06-16",
    status: "review",
    comments: []
  },
  {
    id: "DS-105",
    title: "移动端任务概览",
    description: "移动端以只读概览为主，展示我的任务、截止日期和当前阶段。",
    priority: "P1",
    platform: "移动端",
    product: "DeepSleep 项目看板",
    owner: "Ray",
    due: "2026-06-18",
    status: "design",
    comments: [
      { author: "UX", text: "窄屏下看板可以横向滚动，优先保证信息不重叠。" }
    ]
  },
  {
    id: "DS-106",
    title: "任务保存到浏览器",
    description: "使用 localStorage 保存任务、筛选前后的修改和批注，刷新后不丢失，方便现场演示。",
    priority: "P1",
    platform: "后端",
    product: "DeepSleep 项目看板",
    owner: "Ivy",
    due: "2026-06-10",
    status: "done",
    comments: [
      { author: "Dev", text: "静态原型不接后端，后续可以替换为 API。" }
    ]
  },
  {
    id: "DS-107",
    title: "AI 需求摘要",
    description: "从长需求正文中生成简短摘要，便于看板卡片快速浏览。黑客松版本先作为 AI 端任务占位。",
    priority: "P2",
    platform: "AI",
    product: "DeepSleep 项目看板",
    owner: "Leo",
    due: "2026-06-21",
    status: "todo",
    comments: []
  }
];
