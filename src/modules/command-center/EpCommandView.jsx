import { useMemo, useState } from "react";
import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS } from "../../data/pageLabels";
import { demoEmailOfViewAs, labelOfViewAs, VIEW_AS_OPTIONS } from "../../data/viewAsPresets";
import { buildEpPortfolio } from "./epPortfolioUtils";
import { ManagementCommandBody } from "./ManagementCommandBody";
import { ROLE_PAGE_INTRO } from "./managementCopy";

function EmGroupCard({ group, onOpenProgress, onOpenDetail }) {
  const nearest = group.nearestReport;

  return (
    <article className="ep-em-group-card progress-dashboard-card">
      <div className="ep-em-group-head">
        <div>
          <p className="staff-summary-eyebrow">Engagement Manager</p>
          <h3>{group.managerLabel}</h3>
        </div>
        <div className="ep-em-group-stats">
          <span>{group.projectCount} 个项目</span>
          {nearest ? (
            <span className={`report-tier-pill ${nearest.urgency.className}`}>
              {nearest.urgency.readableLabel}
            </span>
          ) : null}
        </div>
      </div>
      <p className="ep-em-group-meta">
        现场团队 {group.executionHeadcount} 人
        · 饱和度偏高 {group.highLoadCount} 人
        · {group.totalOverdue} 项逾期
      </p>
      {group.reportStack.triggered ? (
        <p className="team-collision-note">
          报告日集中：14 天内有 {group.reportStack.count} 个项目出具报告
        </p>
      ) : null}
      <div className="ep-em-project-list">
        {group.projects.map((entry) => (
          <button
            key={entry.project.id}
            className={`ep-em-project-row ${entry.urgency.className}`}
            type="button"
            onClick={() => onOpenProgress(entry.project.id)}
          >
            <span className="report-readable compact">
              {entry.urgency.readableLabel}
            </span>
            <span className="ep-em-project-copy">
              <strong>{entry.project.clientName || entry.project.name}</strong>
              <small>{entry.project.name}</small>
            </span>
            <span className="ep-em-project-side">
              {entry.overdueCount ? `${entry.overdueCount} 项逾期` : "—"}
            </span>
          </button>
        ))}
      </div>
      <button
        className="button subtle compact"
        type="button"
        onClick={() => nearest && onOpenDetail(nearest.project.id)}
      >
        打开优先关注项目
      </button>
    </article>
  );
}

export function EpCommandView({
  projects,
  tasks,
  viewAs,
  onViewAsChange,
  onOpenProgress,
  onOpenDetail
}) {
  const [search, setSearch] = useState("");
  const [emExpanded, setEmExpanded] = useState(false);
  const partnerEmail = demoEmailOfViewAs("ep");

  const portfolio = useMemo(
    () => buildEpPortfolio(projects, tasks, partnerEmail),
    [projects, tasks, partnerEmail]
  );

  const filteredMatrix = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return portfolio.riskMatrix;
    return portfolio.riskMatrix.filter((row) => (
      row.managerLabel.toLowerCase().includes(query)
      || `${row.project.clientName} ${row.project.name}`.toLowerCase().includes(query)
    ));
  }, [portfolio.riskMatrix, search]);

  const visibleGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return portfolio.emGroups;
    return portfolio.emGroups.filter((group) => (
      group.managerLabel.toLowerCase().includes(query)
      || group.projects.some((entry) => (
        `${entry.project.clientName} ${entry.project.name}`.toLowerCase().includes(query)
      ))
    ));
  }, [portfolio.emGroups, search]);

  const emCollapseSummary = useMemo(() => {
    if (!visibleGroups.length) return "";
    return visibleGroups.map((group) => (
      `${group.managerLabel} · ${group.projectCount} 个项目 · ${group.totalOverdue} 项逾期`
    )).join(" · ");
  }, [visibleGroups]);

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

      <div className="command-toolbar staff-command-toolbar">
        <label className="view-as-field">
          <span className="label">角色视角 · View as</span>
          <select value={viewAs} onChange={(e) => onViewAsChange(e.target.value)}>
            {VIEW_AS_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="search-field">
          <span className="label">搜索项目 / EM</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="客户、项目名、负责 EM..."
          />
        </label>
      </div>

      <p className="command-view-hint">
        当前视角：<strong>{labelOfViewAs(viewAs)}</strong>
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
          summary={portfolio.summary}
          reportStack={portfolio.portfolioStack}
          filteredMatrix={filteredMatrix}
          tasks={tasks}
          showEmColumn
          attentionQueue={portfolio.attentionQueue}
          attentionRoleLabel="EP"
          attentionLimit={3}
          watchlist={portfolio.watchlist}
          nearestReport={portfolio.nearestReport}
          onOpenProgress={onOpenProgress}
          onOpenDetail={onOpenDetail}
          collapsibleSection={{
            title: `下辖 EM · Engagement Manager (${visibleGroups.length})`,
            summary: emCollapseSummary,
            expanded: emExpanded,
            onToggle: () => setEmExpanded((open) => !open),
            children: (
              <div className="ep-em-group-list">
                {visibleGroups.map((group) => (
                  <EmGroupCard
                    key={group.managerEmail}
                    group={group}
                    onOpenProgress={onOpenProgress}
                    onOpenDetail={onOpenDetail}
                  />
                ))}
              </div>
            )
          }}
        />
      )}
    </section>
  );
}
