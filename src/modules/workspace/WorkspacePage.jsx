import { useEffect, useMemo, useState } from "react";
import {
  FIELD_REVIEW_STATUS,
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

const WORKSPACE_PROGRESS_LABELS = {
  [PROGRESS_STATUS.NOT_STARTED]: "未开始",
  [PROGRESS_STATUS.IN_PROGRESS]: "测试中",
  [PROGRESS_STATUS.COMPLETED]: "已完成"
};

const MATERIAL_LABELS = {
  [MATERIAL_CATEGORY.SPP]: "SPP",
  [MATERIAL_CATEGORY.MEETING_MINUTES]: "会议纪要",
  [MATERIAL_CATEGORY.EVIDENCE]: "测试资料"
};

const REVIEW_DOT_LABELS = {
  [FIELD_REVIEW_STATUS.OPEN]: "待回复",
  [FIELD_REVIEW_STATUS.REPLIED]: "已回复",
  [FIELD_REVIEW_STATUS.ACCEPTED]: "已接受"
};

const emptyDetail = {
  id: "",
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
  workspaceStatus: PROGRESS_STATUS.NOT_STARTED,
  milestones: {
    planning: false,
    review: false
  },
  milestoneActors: {
    planning: "",
    review: ""
  },
  extraTextFields: {},
  fieldReviews: {},
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

function actorInitials(value = "") {
  const source = String(value || "").split("@")[0].replace(/[._-]+/g, " ").trim();
  if (!source) return "ME";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function normalizeWorkspaceStatus(status) {
  if (status === PROGRESS_STATUS.COMPLETED) return PROGRESS_STATUS.COMPLETED;
  if (status === PROGRESS_STATUS.NOT_STARTED) return PROGRESS_STATUS.NOT_STARTED;
  return PROGRESS_STATUS.IN_PROGRESS;
}

function workspaceStatusForControl(control) {
  return normalizeWorkspaceStatus(control?.workspaceStatus || control?.progressStatus);
}

function workspaceStatusForDetail(detail) {
  if (!detail?.materials?.length) return PROGRESS_STATUS.NOT_STARTED;
  const reviewComments = Object.values(detail.fieldReviews || {});
  const commentsCleared = reviewComments.every((review) => (
    review.status === FIELD_REVIEW_STATUS.ACCEPTED
  ));

  if (detail.milestones?.planning && detail.milestones?.review && commentsCleared) {
    return PROGRESS_STATUS.COMPLETED;
  }

  return PROGRESS_STATUS.IN_PROGRESS;
}

function syncLegacyTestContent(detail) {
  return {
    objective: detail.nodeResponses["tod-objective"] || detail.testContent.objective || "",
    procedure: detail.nodeResponses["toe-procedure"] || detail.testContent.procedure || "",
    sampleInfo: detail.nodeResponses["toe-sample"] || detail.testContent.sampleInfo || "",
    result: detail.nodeResponses["toe-result"] || detail.testContent.result || ""
  };
}

function detailPatch(detail) {
  return {
    nodeResponses: detail.nodeResponses,
    testContent: syncLegacyTestContent(detail),
    reviewStatus: detail.reviewStatus,
    reviewComment: detail.reviewComment,
    milestones: detail.milestones,
    milestoneActors: detail.milestoneActors,
    extraTextFields: detail.extraTextFields,
    fieldReviews: detail.fieldReviews
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

export function WorkspacePage({ project, tasks, focusControlId = "", onToast }) {
  const [ownerFilter, setOwnerFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionOnly, setActionOnly] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [detail, setDetail] = useState(emptyDetail);
  const [activePhase, setActivePhase] = useState("tod");
  const [openTextMenuKey, setOpenTextMenuKey] = useState("");
  const [openReviewKey, setOpenReviewKey] = useState("");

  const snapshot = useMemo(
    () => getControlProgressSnapshot(project?.id || "", tasks),
    [project?.id, tasks, refreshToken]
  );

  const owners = useMemo(() => (
    [...new Set(snapshot.controls.map((item) => item.owner).filter(Boolean))].sort()
  ), [snapshot.controls]);

  const visibleControls = useMemo(() => (
    snapshot.controls.filter((item) => {
      const displayStatus = workspaceStatusForControl(item);
      const matchesOwner = !ownerFilter || item.owner === ownerFilter;
      const matchesType = !typeFilter || item.controlType === typeFilter;
      const matchesStatus = !statusFilter || displayStatus === statusFilter;
      const matchesAction = !actionOnly || displayStatus !== PROGRESS_STATUS.COMPLETED;
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
      testing: snapshot.controls.filter((item) => workspaceStatusForControl(item) === PROGRESS_STATUS.IN_PROGRESS).length,
      completed: snapshot.controls.filter((item) => workspaceStatusForControl(item) === PROGRESS_STATUS.COMPLETED).length,
      nodeProgress: `${completedNodes}/${totalNodes}`
    };
  }, [snapshot.controls]);

  const activePhaseDetail = useMemo(() => (
    detail.phases.find((phase) => phase.id === activePhase) || detail.phases[0] || null
  ), [activePhase, detail.phases]);

  const detailDisplayStatus = detail.id
    ? workspaceStatusForDetail(detail)
    : workspaceStatusForControl(selectedControl);

  useEffect(() => {
    if (!focusControlId) return;
    setSelectedId(focusControlId);
  }, [focusControlId]);

  useEffect(() => {
    if (!selectedControl) {
      setDetail(emptyDetail);
      return;
    }
    if (selectedId !== selectedControl.id) {
      setSelectedId(selectedControl.id);
    }
    setDetail(getControlProgressDetail(selectedControl.id, selectedTask, tasks));
  }, [selectedControl, selectedId, selectedTask, tasks, refreshToken]);

  useEffect(() => {
    setActivePhase("tod");
    setOpenTextMenuKey("");
    setOpenReviewKey("");
  }, [selectedControl?.id]);

  useEffect(() => {
    if (!detail.phases.length) return;
    if (!detail.phases.some((phase) => phase.id === activePhase)) {
      setActivePhase(detail.phases[0].id);
    }
  }, [activePhase, detail.phases]);

  function notify(message) {
    if (typeof onToast === "function") onToast(message);
  }

  function refresh() {
    setRefreshToken((value) => value + 1);
  }

  function persist(nextDetail, message = "") {
    if (!selectedControl) return;
    upsertControlProgress(
      selectedControl.id,
      detailPatch(nextDetail),
      project?.id || selectedTask?.projectId || ""
    );
    refresh();
    if (message) notify(message);
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

  function addExtraTextField(nodeId) {
    setDetail((current) => ({
      ...current,
      extraTextFields: {
        ...current.extraTextFields,
        [nodeId]: [
          ...(current.extraTextFields?.[nodeId] || []),
          {
            id: `txt_${Date.now().toString(36)}`,
            label: "补充说明",
            value: "",
            createdAt: new Date().toISOString()
          }
        ]
      }
    }));
    setOpenTextMenuKey("");
  }

  function updateExtraTextField(nodeId, fieldId, value) {
    setDetail((current) => ({
      ...current,
      extraTextFields: {
        ...current.extraTextFields,
        [nodeId]: (current.extraTextFields?.[nodeId] || []).map((field) => (
          field.id === fieldId ? { ...field, value } : field
        ))
      }
    }));
  }

  function updateFieldReview(fieldKey, patch) {
    setDetail((current) => ({
      ...current,
      fieldReviews: {
        ...current.fieldReviews,
        [fieldKey]: {
          ...(current.fieldReviews?.[fieldKey] || {
            id: `rev_${Date.now().toString(36)}`,
            status: FIELD_REVIEW_STATUS.OPEN,
            comment: "",
            reply: "",
            createdBy: "Reviewer",
            createdAt: new Date().toISOString()
          }),
          ...patch,
          updatedAt: new Date().toISOString()
        }
      }
    }));
  }

  function addFieldReview(fieldKey) {
    updateFieldReview(fieldKey, {
      status: FIELD_REVIEW_STATUS.OPEN,
      comment: detail.fieldReviews?.[fieldKey]?.comment || ""
    });
    setOpenReviewKey(fieldKey);
    setOpenTextMenuKey("");
  }

  function submitReviewReply(fieldKey) {
    const review = detail.fieldReviews?.[fieldKey];
    if (!review?.reply?.trim()) return;
    updateFieldReview(fieldKey, {
      status: FIELD_REVIEW_STATUS.REPLIED,
      repliedBy: selectedControl?.owner || "成员"
    });
  }

  function acceptFieldReview(fieldKey) {
    updateFieldReview(fieldKey, {
      status: FIELD_REVIEW_STATUS.ACCEPTED,
      acceptedBy: "Reviewer"
    });
  }

  function actorSourceFor(milestone) {
    if (milestone === "review") {
      return project?.reviewer || project?.manager || selectedControl?.owner || project?.owner || "member";
    }
    return project?.inCharge || selectedControl?.owner || project?.owner || "member";
  }

  function toggleMilestone(milestone) {
    if (!selectedControl) return;
    const nextActive = !detail.milestones?.[milestone];
    const nextDetail = {
      ...detail,
      milestones: {
        ...detail.milestones,
        [milestone]: nextActive
      },
      milestoneActors: {
        ...detail.milestoneActors,
        [milestone]: nextActive ? actorInitials(actorSourceFor(milestone)) : ""
      },
      reviewStatus: milestone === "review" && nextActive
        ? REVIEW_STATUS.SIGNED_OFF
        : milestone === "review"
          ? REVIEW_STATUS.NOT_SUBMITTED
          : detail.reviewStatus
    };

    setDetail(nextDetail);
    persist(nextDetail, nextActive ? `${milestone} 节点已完成。` : `${milestone} 节点已撤销。`);
  }

  function saveDetail() {
    if (!selectedControl) return;
    const nextDetail = {
      ...detail,
      reviewStatus: detail.milestones?.review
        ? REVIEW_STATUS.SIGNED_OFF
        : REVIEW_STATUS.NOT_SUBMITTED
    };
    setDetail(nextDetail);
    persist(nextDetail, "工作台内容已保存，模块 3 进度接口已更新。");
  }

  function cancelDetail() {
    if (!selectedControl) return;
    setDetail(getControlProgressDetail(selectedControl.id, selectedTask, tasks));
    setOpenTextMenuKey("");
    setOpenReviewKey("");
    notify("已取消未保存修改。");
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
      }, project?.id || selectedTask?.projectId || "");
    });
    event.target.value = "";
    refresh();
    if (files.length) {
      notify(`已记录 ${files.length} 个${materialLabel(node.category)}。`);
    }
  }

  function removeMaterial(materialId) {
    if (!selectedControl) return;
    removeWorkspaceMaterial(
      selectedControl.id,
      materialId,
      project?.id || selectedTask?.projectId || ""
    );
    refresh();
    notify("材料记录已移除。");
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

  function renderReviewThread(fieldKey) {
    const review = detail.fieldReviews?.[fieldKey];
    if (!review || openReviewKey !== fieldKey) return null;

    return (
      <div className="workspace-review-thread">
        <div className="workspace-review-thread-head">
          <strong>复核意见</strong>
          <span className={`workspace-review-state ${review.status}`}>
            {REVIEW_DOT_LABELS[review.status] || "待处理"}
          </span>
        </div>
        <textarea
          rows="2"
          value={review.comment}
          onChange={(event) => updateFieldReview(fieldKey, { comment: event.target.value })}
          placeholder="输入 reviewer 复核意见。"
        />
        <textarea
          rows="2"
          value={review.reply}
          onChange={(event) => updateFieldReview(fieldKey, { reply: event.target.value })}
          placeholder="回复复核意见。"
        />
        <div className="workspace-review-actions">
          <button className="button subtle" type="button" onClick={() => submitReviewReply(fieldKey)}>
            回复
          </button>
          <button className="button success" type="button" onClick={() => acceptFieldReview(fieldKey)}>
            接受
          </button>
        </div>
      </div>
    );
  }

  function renderTextBox({ node, fieldKey, value, placeholder, onChange }) {
    const review = detail.fieldReviews?.[fieldKey];
    const menuOpen = openTextMenuKey === fieldKey;

    return (
      <div className="workspace-text-box" key={fieldKey}>
        <div className="workspace-text-toolbar">
          <span />
          <div className="workspace-text-menu-wrap">
            <button
              className="workspace-text-menu-button"
              type="button"
              aria-label="文本框操作"
              onClick={() => setOpenTextMenuKey(menuOpen ? "" : fieldKey)}
            >
              ...
            </button>
            {review ? (
              <button
                className={`workspace-comment-dot ${review.status}`}
                type="button"
                aria-label={REVIEW_DOT_LABELS[review.status] || "复核意见"}
                onClick={() => setOpenReviewKey(openReviewKey === fieldKey ? "" : fieldKey)}
              />
            ) : null}
            {menuOpen ? (
              <div className="workspace-text-menu">
                <button type="button" onClick={() => addExtraTextField(node.id)}>
                  新增文本框
                </button>
                <button type="button" onClick={() => addFieldReview(fieldKey)}>
                  添加复核意见
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <textarea
          rows="3"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        {renderReviewThread(fieldKey)}
      </div>
    );
  }

  return (
    <section className="workspace-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Workspace · 测试点执行工作台</p>
          <h2>{project?.clientName || project?.name || "项目工作台"}</h2>
        </div>
        <div className="workspace-stats">
          <WorkspaceStat value={stats.total} label="测试点" />
          <WorkspaceStat value={stats.nodeProgress} label="节点进度" />
          <WorkspaceStat value={stats.testing} label="测试中" />
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
                {Object.entries(WORKSPACE_PROGRESS_LABELS).map(([value, label]) => (
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
            {visibleControls.length ? visibleControls.map((control) => {
              const displayStatus = workspaceStatusForControl(control);

              return (
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
                    <span className={`progress-pill ${statusClass(displayStatus)}`}>
                      {WORKSPACE_PROGRESS_LABELS[displayStatus]}
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
                    SPP {control.sppCount || 0} · 纪要 {control.meetingMinutesCount || 0} · 资料 {control.evidenceCount || 0}
                  </small>
                </button>
              );
            }) : (
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
                <span className={`progress-pill ${statusClass(detailDisplayStatus)}`}>
                  {WORKSPACE_PROGRESS_LABELS[detailDisplayStatus]}
                </span>
              </div>

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

              <div className="workspace-milestone-section">
                <span>流程节点</span>
                <div className="workspace-milestone-buttons">
                  {["planning", "review"].map((milestone) => {
                    const active = Boolean(detail.milestones?.[milestone]);
                    const label = active
                      ? detail.milestoneActors?.[milestone] || actorInitials(actorSourceFor(milestone))
                      : milestone;

                    return (
                      <button
                        key={milestone}
                        className={`workspace-milestone-button ${active ? "active" : ""}`}
                        type="button"
                        onClick={() => toggleMilestone(milestone)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="workspace-phase-tabs">
                {(detail.phases || []).map((phase) => (
                  <button
                    key={phase.id}
                    className={phase.id === activePhase ? "active" : ""}
                    type="button"
                    onClick={() => setActivePhase(phase.id)}
                  >
                    {phase.label}
                  </button>
                ))}
              </div>

              {activePhaseDetail ? (
                <section className="workspace-phase-panel">
                  <div className="workspace-phase-head">
                    <div>
                      <h4>{activePhaseDetail.label}</h4>
                      <p>{activePhaseDetail.description}</p>
                    </div>
                    <strong>{activePhaseDetail.completedNodes}/{activePhaseDetail.totalNodes}</strong>
                  </div>

                  <div className="workspace-node-list">
                    {activePhaseDetail.nodes.map((node) => {
                      const textValue = textValueForNode(node);
                      const textComplete = Boolean(textValue.trim());
                      const nodeStatus = textComplete ? NODE_STATUS.COMPLETED : node.status;
                      const nodeMaterials = node.type.startsWith("upload") ? materialsForNode(node) : [];
                      const extraFields = detail.extraTextFields?.[node.id] || [];

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
                            <>
                              {renderTextBox({
                                node,
                                fieldKey: node.id,
                                value: textValue,
                                placeholder: node.placeholder,
                                onChange: (value) => updateNodeResponse(node.id, value)
                              })}
                              {extraFields.map((field) => renderTextBox({
                                node,
                                fieldKey: `${node.id}::${field.id}`,
                                value: field.value,
                                placeholder: field.label || "补充说明",
                                onChange: (value) => updateExtraTextField(node.id, field.id, value)
                              }))}
                            </>
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
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              <div className="workspace-detail-actions">
                <button className="button subtle" type="button" onClick={cancelDetail}>
                  Cancel
                </button>
                <button className="button success" type="button" onClick={saveDetail}>
                  Save
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
