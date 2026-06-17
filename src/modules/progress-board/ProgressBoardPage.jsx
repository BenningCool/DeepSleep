import { useEffect, useMemo, useState } from "react";
import {
  ATTENTION_LABELS,
  CONTRIBUTOR_FILTER_OPTIONS,
  DRAWER_WORKSPACE_LABELS,
  labelOfProgressStatus,
  labelOfWorkspaceStatus,
  PROGRESS_LIST_LABELS
} from "../../data/progressLabels";
import { labelOfContributorGroup } from "../project/contributorGroup";
import {
  buildTaskMap,
  controlTypeClass,
  isBoardProgressMismatch
} from "./progressBoardUtils";
import {
  getControlProgressDetail,
  getControlProgressSnapshot,
  PROGRESS_STATUS
} from "../../services/workspaceProgressService";
import { ProgressAttentionPanel } from "./ProgressAttentionPanel";
import { ProgressDashboard } from "./ProgressDashboard";
import { ControlNodeProgressDisplay } from "./ControlNodeProgressDisplay";
import { ProgressOwnerLabel } from "./ProgressOwnerLabel";
import { isControlOverdue } from "./attentionItemsUtils";
import { daysOverdueForControl, resolveControlPlanDue } from "./progressDueUtils";
import { workspaceStatusClass } from "./progressVisualTokens";
import { ProgressOwnerFilter } from "./ProgressOwnerFilter";
import { matchesOwnerFilter } from "./progressOwnerUtils";
import { collectNodeDueDateEntries } from "./progressNodeDisplay";

function statusClass(status) {
  return workspaceStatusClass(status);
}

function formatNodeDueDatesList(detail) {
  const entries = collectNodeDueDateEntries(detail);
  const showPhase = new Set(entries.map((entry) => entry.phaseId).filter(Boolean)).size > 1;

  if (!entries.length) {
    return <p className="progress-node-due-empty">—</p>;
  }

  return (
    <ul className="progress-node-due-list">
      {entries.map((entry) => (
        <li key={entry.id}>
          <span className="progress-node-due-copy">
            {showPhase && entry.phaseId ? (
              <span className="progress-node-due-phase">{entry.phaseId.toUpperCase()}</span>
            ) : null}
            <span className="progress-node-due-label">{entry.label}</span>
          </span>
          <span className="progress-node-due-date">{entry.dueDate || "—"}</span>
        </li>
      ))}
    </ul>
  );
}

