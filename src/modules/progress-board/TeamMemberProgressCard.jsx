import { useMemo } from "react";
import { DASHBOARD_CARD_LABELS } from "../../data/progressLabels";
import { computeMemberWorkloadRows } from "./memberWorkloadUtils";
import { ProgressOwnerLabel } from "./ProgressOwnerLabel";
import { UNASSIGNED_MEMBER_KEY } from "./progressOwnerUtils";
import {
  formatWorkspaceStatusSummary,
  getBreakdownCompletionPercent,
  MemberCompletionProgressBar
} from "./WorkspaceStatusOverviewBar";
import { PROGRESS_STATUS } from "../../services/workspaceProgressService";

function MemberProgressRow({ row }) {
  const { total } = row.breakdown;
  const completedCount = row.breakdown[PROGRESS_STATUS.COMPLETED] || 0;
  const percent = getBreakdownCompletionPercent(row.breakdown);

  return (
    <div className="progress-member-row">
      <div className="progress-member-head">
        <ProgressOwnerLabel
          owner={row.id === UNASSIGNED_MEMBER_KEY ? "" : row.label}
          compact
        />
        <strong>
          {total
            ? `${completedCount}/${total} 已完成 · ${percent}%`
            : "0 测试点"}
        </strong>
      </div>
      {total ? (
        <>
          <MemberCompletionProgressBar breakdown={row.breakdown} className="compact" />
          <p className="progress-member-meta">{formatWorkspaceStatusSummary(row.breakdown)}</p>
        </>
      ) : (
        <>
          <MemberCompletionProgressBar breakdown={row.breakdown} pending />
          <p className="progress-member-meta muted">暂无测试点</p>
        </>
      )}
    </div>
  );
}

/**
 * 成员列表与柱图跟随页顶负责组筛选；仅展示 In-charge（IC）与 Staff 及其负责的控制点。
 */
export function TeamMemberProgressCard({
  project,
  controls = [],
  groupFilter = ""
}) {
  const memberRows = useMemo(
    () => computeMemberWorkloadRows(groupFilter, controls, project),
    [groupFilter, controls, project]
  );

  return (
    <article className="progress-dashboard-card progress-member-card">
      <header className="progress-dashboard-card-head">
        <div>
          <h3>{DASHBOARD_CARD_LABELS.teamMemberProgress}</h3>
        </div>
      </header>
      <div className="progress-member-list">
        {memberRows.length ? (
          memberRows.map((row) => <MemberProgressRow key={row.id} row={row} />)
        ) : (
          <div className="progress-dashboard-empty">
            <p>{DASHBOARD_CARD_LABELS.teamMemberProgressEmpty}</p>
          </div>
        )}
      </div>
    </article>
  );
}
