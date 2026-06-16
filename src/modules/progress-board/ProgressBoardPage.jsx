import { useEffect, useMemo, useState } from "react";
import {
  ATTENTION_LABELS,
  CONTRIBUTOR_FILTER_OPTIONS,
  DRAWER_PREREQUISITE_LABELS,
  DRAWER_WORKSPACE_LABELS,
  PROGRESS_LIST_LABELS,
  labelOfProgressStatus,
  labelOfWorkspaceStatus
} from "../../data/progressLabels";
import { labelOfContributorGroup } from "../project/contributorGroup";
import {
  buildTaskMap,
  isBoardProgressMismatch,
  labelOfAuditPhase
} from "./progressBoardUtils";
import { columnTitle } from "../../utils/taskUtils";
import {
  getControlProgressDetail,
  getControlProgressSnapshot,
  PROGRESS_STATUS
} from "../../services/workspaceProgressService";
import { ProgressAttentionPanel } from "./ProgressAttentionPanel";
import { ProgressDashboard } from "./ProgressDashboard";
import { isControlOverdue } from "./attentionItemsUtils";
import { countControlsWithPlanDue, daysOverdueForControl } from "./progressDueUtils";
import { workspaceStatusClass } from "./progressVisualTokens";

function statusClass(status) {
  return workspaceStatusClass(status);
}

function formatNodePhase(control) {
  const tod = control.phaseProgress?.tod;
  const toe = control.phaseProgress?.toe;
  const parts = [`${control.completedNodes || 0}/${control.totalNodes || 0}`];
  if (tod) parts.push(`TOD ${tod.completedNodes}/${tod.totalNodes}`);
  if (toe) parts.push(`TOE ${toe.completedNodes}/${toe.totalNodes}`);
  return parts.join(" · ");
}