function formatMaterialSummary(control) {
  const parts = [
    `Policy ${control.policyCount || 0}`,
    `Minutes ${control.meetingMinutesCount || 0}`,
    `Supporting Materials ${control.supportingMaterialCount || 0}`,
    `SPP ${control.sppCount || 0}`,
    `Test Evidence ${control.evidenceCount || 0}`
  ];

  if (control.requirementListCount) {
    parts.push(`Requirement List ${control.requirementListCount}`);
  }
  if (control.samplePoolCount) {
    parts.push(`Sample Population ${control.samplePoolCount}`);
  }
  if (control.returnedSampleSupportCount) {
    parts.push(`Returned Materials ${control.returnedSampleSupportCount}`);
  }

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
  const [ownerFilter, setOwnerFilter] = useState("");
  const [controlTypeTab, setControlTypeTab] = useState("ALL");
  const [selectedId, setSelectedId] = useState(focusControlId);
  const [refreshToken, setRefreshToken] = useState(0);

  const taskMap = useMemo(() => buildTaskMap(tasks), [tasks]);

  const snapshot = useMemo(
    () => getControlProgressSnapshot(project?.id || "", tasks),
    [project?.id, tasks, refreshToken]
  );

  const enrichedControls = useMemo(() => (
    (snapshot?.controls || []).map((control) => ({
      ...control,
      contributorGroup: taskMap[control.id]?.contributorGroup || "audit"
    }))
  ), [snapshot?.controls, taskMap]);

  const groupFilteredControls = useMemo(() => (
    enrichedControls.filter((control) => (
      !groupFilter || control.contributorGroup === groupFilter
    ))
  ), [enrichedControls, groupFilter]);

  const filteredControls = useMemo(() => (
    groupFilteredControls.filter((control) => matchesOwnerFilter(control, ownerFilter))
  ), [groupFilteredControls, ownerFilter]);

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
      { id: "ALL", label: "All", count: filteredControls.length },
      { id: "GITC", label: "GITC", count: gitcControls.length },
      { id: "ITAC", label: "ITAC", count: itacControls.length }
    ];
    if (otherControls.length) {
      tabs.push({ id: "OTHER", label: "Other", count: otherControls.length });
    }
    return tabs;
  }, [filteredControls.length, gitcControls.length, itacControls.length, otherControls.length]);

  const activeTypeControls = useMemo(() => {
    if (controlTypeTab === "ALL") return filteredControls;
    if (controlTypeTab === "ITAC") return itacControls;
    if (controlTypeTab === "OTHER") return otherControls;
    return gitcControls;
  }, [controlTypeTab, filteredControls, gitcControls, itacControls, otherControls]);

  useEffect(() => {
    setRefreshToken((value) => value + 1);
  }, [dataRefreshKey]);

  useEffect(() => {
    if (!focusControlId) return;
    setSelectedId(focusControlId);
  }, [focusControlId]);

  useEffect(() => {
    if (!selectedId) return;
    if (!filteredControls.some((control) => control.id === selectedId)) {
      setSelectedId("");
    }
  }, [filteredControls, selectedId]);

  useEffect(() => {
    if (!ownerFilter) return;
    const stillValid = groupFilteredControls.some((control) => matchesOwnerFilter(control, ownerFilter));
    if (!stillValid) {
      setOwnerFilter("");
    }
  }, [groupFilteredControls, ownerFilter]);

  useEffect(() => {
    if (controlTypeTab === "OTHER" && !otherControls.length) {
      setControlTypeTab("ALL");
    }
  }, [controlTypeTab, otherControls.length]);

  function refresh() {
    setRefreshToken((value) => value + 1);
  }

  function handleSelectControl(id) {
    if (!id) return;
    setSelectedId(id);
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
            <th>Test Points</th>
            <th>Owner</th>
            <th>Owner Group</th>
            <th>Test Point Status</th>
            <th>Node Progress</th>
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
                  <span className={`control-type inline ${controlTypeClass(control.controlType)}`}>
                    {control.controlType || "TASK"}
                  </span>
                  {rowOverdue ? (
                    <span className="progress-flag overdue compact">
                      {ATTENTION_LABELS.overdueBadge}
                      {overdueDays ? ` ${overdueDays}d` : ""}
                    </span>
                  ) : null}
                  <span className="progress-control-title">{control.title}</span>
                  <small>{control.id}</small>
                </td>
                <td className="progress-owner-cell">
                  <ProgressOwnerLabel owner={control.owner} />
                </td>
                <td className="progress-group-cell">{labelOfContributorGroup(control.contributorGroup)}</td>
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
                <td className="progress-node-cell">
                  <ControlNodeProgressDisplay control={control} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (!project) {
    return (
      <section className="progress-board-page">
        <div className="empty-state compact">
          <p>Current project not found. Re-enter from Project List.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="progress-board-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Progress Board · Project Progress Board</p>
          <h2>{project.clientName || project.name}</h2>
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

      </div>

      <ProgressDashboard
        project={project}
        summaryControls={groupFilteredControls}
        detailControls={filteredControls}
        memberControls={groupFilteredControls}
        taskMap={taskMap}
        groupFilter={groupFilter}
        ownerFilter={ownerFilter}
        ownerFilterControls={groupFilteredControls}
        onOwnerFilterChange={setOwnerFilter}
        onSelectControl={handleSelectControl}
      />

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
            <h3>Test Point List</h3>
            {groupFilteredControls.length ? (
              <div className="progress-table-tools">
                <ProgressOwnerFilter
                  project={project}
                  groupFilter={groupFilter}
                  controls={groupFilteredControls}
                  value={ownerFilter}
                  onChange={setOwnerFilter}
                />
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
              </div>
            ) : null}
          </div>
          {groupFilteredControls.length ? (
            renderControlTable(
              activeTypeControls,
              ownerFilter
                ? PROGRESS_LIST_LABELS.filterEmpty
                : controlTypeTab === "ALL"
                  ? "No test points under the current filters."
                  : `No ${controlTypeTab === "OTHER" ? "Other" : controlTypeTab} test points under the current filters.`
            )
          ) : (
            <div className="empty-state compact">
              <p>No test points yet. Create a test point in Workspace or adjust filters.</p>
            </div>
          )}
        </section>

        <aside className="progress-drawer-panel">
          {selectedControl && detail ? (
            <div className="progress-drawer-shell">
              <div className="progress-drawer-scroll">
                <div className="progress-drawer-head">
                  <span className={`control-type ${controlTypeClass(selectedControl.controlType)}`}>
                    {selectedControl.controlType || "TASK"}
                  </span>
                  <h3>{selectedControl.title}</h3>
                  <p>
                    {selectedControl.id}
                    {" · "}
                    <ProgressOwnerLabel owner={selectedControl.owner || "Unassigned"} />
                  </p>
                </div>

                <div className="progress-dual-status">
                  <div className="dual-status-row">
                    <span className="dual-status-label">Test Point Status</span>
                    <div className="progress-status-value">
                      <span className={`progress-pill workspace-status ${statusClass(selectedControl.workspaceStatus)}`}>
                        {labelOfWorkspaceStatus(selectedControl.workspaceStatus)}
                      </span>
                      {selectedControl.progressStatus !== selectedControl.workspaceStatus
                        && selectedControl.progressStatus !== PROGRESS_STATUS.BLOCKED ? (
                          <small className="progress-inline-sub">
                            {labelOfProgressStatus(selectedControl.progressStatus)}
                          </small>
                        ) : null}
                    </div>
                  </div>
                  <div className="dual-status-row dual-status-row-node-progress">
                    <span className="dual-status-label">{DRAWER_WORKSPACE_LABELS.detailProgress}</span>
                    <ControlNodeProgressDisplay control={selectedControl} align="right" />
                  </div>
                  {isBoardProgressMismatch(selectedControl) ? (
                    <p className="progress-status-hint">{DRAWER_WORKSPACE_LABELS.mismatchHint}</p>
                  ) : null}
                </div>

                <div className="progress-detail-block progress-drawer-fill">
                  <h4>{DRAWER_WORKSPACE_LABELS.workspaceSummary}</h4>
                  <p>
                    {ATTENTION_LABELS.dueLabel}:
                    {resolveControlPlanDue(selectedControl, taskMap[selectedControl.id]) || "—"}
                  </p>
                  <div className="progress-detail-subfield progress-drawer-due-field">
                    <strong>{DRAWER_WORKSPACE_LABELS.nodeDueDates}</strong>
                    {formatNodeDueDatesList(detail)}
                  </div>
                </div>

                <div className="progress-detail-block">
                  <h4>{DRAWER_WORKSPACE_LABELS.materials}</h4>
                  <p>{formatMaterialSummary(selectedControl)}</p>
                </div>
              </div>

              <div className="panel-footer-actions progress-drawer-footer">
                {onGoBoard ? (
                  <button className="button" type="button" onClick={() => onGoBoard(selectedControl.id)}>
                    Go to Kanban
                  </button>
                ) : null}
                <button className="button primary" type="button" onClick={() => onGoWorkspace(selectedControl.id)}>
                  Go to Workspace
                </button>
                <button className="button subtle" type="button" onClick={refresh}>Refresh</button>
              </div>
            </div>
          ) : (
            <div className="progress-drawer-placeholder">
              <p>Select a test point or click an item in Recent Activity or Attention Items to view read-only details.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
