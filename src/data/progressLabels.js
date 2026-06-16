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

/** 工作台三态（环形图、进度列表主状态） */
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

export const PROGRESS_LIST_LABELS = {
  allMembers: "全部成员",
  memberFilter: "负责人筛选",
  filterEmpty: "当前筛选条件下暂无控制点，请调整状态、逾期或成员筛选。"
};

export const DASHBOARD_CARD_LABELS = {
  statusOverview: "状态概述",
  statusOverviewLead: "按工作台底稿三态汇总当前筛选下的控制点。",
  controlTotal: "控制点",
  viewAllControls: "查看全部控制点",
  recentActivity: "近期动态",
  recentActivityLead: "按工作台最近保存时间排序",
  recentActivityEmpty: "尚无动态。在工作台保存测试点后，将在此显示最近更新。",
  controlType: "控制类型分布",
  teamMemberProgress: "组内成员进度",
  teamMemberProgressLead: "跟随页顶负责组筛选：「全部」展示 Audit 与已启用 Specialist 全部成员；柱体为已完成占比，下方为三态明细。",
  teamMemberProgressEmpty: "当前组暂无成员。",
  teamMemberProgressUnassigned: "未分配",
  blockedNote: "被阻塞"
};

export const ATTENTION_LABELS = {
  panelTitle: "需关注事项",
  panelLead: "仅汇总计划逾期与长期未启动的控制点，便于安排跟进优先级。",
  overdueTitle: "计划逾期",
  staleTitle: "长期未开始",
  overdueBadge: "已逾期",
  dueLabel: "计划完成日",
  overdueDaysPrefix: "已逾期 ",
  overdueEmpty: "暂无计划逾期项",
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
  nodeProgress: "节点进度",
  milestones: "流程节点",
  materials: "材料",
  fieldReviews: "字段复核",
  planning: "Planning",
  review: "Review",
  detailProgress: "细态进度",
  mismatchHint: "看板已推进，底稿尚未齐备。"
};

export const CONTRIBUTOR_FILTER_OPTIONS = [
  { id: "", label: "全部" },
  { id: "audit", label: "Audit team" },
  { id: "ita", label: "ITA team" },
  { id: "tax", label: "Tax team" },
  { id: "frm", label: "FRM team" }
];

export function labelOfProgressStatus(status) {
  return PROGRESS_STATUS_LABELS[status] || status;
}

export function labelOfWorkspaceStatus(status) {
  return WORKSPACE_STATUS_LABELS[status] || labelOfProgressStatus(status);
}
