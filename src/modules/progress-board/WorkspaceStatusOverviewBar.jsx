import { labelOfWorkspaceStatus } from "../../data/progressLabels";
import { PROGRESS_STATUS } from "../../services/workspaceProgressService";
import { WORKSPACE_STATUS_SEGMENTS } from "./progressVisualTokens";

const PROGRESS_BAR_SEGMENTS = WORKSPACE_STATUS_SEGMENTS.filter(
  (segment) => segment.id !== PROGRESS_STATUS.NOT_STARTED
);

function hasProgressFill(breakdown) {
  return (breakdown[PROGRESS_STATUS.IN_PROGRESS] || 0)
    + (breakdown[PROGRESS_STATUS.COMPLETED] || 0) > 0;
}

export function getBreakdownCompletionPercent(breakdown) {
  const total = breakdown?.total || 0;
  if (!total) return 0;
  const completed = breakdown[PROGRESS_STATUS.COMPLETED] || 0;
  return Math.round((completed / total) * 100);
}

export function formatWorkspaceStatusSummary(breakdown) {
  return WORKSPACE_STATUS_SEGMENTS
    .map((segment) => {
      const count = breakdown[segment.id] || 0;
      return `${labelOfWorkspaceStatus(segment.id)} ${count}`;
    })
    .join(" · ");
}

/**
 * 与进度看板「状态概述」环形图同一口径（workspaceStatus 三态），横向分段柱展现。
 */
export function WorkspaceStatusOverviewBar({
  breakdown,
  className = "",
  pending = false
}) {
  const { total } = breakdown;

  if (pending || !total || !hasProgressFill(breakdown)) {
    return (
      <div className={`project-card-progress-track pending ${className}`.trim()}>
        <span style={{ width: "0%" }} />
      </div>
    );
  }

  return (
    <div
      className={`project-card-progress-track stacked ${className}`.trim()}
      role="img"
      aria-label={formatWorkspaceStatusSummary(breakdown)}
    >
      {PROGRESS_BAR_SEGMENTS.map((segment) => {
        const count = breakdown[segment.id] || 0;
        if (!count) return null;
        return (
          <span
            key={segment.id}
            style={{
              width: `${(count / total) * 100}%`,
              background: segment.color
            }}
            title={`${labelOfWorkspaceStatus(segment.id)} ${count}`}
          />
        );
      })}
    </div>
  );
}

const COMPLETION_FILL_COLOR = WORKSPACE_STATUS_SEGMENTS.find(
  (segment) => segment.id === PROGRESS_STATUS.COMPLETED
)?.color || "#36b37e";

/**
 * 组内成员进度：柱体填充 = 已完成控制点 / 总数；仅全完成时满条。三态明细见辅文。
 */
export function MemberCompletionProgressBar({
  breakdown,
  className = "",
  pending = false
}) {
  const { total } = breakdown;
  const percent = getBreakdownCompletionPercent(breakdown);

  if (pending || !total) {
    return (
      <div className={`project-card-progress-track pending ${className}`.trim()}>
        <span style={{ width: "0%" }} />
      </div>
    );
  }

  return (
    <div
      className={`project-card-progress-track completion ${className}`.trim()}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={`已完成 ${breakdown[PROGRESS_STATUS.COMPLETED] || 0}/${total}`}
    >
      <span style={{ width: `${percent}%`, background: COMPLETION_FILL_COLOR }} />
    </div>
  );
}
