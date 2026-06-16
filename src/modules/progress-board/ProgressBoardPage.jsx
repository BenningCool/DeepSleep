import { useEffect, useMemo, useState } from "react";
import {
  CONTRIBUTOR_FILTER_OPTIONS,
  DRAWER_PREREQUISITE_LABELS,
  KPI_LABELS,
  labelOfProgressStatus
} from "../../data/progressLabels";
import { labelOfContributorGroup } from "../project/contributorGroup";
import {
  buildTaskMap,
  computePhaseProgress,
  computeProgressKpis,
  isBoardProgressMismatch,
  labelOfAuditPhase
} from "./progressBoardUtils";
import { columnTitle } from "../../utils/taskUtils";
import {
  getControlProgressDetail,
  getControlProgressSnapshot
} from "../../services/workspaceProgressService";
import { ProgressAttentionPanel } from "./ProgressAttentionPanel";

function KpiCard({ label, value }) {
  return (
    <div className="progress-kpi">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function statusClass(status) {
  return String(status || "").replaceAll("_", "-");
}

export function ProgressBoardPage({
  project,
  tasks,
  onGoWorkspace,
  onGoBoard,
  focusControlId = ""
}) {
  const [groupFilter, setGroupFilter] = useState("");
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

  const filteredControls = useMemo(() => (
    enrichedControls.filter((control) => (
      !groupFilter || control.contributorGroup === groupFilter
    ))
  ), [enrichedControls, groupFilter]);

  const kpis = useMemo(
    () => computeProgressKpis(filteredControls, taskMap),
    [filteredControls, taskMap]
  );

  const phaseProgress = useMemo(
    () => computePhaseProgress(filteredControls),
    [filteredControls]
  );

  const selectedControl = useMemo(
    () => filteredControls.find((control) => control.id === selectedId) || null,
    [filteredControls, selectedId]
  );

  const detail = useMemo(
    () => (selectedControl ? getControlProgressDetail(selectedControl.id) : null),
    [selectedControl, refreshToken]
  );

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
    if (controlTypeTab === "OTHER" && !otherControls.length) {
      setControlTypeTab("GITC");
    }
  }, [controlTypeTab, otherControls.length]);

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
            <th>状态</th>
            <th>进度</th>
            <th>阶段</th>
          </tr>
        </thead>
        <tbody>
          {controls.map((control) => (
            <tr
              key={control.id}
              className={selectedId === control.id ? "active" : ""}
              onClick={() => setSelectedId(control.id)}
            >
              <td>
                <span className={`control-type inline ${control.controlType.toLowerCase()}`}>
                  {control.controlType}
                </span>
                <span className="progress-control-title">{control.title}</span>
                <small>{control.id}</small>
              </td>
              <td>{control.owner}</td>
              <td>{labelOfContributorGroup(control.contributorGroup)}</td>
              <td>
                <span className={`progress-pill ${statusClass(control.progressStatus)}`}>
                  {labelOfProgressStatus(control.progressStatus)}
                </span>
              </td>
              <td>{control.progressPercent}%</td>
              <td>{labelOfAuditPhase(control.auditPhase)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function refresh() {
    setRefreshToken((value) => value + 1);
  }

  return (
    <section className="progress-board-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Progress · 项目进度</p>
          <h2>{project.clientName || project.name}</h2>
          <p className="page-lead">
            只读鸟瞰：自动汇聚 Scope、看板与工作台数据，无需在此拖拽或编辑。
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
      </div>

      <div className="progress-kpi-row">
        <KpiCard label={KPI_LABELS.total} value={kpis.total} />
        <KpiCard label={KPI_LABELS.completed} value={kpis.completed} />
        <KpiCard label={KPI_LABELS.pending} value={kpis.pending} />
        <KpiCard label={KPI_LABELS.delay} value={kpis.delay} />
      </div>

      {phaseProgress.length ? (
        <section className="progress-phase-bar">
          {phaseProgress.map((phase) => {
            const percent = phase.total ? Math.round((phase.completed / phase.total) * 100) : 0;
            return (
              <div className="phase-item" key={phase.phase}>
                <div className="phase-head">
                  <span>{phase.label}</span>
                  <span>{phase.completed}/{phase.total}</span>
                </div>
                <div className="phase-track">
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      <ProgressAttentionPanel
        controls={filteredControls}
        taskMap={taskMap}
        projectStartDate={project?.startDate || ""}
        selectedId={selectedId}
        onSelect={setSelectedId}
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
              <p>暂无控制点，请先生成 Scope。</p>
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
                <p>{selectedControl.id} · {selectedControl.owner}</p>
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
                  <span className={`progress-pill ${statusClass(selectedControl.progressStatus)}`}>
                    {labelOfProgressStatus(selectedControl.progressStatus)}
                  </span>
                </div>
                {isBoardProgressMismatch(selectedControl) ? (
                  <p className="progress-status-hint">看板已推进，底稿尚未齐备。</p>
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
                  <button
                    className="button subtle"
                    type="button"
                    onClick={() => onGoBoard(blockerTitles[0].id)}
                  >
                    {DRAWER_PREREQUISITE_LABELS.goBoard}
                  </button>
                </div>
              ) : null}

              <div className="progress-detail-block">
                <h4>测试摘要</h4>
                <p>{detail.testContent.objective || "尚未填写测试目标。"}</p>
                <p>{detail.testContent.procedure || "尚未填写测试程序。"}</p>
              </div>

              <div className="progress-detail-block">
                <h4>材料</h4>
                <p>会议纪要 {detail.materials.filter((item) => item.category === "meeting_minutes").length} 份</p>
                <p>测试资料 {detail.materials.filter((item) => item.category === "evidence").length} 份</p>
              </div>

              <div className="panel-footer-actions">
                <button className="button" type="button" onClick={() => onGoBoard(selectedControl.id)}>
                  去看板
                </button>
                <button className="button primary" type="button" onClick={() => onGoWorkspace(selectedControl.id)}>
                  去工作台
                </button>
                <button className="button subtle" type="button" onClick={refresh}>刷新</button>
              </div>
            </>
          ) : (
            <div className="empty-state compact">
              <p>选择控制点查看只读详情。</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