export function ProgressBoardPage({
  project,
  tasks,
  onGoWorkspace,
  onGoBoard,
  focusControlId = "",
  dataRefreshKey = 0
}) {
  const [groupFilter, setGroupFilter] = useState("");
  const [workspaceStatusFilter, setWorkspaceStatusFilter] = useState("");
  const [overdueOnlyFilter, setOverdueOnlyFilter] = useState(false);
  const [controlTypeTab, setControlTypeTab] = useState("GITC");
  const [selectedId, setSelectedId] = useState(focusControlId);
  const [refreshToken, setRefreshToken] = useState(0);

  const taskMap = useMemo(() => buildTaskMap(tasks), [tasks]);

  const snapshot = useMemo(
    () => getControlProgressSnapshot(project?.id || "", tasks),
    [project?.id, tasks, refreshToken]
  );

  const enrichedControls = useMemo(() => (
    snapshot.controls.map((control) => ({
      ...control,
      contributorGroup: taskMap[control.id]?.contributorGroup || "audit"
    }))
  ), [snapshot.controls, taskMap]);

  const groupFilteredControls = useMemo(() => (
    enrichedControls.filter((control) => (
      !groupFilter || control.contributorGroup === groupFilter
    ))
  ), [enrichedControls, groupFilter]);

  const statusFilteredControls = useMemo(() => (
    groupFilteredControls.filter((control) => (
      !workspaceStatusFilter || control.workspaceStatus === workspaceStatusFilter
    ))
  ), [groupFilteredControls, workspaceStatusFilter]);

  const overdueFilteredControls = useMemo(() => {
    if (!overdueOnlyFilter) return statusFilteredControls;
    return statusFilteredControls.filter((control) => (
      isControlOverdue(control, taskMap[control.id])
    ));
  }, [statusFilteredControls, overdueOnlyFilter, taskMap]);

  const filteredControls = overdueFilteredControls;

  const attentionControls = groupFilteredControls;

  const selectedControl = useMemo(
    () => groupFilteredControls.find((control) => control.id === selectedId)
      || enrichedControls.find((control) => control.id === selectedId)
      || null,
    [groupFilteredControls, enrichedControls, selectedId]
  );

  const detail = useMemo(() => {
    if (!selectedControl) return null;
    return getControlProgressDetail(
      selectedControl.id,
      taskMap[selectedControl.id],
      tasks
    );
  }, [selectedControl, taskMap, tasks, refreshToken]);

  const blockerTitles = useMemo(() => {
    if (!selectedControl?.blockers?.length) return [];
    return selectedControl.blockers.map((id) => ({
      id,
      title: taskMap[id]?.title || id
    }));
  }, [selectedControl, taskMap]);

  const gitcControls = useMemo(
    () => filteredControls.filter((control) => control.controlType === "GITC"),
    [filteredControls]
  );

  const itacControls = useMemo(
    () => filteredControls.filter((control) => control.controlType === "ITAC"),
    [filteredControls]
  );

  const otherControls = useMemo(
    () => filteredControls.filter(
      (control) => control.controlType !== "GITC" && control.controlType !== "ITAC"
    ),
    [filteredControls]
  );

  const controlTypeTabs = useMemo(() => {
    const tabs = [
      { id: "GITC", label: "GITC", count: gitcControls.length },
      { id: "ITAC", label: "ITAC", count: itacControls.length }
    ];
    if (otherControls.length) {
      tabs.push({ id: "OTHER", label: "其他", count: otherControls.length });
    }
    return tabs;
  }, [gitcControls.length, itacControls.length, otherControls.length]);

  const activeTypeControls = useMemo(() => {
    if (controlTypeTab === "ITAC") return itacControls;
    if (controlTypeTab === "OTHER") return otherControls;
    return gitcControls;
  }, [controlTypeTab, gitcControls, itacControls, otherControls]);

  useEffect(() => {
    setRefreshToken((value) => value + 1);
  }, [dataRefreshKey]);

  useEffect(() => {
    if (!focusControlId) return;
    setSelectedId(focusControlId);
  }, [focusControlId]);

  useEffect(() => {
    if (!selectedId) return;
    if (!groupFilteredControls.some((control) => control.id === selectedId)) {
      setSelectedId("");
    }
  }, [groupFilteredControls, selectedId]);

  useEffect(() => {
    if (controlTypeTab === "OTHER" && !otherControls.length) {
      setControlTypeTab("GITC");
    }
  }, [controlTypeTab, otherControls.length]);

  function refresh() {
    setRefreshToken((value) => value + 1);
  }

  function handleSelectControl(id) {
    if (!id) return;
    setSelectedId(id);
  }

  function handleWorkspaceStatusFilter(status) {
    setWorkspaceStatusFilter(status);
    if (status) setOverdueOnlyFilter(false);
  }

  function handleOverdueFilter() {
    if (!countControlsWithPlanDue(groupFilteredControls, taskMap)) return;
    setOverdueOnlyFilter((value) => !value);
    if (!overdueOnlyFilter) setWorkspaceStatusFilter("");
  }

  function renderFieldReviewSummary(summary = {}) {
    const open = summary.open || 0;
    const replied = summary.replied || 0;
    const accepted = summary.accepted || 0;
    if (!open && !replied && !accepted) {
      return <p>暂无字段级复核意见。</p>;
    }
    return (
      <p>
        待回复 {open} · 已回复 {replied} · 已接受 {accepted}
      </p>
    );
  }

  function renderControlTable(controls, emptyText) {
    if (!controls.length) {
      return (
        <div className="empty-state compact">
          <p>{emptyText}</p>
        </div>
      );
    }

    return (
      <table className="progress-table">
        <thead>
          <tr>
            <th>控制点</th>
            <th>负责人</th>
            <th>负责组</th>
            <th>底稿状态</th>
            <th>节点进度</th>
            <th>阶段</th>
          </tr>
        </thead>
        <tbody>
          {controls.map((control) => {
            const task = taskMap[control.id];
            const overdueDays = daysOverdueForControl(control, task);
            const rowOverdue = isControlOverdue(control, task);

            return (
              <tr
                key={control.id}
                className={[
                  selectedId === control.id ? "active" : "",
                  rowOverdue ? "progress-row-overdue" : ""
                ].filter(Boolean).join(" ")}
                onClick={() => setSelectedId(control.id)}
              >
                <td>
                  <span className={`control-type inline ${control.controlType.toLowerCase()}`}>
                    {control.controlType}
                  </span>
                  {rowOverdue ? (
                    <span className="progress-flag overdue compact">
                      {ATTENTION_LABELS.overdueBadge}
                      {overdueDays ? ` ${overdueDays}天` : ""}
                    </span>
                  ) : null}
                  <span className="progress-control-title">{control.title}</span>
                  <small>{control.id}</small>
                  {control.progressStatus === PROGRESS_STATUS.BLOCKED ? (
                    <small className="progress-inline-flag blocked">被阻塞</small>
                  ) : null}
                </td>
                <td>{control.owner}</td>
                <td>{labelOfContributorGroup(control.contributorGroup)}</td>
                <td>
                  <span className={`progress-pill workspace-status ${statusClass(control.workspaceStatus)}`}>
                    {labelOfWorkspaceStatus(control.workspaceStatus)}
                  </span>
                  {control.progressStatus !== control.workspaceStatus
                    && control.progressStatus !== PROGRESS_STATUS.BLOCKED ? (
                      <small className="progress-inline-sub">
                        {labelOfProgressStatus(control.progressStatus)}
                      </small>
                    ) : null}
                </td>
                <td>{formatNodePhase(control)}</td>
                <td>{labelOfAuditPhase(control.auditPhase)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <section className="progress-board-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Progress Board · 项目进度看板</p>
          <h2>{project.clientName || project.name}</h2>
          <p className="page-lead">
            摘要仪表盘 + 控制点明细：底稿进度来自工作台 snapshot。三态 KPI + 逾期风险，便于合伙人/经理鸟瞰全局。
          </p>
        </div>
      </header>

      <div className="progress-filter-row">
        {CONTRIBUTOR_FILTER_OPTIONS.map((option) => (
          <button
            key={option.id || "all"}
            type="button"
            className={`filter-chip ${groupFilter === option.id ? "active" : ""}`}
            onClick={() => setGroupFilter(option.id)}
          >
            {option.label}
          </button>
        ))}

        {workspaceStatusFilter ? (
          <button
            type="button"
            className="filter-chip active subtle-clear"
            onClick={() => setWorkspaceStatusFilter("")}
          >
            清除状态筛选 · {labelOfWorkspaceStatus(workspaceStatusFilter)}
          </button>
        ) : null}
        {overdueOnlyFilter ? (
          <button
            type="button"
            className="filter-chip active subtle-clear overdue-clear"
            onClick={() => setOverdueOnlyFilter(false)}
          >
            清除逾期筛选
          </button>
        ) : null}
      </div>

      <ProgressDashboard
        project={project}
        summaryControls={groupFilteredControls}
        detailControls={filteredControls}
        memberControls={groupFilteredControls}
        taskMap={taskMap}
        groupFilter={groupFilter}
        workspaceStatusFilter={workspaceStatusFilter}
        overdueOnlyFilter={overdueOnlyFilter}
        onWorkspaceStatusFilter={handleWorkspaceStatusFilter}
        onOverdueFilter={handleOverdueFilter}
        onSelectControl={handleSelectControl}
      />

      {!filteredControls.length && groupFilteredControls.length ? (
        <div className="empty-state compact progress-filter-empty">
          <p>{PROGRESS_LIST_LABELS.filterEmpty}</p>
        </div>
      ) : null}

      <ProgressAttentionPanel
        controls={attentionControls}
        taskMap={taskMap}
        projectStartDate={project?.startDate || ""}
        selectedId={selectedId}
        onSelect={handleSelectControl}
      />

      <div className="progress-main-grid">
        <section className="progress-table-panel">
          <div className="progress-table-head">
            <h3>控制点列表</h3>
            {filteredControls.length ? (
              <div className="progress-type-tabs">
                {controlTypeTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`filter-chip ${controlTypeTab === tab.id ? "active" : ""}`}
                    onClick={() => setControlTypeTab(tab.id)}
                  >
                    {tab.label} · {tab.count}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {filteredControls.length ? (
            renderControlTable(
              activeTypeControls,
              `当前筛选下暂无 ${controlTypeTab === "OTHER" ? "其他" : controlTypeTab} 控制点。`
            )
          ) : (
            <div className="empty-state compact">
              <p>暂无控制点，请先生成 Scope 或调整筛选条件。</p>
            </div>
          )}
        </section>

        <aside className="progress-drawer-panel">
          {selectedControl && detail ? (
            <>
              <div className="progress-drawer-head">
                <span className={`control-type ${selectedControl.controlType.toLowerCase()}`}>
                  {selectedControl.controlType}
                </span>
                <h3>{selectedControl.title}</h3>
                <p>{selectedControl.id} · {selectedControl.owner || "未分配"}</p>
              </div>

              <div className="progress-dual-status">
                <div className="dual-status-row">
                  <span className="dual-status-label">执行状态（看板）</span>
                  <span className="progress-pill board-status">
                    {columnTitle(selectedControl.taskStatus)}
                  </span>
                </div>
                <div className="dual-status-row">
                  <span className="dual-status-label">底稿状态（工作台）</span>
                  <span className={`progress-pill workspace-status ${statusClass(selectedControl.workspaceStatus)}`}>
                    {labelOfWorkspaceStatus(selectedControl.workspaceStatus)}
                  </span>
                </div>
                <div className="dual-status-row">
                  <span className="dual-status-label">{DRAWER_WORKSPACE_LABELS.detailProgress}</span>
                  <span className={`progress-pill ${statusClass(selectedControl.progressStatus)}`}>
                    {labelOfProgressStatus(selectedControl.progressStatus)}
                  </span>
                </div>
                {isBoardProgressMismatch(selectedControl) ? (
                  <p className="progress-status-hint">{DRAWER_WORKSPACE_LABELS.mismatchHint}</p>
                ) : null}
              </div>

              {blockerTitles.length ? (
                <div className="progress-prerequisite-block">
                  <h4>{DRAWER_PREREQUISITE_LABELS.title}</h4>
                  <ul className="progress-prerequisite-list">
                    {blockerTitles.map((item) => (
                      <li key={item.id}>
                        <strong>{item.title}</strong>
                        <span>{item.id} · 看板 {columnTitle(taskMap[item.id]?.status)}</span>
                      </li>
                    ))}
                  </ul>
                  {onGoBoard ? (
                    <button
                      className="button subtle"
                      type="button"
                      onClick={() => onGoBoard(blockerTitles[0].id)}
                    >
                      {DRAWER_PREREQUISITE_LABELS.goBoard}
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className="progress-detail-block">
                <h4>{DRAWER_WORKSPACE_LABELS.workspaceSummary}</h4>
                <p>
                  {DRAWER_WORKSPACE_LABELS.nodeProgress}：
                  {selectedControl.completedNodes}/{selectedControl.totalNodes}
                  {selectedControl.phaseProgress?.tod
                    ? ` · TOD ${selectedControl.phaseProgress.tod.completedNodes}/${selectedControl.phaseProgress.tod.totalNodes}`
                    : ""}
                  {selectedControl.phaseProgress?.toe
                    ? ` · TOE ${selectedControl.phaseProgress.toe.completedNodes}/${selectedControl.phaseProgress.toe.totalNodes}`
                    : ""}
                </p>
                <p>
                  {DRAWER_WORKSPACE_LABELS.milestones}：
                  Planning {selectedControl.milestones?.planning ? "✓" : "—"}
                  {selectedControl.milestoneActors?.planning
                    ? ` (${selectedControl.milestoneActors.planning})`
                    : ""}
                  {" · "}
                  Review {selectedControl.milestones?.review ? "✓" : "—"}
                  {selectedControl.milestoneActors?.review
                    ? ` (${selectedControl.milestoneActors.review})`
                    : ""}
                </p>
              </div>

              <div className="progress-detail-block">
                <h4>{DRAWER_WORKSPACE_LABELS.materials}</h4>
                <p>
                  SPP {selectedControl.sppCount || 0} · 会议纪要 {selectedControl.meetingMinutesCount || 0}
                  {" · "}测试资料 {selectedControl.evidenceCount || 0}
                </p>
              </div>

              <div className="progress-detail-block">
                <h4>{DRAWER_WORKSPACE_LABELS.fieldReviews}</h4>
                {renderFieldReviewSummary(selectedControl.fieldReviewSummary)}
              </div>

              <div className="progress-detail-block">
                <h4>测试摘要</h4>
                <p>{detail.nodeResponses?.["tod-objective"] || detail.testContent.objective || "尚未填写测试目标。"}</p>
                <p>{detail.nodeResponses?.["toe-procedure"] || detail.testContent.procedure || "尚未填写测试程序。"}</p>
              </div>

              <div className="panel-footer-actions">
                {onGoBoard ? (
                  <button className="button" type="button" onClick={() => onGoBoard(selectedControl.id)}>
                    去看板
                  </button>
                ) : null}
                <button className="button primary" type="button" onClick={() => onGoWorkspace(selectedControl.id)}>
                  去工作台
                </button>
                <button className="button subtle" type="button" onClick={refresh}>刷新</button>
              </div>
            </>
          ) : (
            <div className="empty-state compact">
              <p>选择控制点或点击「近期动态」「需关注事项」中的条目，查看只读详情。</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
