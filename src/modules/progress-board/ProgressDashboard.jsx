import { DASHBOARD_CARD_LABELS, DASHBOARD_KPI_LABELS, labelOfWorkspaceStatus } from "../../data/progressLabels";
import { PROGRESS_STATUS } from "../../services/workspaceProgressService";
import {
  buildDonutStyle,
  computeControlTypeDistribution,
  computeDashboardKpis,
  computeWorkspaceStatusBreakdown,
  formatActivityTime,
  getRecentActivity,
  WORKSPACE_STATUS_SEGMENTS
} from "./progressDashboardUtils";
import { countControlsWithPlanDue } from "./progressDueUtils";
import { workspaceStatusClass } from "./progressVisualTokens";
import { TeamMemberProgressCard } from "./TeamMemberProgressCard";
import { formatWorkspaceStatusSummary } from "./WorkspaceStatusOverviewBar";

const KPI_STATUS_CONFIG = [
  {
    id: PROGRESS_STATUS.NOT_STARTED,
    labelKey: "notStarted",
    tone: "status-not-started",
    iconType: "not-started",
    hint: "尚未启动测试"
  },
  {
    id: PROGRESS_STATUS.IN_PROGRESS,
    labelKey: "inProgress",
    tone: "status-in-progress",
    iconType: "in-progress",
    hint: "底稿测试中"
  },
  {
    id: PROGRESS_STATUS.COMPLETED,
    labelKey: "completed",
    tone: "status-completed",
    iconType: "completed",
    hint: "底稿已完成"
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
  tone,
  hint,
  active = false,
  disabled = false,
  alert = false,
  badge = "",
  extraClassName = "",
  onClick
}) {
  const numericValue = typeof value === "number" ? value : 0;
  const hasValue = numericValue > 0;

  return (
    <button
      type="button"
      className={[
        "progress-dashboard-kpi",
        `tone-${tone}`,
        extraClassName,
        hasValue ? "has-value" : "is-idle",
        alert && hasValue ? "is-alert" : "",
        badge ? "has-badge" : "",
        active ? "active" : "",
        disabled ? "is-disabled" : ""
      ].filter(Boolean).join(" ")}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {badge ? <span className="progress-kpi-badge">{badge}</span> : null}
      <span className={`progress-kpi-icon icon-${iconType}`} aria-hidden="true">
        <KpiIcon type={iconType} />
      </span>
      <div className="progress-kpi-copy">
        <span className="progress-kpi-label">{label}</span>
        {hint ? <small className="progress-kpi-hint">{hint}</small> : null}
      </div>
      <strong className="progress-kpi-value">{value}</strong>
    </button>
  );
}

function DistributionBar({ label, completed, total, percent }) {
  return (
    <div className="progress-dist-row readonly">
      <div className="progress-dist-head">
        <span>{label}</span>
        <strong>{completed}/{total} · {percent}%</strong>
      </div>
      <div className="progress-dist-track">
        <span className="progress-dist-fill-completed" style={{ width: `${percent}%` }} />
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
  workspaceStatusFilter = "",
  overdueOnlyFilter = false,
  onWorkspaceStatusFilter,
  onOverdueFilter,
  onSelectControl
}) {
  const breakdown = computeWorkspaceStatusBreakdown(summaryControls);
  const kpis = computeDashboardKpis(summaryControls, taskMap);
  const typeDistribution = computeControlTypeDistribution(detailControls);
  const activity = getRecentActivity(detailControls);
  const donutStyle = buildDonutStyle(breakdown);
  const hasPlanDue = countControlsWithPlanDue(summaryControls, taskMap) > 0;
  const overdueValue = hasPlanDue ? kpis.overdue : "—";
  const overdueHint = hasPlanDue ? undefined : DASHBOARD_KPI_LABELS.overdueAwaitingData;

  return (
    <section className="progress-dashboard" aria-label="进度摘要仪表盘">
      <div className="progress-dashboard-kpi-row">
        {KPI_STATUS_CONFIG.map((item) => (
          <StatusKpiCard
            key={item.id}
            iconType={item.iconType}
            label={DASHBOARD_KPI_LABELS[item.labelKey]}
            value={breakdown[item.id] || 0}
            tone={item.tone}
            hint={item.hint}
            alert={item.id === PROGRESS_STATUS.NOT_STARTED}
            active={workspaceStatusFilter === item.id && !overdueOnlyFilter}
            onClick={() => onWorkspaceStatusFilter(
              workspaceStatusFilter === item.id ? "" : item.id
            )}
          />
        ))}
        <StatusKpiCard
          iconType="overdue"
          label={DASHBOARD_KPI_LABELS.overdue}
          value={overdueValue}
          tone={hasPlanDue && kpis.overdue > 0 ? "due-risk-alert" : "status-overdue-idle"}
          hint={overdueHint || (hasPlanDue && kpis.overdue > 0 ? "需立即跟进逾期控制点" : "监控计划完成日风险")}
          alert
          badge={hasPlanDue && kpis.overdue > 0 ? "需跟进" : ""}
          extraClassName={hasPlanDue ? "is-overdue-kpi" : ""}
          active={overdueOnlyFilter}
          disabled={!hasPlanDue}
          onClick={() => onOverdueFilter?.()}
        />
      </div>

      <div className="progress-dashboard-top-grid">
        <article className="progress-dashboard-card">
          <header className="progress-dashboard-card-head">
            <div>
              <h3>{DASHBOARD_CARD_LABELS.statusOverview}</h3>
              <p className="panel-note">{DASHBOARD_CARD_LABELS.statusOverviewLead}</p>
            </div>
          </header>
          <div className="progress-donut-wrap">
            <div
              className="progress-donut"
              style={donutStyle}
              role="img"
              aria-label={formatWorkspaceStatusSummary(breakdown)}
            >
              <div className="progress-donut-hole">
                <strong>{breakdown.total}</strong>
                <span>{DASHBOARD_CARD_LABELS.controlTotal}</span>
              </div>
            </div>
            <ul className="progress-donut-legend">
              {WORKSPACE_STATUS_SEGMENTS.map((segment) => (
                <li key={segment.id}>
                  <button
                    type="button"
                    className={`legend-chip status-${workspaceStatusClass(segment.id)} ${
                      workspaceStatusFilter === segment.id && !overdueOnlyFilter ? "active" : ""
                    }`}
                    onClick={() => onWorkspaceStatusFilter(
                      workspaceStatusFilter === segment.id ? "" : segment.id
                    )}
                  >
                    <span className="legend-swatch" style={{ background: segment.color }} />
                    {labelOfWorkspaceStatus(segment.id)}
                    <strong>{breakdown[segment.id] || 0}</strong>
                  </button>
                </li>
              ))}
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
                      <p>
                        节点 {item.nodeLabel}
                        {item.tod ? ` · TOD ${item.tod.completedNodes}/${item.tod.totalNodes}` : ""}
                        {item.toe ? ` · TOE ${item.toe.completedNodes}/${item.toe.totalNodes}` : ""}
                        {" · "}{item.owner}
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
        <article className="progress-dashboard-card">
          <header className="progress-dashboard-card-head">
            <h3>{DASHBOARD_CARD_LABELS.controlType}</h3>
          </header>
          <div className="progress-dist-list">
            {typeDistribution.map((item) => (
              <DistributionBar
                key={item.id}
                label={item.id}
                completed={item.completed}
                total={item.total}
                percent={item.percent}
              />
            ))}
          </div>
        </article>

        <TeamMemberProgressCard
          project={project}
          controls={memberControls}
          groupFilter={groupFilter}
        />
      </div>
    </section>
  );
}
