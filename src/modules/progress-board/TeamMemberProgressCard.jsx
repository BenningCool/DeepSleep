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
            ? `${completedCount}/${total} Completed · ${percent}%`
            : "0 Test Points"}
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
          <p className="progress-member-meta muted">No Test Points</p>
        </>
      )}
    </div>
  );
}

/**
 * Member list and bar chart follow the top owner-group filter and show only In-charge (IC), Staff, and their assigned controls.
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
