import { useEffect, useMemo, useState } from "react";
import {
  EVIDENCE_STATUS,
  MATERIAL_CATEGORY,
  NODE_STATUS,
  PROGRESS_STATUS,
  REVIEW_STATUS,
  addWorkspaceMaterial,
  getControlProgressDetail,
  getControlProgressSnapshot,
  removeWorkspaceMaterial,
  upsertControlProgress
} from "../../services/workspaceProgressService";

const PROGRESS_LABELS = {
  [PROGRESS_STATUS.NOT_STARTED]: "未开始",
  [PROGRESS_STATUS.IN_PROGRESS]: "测试中",
  [PROGRESS_STATUS.EVIDENCE_SUBMITTED]: "证据已提交",
  [PROGRESS_STATUS.PENDING_REVIEW]: "待复核",
  [PROGRESS_STATUS.NEEDS_REWORK]: "待补充",
  [PROGRESS_STATUS.COMPLETED]: "已完成",
  [PROGRESS_STATUS.BLOCKED]: "被阻塞"
};

const EVIDENCE_LABELS = {
  [EVIDENCE_STATUS.NONE]: "无资料",
  [EVIDENCE_STATUS.PARTIAL_UPLOADED]: "部分上传",
  [EVIDENCE_STATUS.UPLOADED]: "已上传",
  [EVIDENCE_STATUS.APPROVED]: "已认可",
  [EVIDENCE_STATUS.REJECTED]: "需修订"
};

const REVIEW_LABELS = {
  [REVIEW_STATUS.NOT_SUBMITTED]: "未提交",
  [REVIEW_STATUS.PENDING_REVIEW]: "待复核",
  [REVIEW_STATUS.COMMENTED]: "有复核意见",
  [REVIEW_STATUS.SIGNED_OFF]: "已签核"
};

const MATERIAL_LABELS = {
  [MATERIAL_CATEGORY.SPP]: "SPP",
  [MATERIAL_CATEGORY.MEETING_MINUTES]: "会议纪要",
  [MATERIAL_CATEGORY.EVIDENCE]: "测试资料"
};

const emptyDetail = {
  testContent: {
    objective: "",
    procedure: "",
    sampleInfo: "",
    result: ""
  },
  nodeResponses: {},
  materials: [],
  phases: [],
  completedNodes: 0,
  totalNodes: 0,
  phaseProgress: {},
  progressPercent: 0,
  reviewStatus: REVIEW_STATUS.NOT_SUBMITTED,
  reviewComment: ""
};

