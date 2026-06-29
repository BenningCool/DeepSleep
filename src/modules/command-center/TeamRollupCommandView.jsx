import { useMemo } from "react";
import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS } from "../../data/pageLabels";
import { demoEmailOfViewAs, labelOfViewAs, VIEW_AS_OPTIONS } from "../../data/viewAsPresets";
import {
  buildCommandListMetrics,
  buildFilteredRiskMatrix,
  useCommandListFilters
} from "./commandPortfolioFilters";
import { ManagementCommandBody } from "./ManagementCommandBody";
import { PortfolioListToolbar } from "./PortfolioListToolbar";
import { buildSupervisorResourceGroup } from "./resourceAllocationUtils";
import { ROLE_PAGE_INTRO } from "./managementCopy";
import {
  buildTeamRollup,
  getSupervisedProjects
} from "./teamRollupUtils";

function RollupManagementLayout({
  mode,
  filteredMatrix,
  filteredSummary,
  listMetrics,
  supervisedProjects,
  resourceGroups,
  tasks,
  listToolbar,
  attentionLimit,
  onOpenProgress,
  onOpenDetail
}) {
  return (
    <ManagementCommandBody
      mode={mode}
      summary={filteredSummary}
      reportStack={listMetrics.reportStack}
      filteredMatrix={filteredMatrix}
      tasks={tasks}
      showEmColumn={false}
      attentionQueue={listMetrics.attentionQueue}
      attentionLimit={attentionLimit}
      watchlist={listMetrics.watchlist}
      nearestReport={listMetrics.nearestReport}
      totalProjectCount={supervisedProjects.length}
      resourceGroups={resourceGroups}
      listToolbar={listToolbar}
      onOpenProgress={onOpenProgress}
      onOpenDetail={onOpenDetail}
    />
  );
}

export function TeamRollupCommandView({
  projects,
  tasks,
  viewAs,
  onViewAsChange,
  onOpenProgress,
  onOpenDetail,
  onOpenMemberProgress: _onOpenMemberProgress
}) {
  const {
    filters,
    search,
    setSearch,
    teamFilter,
    setTeamFilter,
    typeFilter,
    setTypeFilter,
    sortBy,
    setSortBy
  } = useCommandListFilters();
  const supervisorEmail = demoEmailOfViewAs(viewAs);
  const pageLabels = viewAs === "em" ? PAGE_LABELS.emCommand : PAGE_LABELS.icCommand;
  const isEmView = viewAs === "em";
  const attentionLimit = isEmView ? 1 : 3;

  const rollup = useMemo(
    () => buildTeamRollup(projects, tasks, supervisorEmail, viewAs),
    [projects, tasks, supervisorEmail, viewAs]
  );

  const supervisedProjects = useMemo(
    () => getSupervisedProjects(projects, supervisorEmail, viewAs),
    [projects, supervisorEmail, viewAs]
  );

  const { filteredProjects, riskMatrix: filteredMatrix } = useMemo(
    () => buildFilteredRiskMatrix(supervisedProjects, tasks, filters),
    [supervisedProjects, tasks, filters]
  );

  const listMetrics = useMemo(
    () => buildCommandListMetrics(filteredProjects, filteredMatrix, tasks, attentionLimit),
    [filteredProjects, filteredMatrix, tasks, attentionLimit]
  );

  const resourceGroups = useMemo(() => {
    if (!filteredProjects.length) return [];
    return [
      buildSupervisorResourceGroup(filteredProjects, tasks, supervisorEmail, viewAs)
    ];
  }, [filteredProjects, tasks, supervisorEmail, viewAs]);

  const filteredSummary = useMemo(() => ({
    ...rollup.summary,
    projectCount: filteredProjects.length,
    watchlistCount: listMetrics.watchlist.length,
    riskCounts: listMetrics.riskCounts
  }), [rollup.summary, filteredProjects.length, listMetrics]);

  const searchLabel = "搜索项目 / 成员";
  const searchPlaceholder = "客户、项目名、成员邮箱...";

  return (
    <section className="page-shell progress-board-page management-command-page team-rollup-page">
      <header className="page-header">
        <div>
          <ModuleHeading
            as="h2"
            title={pageLabels.title}
            titleEn={pageLabels.titleEn}
          />
          <p className="page-note">{supervisorEmail}</p>
        </div>
      </header>

      <div className="command-toolbar staff-command-toolbar command-toolbar-view-as-only">
        <label className="view-as-field">
          <span className="label">角色视角 · View as</span>
          <select value={viewAs} onChange={(e) => onViewAsChange(e.target.value)}>
            {VIEW_AS_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="command-view-hint">
        当前视角：<strong>{labelOfViewAs(viewAs)}</strong>
        · {isEmView ? ROLE_PAGE_INTRO.em : ROLE_PAGE_INTRO.ic}
      </p>

      {!supervisedProjects.length ? (
        <div className="empty-state large">
          <h3>暂无所辖项目</h3>
          <p>
            当前演示账号尚未被设为任何项目的
            {isEmView ? " Manager" : " In-charge"}。
          </p>
        </div>
      ) : (
        <RollupManagementLayout
          mode={isEmView ? "em" : "ic"}
          filteredMatrix={filteredMatrix}
          filteredSummary={filteredSummary}
          listMetrics={listMetrics}
          supervisedProjects={supervisedProjects}
          resourceGroups={resourceGroups}
          tasks={tasks}
          attentionLimit={attentionLimit}
          listToolbar={({ visibleCount, totalCount }) => (
            <PortfolioListToolbar
              search={search}
              teamFilter={teamFilter}
              typeFilter={typeFilter}
              sortBy={sortBy}
              onSearchChange={setSearch}
              onTeamFilterChange={setTeamFilter}
              onTypeFilterChange={setTypeFilter}
              onSortChange={setSortBy}
              searchLabel={searchLabel}
              searchPlaceholder={searchPlaceholder}
              visibleCount={visibleCount}
              totalCount={totalCount}
            />
          )}
          onOpenProgress={onOpenProgress}
          onOpenDetail={onOpenDetail}
        />
      )}
    </section>
  );
}
