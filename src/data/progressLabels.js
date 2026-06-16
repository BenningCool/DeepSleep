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

export const CONTRIBUTOR_FILTER_OPTIONS = [
  { id: "", label: "全部" },
  { id: "audit", label: "Audit 主责" },
  { id: "ita", label: "ITA 组" },
  { id: "tax", label: "Tax 组" },
  { id: "frm", label: "FRM 组" }
];

export function labelOfProgressStatus(status) {
  return PROGRESS_STATUS_LABELS[status] || status;
}
