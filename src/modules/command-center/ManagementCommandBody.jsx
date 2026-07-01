import { useEffect, useMemo, useState } from "react";
import { COMMAND_CENTER_LABELS } from "../../data/progressLabels";
import { CollapsibleSection } from "./CollapsibleSection";
import { DashboardSection } from "./DashboardSection";
import { EngagementPortfolioCardList } from "./EngagementPortfolioCardList";
import { PortfolioKpiSection } from "./PortfolioKpiSection";
import { ReportDayPanel } from "./ReportDayPanel";
import { ReportDateCalendar } from "./ReportDateCalendar";
import { ResourceAllocationSection } from "./ResourceAllocationSection";
import { resolveResourceUiConfig } from "./resourceAllocationConfig";
import { AiAuditCommandPanel } from "./AiAuditCommandPanel";
import {
  addMonthOffset,
  mergeAttentionWithMonthRows,
  resolveInitialReportMonth
} from "./reportCalendarUtils";

export function ManagementCommandBody({
  mode,
  summary,
  reportStack,
  filteredMatrix,
  tasks,
  showEmColumn = true,
  attentionQueue,
  attentionLimit = 3,
  watchlist,
  nearestReport,
  listToolbar = null,
  resourceGroups = null,
  totalProjectCount = 0,
  onOpenProgress,
  onOpenDetail,
  collapsibleSection = null
}) {
  const labels = COMMAND_CENTER_LABELS;
  const resourceUiConfig = resolveResourceUiConfig(mode);

  const initialMonth = useMemo(
    () => resolveInitialReportMonth(filteredMatrix, nearestReport),
    [filteredMatrix, nearestReport]
  );

  const [visibleMonth, setVisibleMonth] = useState(initialMonth);
  const [portfolioListExpanded, setPortfolioListExpanded] = useState(false);

  useEffect(() => {
    setVisibleMonth(initialMonth);
  }, [initialMonth.year, initialMonth.month]);

  const listRows = useMemo(
    () => mergeAttentionWithMonthRows(filteredMatrix, attentionQueue, attentionLimit),
    [filteredMatrix, attentionQueue, attentionLimit]
  );

  const rankedCount = Math.min(attentionLimit, attentionQueue?.length || 0);
  const listLead = rankedCount
    ? `#1–#${rankedCount} 为建议优先跟进；其余按报告日排序。`
    : labels.portfolioList.lead;

  const resourceSectionLead = useMemo(() => {
    const allocation = labels.resourceAllocation;
    if (mode === "ep") return allocation.leadEp;
    if (mode === "em") return allocation.leadEm;
    if (mode === "ic") return allocation.leadIc;
    if (mode === "staff") return allocation.leadStaff;
    if (mode === "contributor") return allocation.leadContributor;
    return allocation.lead;
  }, [mode, labels]);

  const visibleCount = filteredMatrix.length;
  const totalCount = totalProjectCount || visibleCount;
  const topPortfolioProject = listRows[0]?.project || null;
  const portfolioListSummary = topPortfolioProject
    ? `当前展示 ${visibleCount} / ${totalCount} 个项目；优先关注：${topPortfolioProject.clientName || topPortfolioProject.name}。`
    : `当前展示 ${visibleCount} / ${totalCount} 个项目。`;

  return (
    <section className="progress-dashboard" aria-label="组合指挥中心">
      <PortfolioKpiSection
        mode={mode}
        summary={summary}
        reportStack={reportStack}
      />

      <AiAuditCommandPanel
        projects={filteredMatrix.map((row) => row.project)}
        tasks={tasks}
        onOpenProgress={onOpenProgress}
      />

      <div className="command-dashboard-grid">
        <DashboardSection
          title={labels.portfolioList.title}
          titleEn={labels.portfolioList.titleEn}
          lead={listLead}
          headerExtra={(
            <button
              className="button subtle compact"
              type="button"
              aria-expanded={portfolioListExpanded}
              onClick={() => setPortfolioListExpanded((value) => !value)}
            >
              {portfolioListExpanded ? "收起" : "展开"}
            </button>
          )}
          className="command-portfolio-section"
        >
          {!portfolioListExpanded ? (
            <button
              className="command-portfolio-collapsed-summary"
              type="button"
              onClick={() => setPortfolioListExpanded(true)}
            >
              <span>项目列表已收起</span>
              <strong>{portfolioListSummary}</strong>
              <small>{rankedCount ? `#1-#${rankedCount} 为建议优先跟进。` : labels.portfolioList.lead}</small>
            </button>
          ) : (
            <>
              {listToolbar ? (
                <div className="command-portfolio-list-toolbar-wrap">
                  {typeof listToolbar === "function"
                    ? listToolbar({ visibleCount, totalCount })
                    : listToolbar}
                </div>
              ) : null}
              <EngagementPortfolioCardList
                rows={listRows}
                tasks={tasks}
                showEmColumn={showEmColumn}
                emptyHint="当前筛选条件下暂无项目。"
                onOpenProgress={onOpenProgress}
                onOpenDetail={onOpenDetail}
              />
            </>
          )}
        </DashboardSection>

        {resourceGroups?.length ? (
          <DashboardSection
            title={labels.resourceAllocation.title}
            titleEn={labels.resourceAllocation.titleEn}
            lead={resourceSectionLead}
            className="command-resource-section"
          >
            <ResourceAllocationSection
              mode={mode}
              groups={resourceGroups}
              uiConfig={resourceUiConfig}
              onOpenProgress={onOpenProgress}
            />
          </DashboardSection>
        ) : null}

        <div className="command-report-row">
          <DashboardSection
            title={labels.timeline.title}
            titleEn={labels.timeline.titleEn}
            lead={labels.timeline.lead}
            className="command-report-calendar-section"
          >
            <ReportDateCalendar
              embedded
              showMonthNav
              rows={filteredMatrix}
              visibleMonth={visibleMonth}
              onPrevMonth={() => setVisibleMonth((current) => addMonthOffset(current, -1))}
              onNextMonth={() => setVisibleMonth((current) => addMonthOffset(current, 1))}
              onOpenProgress={onOpenProgress}
            />
          </DashboardSection>

          <DashboardSection
            title={labels.reportWatch.title}
            titleEn={labels.reportWatch.titleEn}
            lead={labels.reportWatch.lead}
            className="command-report-watch-section"
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
        </div>

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
