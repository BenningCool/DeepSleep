import { useMemo, useState } from "react";
import { DASHBOARD_CARD_LABELS } from "../../data/progressLabels";
import { controlTypeClass } from "./progressBoardUtils";
import { ProgressModuleHeading } from "./ProgressModuleHeading";
import { ProgressOwnerFilter } from "./ProgressOwnerFilter";
import { ProgressOwnerLabel } from "./ProgressOwnerLabel";
import {
  computeControlNodeProgressRows,
  CONTROL_TYPE_FILTER_TABS,
  countControlsByType,
  filterControlsByControlType
} from "./progressDashboardUtils";

function ControlNodeProgressRow({ row }) {
  return (
    <div className="progress-dist-row readonly progress-node-progress-row">
      <div className="progress-dist-head">
        <span className="progress-node-progress-label">
          <span className={`control-type inline ${controlTypeClass(row.controlType)}`}>
            {row.controlType}
          </span>
          <span className="progress-node-progress-copy">
            <span className="progress-node-progress-title">{row.title}</span>
            <ProgressOwnerLabel owner={row.owner} compact className="progress-node-progress-owner" />
          </span>
        </span>
        <strong>
          {row.totalNodes
            ? `${row.completedNodes}/${row.totalNodes} · ${row.percent}%`
            : "—"}
        </strong>
      </div>
      <div className="progress-dist-track">
        <span
          className="progress-dist-fill-completed"
          style={{ width: `${row.percent}%` }}
        />
      </div>
    </div>
  );
}

export function ControlNodeProgressCard({
  controls = [],
  project,
  groupFilter = "",
  ownerFilterControls = [],
  ownerFilter = "",
  onOwnerFilterChange
}) {
  const [typeFilter, setTypeFilter] = useState("ALL");

  const typeCounts = useMemo(() => countControlsByType(controls), [controls]);
  const filteredControls = useMemo(
    () => filterControlsByControlType(controls, typeFilter),
    [controls, typeFilter]
  );
  const rows = useMemo(
    () => computeControlNodeProgressRows(filteredControls),
    [filteredControls]
  );

  return (
    <article className="progress-dashboard-card progress-node-progress-card">
      <header className="progress-dashboard-card-head stacked">
        <div className="progress-node-progress-head">
          <ProgressModuleHeading
            title={DASHBOARD_CARD_LABELS.controlNodeProgress}
            titleEn={DASHBOARD_CARD_LABELS.controlNodeProgressEn}
          />
          {onOwnerFilterChange ? (
            <ProgressOwnerFilter
              project={project}
              groupFilter={groupFilter}
              controls={ownerFilterControls}
              value={ownerFilter}
              onChange={onOwnerFilterChange}
            />
          ) : null}
        </div>
        <div
          className="progress-type-tabs compact"
          role="tablist"
          aria-label="测试点节点进度类型"
        >
          {CONTROL_TYPE_FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={typeFilter === tab.id}
              className={`filter-chip ${typeFilter === tab.id ? "active" : ""}`}
              onClick={() => setTypeFilter(tab.id)}
            >
              {tab.label}
              <span className="tab-count">{typeCounts[tab.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </header>
      {rows.length ? (
        <div className="progress-dist-list progress-node-progress-list">
          {rows.map((row) => (
            <ControlNodeProgressRow key={row.id} row={row} />
          ))}
        </div>
      ) : (
        <div className="progress-dashboard-empty compact">
          <p>{DASHBOARD_CARD_LABELS.controlNodeProgressEmpty}</p>
        </div>
      )}
    </article>
  );
}
