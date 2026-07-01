import { useMemo } from "react";
import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS } from "../../data/pageLabels";
import { COMMAND_VIEW_AS_OPTIONS, demoEmailOfViewAs, labelOfViewAs } from "../../data/viewAsPresets";
import {
  buildCommandListMetrics,
  buildFilteredRiskMatrix
} from "./commandPortfolioFilters";
import { buildContributorLeadPortfolio } from "./contributorLeadUtils";
import { ManagementCommandBody } from "./ManagementCommandBody";
import { buildContributorResourceGroup } from "./resourceAllocationUtils";
import { ROLE_PAGE_INTRO } from "./managementCopy";

const CONTRIBUTOR_GROUP_BY_VIEW = {
  ita_lead: "ita",
  tax_lead: "tax"
};

export function ContributorLeadCommandView({
  projects,
  tasks,
  viewAs,
  onViewAsChange,
  onOpenProgress,
  onOpenDetail: _onOpenDetail,
  onOpenAllProjects
}) {
  const leadEmail = demoEmailOfViewAs(viewAs);
  const contributorGroup = CONTRIBUTOR_GROUP_BY_VIEW[viewAs] || "ita";

  const basePortfolio = useMemo(
    () => buildContributorLeadPortfolio(projects, tasks, contributorGroup),
    [projects, tasks, contributorGroup]
  );

  const { filteredProjects, riskMatrix: filteredMatrix } = useMemo(
    () => buildFilteredRiskMatrix(basePortfolio.leadProjects, tasks, {}),
    [basePortfolio.leadProjects, tasks]
  );

  const listMetrics = useMemo(
    () => buildCommandListMetrics(filteredProjects, filteredMatrix, tasks, 3),
    [filteredProjects, filteredMatrix, tasks]
  );

  const filteredSummary = useMemo(() => ({
    ...basePortfolio.summary,
    projectCount: filteredProjects.length,
    watchlistCount: listMetrics.watchlist.length,
    riskCounts: listMetrics.riskCounts
  }), [basePortfolio.summary, filteredProjects.length, listMetrics]);

  const resourceGroups = useMemo(() => {
    if (!filteredProjects.length) return [];
    return [
      buildContributorResourceGroup(
        filteredProjects,
        tasks,
        leadEmail,
        basePortfolio.contributorLabel
      )
    ];
  }, [filteredProjects, tasks, leadEmail, basePortfolio.contributorLabel]);

  return (
    <section className="page-shell progress-board-page management-command-page contributor-lead-page">
      <header className="page-header">
        <div>
          <ModuleHeading
            as="h2"
            title={PAGE_LABELS.commandCenter.title}
            titleEn={PAGE_LABELS.commandCenter.titleEn}
          />
          <p className="page-note">{leadEmail}</p>
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
        · {ROLE_PAGE_INTRO[viewAs]}
      </p>

      {!basePortfolio.leadProjects.length ? (
        <div className="empty-state large">
          <h3>暂无协作项目</h3>
          <p>
            当前演示数据中没有 {basePortfolio.contributorLabel} 组贡献的项目。
          </p>
        </div>
      ) : (
        <ManagementCommandBody
          mode="contributor"
          summary={filteredSummary}
          reportStack={listMetrics.reportStack}
          filteredMatrix={filteredMatrix}
          tasks={tasks}
          attentionQueue={listMetrics.attentionQueue}
          totalProjectCount={basePortfolio.leadProjects.length}
          resourceGroups={resourceGroups}
          onOpenProgress={onOpenProgress}
          onOpenAllProjects={onOpenAllProjects}
        />
      )}
    </section>
  );
}
