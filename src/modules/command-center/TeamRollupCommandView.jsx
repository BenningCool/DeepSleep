import { useMemo, useState } from "react";
import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS } from "../../data/pageLabels";
import { demoEmailOfViewAs, labelOfViewAs, VIEW_AS_OPTIONS } from "../../data/viewAsPresets";
import { labelOfTeam } from "../../data/projectConstants";
import { ProgressOwnerLabel } from "../progress-board/ProgressOwnerLabel";
import { formatReportCountdown, ledTeamLabel } from "./commandCenterUtils";
import { getReportUrgency } from "./reportDayUtils";
import { ManagementFocusCard, ReportDayPanel } from "./ReportDayPanel";
import {
  buildTeamRollup,
  formatFocusLabel,
  getSupervisedProjects
} from "./teamRollupUtils";

function SaturationBar({ percent, levelClass }) {
  return (
    <div className={`staff-saturation-bar compact ${levelClass}`} aria-hidden="true">
      <span className="staff-saturation-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

function PersonLoadRow({
  person,
  onOpenMemberProgress,
  onOpenDetail
}) {
  const { saturation } = person;
  const focusLabel = formatFocusLabel(person);

  return (
    <article
      className={[
        "team-person-row",
        saturation.levelClass,
        person.isSelf ? "is-self" : ""
      ].filter(Boolean).join(" ")}
    >
      <div className="team-person-main">
        <div className="team-person-head">
          <div className="team-person-identity">
            <ProgressOwnerLabel owner={person.email} compact />
            <span className="role-pill">{person.roleLabel}</span>
            {person.isSelf ? <span className="staff-focus-badge">本人</span> : null}
          </div>
          <div className="team-person-load">
            <span className={`team-load-level ${saturation.levelClass}`}>
              负荷 {saturation.level}
            </span>
            <strong>{saturation.percent}%</strong>
          </div>
        </div>
        <SaturationBar percent={saturation.percent} levelClass={saturation.levelClass} />
        <div className="team-person-stats">
          <span>{saturation.assignedTotal} 个测试点</span>
          <span>{saturation.projectCount} 个项目</span>
          <span>未开始 {saturation.notStarted}</span>
          <span>测试中 {saturation.inProgress}</span>
          {saturation.overdue ? (
            <span className="team-stat-overdue">逾期 {saturation.overdue}</span>
          ) : null}
        </div>
        <p className="team-person-focus">
          <span className="team-focus-label">当前 Focus</span>
          <strong>{focusLabel}</strong>
        </p>
      </div>
      <div className="team-person-actions">
        {person.focusProjectId ? (
          <button
            className="button primary compact"
            type="button"
            onClick={() => onOpenMemberProgress(person.focusProjectId, person.email)}
          >
            查看测试点
          </button>
        ) : null}
        {person.portfolio[0]?.project?.id ? (
          <button
            className="button subtle compact"
            type="button"
            onClick={() => onOpenDetail(person.portfolio[0].project.id)}
          >
            项目概览
          </button>
        ) : null}
      </div>
    </article>
  );
}

function SupervisedProjectChip({ project, onOpenProgress }) {
  const reportLabel = formatReportCountdown(project.reportDate);
  const urgency = getReportUrgency(project.reportDate);

  return (
    <button
      className={`team-project-chip ${urgency.className}`}
      type="button"
      onClick={() => onOpenProgress(project.id)}
    >
      <strong>{project.clientName || project.name}</strong>
      <span>{ledTeamLabel(project.team)} · {labelOfTeam(project.team)}</span>
      {reportLabel ? (
        <span className={`report-tier-pill ${urgency.className}`}>{reportLabel}</span>
      ) : (
        <span className="report-tier-pill report-missing">未填 Report</span>
      )}
    </button>
  );
}

export function TeamRollupCommandView({
  projects,
  tasks,
  viewAs,
  onViewAsChange,
  onOpenProgress,
  onOpenDetail,
  onOpenMemberProgress
}) {
  const [search, setSearch] = useState("");
  const supervisorEmail = demoEmailOfViewAs(viewAs);
  const pageLabels = viewAs === "em" ? PAGE_LABELS.emCommand : PAGE_LABELS.icCommand;

  const rollup = useMemo(
    () => buildTeamRollup(projects, tasks, supervisorEmail, viewAs),
    [projects, tasks, supervisorEmail, viewAs]
  );

  const visiblePeople = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rollup.people;
    return rollup.people.filter((person) => (
      person.email.includes(query)
      || person.roleLabel.toLowerCase().includes(query)
      || formatFocusLabel(person).toLowerCase().includes(query)
    ));
  }, [rollup.people, search]);

  const supervisedProjects = useMemo(
    () => getSupervisedProjects(projects, supervisorEmail, viewAs),
    [projects, supervisorEmail, viewAs]
  );

  const isEmView = viewAs === "em";

  return (
    <section className="page-shell team-rollup-page">
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
          <span className="label">搜索成员</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="邮箱、角色、Focus 项目..."
          />
        </label>
      </div>

      <p className="command-view-hint">
        当前视角：<strong>{labelOfViewAs(viewAs)}</strong>
        {isEmView
          ? " · 管理角色（不执行测试）· Report Date D-30 / D-14 / D-7 优先 · 下方为执行层 IC / Staff 负荷"
          : " · 查看所辖项目上的 IC / Staff 负荷与 Focus · 全员关注 Report Date"}
      </p>

      {!supervisedProjects.length ? (
        <div className="empty-state large">
          <h3>暂无所辖项目</h3>
          <p>
            当前演示账号尚未被设为任何项目的
            {viewAs === "em" ? " Manager" : " In-charge"}。
          </p>
        </div>
      ) : (
        <>
          <article className="team-summary-card">
            <div className="team-summary-grid">
              <div>
                <p className="staff-summary-eyebrow">Team Overview</p>
                <h3>
                  {isEmView ? "执行层 " : ""}
                  {rollup.summary.headcount} 人 · {supervisedProjects.length} 个项目
                </h3>
              </div>
              {isEmView ? (
                <>
                  <div className="team-summary-stat">
                    <span className="team-stat-label">30 天内 Report</span>
                    <strong>{rollup.reportWatchlist.length}</strong>
                  </div>
                  <div className="team-summary-stat">
                    <span className="team-stat-label">D-14 堆叠</span>
                    <strong className={rollup.reportStack.triggered ? "load-medium-text" : ""}>
                      {rollup.reportStack.triggered ? rollup.reportStack.count : "—"}
                    </strong>
                  </div>
                </>
              ) : null}
              <div className="team-summary-stat">
                <span className="team-stat-label">高负荷</span>
                <strong className="load-high-text">{rollup.summary.highLoadCount}</strong>
              </div>
              <div className="team-summary-stat">
                <span className="team-stat-label">中负荷</span>
                <strong className="load-medium-text">{rollup.summary.mediumLoadCount}</strong>
              </div>
              <div className="team-summary-stat">
                <span className="team-stat-label">执行层逾期</span>
                <strong className="load-high-text">{rollup.summary.totalOverdue}</strong>
              </div>
            </div>
            {rollup.summary.focusCollision ? (
              <p className="team-collision-note">
                多人当前 Focus 落在同一项目，可能存在资源争抢，建议协调分工。
              </p>
            ) : null}
          </article>

          <ReportDayPanel
            watchlist={rollup.reportWatchlist}
            stack={isEmView ? rollup.reportStack : null}
            onOpenProgress={onOpenProgress}
            onOpenDetail={onOpenDetail}
          />

          {isEmView ? (
            <ManagementFocusCard
              entry={rollup.managementFocus}
              roleLabel="EM"
              onOpenProgress={onOpenProgress}
              onOpenDetail={onOpenDetail}
            />
          ) : null}

          <section className="team-people-section">
            <h3 className="staff-section-title">
              {isEmView ? "执行层负荷 · IC & Staff" : "组内负荷 · Team Load"}
            </h3>
            {isEmView ? (
              <p className="management-role-banner">
                您当前为 <strong>Engagement Manager</strong>，不参与测试点执行；请通过 Report 预警与下方执行层负荷协调资源。
              </p>
            ) : null}
            {visiblePeople.length ? (
              <div className="team-person-list">
                {visiblePeople.map((person) => (
                  <PersonLoadRow
                    key={person.email}
                    person={person}
                    onOpenMemberProgress={onOpenMemberProgress}
                    onOpenDetail={onOpenDetail}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state compact">
                <p>没有匹配的成员。</p>
              </div>
            )}
          </section>

          <section className="team-projects-section">
            <h3 className="staff-section-title">
              所辖项目 · Supervised Engagements ({supervisedProjects.length})
            </h3>
            <div className="team-project-chips">
              {supervisedProjects.map((project) => (
                <SupervisedProjectChip
                  key={project.id}
                  project={project}
                  onOpenProgress={onOpenProgress}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
