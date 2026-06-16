import {
  formatCurrentNodeHeadline,
  formatNodeProgressPhaseCounts,
  resolveNodeProgressPercent
} from "./progressNodeDisplay";

export function ControlNodeProgressDisplay({ control, align = "left" }) {
  const percent = resolveNodeProgressPercent(control);
  const phaseCounts = formatNodeProgressPhaseCounts(control);

  return (
    <div className={`progress-node-cell-content ${align === "right" ? "is-right" : ""}`}>
      <span className={`progress-current-node ${control.allNodesComplete ? "is-complete" : ""}`}>
        {formatCurrentNodeHeadline(control)}
      </span>
      <div className="progress-node-stats">
        <strong className="progress-node-percent">{percent}%</strong>
        <span className="progress-node-meta">{phaseCounts}</span>
      </div>
      <div className="progress-node-bar" role="presentation" aria-hidden="true">
        <span
          className={`progress-node-bar-fill ${control.allNodesComplete ? "is-complete" : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
