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

export const KPI_LABELS = {
  total: "总数",
  completed: "已完成",
  pending: "进行中",
  delay: "逾期/阻塞"
};

export const ATTENTION_LABELS = {
  panelTitle: "需关注事项",
  panelLead: "仅汇总计划逾期与长期未启动的控制点，便于安排跟进优先级。",
  overdueTitle: "计划逾期",
  staleTitle: "长期未开始",
  dueLabel: "计划完成日",
  overdueDaysPrefix: "已逾期 "
};

export const DRAWER_PREREQUISITE_LABELS = {
  title: "前置程序未完成",
  goBoard: "去看板处理前置"
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
