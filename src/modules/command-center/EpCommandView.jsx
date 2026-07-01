import { useMemo } from "react";
import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS } from "../../data/pageLabels";
import { COMMAND_VIEW_AS_OPTIONS, demoEmailOfViewAs, labelOfViewAs } from "../../data/viewAsPresets";
import {
  buildEpPortfolio,
  getManagerEmail
} from "./epPortfolioUtils";
import {
  buildCommandListMetrics,
  buildFilteredRiskMatrix
} from "./commandPortfolioFilters";
import { ManagementCommandBody } from "./ManagementCommandBody";
import { buildEmResourceGroups } from "./resourceAllocationUtils";
import { ROLE_PAGE_INTRO } from "./managementCopy";

export function EpCommandView({
  projects,
  tasks,
  viewAs,
  onViewAsChange,
  onOpenProgress,
  onOpenDetail: _onOpenDetail,
  onOpenAllProjects
}) {
  const partnerEmail = demoEmailOfViewAs("ep");

  const portfolio = useMemo(
    () => buildEpPortfolio(projects, tasks, partnerEmail),
    [projects, tasks, partnerEmail]
  );

  const { filteredProjects, riskMatrix: filteredMatrix } = useMemo(
    () => buildFilteredRiskMatrix(
      portfolio.partnerProjects,
      tasks,
      {},
      getManagerEmail
    ),
    [portfolio.partnerProjects, tasks]
  );

  const listMetrics = useMemo(
    () => buildCommandListMetrics(filteredProjects, filteredMatrix, tasks, 3),
    [filteredProjects, filteredMatrix, tasks]
  );

  const resourceGroups = useMemo(
    () => buildEmResourceGroups(filteredProjects, tasks),
    [filteredProjects, tasks]
  );

  const filteredSummary = useMemo(() => ({
    ...portfolio.summary,
    projectCount: filteredProjects.length,
    emCount: resourceGroups.length,
    watchlistCount: listMetrics.watchlist.length,
    riskCounts: listMetrics.riskCounts
  }), [portfolio.summary, filteredProjects.length, resourceGroups.length, listMetrics]);

  return (
    <section className="page-shell progress-board-page management-command-page ep-command-page">
      <header className="page-header">
        <div>
          <ModuleHeading
            as="h2"
            title={PAGE_LABELS.epCommand.title}
            titleEn={PAGE_LABELS.epCommand.titleEn}
          />
          <p className="page-note">{partnerEmail}</p>
        </div>
      </header>

      <div className="command-toolbar staff-command-toolbar command-toolbar-view-as-only">
        <label className="view-as-field">
          <span className="label">角色视角 · View as</span>
          <select value={viewAs} onChange={(e) => onViewAsChange(e.target.value)}>
            {COMMAND_VIEW_AS_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="command-view-hint">
        <strong>{labelOfViewAs(viewAs)}</strong>
        · {ROLE_PAGE_INTRO.ep}
      </p>

      {!portfolio.partnerProjects.length ? (
        <div className="empty-state large">
          <h3>暂无组合项目</h3>
          <p>当前演示账号尚未被设为任何项目的 Partner。</p>
        </div>
      ) : (
        <ManagementCommandBody
          mode="ep"
          summary={filteredSummary}
          reportStack={listMetrics.reportStack}
          filteredMatrix={filteredMatrix}
          tasks={tasks}
          attentionQueue={listMetrics.attentionQueue}
          totalProjectCount={portfolio.partnerProjects.length}
          resourceGroups={resourceGroups}
          onOpenProgress={onOpenProgress}
          onOpenAllProjects={onOpenAllProjects}
        />
      )}
    </section>
  );
}
