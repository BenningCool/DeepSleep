import { useMemo, useState } from "react";
import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS } from "../../data/pageLabels";
import { demoEmailOfViewAs, labelOfViewAs, VIEW_AS_OPTIONS } from "../../data/viewAsPresets";
import { buildEpPortfolio } from "./epPortfolioUtils";
import { ManagementFocusCard, ReportDayPanel } from "./ReportDayPanel";

function EmGroupCard({ group, onOpenProgress, onOpenDetail }) {
  const nearest = group.nearestReport;

  return (
    <article className="ep-em-group-card">
      <div className="ep-em-group-head">
        <div>
          <p className="staff-summary-eyebrow">Engagement Manager</p>
          <h3>{group.managerLabel}</h3>
        </div>
        <div className="ep-em-group-stats">
          <span>{group.projectCount} 个项目</span>
          {nearest ? (
            <span className={`report-tier-pill ${nearest.urgency.className}`}>
              最近 {nearest.urgency.shortLabel}
            </span>
          ) : null}
        </div>
      </div>
      <p className="ep-em-group-meta">
        执行层 {group.executionHeadcount} 人 · 高负荷 {group.highLoadCount}
        · 逾期 {group.totalOverdue}
      </p>
      {group.reportStack.triggered ? (
        <p className="team-collision-note">{group.reportStack.count} 个项目 Report 挤在 14 天内</p>
      ) : null}
      <div className="ep-em-project-list">
        {group.projects.map((entry) => (
          <button
            key={entry.project.id}
            className={`ep-em-project-row ${entry.urgency.className}`}
            type="button"
            onClick={() => onOpenProgress(entry.project.id)}
          >
            <span className={`report-tier-pill ${entry.urgency.className}`}>
              {entry.urgency.shortLabel}
            </span>
            <span className="ep-em-project-copy">
              <strong>{entry.project.clientName || entry.project.name}</strong>
              <small>{entry.project.name}</small>
            </span>
            <span className="ep-em-project-side">
              {entry.overdueCount ? `逾期 ${entry.overdueCount}` : "—"}
            </span>
          </button>
        ))}
      </div>
      <button
        className="button subtle compact"
        type="button"
        onClick={() => nearest && onOpenDetail(nearest.project.id)}
      >
        查看 EM 重点项目概览
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
  const partnerEmail = demoEmailOfViewAs("ep");

  const portfolio = useMemo(
    () => buildEpPortfolio(projects, tasks, partnerEmail),
    [projects, tasks, partnerEmail]
  );

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

  return (
    <section className="page-shell ep-command-page">
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
          <span className="label">View as · 查看身份</span>
          <select value={viewAs} onChange={(e) => onViewAsChange(e.target.value)}>
            {VIEW_AS_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="search-field">
          <span className="label">搜索 EM / 项目</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="EM 邮箱、客户、项目名..."
          />
        </label>
      </div>

      <p className="command-view-hint">
        当前视角：<strong>{labelOfViewAs(viewAs)}</strong>
        · Portfolio 管理（不直接执行测试）· Report Date D-30 / D-14 / D-7 优先
      </p>

      {!portfolio.partnerProjects.length ? (
        <div className="empty-state large">
          <h3>暂无 Portfolio 项目</h3>
          <p>当前演示账号尚未被设为任何项目的 Partner。</p>
        </div>
      ) : (
        <>
          <article className="team-summary-card ep-portfolio-summary">
            <div className="team-summary-grid">
              <div>
                <p className="staff-summary-eyebrow">Portfolio Overview</p>
                <h3>
                  {portfolio.summary.emCount} 个 EM · {portfolio.summary.projectCount} 个项目
                </h3>
              </div>
              <div className="team-summary-stat">
                <span className="team-stat-label">30 天内 Report</span>
                <strong>{portfolio.summary.watchlistCount}</strong>
              </div>
              <div className="team-summary-stat">
                <span className="team-stat-label">D-14 内</span>
                <strong className="load-medium-text">{portfolio.summary.warningCount}</strong>
              </div>
              <div className="team-summary-stat">
                <span className="team-stat-label">D-7 内/过期</span>
                <strong className="load-high-text">{portfolio.summary.criticalCount}</strong>
              </div>
            </div>
            {portfolio.portfolioStack.triggered ? (
              <p className="team-collision-note report-stack-note">
                Portfolio 内 {portfolio.portfolioStack.count} 个项目 Report 落在 14 天内，需防 last minute。
              </p>
            ) : null}
          </article>

          <ReportDayPanel
            watchlist={portfolio.watchlist}
            stack={portfolio.portfolioStack}
            onOpenProgress={onOpenProgress}
            onOpenDetail={onOpenDetail}
          />

          <ManagementFocusCard
            entry={portfolio.focusEntry}
            roleLabel="EP"
            onOpenProgress={onOpenProgress}
            onOpenDetail={onOpenDetail}
          />

          <section className="ep-em-groups-section">
            <h3 className="staff-section-title">
              下辖 EM · Engagement Managers ({visibleGroups.length})
            </h3>
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
          </section>
        </>
      )}
    </section>
  );
}
