import { PROGRESS_STATUS } from "../services/workspaceProgressService";

export const PROGRESS_STATUS_LABELS = {
  [PROGRESS_STATUS.NOT_STARTED]: "未开始",
  [PROGRESS_STATUS.IN_PROGRESS]: "测试中",
  [PROGRESS_STATUS.EVIDENCE_SUBMITTED]: "资料已获取",
  [PROGRESS_STATUS.PENDING_REVIEW]: "待复核",
  [PROGRESS_STATUS.NEEDS_REWORK]: "待补充测试",
  [PROGRESS_STATUS.COMPLETED]: "已完成",
  [PROGRESS_STATUS.BLOCKED]: "被阻塞"
};

/** 工作台三态（KPI 四格、进度列表/抽屉主状态、项目列表状态概述柱） */
export const WORKSPACE_STATUS_LABELS = {
  [PROGRESS_STATUS.NOT_STARTED]: "未开始",
  [PROGRESS_STATUS.IN_PROGRESS]: "测试中",
  [PROGRESS_STATUS.COMPLETED]: "已完成"
};

export const KPI_LABELS = {
  total: "总数",
  completed: "已完成",
  pending: "进行中",
  delay: "逾期/阻塞"
};

export const DASHBOARD_KPI_LABELS = {
  notStarted: "未开始",
  inProgress: "测试中",
  completed: "已完成",
  overdue: "已逾期",
  overdueAwaitingData: "计划完成日同步后展示"
};

export const DASHBOARD_KPI_SECTION = {
  title: "测试点进度",
  titleEn: "Test Point Status",
  lead: "按工作台底稿三态汇总当前筛选下的测试点；卡片小字为 GITC / ITAC 数量及占该状态比例。"
};

export const PROGRESS_BOARD_SECTION_LABELS = {
  testPointList: "测试点列表",
  testPointListEn: "Test Point List"
};

export const PROGRESS_LIST_LABELS = {
  allMembers: "全部成员",
  memberFilter: "负责人筛选",
  filterEmpty: "当前筛选条件下暂无测试点，请调整状态、逾期或成员筛选。"
};

export const DASHBOARD_CARD_LABELS = {
  nodeProgressOverview: "测试节点进度",
  nodeProgressOverviewEn: "Node Progress",
  nodeProgressOverviewLead: "来自工作台 snapshot 的 completedNodes / totalNodes，按当前筛选汇总整体节点完成度。",
  nodeProgressCenterLabel: "节点完成度",
  nodeProgressCompleted: "已完成节点",
  nodeProgressRemaining: "未完成节点",
  nodeProgressTestPoints: "测试点",
  controlTotal: "测试点",
  viewAllControls: "查看全部测试点",
  recentActivity: "近期动态",
  recentActivityEn: "Recent Activity",
  recentActivityLead: "按工作台最近保存时间排序",
  recentActivityEmpty: "尚无动态。在工作台保存测试点后，将在此显示最近更新。",
  controlNodeProgress: "测试点节点进度",
  controlNodeProgressEn: "Test Point Node Progress",
  controlNodeProgressEmpty: "当前类型下暂无测试点。",
  teamMemberProgress: "组内成员进度",
  teamMemberProgressEn: "Team Member Progress",
  teamMemberProgressLead: "跟随页顶负责组筛选；仅展示 In-charge 与 Staff 及其负责的测试点；柱体为已完成占比，下方为三态明细。",
  teamMemberProgressEmpty: "当前组暂无成员。",
  teamMemberProgressUnassigned: "未分配",
  blockedNote: "被阻塞"
};

export const ATTENTION_LABELS = {
  panelTitle: "需关注事项",
  panelTitleEn: "Attention Items",
  panelLead: "仅汇总计划逾期与长期未启动的测试点，便于安排跟进优先级。",
  overdueTitle: "计划逾期",
  overdueTitleEn: "Overdue",
  staleTitle: "长期未开始",
  staleTitleEn: "Not Started",
  overdueBadge: "已逾期",
  dueLabel: "计划完成日",
  overdueDaysPrefix: "已逾期 ",
  overdueEmpty: "暂无计划逾期项",
  overdueEmptyEn: "No Overdue Items",
  overdueAwaitingData: "计划完成日数据同步后，逾期项将在此红色高亮展示"
};

export const ATTENTION_BUCKET_LABELS = {
  overdue: "计划逾期",
  stale: "长期未开始",
  blocked: "被阻塞",
  onTrack: "正常推进"
};

export const DRAWER_PREREQUISITE_LABELS = {
  title: "前置程序未完成",
  goBoard: "去看板处理前置"
};

export const DRAWER_WORKSPACE_LABELS = {
  overallProgress: "整体进度",
  workspaceSummary: "工作台摘要",
  workspaceSummaryEn: "Workspace Summary",
  nodeProgress: "节点进度",
  nodeDueDates: "节点预计完成日",
  nodeDueDatesEn: "Node Due Dates",
  materials: "材料",
  materialsEn: "Materials",
  fieldReviews: "字段复核",
  planning: "Planning",
  review: "Review",
  detailProgress: "节点进度",
  mismatchHint: "看板已推进，底稿尚未齐备。"
};

export const CONTRIBUTOR_FILTER_OPTIONS = [
  { id: "", label: "全部" },
  { id: "audit", label: "Audit team" },
  { id: "ita", label: "ITA team" },
  { id: "tax", label: "Tax team" },
  { id: "frm", label: "FRM team" }
];

export const COMMAND_CENTER_LABELS = {
  kpi: {
    sectionTitle: "组合风险概览",
    sectionTitleEn: "Portfolio Risk Overview",
    critical: "需立即关注",
    elevated: "需重点关注",
    reportWindow: "30 天内报告",
    overdueProcedures: "已逾期"
  },
  portfolioList: {
    title: "项目列表",
    titleEn: "Engagement List",
    lead: "与进度看板同一测试点三态口径；点击项目进度进入单项目看板。"
  },
  timeline: {
    title: "报告日时间轴",
    titleEn: "Report Date Timeline",
    lead: "横轴为距报告日天数；圆点越大表示逾期测试点越多。"
  },
  attention: {
    title: "优先关注",
    titleEn: "Priority Attention",
    lead: "综合报告日与测试点逾期，建议优先跟进的 engagment。"
  },
  reportWatch: {
    title: "报告日预警",
    titleEn: "Report Date Watchlist",
    lead: "未来 30 天内出具报告的项目。"
  }
};

export function labelOfProgressStatus(status) {
  return PROGRESS_STATUS_LABELS[status] || status;
}

export function labelOfWorkspaceStatus(status) {
  return WORKSPACE_STATUS_LABELS[status] || labelOfProgressStatus(status);
}
