import { useMemo } from "react";
import { DASHBOARD_CARD_LABELS, DASHBOARD_KPI_LABELS, DASHBOARD_KPI_SECTION } from "../../data/progressLabels";
import { PROGRESS_STATUS } from "../../services/workspaceProgressService";
import {
  computeDashboardKpis,
  computeNodeProgressOverviewRows,
  computeTypeSplitForControls,
  computeWorkspaceStatusBreakdown,
  filterControlsByWorkspaceStatus,
  filterOverdueControls,
  formatActivityTime,
  formatSharePercent,
  getRecentActivity
} from "./progressDashboardUtils";
import { countControlsWithPlanDue } from "./progressDueUtils";
import { ControlNodeProgressCard } from "./ControlNodeProgressCard";
import { ProgressOwnerLabel } from "./ProgressOwnerLabel";
import { ProgressModuleHeading } from "./ProgressModuleHeading";
import { TeamMemberProgressCard } from "./TeamMemberProgressCard";

function NodeProgressOverviewRow({ row }) {
  const isComplete = row.totalNodes > 0 && row.percent >= 100;

  return (
    <div className="progress-node-overview-row">
      <div className="progress-node-overview-head">
        <strong>{row.label}</strong>
        <span>
          {row.completedNodes}/{row.totalNodes || 0} 节点 · {row.percent}%
          {" · "}
          {row.testPointCount} 测试点
        </span>
      </div>
      <div
        className="progress-node-overview-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={row.percent}
        aria-label={`${row.label} 节点完成度 ${row.percent}%`}
      >
        <span
          className={`progress-node-overview-fill ${isComplete ? "is-complete" : ""}`}
          style={{ width: `${row.percent}%` }}
        />
      </div>
    </div>
  );
}

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

function KpiTypeSplit({ typeSplit }) {
  if (!typeSplit) return null;

  return (
    <ul className="progress-kpi-type-split" aria-label="GITC 与 ITAC 分布">
      {["GITC", "ITAC"].map((type) => (
        <li key={type}>
          <span className="progress-kpi-type-name">{type}</span>
          <span className="progress-kpi-type-stat">
            {typeSplit[type].count}
            {" · "}
            {typeSplit[type].percent}
          </span>
        </li>
      ))}
    </ul>
  );
}

function StatusKpiCard({
  iconType,
  label,
  value,
  percent,
  typeSplit,
  tone,
  alert = false,
  badge = "",
  extraClassName = "",
  muted = false,
  subject = "测试点"
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
      <span className={`progress-kpi-icon icon-${iconType}`} aria-hidden="true">
        <KpiIcon type={iconType} />
      </span>
      <div className="progress-kpi-copy">
        <div className="progress-kpi-label-row">
          <span className="progress-kpi-label">{label}</span>
          {badge ? <span className="progress-kpi-badge inline">{badge}</span> : null}
        </div>
        {subject ? <span className="progress-kpi-subject">{subject}</span> : null}
        <KpiTypeSplit typeSplit={typeSplit} />
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
  const breakdown = computeWorkspaceStatusBreakdown(summaryControls);
  const nodeProgressRows = useMemo(
    () => computeNodeProgressOverviewRows(summaryControls),
    [summaryControls]
  );

  const kpis = computeDashboardKpis(summaryControls, taskMap);
  const overdueControls = useMemo(
    () => filterOverdueControls(summaryControls, taskMap),
    [summaryControls, taskMap]
  );
  const activity = getRecentActivity(detailControls);
  const hasPlanDue = countControlsWithPlanDue(summaryControls, taskMap) > 0;
  const overdueValue = hasPlanDue ? kpis.overdue : "—";
  const totalControls = breakdown.total || 0;

  return (
    <section className="progress-dashboard" aria-label="进度摘要仪表盘">
      <div className="progress-dashboard-kpi-section">
        <header className="progress-dashboard-kpi-head">
          <ProgressModuleHeading
            title={DASHBOARD_KPI_SECTION.title}
            titleEn={DASHBOARD_KPI_SECTION.titleEn}
          />
        </header>
        <div className="progress-dashboard-kpi-row">
        {KPI_STATUS_CONFIG.map((item) => {
          const statusControls = filterControlsByWorkspaceStatus(summaryControls, item.id);
          const count = statusControls.length;
          return (
            <StatusKpiCard
              key={item.id}
              iconType={item.iconType}
              label={DASHBOARD_KPI_LABELS[item.labelKey]}
              value={count}
              percent={formatSharePercent(count, totalControls)}
              typeSplit={computeTypeSplitForControls(statusControls, count)}
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
          typeSplit={hasPlanDue
            ? computeTypeSplitForControls(overdueControls, kpis.overdue)
            : null}
          tone={hasPlanDue && kpis.overdue > 0 ? "due-risk-alert" : "status-overdue-idle"}
          alert
          badge={hasPlanDue && kpis.overdue > 0 ? "需跟进" : ""}
          extraClassName={hasPlanDue ? "is-overdue-kpi" : ""}
          muted={!hasPlanDue}
          subject=""
        />
        </div>
      </div>

      <div className="progress-dashboard-top-grid">
        <article className="progress-dashboard-card progress-node-overview-card">
          <header className="progress-dashboard-card-head">
            <div>
              <ProgressModuleHeading
                title={DASHBOARD_CARD_LABELS.nodeProgressOverview}
                titleEn={DASHBOARD_CARD_LABELS.nodeProgressOverviewEn}
              />
            </div>
          </header>
          <div className="progress-node-overview-list">
            {nodeProgressRows.map((row) => (
              <NodeProgressOverviewRow key={row.id} row={row} />
            ))}
          </div>
        </article>

        <article className="progress-dashboard-card">
          <header className="progress-dashboard-card-head">
            <div>
              <ProgressModuleHeading
                title={DASHBOARD_CARD_LABELS.recentActivity}
                titleEn={DASHBOARD_CARD_LABELS.recentActivityEn}
              />
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
