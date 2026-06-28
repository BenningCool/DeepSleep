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
  const totalOverdue = summary.totalOverdue ?? 0;

  const headline = mode === "ep"
    ? `${projectCount} 个项目 · ${summary.emCount ?? 0} 位下辖 EM`
    : `${projectCount} 个项目 · 现场团队 ${summary.fieldworkHeadcount ?? summary.headcount ?? 0} 人`;

  const labels = COMMAND_CENTER_LABELS.kpi;

  return (
    <div className="progress-dashboard-kpi-section">
      <header className="progress-dashboard-kpi-head">
        <ModuleHeading
          title={labels.sectionTitle}
          titleEn={labels.sectionTitleEn}
        />
        <p className="panel-note">{headline}</p>
      </header>
      <div className="progress-dashboard-kpi-row">
        <StatusKpiCard
          iconType="overdue"
          label={labels.critical}
          value={critical}
          percent={formatSharePercent(critical, projectCount)}
          tone="due-risk-alert"
          alert
          badge={critical ? "需跟进" : ""}
          extraClassName={critical ? "is-overdue-kpi" : ""}
          subject="项目"
        />
        <StatusKpiCard
          iconType="not-started"
          label={labels.elevated}
          value={elevated}
          percent={formatSharePercent(elevated, projectCount)}
          tone="status-not-started"
          alert={elevated > 0}
          subject="项目"
        />
        <StatusKpiCard
          iconType="in-progress"
          label={labels.reportWindow}
          value={watchlistCount}
          percent={formatSharePercent(watchlistCount, projectCount)}
          tone="status-in-progress"
          subject="30 天内报告"
        />
        <StatusKpiCard
          iconType="overdue"
          label={labels.overdueProcedures}
          value={totalOverdue}
          tone={totalOverdue > 0 ? "due-risk-alert" : "status-overdue-idle"}
          alert
          badge={totalOverdue ? "需跟进" : ""}
          extraClassName={totalOverdue ? "is-overdue-kpi" : ""}
          subject=""
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
