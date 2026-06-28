import { useMemo, useState } from "react";
import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS } from "../../data/pageLabels";
import {
  getEngagementTypeProfile,
  projectTypeSkinClass
} from "../../data/engagementTypeProfiles";
import { demoEmailOfViewAs, labelOfViewAs, VIEW_AS_OPTIONS } from "../../data/viewAsPresets";
import { labelOfTeam } from "../../data/projectConstants";
import {
  formatWorkspaceStatusSummary,
  WorkspaceStatusOverviewBar
} from "../progress-board/WorkspaceStatusOverviewBar";
import { formatReportCountdown, ledTeamLabel } from "./commandCenterUtils";
import {
  buildStaffPortfolio,
  computeStaffSaturation,
  formatStaffAssignmentSummary,
  pickFocusProjectEntry
} from "./staffWorkloadUtils";

function SaturationBar({ percent, levelClass }) {
  return (
    <div className={`staff-saturation-bar ${levelClass}`} aria-hidden="true">
      <span className="staff-saturation-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

function StaffProjectRow({ entry, isFocus, onOpenProgress, onOpenDetail }) {
  const { project } = entry;
  const profile = getEngagementTypeProfile(project.projectType);
  const reportLabel = formatReportCountdown(project.reportDate);

  return (
    <article
      className={[
        "staff-project-row",
        projectTypeSkinClass(project.projectType),
        isFocus ? "is-focus" : ""
      ].filter(Boolean).join(" ")}
      style={{ "--type-accent": profile.color }}
    >
      <div className="staff-project-accent" aria-hidden="true" />
      <div className="staff-project-body">
        <div className="staff-project-head">
          <div>
            <span className="type-badge">{profile.badge}</span>
            {isFocus ? <span className="staff-focus-badge">当前主攻</span> : null}
            {entry.overdue ? (
              <span className="command-overdue-pill">逾期 {entry.overdue}</span>
            ) : null}
          </div>
          {reportLabel ? <span className="command-report-pill">{reportLabel}</span> : null}
        </div>
        <p className="staff-project-client">{project.clientName || "未填写客户"}</p>
        <h3>{project.name}</h3>
        <p className="staff-project-meta">
          {ledTeamLabel(project.team)} · {labelOfTeam(project.team)}
          {entry.assignedTotal ? ` · ${entry.assignedTotal} 个指派测试点` : ""}
        </p>
        {entry.assignedTotal ? (
          <div className="staff-project-progress">
            <WorkspaceStatusOverviewBar breakdown={entry.breakdown} />
            <p className="staff-project-progress-meta">
              {formatWorkspaceStatusSummary(entry.breakdown)}
            </p>
          </div>
        ) : (
          <p className="staff-project-empty-note">{formatStaffAssignmentSummary(entry)}</p>
        )}
        <div className="command-card-actions">
          <button
            className="button primary"
            type="button"
            onClick={() => onOpenProgress(project.id)}
          >
            我的测试点
          </button>
          <button
            className="button subtle"
            type="button"
            onClick={() => onOpenDetail(project.id)}
          >
            项目概览
          </button>
        </div>
      </div>
    </article>
  );
}

export function StaffCommandView({
  projects,
  tasks,
  viewAs,
  onViewAsChange,
  onOpenProgress,
  onOpenDetail
}) {
  const [search, setSearch] = useState("");
  const staffEmail = demoEmailOfViewAs("staff");

  const portfolio = useMemo(
    () => buildStaffPortfolio(projects, tasks, staffEmail),
    [projects, tasks, staffEmail]
  );

  const saturation = useMemo(
    () => computeStaffSaturation(portfolio),
    [portfolio]
  );

  const focusEntry = useMemo(
    () => pickFocusProjectEntry(portfolio),
    [portfolio]
  );

  const visiblePortfolio = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return portfolio;
    return portfolio.filter((entry) => {
      const { project } = entry;
      const haystack = [
        project.clientName,
        project.name,
        project.id,
        labelOfTeam(project.team)
      ].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [portfolio, search]);

  const otherEntries = visiblePortfolio.filter(
    (entry) => !focusEntry || entry.project.id !== focusEntry.project.id
  );

  return (
    <section className="page-shell staff-command-page">
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
          <span className="label">搜索我的项目</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="客户、项目名..."
          />
        </label>
      </div>

      <p className="command-view-hint">
        当前视角：<strong>{labelOfViewAs(viewAs)}</strong> · 跨项目个人工作全景（仅展示参与或有指派的项目）
      </p>

      {!portfolio.length ? (
        <div className="empty-state large">
          <h3>暂无参与项目</h3>
          <p>当前演示账号尚未加入任何项目，或未指派测试点。</p>
        </div>
      ) : (
        <>
          <article className={`staff-summary-card ${saturation.levelClass}`}>
            <div className="staff-summary-head">
              <div>
                <p className="staff-summary-eyebrow">Overall Load · 整体负荷</p>
                <h3>
                  {saturation.assignedTotal} 个测试点
                  <span className="staff-summary-sub">
                    · {saturation.projectCount} 个项目 · 负荷 {saturation.level}
                  </span>
                </h3>
              </div>
              <strong className="staff-summary-percent">{saturation.percent}%</strong>
            </div>
            <SaturationBar percent={saturation.percent} levelClass={saturation.levelClass} />
            <p className="staff-summary-meta">
              未开始 {saturation.notStarted} · 测试中 {saturation.inProgress} · 逾期 {saturation.overdue}
            </p>
          </article>

          {focusEntry ? (
            <section className="staff-focus-section">
              <h3 className="staff-section-title">当前主攻 · Active Focus</h3>
              <StaffProjectRow
                entry={focusEntry}
                isFocus
                onOpenProgress={onOpenProgress}
                onOpenDetail={onOpenDetail}
              />
            </section>
          ) : null}

          {otherEntries.length ? (
            <section className="staff-projects-section">
              <h3 className="staff-section-title">
                参与项目 · My Engagements ({otherEntries.length})
              </h3>
              <div className="staff-project-list">
                {otherEntries.map((entry) => (
                  <StaffProjectRow
                    key={entry.project.id}
                    entry={entry}
                    onOpenProgress={onOpenProgress}
                    onOpenDetail={onOpenDetail}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </section>
  );
}
