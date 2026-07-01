import { ModuleHeading } from "../../components/ModuleHeading";
import { StatusKpiCard } from "../../components/StatusKpiCard";
import { COMMAND_CENTER_LABELS } from "../../data/progressLabels";
import { formatSharePercent } from "../progress-board/progressDashboardUtils";
import { formatReportStackMessage } from "./reportDayUtils";

export function PortfolioKpiSection({ mode, summary, reportStack }) {
  const projectCount = summary.projectCount || 0;
  const critical = summary.riskCounts?.critical ?? 0;
  const elevated = summary.riskCounts?.elevated ?? 0;
  const watchlistCount = summary.watchlistCount ?? 0;

  const headline = mode === "ep"
    ? `${projectCount} 个项目 · ${summary.emCount ?? 0} 位下辖 EM`
    : mode === "staff"
      ? `${projectCount} 个项目 · ${summary.assignedTotal ?? 0} 个指派测试点 · 负荷 ${summary.saturationLevel ?? "—"}`
      : mode === "contributor"
        ? `${projectCount} 个协作项目 · ${summary.contributorLabel ?? ""} 组贡献`
        : `${projectCount} 个项目 · 现场团队 ${summary.fieldworkHeadcount ?? summary.headcount ?? 0} 人`;

  const labels = COMMAND_CENTER_LABELS.kpi;

  return (
    <div className="progress-dashboard-kpi-section portfolio-kpi-section">
      <header className="progress-dashboard-kpi-head">
        <ModuleHeading
          title="交付风险摘要"
          titleEn="Delivery Risk Summary"
        />
        <p className="panel-note">{headline}</p>
      </header>

      <div className="progress-dashboard-kpi-row portfolio-kpi-project-row">
        <StatusKpiCard
          iconType="flag"
          label={labels.critical}
          value={critical}
          percent={formatSharePercent(critical, projectCount)}
          tone="due-risk-alert"
          alert
          badge={critical ? "需跟进" : ""}
          extraClassName={critical ? "is-overdue-kpi" : ""}
          subject="个项目"
        />
        <StatusKpiCard
          iconType="not-started"
          label={labels.elevated}
          value={elevated}
          percent={formatSharePercent(elevated, projectCount)}
          tone="status-not-started"
          alert={elevated > 0}
          subject="个项目"
        />
        <StatusKpiCard
          iconType="in-progress"
          label={labels.reportWindow}
          value={watchlistCount}
          percent={formatSharePercent(watchlistCount, projectCount)}
          tone="status-in-progress"
          subject="个项目"
        />
      </div>

      {reportStack?.triggered ? (
        <p className="team-collision-note report-stack-note">
          {formatReportStackMessage(reportStack)}
        </p>
      ) : null}
    </div>
  );
}