function formatDateTime(value) {
  if (!value) return "未更新";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function statusClass(status) {
  return String(status || "").replaceAll("_", "-");
}

function materialLabel(category) {
  return MATERIAL_LABELS[category] || "材料";
}

function uploadLabel(node) {
  if (node.type === "upload_spp") return "上传 SPP";
  if (node.type === "upload_minutes") return "上传纪要";
  return "上传资料";
}

function syncLegacyTestContent(detail) {
  return {
    objective: detail.nodeResponses["tod-objective"] || detail.testContent.objective || "",
    procedure: detail.nodeResponses["toe-procedure"] || detail.testContent.procedure || "",
    sampleInfo: detail.nodeResponses["toe-sample"] || detail.testContent.sampleInfo || "",
    result: detail.nodeResponses["toe-result"] || detail.testContent.result || ""
  };
}

function WorkspaceStat({ value, label }) {
  return (
    <div className="workspace-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ProgressMeter({ completed, total, label }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="workspace-meter">
      <div className="workspace-meter-head">
        <span>{label}</span>
        <strong>{completed}/{total}</strong>
      </div>
      <div className="workspace-progress-track">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function MaterialList({ items, onRemove }) {
  if (!items.length) {
    return <p className="workspace-empty-line">暂无材料</p>;
  }

  return (
    <ul className="workspace-material-list compact">
      {items.map((item) => (
        <li key={item.id}>
          <div>
            <strong>{item.name}</strong>
            <span>
              {materialLabel(item.category)} · {item.uploadedBy} · {formatDateTime(item.uploadedAt)}
              {item.size ? ` · ${Math.round(item.size / 1024)} KB` : ""}
            </span>
          </div>
          <button className="button subtle" type="button" onClick={() => onRemove(item.id)}>
            移除
          </button>
        </li>
      ))}
    </ul>
  );
}

export function WorkspacePage({ project, tasks, onToast }) {
  const [ownerFilter, setOwnerFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionOnly, setActionOnly] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [detail, setDetail] = useState(emptyDetail);

  const snapshot = useMemo(
    () => getControlProgressSnapshot(project?.id || "", tasks),
    [project?.id, tasks, refreshToken]
  );

  const owners = useMemo(() => (
    [...new Set(snapshot.controls.map((item) => item.owner).filter(Boolean))].sort()
  ), [snapshot.controls]);

  const visibleControls = useMemo(() => (
    snapshot.controls.filter((item) => {
      const matchesOwner = !ownerFilter || item.owner === ownerFilter;
      const matchesType = !typeFilter || item.controlType === typeFilter;
      const matchesStatus = !statusFilter || item.progressStatus === statusFilter;
      const matchesAction = !actionOnly || item.progressStatus !== PROGRESS_STATUS.COMPLETED;
      return matchesOwner && matchesType && matchesStatus && matchesAction;
    })
  ), [actionOnly, ownerFilter, snapshot.controls, statusFilter, typeFilter]);

  const selectedControl = useMemo(() => (
    snapshot.controls.find((item) => item.id === selectedId) || visibleControls[0] || null
  ), [snapshot.controls, selectedId, visibleControls]);

  const selectedTask = useMemo(() => (
    tasks.find((task) => task.id === selectedControl?.id) || null
  ), [selectedControl?.id, tasks]);

  const stats = useMemo(() => {
    const completedNodes = snapshot.controls.reduce((sum, item) => sum + (item.completedNodes || 0), 0);
    const totalNodes = snapshot.controls.reduce((sum, item) => sum + (item.totalNodes || 0), 0);

    return {
      total: snapshot.controls.length,
      blocked: snapshot.controls.filter((item) => item.progressStatus === PROGRESS_STATUS.BLOCKED).length,
      pendingReview: snapshot.controls.filter((item) => item.progressStatus === PROGRESS_STATUS.PENDING_REVIEW).length,
      completed: snapshot.controls.filter((item) => item.progressStatus === PROGRESS_STATUS.COMPLETED).length,
      nodeProgress: `${completedNodes}/${totalNodes}`
    };
  }, [snapshot.controls]);

  useEffect(() => {
    if (!selectedControl) {
      setSelectedId("");
      setDetail(emptyDetail);
      return;
    }

    if (selectedId !== selectedControl.id) {
      setSelectedId(selectedControl.id);
    }
    setDetail(getControlProgressDetail(selectedControl.id, selectedTask, tasks));
  }, [selectedControl, selectedId, selectedTask, tasks, refreshToken]);

  function refresh() {
    setRefreshToken((value) => value + 1);
  }

  function updateNodeResponse(nodeId, value) {
    setDetail((current) => ({
      ...current,
      nodeResponses: {
        ...current.nodeResponses,
        [nodeId]: value
      }
    }));
  }

  function updateField(name, value) {
    setDetail((current) => ({ ...current, [name]: value }));
  }

  function saveDetail() {
    if (!selectedControl) return;
    upsertControlProgress(selectedControl.id, {
      nodeResponses: detail.nodeResponses,
      testContent: syncLegacyTestContent(detail),
      reviewStatus: detail.reviewStatus,
      reviewComment: detail.reviewComment
    });
    refresh();
    onToast("测试点子流程已保存，模块 3 进度接口已更新。");
  }

  function uploadMaterials(event, node) {
    if (!selectedControl) return;
    const files = [...(event.target.files || [])];
    files.forEach((file) => {
      addWorkspaceMaterial(selectedControl.id, {
        category: node.category || MATERIAL_CATEGORY.EVIDENCE,
        phaseId: node.phaseId,
        nodeId: node.id,
        name: file.name,
        fileType: file.type,
        size: file.size,
        uploadedBy: selectedControl.owner || "成员"
      });
    });
    event.target.value = "";
    refresh();
    if (files.length) {
      onToast(`已记录 ${files.length} 个${materialLabel(node.category)}。`);
    }
  }

  function removeMaterial(materialId) {
    if (!selectedControl) return;
    removeWorkspaceMaterial(selectedControl.id, materialId);
    refresh();
    onToast("材料记录已移除。");
  }

  function materialsForNode(node) {
    return detail.materials.filter((item) => (
      item.phaseId === node.phaseId
      && item.category === node.category
      && (!item.nodeId || item.nodeId === node.id)
    ));
  }

  function textValueForNode(node) {
    return detail.nodeResponses[node.id] ?? node.value ?? "";
  }

  return (
    <section className="workspace-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Workspace · 测试点执行工作台</p>
          <h2>{project.clientName || project.name}</h2>
        </div>
        <div className="workspace-stats">
          <WorkspaceStat value={stats.total} label="测试点" />
          <WorkspaceStat value={stats.nodeProgress} label="节点进度" />
          <WorkspaceStat value={stats.pendingReview} label="待复核" />
          <WorkspaceStat value={stats.completed} label="已完成" />
        </div>
      </header>

      <div className="workspace-grid">
        <aside className="workspace-list-panel">
          <div className="panel-toolbar">
            <div>
              <h3>测试点清单</h3>
              <p className="panel-note">一张卡片代表一个 GITC / ITAC 测试点</p>
            </div>
          </div>

          <div className="workspace-filter-grid">
            <label className="field">
              <span className="label">负责人</span>
              <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
                <option value="">全部</option>
                {owners.map((owner) => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">类型</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="">全部</option>
                <option value="GITC">GITC</option>
                <option value="ITAC">ITAC</option>
                <option value="TASK">TASK</option>
              </select>
            </label>

            <label className="field full">
              <span className="label">进度状态</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">全部状态</option>
                {Object.entries(PROGRESS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="workspace-check full">
              <input
                type="checkbox"
                checked={actionOnly}
                onChange={(event) => setActionOnly(event.target.checked)}
              />
              <span>仅看未完成 / 待处理</span>
            </label>
          </div>

          <div className="workspace-control-list">
            {visibleControls.length ? visibleControls.map((control) => (
              <button
                key={control.id}
                className={`workspace-control-card ${selectedControl?.id === control.id ? "active" : ""}`}
                type="button"
                onClick={() => setSelectedId(control.id)}
              >
                <span className={`control-type ${control.controlType.toLowerCase()}`}>
                  {control.controlType}
                </span>
                <strong>{control.title}</strong>
                <span>{control.owner} · {control.auditPhase || "general"}</span>
                <div className="workspace-progress-row">
                  <span className={`progress-pill ${statusClass(control.progressStatus)}`}>
                    {PROGRESS_LABELS[control.progressStatus]}
                  </span>
                  <span>{control.completedNodes || 0}/{control.totalNodes || 0}</span>
                </div>
                <div className="workspace-progress-track">
                  <span style={{ width: `${control.progressPercent}%` }} />
                </div>
                <div className="workspace-phase-mini">
                  <span>TOD {control.phaseProgress?.tod?.completedNodes || 0}/{control.phaseProgress?.tod?.totalNodes || 0}</span>
                  <span>TOE {control.phaseProgress?.toe?.completedNodes || 0}/{control.phaseProgress?.toe?.totalNodes || 0}</span>
                </div>
                <small>
                  SPP {control.sppCount || 0} · 纪要 {control.meetingMinutesCount || 0} · 资料 {control.evidenceCount || 0} · {EVIDENCE_LABELS[control.evidenceStatus]}
                </small>
              </button>
            )) : (
              <div className="empty-state compact">
                <h3>暂无可记录的测试点</h3>
                <p>请先在 Scope 或看板中生成当前项目任务。</p>
              </div>
            )}
          </div>
        </aside>

        <section className="workspace-detail-panel">
          {selectedControl ? (
            <>
              <div className="workspace-detail-head">
                <div>
                  <span className={`control-type ${selectedControl.controlType.toLowerCase()}`}>
                    {selectedControl.controlType}
                  </span>
                  <h3>{selectedControl.title}</h3>
                  <p>
                    {selectedControl.owner} · 看板状态 {selectedControl.taskStatus}
                    {" · "}
                    最近更新 {formatDateTime(detail.updatedAt)}
                  </p>
                </div>
                <span className={`progress-pill ${statusClass(selectedControl.progressStatus)}`}>
                  {PROGRESS_LABELS[selectedControl.progressStatus]}
                </span>
              </div>

              {selectedControl.blockers.length ? (
                <div className="workspace-blocker">
                  前置关键步骤未完成：{selectedControl.blockers.join("、")}
                </div>
              ) : null}

              <div className="workspace-progress-summary">
                <ProgressMeter
                  label="总进度"
                  completed={detail.completedNodes || 0}
                  total={detail.totalNodes || 0}
                />
                {(detail.phases || []).map((phase) => (
                  <ProgressMeter
                    key={phase.id}
                    label={phase.label}
                    completed={phase.completedNodes}
                    total={phase.totalNodes}
                  />
                ))}
              </div>

              <div className="workspace-review-row">
                <label className="field">
                  <span className="label">复核状态 Review</span>
                  <select
                    value={detail.reviewStatus}
                    onChange={(event) => updateField("reviewStatus", event.target.value)}
                  >
                    {Object.entries(REVIEW_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="label">复核意见</span>
                  <textarea
                    rows="3"
                    value={detail.reviewComment}
                    onChange={(event) => updateField("reviewComment", event.target.value)}
                    placeholder="Reviewer comment / 待补证据说明。"
                  />
                </label>
              </div>

              <div className="workspace-phase-list">
                {(detail.phases || []).map((phase) => (
                  <section key={phase.id} className="workspace-phase-panel">
                    <div className="workspace-phase-head">
                      <div>
                        <h4>{phase.label}</h4>
                        <p>{phase.description}</p>
                      </div>
                      <strong>{phase.completedNodes}/{phase.totalNodes}</strong>
                    </div>

                    <div className="workspace-node-list">
                      {phase.nodes.map((node) => {
                        const textValue = textValueForNode(node);
                        const textComplete = node.type === "text" && textValue.trim();
                        const nodeStatus = textComplete ? NODE_STATUS.COMPLETED : node.status;
                        const nodeMaterials = node.type.startsWith("upload") ? materialsForNode(node) : [];

                        return (
                          <div key={node.id} className={`workspace-node ${nodeStatus}`}>
                            <div className="workspace-node-main">
                              <span className={`node-status ${nodeStatus}`}>
                                {nodeStatus === NODE_STATUS.COMPLETED ? "Done" : "Pending"}
                              </span>
                              <div>
                                <strong>{node.label}</strong>
                                <span>{node.type}</span>
                              </div>
                            </div>

                            {node.type === "text" ? (
                              <textarea
                                rows="3"
                                value={textValue}
                                onChange={(event) => updateNodeResponse(node.id, event.target.value)}
                                placeholder={node.placeholder}
                              />
                            ) : null}

                            {node.type.startsWith("upload") ? (
                              <div className="workspace-node-upload">
                                <label className="button">
                                  {uploadLabel(node)}
                                  <input
                                    type="file"
                                    multiple
                                    onChange={(event) => uploadMaterials(event, node)}
                                  />
                                </label>
                                <MaterialList items={nodeMaterials} onRemove={removeMaterial} />
                              </div>
                            ) : null}

                            {node.type === "review" ? (
                              <p className="workspace-node-note">
                                当前复核状态：{REVIEW_LABELS[detail.reviewStatus]}。
                                {node.threshold === REVIEW_STATUS.SIGNED_OFF
                                  ? "该节点需要最终签核。"
                                  : "提交复核后该节点完成。"}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <div className="workspace-upload-row">
                <button className="button primary" type="button" onClick={saveDetail}>
                  保存测试点子流程
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state large">
              <h3>暂无测试点</h3>
              <p>当前项目还没有可记录的测试点。</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
