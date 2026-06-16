import { useMemo, useState } from "react";
import { DASHBOARD_CARD_LABELS, DASHBOARD_KPI_LABELS, labelOfWorkspaceStatus } from "../../data/progressLabels";
import { PROGRESS_STATUS } from "../../services/workspaceProgressService";
import {
  buildDonutStyle,
  computeDashboardKpis,
  computeWorkspaceStatusBreakdown,
  CONTROL_TYPE_FILTER_TABS,
  countControlsByType,
  filterControlsByControlType,
  formatActivityTime,
  formatSharePercent,
  getRecentActivity,
  WORKSPACE_STATUS_SEGMENTS
} from "./progressDashboardUtils";
import { countControlsWithPlanDue } from "./progressDueUtils";
import { workspaceStatusClass } from "./progressVisualTokens";
import { ControlNodeProgressCard } from "./ControlNodeProgressCard";
import { ProgressOwnerLabel } from "./ProgressOwnerLabel";
import { TeamMemberProgressCard } from "./TeamMemberProgressCard";
import { formatWorkspaceStatusSummary } from "./WorkspaceStatusOverviewBar";

const KPI_STATUS_CONFIG = [
  {
    id: PROGRESS_STATUS.NOT_STARTED,
    labelKey: "notStarted",
    tone: "status-not-started",
    iconType: "not-started"
  },
  {
    id: PROGRESS_STATUS.IN_PROGRESS,
    labelKey: "inProgress",
    tone: "status-in-progress",
    iconType: "in-progress"
  },
  {
    id: PROGRESS_STATUS.COMPLETED,
    labelKey: "completed",
    tone: "status-completed",
    iconType: "completed"
  }
];

function KpiIcon({ type }) {
  if (type === "not-started") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
        <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "in-progress") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "completed") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12.5l2.5 2.5L16 9.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.5 20.5 19H3.5L12 3.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 9v5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function StatusKpiCard({
  iconType,
  label,
  value,
  percent,
  tone,
  alert = false,
  badge = "",
  extraClassName = "",
  muted = false
}) {
  const numericValue = typeof value === "number" ? value : 0;
  const hasValue = numericValue > 0;

  return (
    <div
      className={[
        "progress-dashboard-kpi",
        "readonly",
        `tone-${tone}`,
        extraClassName,
        hasValue ? "has-value" : "is-idle",
        alert && hasValue ? "is-alert" : "",
        badge ? "has-badge" : "",
        muted ? "is-muted" : ""
      ].filter(Boolean).join(" ")}
      aria-label={percent ? `${label} ${value}，占 ${percent}` : `${label} ${value}`}
    >
      {badge ? <span className="progress-kpi-badge">{badge}</span> : null}
      <span className={`progress-kpi-icon icon-${iconType}`} aria-hidden="true">
        <KpiIcon type={iconType} />
      </span>
      <div className="progress-kpi-copy">
        <span className="progress-kpi-label">{label}</span>
      </div>
      <div className="progress-kpi-stat">
        <strong className="progress-kpi-value">{value}</strong>
        {percent ? <span className="progress-kpi-percent">{percent}</span> : null}
      </div>
    </div>
  );
}

