import { PROGRESS_STATUS } from "../services/workspaceProgressService";

export const PROGRESS_STATUS_LABELS = {
  [PROGRESS_STATUS.NOT_STARTED]: "Not Started",
  [PROGRESS_STATUS.IN_PROGRESS]: "Testing",
  [PROGRESS_STATUS.EVIDENCE_SUBMITTED]: "Evidence Obtained",
  [PROGRESS_STATUS.PENDING_REVIEW]: "Pending Review",
  [PROGRESS_STATUS.NEEDS_REWORK]: "Needs Rework",
  [PROGRESS_STATUS.COMPLETED]: "Completed",
  [PROGRESS_STATUS.BLOCKED]: "Blocked"
};

/** Three workspace states used by donut charts and progress lists. */
export const WORKSPACE_STATUS_LABELS = {
  [PROGRESS_STATUS.NOT_STARTED]: "Not Started",
  [PROGRESS_STATUS.IN_PROGRESS]: "Testing",
  [PROGRESS_STATUS.COMPLETED]: "Completed"
};

export const KPI_LABELS = {
  total: "Total",
  completed: "Completed",
  pending: "In Progress",
  delay: "Overdue / Blocked"
};

export const DASHBOARD_KPI_LABELS = {
  notStarted: "Not Started",
  inProgress: "Testing",
  completed: "Completed",
  overdue: "Overdue",
  overdueAwaitingData: "Shown after due dates sync"
};

export const DASHBOARD_KPI_SECTION = {
  title: "Test Point Progress",
  lead: "Summarizes filtered test points by the three workspace workpaper states; card details show GITC / ITAC counts and their share of the state."
};

export const PROGRESS_LIST_LABELS = {
  allMembers: "All Members",
  memberFilter: "Owner Filter",
  filterEmpty: "No test points match the current filters. Adjust status, overdue, or member filters."
};

export const DASHBOARD_CARD_LABELS = {
  nodeProgressOverview: "Test Node Progress",
  nodeProgressOverviewLead: "Aggregates completedNodes / totalNodes from the workspace snapshot under the current filters.",
  nodeProgressCenterLabel: "Node Completion",
  nodeProgressCompleted: "Completed Nodes",
  nodeProgressRemaining: "Remaining Nodes",
  nodeProgressTestPoints: "Test Points",
  controlTotal: "Test Points",
  viewAllControls: "View All Test Points",
  recentActivity: "Recent Activity",
  recentActivityLead: "Sorted by latest workspace save time",
  recentActivityEmpty: "No activity yet. Recent updates will appear here after test points are saved in Workspace.",
  controlNodeProgress: "Test Point Node Progress",
  controlNodeProgressEmpty: "No test points under this type.",
  teamMemberProgress: "Team Member Progress",
  teamMemberProgressLead: "Follows the owner-group filter at the top; shows only In-charge and Staff and their assigned test points. Bars show completion ratio, with three-state details below.",
  teamMemberProgressEmpty: "No members in this group.",
  teamMemberProgressUnassigned: "Unassigned",
  blockedNote: "Blocked"
};

export const ATTENTION_LABELS = {
  panelTitle: "Attention Items",
  panelLead: "Summarizes only overdue and long-not-started test points to help prioritize follow-up.",
  overdueTitle: "Overdue",
  staleTitle: "Long Not Started",
  overdueBadge: "Overdue",
  dueLabel: "Planned Due Date",
  overdueDaysPrefix: "Overdue ",
  overdueEmpty: "No overdue items",
  overdueAwaitingData: "After planned due dates sync, overdue items will be highlighted here in red"
};

export const ATTENTION_BUCKET_LABELS = {
  overdue: "Overdue",
  stale: "Long Not Started",
  blocked: "Blocked",
  onTrack: "On Track"
};

export const DRAWER_PREREQUISITE_LABELS = {
  title: "Prerequisite Steps Incomplete",
  goBoard: "Go to Kanban"
};

export const DRAWER_WORKSPACE_LABELS = {
  overallProgress: "Overall Progress",
  workspaceSummary: "Workspace Summary",
  nodeProgress: "Node Progress",
  nodeDueDates: "Node Due Dates",
  materials: "Material",
  fieldReviews: "Field Review",
  planning: "Planning",
  review: "Review",
  detailProgress: "Node Progress",
  mismatchHint: "Kanban has progressed while workpapers are not yet complete."
};

export const CONTRIBUTOR_FILTER_OPTIONS = [
  { id: "", label: "All" },
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
