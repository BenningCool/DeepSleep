import { useMemo, useState } from "react";
import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS } from "../../data/pageLabels";
import { demoEmailOfViewAs, labelOfViewAs, VIEW_AS_OPTIONS } from "../../data/viewAsPresets";
import { labelOfTeam } from "../../data/projectConstants";
import { ProgressOwnerLabel } from "../progress-board/ProgressOwnerLabel";
import { formatReportCountdown, ledTeamLabel } from "./commandCenterUtils";
import { ManagementCommandBody } from "./ManagementCommandBody";
import { ReportDayPanel } from "./ReportDayPanel";
import { ROLE_PAGE_INTRO, SATURATION_LEVEL_LABEL } from "./managementCopy";
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
  const levelLabel = SATURATION_LEVEL_LABEL[saturation.level] || saturation.level;

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
              工作饱和度 {levelLabel}
            </span>
            <strong>{saturation.percent}%</strong>
          </div>
        </div>
        <SaturationBar percent={saturation.percent} levelClass={saturation.levelClass} />
        <div className="team-person-stats">
          <span>{saturation.assignedTotal} 个程序</span>
          <span>{saturation.projectCount} 个项目</span>
          <span>未开始 {saturation.notStarted}</span>
          <span>测试中 {saturation.inProgress}</span>
          {saturation.overdue ? (
            <span className="team-stat-overdue">逾期 {saturation.overdue}</span>
          ) : null}
        </div>
        <p className="team-person-focus">
          <span className="team-focus-label">当前优先项目</span>
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
            查看负责程序
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

  return (
    <button
      className="team-project-chip"
      type="button"
      onClick={() => onOpenProgress(project.id)}
    >
      <strong>{project.clientName || project.name}</strong>
      <span>{ledTeamLabel(project.team)} · {labelOfTeam(project.team)}</span>
      <span className="report-readable">{reportLabel || "未填写报告日"}</span>
    </button>
  );
}

function EmManagementLayout({
  rollup,
  filteredMatrix,
  tasks,
  visiblePeople,
  fieldworkExpanded,
  onToggleFieldwork,
  fieldworkSummary,
  onOpenProgress,
  onOpenDetail,
  onOpenMemberProgress
}) {
  return (
    <ManagementCommandBody
      mode="em"
      summary={rollup.summary}
      reportStack={rollup.reportStack}
      filteredMatrix={filteredMatrix}
      tasks={tasks}
      showEmColumn={false}
      attentionQueue={rollup.attentionQueue}
      attentionRoleLabel="EM"
      attentionLimit={1}
      watchlist={rollup.reportWatchlist}
      nearestReport={rollup.nearestReport}
      onOpenProgress={onOpenProgress}
      onOpenDetail={onOpenDetail}
      collapsibleSection={{
        title: `现场团队工作饱和度 · IC & Staff (${visiblePeople.length})`,
        summary: fieldworkSummary,
        expanded: fieldworkExpanded,
        onToggle: onToggleFieldwork,
        children: visiblePeople.length ? (
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
        )
      }}
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
  onOpenMemberProgress
}) {
  const [search, setSearch] = useState("");
  const [fieldworkExpanded, setFieldworkExpanded] = useState(false);
  const supervisorEmail = demoEmailOfViewAs(viewAs);
  const pageLabels = viewAs === "em" ? PAGE_LABELS.emCommand : PAGE_LABELS.icCommand;
  const isEmView = viewAs === "em";

  const rollup = useMemo(
    () => buildTeamRollup(projects, tasks, supervisorEmail, viewAs),
    [projects, tasks, supervisorEmail, viewAs]
  );

  const supervisedProjects = useMemo(
    () => getSupervisedProjects(projects, supervisorEmail, viewAs),
    [projects, supervisorEmail, viewAs]
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

  const filteredMatrix = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rollup.riskMatrix;
    return rollup.riskMatrix.filter((row) => (
      `${row.project.clientName} ${row.project.name}`.toLowerCase().includes(query)
    ));
  }, [rollup.riskMatrix, search]);

  const fieldworkSummary = useMemo(() => {
    if (!rollup.summary.headcount) return "";
    return `${rollup.summary.headcount} 人 · 饱和度偏高 ${rollup.summary.highLoadCount} · 适中 ${rollup.summary.mediumLoadCount} · ${rollup.summary.totalOverdue} 项程序逾期`;
  }, [rollup.summary]);

  const searchLabel = isEmView ? "搜索项目 / 成员" : "搜索成员";
  const searchPlaceholder = isEmView
    ? "客户、项目名、成员邮箱..."
    : "邮箱、角色、优先项目...";

  return (
    <section className={`page-shell team-rollup-page ${isEmView ? "progress-board-page management-command-page" : ""}`}>
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
          <span className="label">角色视角 · View as</span>
          <select value={viewAs} onChange={(e) => onViewAsChange(e.target.value)}>
            {VIEW_AS_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="search-field">
          <span className="label">{searchLabel}</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
          />
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
      ) : isEmView ? (
        <EmManagementLayout
          rollup={rollup}
          filteredMatrix={filteredMatrix}
          tasks={tasks}
          visiblePeople={visiblePeople}
          fieldworkExpanded={fieldworkExpanded}
          onToggleFieldwork={() => setFieldworkExpanded((open) => !open)}
          fieldworkSummary={fieldworkSummary}
          onOpenProgress={onOpenProgress}
          onOpenDetail={onOpenDetail}
          onOpenMemberProgress={onOpenMemberProgress}
        />
      ) : (
        <>
          <article className="team-summary-card">
            <div className="team-summary-grid">
              <div>
                <p className="staff-summary-eyebrow">组内概览 · Team Overview</p>
                <h3>{rollup.summary.headcount} 人 · {supervisedProjects.length} 个项目</h3>
              </div>
              <div className="team-summary-stat">
                <span className="team-stat-label">饱和度偏高</span>
                <strong className="load-high-text">{rollup.summary.highLoadCount}</strong>
              </div>
              <div className="team-summary-stat">
                <span className="team-stat-label">饱和度适中</span>
                <strong className="load-medium-text">{rollup.summary.mediumLoadCount}</strong>
              </div>
              <div className="team-summary-stat">
                <span className="team-stat-label">程序逾期</span>
                <strong className="load-high-text">{rollup.summary.totalOverdue}</strong>
              </div>
            </div>
            {rollup.summary.focusCollision ? (
              <p className="team-collision-note">
                多人当前优先项目相同，可能存在资源争抢，建议协调分工。
              </p>
            ) : null}
          </article>

          <ReportDayPanel
            watchlist={rollup.reportWatchlist}
            nearestReport={rollup.nearestReport}
            onOpenProgress={onOpenProgress}
            onOpenDetail={onOpenDetail}
          />

          <section className="team-people-section">
            <h3 className="staff-section-title">组内工作饱和度 · IC & Staff</h3>
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
              所辖项目 ({supervisedProjects.length})
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
