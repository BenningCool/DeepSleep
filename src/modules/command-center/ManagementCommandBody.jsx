import { COMMAND_CENTER_LABELS } from "../../data/progressLabels";
import { AttentionQueuePanel } from "./AttentionQueuePanel";
import { CollapsibleSection } from "./CollapsibleSection";
import { CommandMetricsLegend } from "./CommandMetricsLegend";
import { DashboardSection } from "./DashboardSection";
import { EngagementPortfolioCardList } from "./EngagementPortfolioCardList";
import { PortfolioKpiSection } from "./PortfolioKpiSection";
import { ReportDayPanel } from "./ReportDayPanel";
import { ReportTimelineStrip } from "./ReportTimelineStrip";

export function ManagementCommandBody({
  mode,
  summary,
  reportStack,
  filteredMatrix,
  tasks,
  showEmColumn = true,
  attentionQueue,
  attentionRoleLabel,
  attentionLimit = 3,
  watchlist,
  nearestReport,
  onOpenProgress,
  onOpenDetail,
  collapsibleSection = null
}) {
  const labels = COMMAND_CENTER_LABELS;

  return (
    <section className="progress-dashboard" aria-label="组合指挥中心">
      <PortfolioKpiSection
        mode={mode}
        summary={summary}
        reportStack={reportStack}
      />

      <div className="command-dashboard-grid">
        <DashboardSection
          title={labels.portfolioList.title}
          titleEn={labels.portfolioList.titleEn}
          lead={labels.portfolioList.lead}
          className="command-portfolio-section"
        >
          <EngagementPortfolioCardList
            rows={filteredMatrix}
            tasks={tasks}
            showEmColumn={showEmColumn}
            onOpenProgress={onOpenProgress}
            onOpenDetail={onOpenDetail}
          />
        </DashboardSection>

        <DashboardSection
          title={labels.timeline.title}
          titleEn={labels.timeline.titleEn}
          lead={labels.timeline.lead}
        >
          <ReportTimelineStrip
            embedded
            rows={filteredMatrix}
            reportStack={reportStack}
            onOpenProgress={onOpenProgress}
          />
        </DashboardSection>

        {attentionQueue?.length ? (
          <DashboardSection
            title={`${labels.attention.title} · Top ${Math.min(attentionLimit, attentionQueue.length)}`}
            titleEn={labels.attention.titleEn}
            lead={labels.attention.lead}
            className="progress-attention-panel-shell"
          >
            <AttentionQueuePanel
              embedded
              queue={attentionQueue}
              roleLabel={attentionRoleLabel}
              limit={attentionLimit}
              onOpenProgress={onOpenProgress}
              onOpenDetail={onOpenDetail}
            />
          </DashboardSection>
        ) : null}

        <DashboardSection
          title={labels.reportWatch.title}
          titleEn={labels.reportWatch.titleEn}
          lead={labels.reportWatch.lead}
        >
          <ReportDayPanel
            embedded
            watchlist={watchlist}
            stack={reportStack}
            nearestReport={nearestReport}
            onOpenProgress={onOpenProgress}
            onOpenDetail={onOpenDetail}
          />
        </DashboardSection>

        <CommandMetricsLegend />

        {collapsibleSection ? (
          <CollapsibleSection
            title={collapsibleSection.title}
            summary={collapsibleSection.summary}
            expanded={collapsibleSection.expanded}
            onToggle={collapsibleSection.onToggle}
          >
            {collapsibleSection.children}
          </CollapsibleSection>
        ) : null}
      </div>
    </section>
  );
}
