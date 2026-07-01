import { useMemo } from "react";
import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS } from "../../data/pageLabels";
import { COMMAND_VIEW_AS_OPTIONS, demoEmailOfViewAs, labelOfViewAs } from "../../data/viewAsPresets";
import {
  buildCommandListMetrics,
  buildFilteredRiskMatrix
} from "./commandPortfolioFilters";
import { ManagementCommandBody } from "./ManagementCommandBody";
import { buildStaffResourceGroup } from "./resourceAllocationUtils";
import { ROLE_PAGE_INTRO } from "./managementCopy";
import { buildStaffCommandPortfolio } from "./staffCommandPortfolio";

export function StaffCommandView({
  projects,
  tasks,
  viewAs,
  onViewAsChange,
  onOpenProgress,
  onOpenDetail: _onOpenDetail,
  onOpenAllProjects
}) {
  const staffEmail = demoEmailOfViewAs("staff");

  const basePortfolio = useMemo(
    () => buildStaffCommandPortfolio(projects, tasks, staffEmail),
    [projects, tasks, staffEmail]
  );

  const { filteredProjects, riskMatrix: filteredMatrix } = useMemo(
    () => buildFilteredRiskMatrix(basePortfolio.staffProjects, tasks, {}),
    [basePortfolio.staffProjects, tasks]
  );

  const listMetrics = useMemo(
    () => buildCommandListMetrics(filteredProjects, filteredMatrix, tasks, 1),
    [filteredProjects, filteredMatrix, tasks]
  );

  const resourceGroups = useMemo(() => {
    if (!filteredProjects.length) return [];
    return [buildStaffResourceGroup(filteredProjects, tasks, staffEmail)];
  }, [filteredProjects, tasks, staffEmail]);

  const filteredSummary = useMemo(() => ({
    ...basePortfolio.summary,
    projectCount: filteredProjects.length,
    watchlistCount: listMetrics.watchlist.length,
    riskCounts: listMetrics.riskCounts
  }), [basePortfolio.summary, filteredProjects.length, listMetrics]);

  return (
    <section className="page-shell progress-board-page management-command-page staff-command-page">
      <header className="page-header">
        <div>
          <ModuleHeading
            as="h2"
            title={PAGE_LABELS.staffCommand.title}
            titleEn={PAGE_LABELS.staffCommand.titleEn}
          />
          <p className="page-note">{staffEmail}</p>
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
        · {ROLE_PAGE_INTRO.staff}
      </p>

      {!basePortfolio.staffProjects.length ? (
        <div className="empty-state large">
          <h3>暂无参与项目</h3>
          <p>当前演示账号尚未加入任何项目，或未指派测试点。</p>
        </div>
      ) : (
        <ManagementCommandBody
          mode="staff"
          summary={filteredSummary}
          reportStack={listMetrics.reportStack}
          filteredMatrix={filteredMatrix}
          tasks={tasks}
          attentionQueue={listMetrics.attentionQueue}
          totalProjectCount={basePortfolio.staffProjects.length}
          resourceGroups={resourceGroups}
          onOpenProgress={onOpenProgress}
          onOpenAllProjects={onOpenAllProjects}
        />
      )}
    </section>
  );
}