export function ProgressDashboard({
  project,
  summaryControls,
  detailControls,
  memberControls,
  taskMap,
  groupFilter = "",
  ownerFilter = "",
  ownerFilterControls = [],
  onOwnerFilterChange,
  onSelectControl
}) {
  const [statusOverviewType, setStatusOverviewType] = useState("ALL");

  const breakdown = computeWorkspaceStatusBreakdown(summaryControls);
  const overviewControls = useMemo(
    () => filterControlsByControlType(summaryControls, statusOverviewType),
    [summaryControls, statusOverviewType]
  );
  const overviewBreakdown = useMemo(
    () => computeWorkspaceStatusBreakdown(overviewControls),
    [overviewControls]
  );
  const overviewTypeCounts = useMemo(
    () => countControlsByType(summaryControls),
    [summaryControls]
  );

  const kpis = computeDashboardKpis(summaryControls, taskMap);
  const activity = getRecentActivity(detailControls);
  const donutStyle = buildDonutStyle(overviewBreakdown);
  const hasPlanDue = countControlsWithPlanDue(summaryControls, taskMap) > 0;
  const overdueValue = hasPlanDue ? kpis.overdue : "—";
  const totalControls = breakdown.total || 0;
  const overviewTotal = overviewBreakdown.total || 0;

  return (
    <section className="progress-dashboard" aria-label="进度摘要仪表盘">
      <div className="progress-dashboard-kpi-row">
        {KPI_STATUS_CONFIG.map((item) => {
          const count = breakdown[item.id] || 0;
          return (
            <StatusKpiCard
              key={item.id}
              iconType={item.iconType}
              label={DASHBOARD_KPI_LABELS[item.labelKey]}
              value={count}
              percent={formatSharePercent(count, totalControls)}
              tone={item.tone}
              alert={item.id === PROGRESS_STATUS.NOT_STARTED}
            />
          );
        })}
        <StatusKpiCard
          iconType="overdue"
          label={DASHBOARD_KPI_LABELS.overdue}
          value={overdueValue}
          percent={hasPlanDue ? formatSharePercent(kpis.overdue, totalControls) : undefined}
          tone={hasPlanDue && kpis.overdue > 0 ? "due-risk-alert" : "status-overdue-idle"}
          alert
          badge={hasPlanDue && kpis.overdue > 0 ? "需跟进" : ""}
          extraClassName={hasPlanDue ? "is-overdue-kpi" : ""}
          muted={!hasPlanDue}
        />
      </div>

      <div className="progress-dashboard-top-grid">
        <article className="progress-dashboard-card">
          <header className="progress-dashboard-card-head stacked">
            <div>
              <h3>{DASHBOARD_CARD_LABELS.statusOverview}</h3>
              <p className="panel-note">{DASHBOARD_CARD_LABELS.statusOverviewLead}</p>
            </div>
            <div
              className="progress-type-tabs compact"
              role="tablist"
              aria-label="状态概述控制点类型"
            >
              {CONTROL_TYPE_FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={statusOverviewType === tab.id}
                  className={`filter-chip ${statusOverviewType === tab.id ? "active" : ""}`}
                  onClick={() => setStatusOverviewType(tab.id)}
                >
                  {tab.label}
                  <span className="tab-count">{overviewTypeCounts[tab.id] ?? 0}</span>
                </button>
              ))}
            </div>
          </header>
          <div className="progress-donut-wrap">
            <div
              className="progress-donut"
              style={donutStyle}
              role="img"
              aria-label={formatWorkspaceStatusSummary(overviewBreakdown)}
            >
              <div className="progress-donut-hole">
                <strong>{overviewBreakdown.total}</strong>
                <span>{DASHBOARD_CARD_LABELS.controlTotal}</span>
              </div>
            </div>
            <ul className="progress-donut-legend">
              {WORKSPACE_STATUS_SEGMENTS.map((segment) => {
                const count = overviewBreakdown[segment.id] || 0;
                return (
                  <li key={segment.id}>
                    <div
                      className={`legend-chip readonly status-${workspaceStatusClass(segment.id)}`}
                    >
                      <span className="legend-swatch" style={{ background: segment.color }} />
                      {labelOfWorkspaceStatus(segment.id)}
                      <span className="legend-stat">
                        <strong>{count}</strong>
                        <span className="legend-percent">{formatSharePercent(count, overviewTotal)}</span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </article>

        <article className="progress-dashboard-card">
          <header className="progress-dashboard-card-head">
            <div>
              <h3>{DASHBOARD_CARD_LABELS.recentActivity}</h3>
              <p className="panel-note">{DASHBOARD_CARD_LABELS.recentActivityLead}</p>
            </div>
          </header>
          {activity.length ? (
            <ul className="progress-activity-list">
              {activity.map((item) => (
                <li key={item.id}>
                  <button type="button" className="progress-activity-item" onClick={() => onSelectControl(item.id)}>
                    <div>
                      <strong>{item.title}</strong>
                      <p className="progress-activity-meta">
                        节点 {item.nodeLabel}
                        {item.tod ? ` · TOD ${item.tod.completedNodes}/${item.tod.totalNodes}` : ""}
                        {item.toe ? ` · TOE ${item.toe.completedNodes}/${item.toe.totalNodes}` : ""}
                        {" · "}
                        <ProgressOwnerLabel owner={item.owner} compact inline />
                      </p>
                    </div>
                    <span>{formatActivityTime(item.updatedAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="progress-dashboard-empty">
              <p>{DASHBOARD_CARD_LABELS.recentActivityEmpty}</p>
            </div>
          )}
        </article>
      </div>

      <div className="progress-dashboard-grid progress-dashboard-grid-compact">
        <TeamMemberProgressCard
          project={project}
          controls={memberControls}
          groupFilter={groupFilter}
        />

        <ControlNodeProgressCard
          controls={detailControls}
          project={project}
          groupFilter={groupFilter}
          ownerFilterControls={ownerFilterControls}
          ownerFilter={ownerFilter}
          onOwnerFilterChange={onOwnerFilterChange}
        />
      </div>
    </section>
  );
}
