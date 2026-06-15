import { useEffect, useMemo, useState } from "react";
import {
  EVIDENCE_STATUS,
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

const emptyDetail = {
  testContent: {
    objective: "",
    procedure: "",
    sampleInfo: "",
    result: ""
  },
  materials: [],
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

function WorkspaceStat({ value, label }) {
  return (
    <div className="workspace-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function MaterialList({ title, items, onRemove }) {
  return (
    <section className="workspace-material-section">
      <h4>{title}</h4>
      {items.length ? (
        <ul className="workspace-material-list">
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>
                  {item.uploadedBy} · {formatDateTime(item.uploadedAt)}
                  {item.size ? ` · ${Math.round(item.size / 1024)} KB` : ""}
                </span>
              </div>
              <button className="button subtle" type="button" onClick={() => onRemove(item.id)}>
                移除
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="workspace-empty-line">暂无材料</p>
      )}
    </section>
  );
}

export function WorkspacePage({ project, tasks, onToast }) {
  const [ownerFilter, setOwnerFilter] = useState("");
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
    snapshot.controls.filter((item) => !ownerFilter || item.owner === ownerFilter)
  ), [snapshot.controls, ownerFilter]);

  const selectedControl = useMemo(() => (
    snapshot.controls.find((item) => item.id === selectedId) || visibleControls[0] || null
  ), [snapshot.controls, selectedId, visibleControls]);

  const stats = useMemo(() => ({
    total: snapshot.controls.length,
    blocked: snapshot.controls.filter((item) => item.progressStatus === PROGRESS_STATUS.BLOCKED).length,
    pendingReview: snapshot.controls.filter((item) => item.reviewStatus === REVIEW_STATUS.PENDING_REVIEW).length,
    completed: snapshot.controls.filter((item) => item.progressStatus === PROGRESS_STATUS.COMPLETED).length
  }), [snapshot.controls]);

  useEffect(() => {
    if (!selectedControl) {
      setSelectedId("");
      setDetail(emptyDetail);
      return;
    }

    if (selectedId !== selectedControl.id) {
      setSelectedId(selectedControl.id);
    }
    setDetail(getControlProgressDetail(selectedControl.id));
  }, [selectedControl, selectedId, refreshToken]);

  function refresh() {
    setRefreshToken((value) => value + 1);
  }

  function updateTestContent(name, value) {
    setDetail((current) => ({
      ...current,
      testContent: {
        ...current.testContent,
        [name]: value
      }
    }));
  }

  function updateField(name, value) {
    setDetail((current) => ({ ...current, [name]: value }));
  }

  function saveDetail() {
    if (!selectedControl) return;
    upsertControlProgress(selectedControl.id, {
      testContent: detail.testContent,
      reviewStatus: detail.reviewStatus,
      reviewComment: detail.reviewComment
    });
    refresh();
    onToast("测试记录已保存，进度接口已更新。");
  }

  function uploadMaterials(event, category) {
    if (!selectedControl) return;
    const files = [...(event.target.files || [])];
    files.forEach((file) => {
      addWorkspaceMaterial(selectedControl.id, {
        category,
        name: file.name,
        fileType: file.type,
        size: file.size,
        uploadedBy: selectedControl.owner || "成员"
      });
    });
    event.target.value = "";
    refresh();
    if (files.length) {
      onToast(`已记录 ${files.length} 个${category === "meeting_minutes" ? "会议纪要" : "测试资料"}。`);
    }
  }

  function removeMaterial(materialId) {
    if (!selectedControl) return;
    removeWorkspaceMaterial(selectedControl.id, materialId);
    refresh();
    onToast("材料记录已移除。");
  }

  const meetingMinutes = detail.materials.filter((item) => item.category === "meeting_minutes");
  const evidenceFiles = detail.materials.filter((item) => item.category === "evidence");

  return (
    <section className="workspace-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Workspace · 测试执行工作台</p>
          <h2>{project.clientName || project.name}</h2>
          <p className="page-lead">
            记录测试内容、会议纪要与测试资料；模块 3 通过共享进度接口读取这里沉淀的材料。
          </p>
        </div>
        <div className="workspace-stats">
          <WorkspaceStat value={stats.total} label="测试项" />
          <WorkspaceStat value={stats.blocked} label="阻塞" />
          <WorkspaceStat value={stats.pendingReview} label="待复核" />
          <WorkspaceStat value={stats.completed} label="已完成" />
        </div>
      </header>

      <div className="workspace-grid">
        <aside className="workspace-list-panel">
          <div className="panel-toolbar">
            <div>
              <h3>任务 / 控制清单</h3>
              <p className="panel-note">数据来自当前项目看板与 Scope 初始化任务</p>
            </div>
          </div>

          <label className="field">
            <span className="label">负责人筛选</span>
            <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
              <option value="">全部负责人</option>
              {owners.map((owner) => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>
          </label>

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
                  <span>{control.progressPercent}%</span>
                </div>
                <div className="workspace-progress-track">
                  <span style={{ width: `${control.progressPercent}%` }} />
                </div>
                <small>
                  纪要 {control.meetingMinutesCount} · 资料 {control.evidenceCount} · {EVIDENCE_LABELS[control.evidenceStatus]}
                </small>
              </button>
            )) : (
              <div className="empty-state compact">
                <h3>暂无可记录的测试项</h3>
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

              <div className="workspace-form-grid">
                <label className="field full">
                  <span className="label">测试目标 Objective</span>
                  <textarea
                    rows="3"
                    value={detail.testContent.objective}
                    onChange={(event) => updateTestContent("objective", event.target.value)}
                    placeholder="例如：验证访问管理控制在审计期间持续有效运行。"
                  />
                </label>

                <label className="field full">
                  <span className="label">测试程序 Procedure</span>
                  <textarea
                    rows="4"
                    value={detail.testContent.procedure}
                    onChange={(event) => updateTestContent("procedure", event.target.value)}
                    placeholder="记录访谈、抽样、检查、重新执行等测试步骤。"
                  />
                </label>

                <label className="field">
                  <span className="label">样本信息 Sample</span>
                  <textarea
                    rows="3"
                    value={detail.testContent.sampleInfo}
                    onChange={(event) => updateTestContent("sampleInfo", event.target.value)}
                    placeholder="样本量、期间、抽样口径。"
                  />
                </label>

                <label className="field">
                  <span className="label">测试结论 Result</span>
                  <textarea
                    rows="3"
                    value={detail.testContent.result}
                    onChange={(event) => updateTestContent("result", event.target.value)}
                    placeholder="No exception noted / 发现与待补充事项。"
                  />
                </label>

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

              <div className="workspace-upload-row">
                <label className="button">
                  上传会议纪要
                  <input
                    type="file"
                    multiple
                    onChange={(event) => uploadMaterials(event, "meeting_minutes")}
                  />
                </label>
                <label className="button">
                  上传测试资料
                  <input
                    type="file"
                    multiple
                    onChange={(event) => uploadMaterials(event, "evidence")}
                  />
                </label>
                <button className="button primary" type="button" onClick={saveDetail}>
                  保存测试记录
                </button>
              </div>

              <div className="workspace-material-grid">
                <MaterialList title="会议纪要" items={meetingMinutes} onRemove={removeMaterial} />
                <MaterialList title="测试资料" items={evidenceFiles} onRemove={removeMaterial} />
              </div>
            </>
          ) : (
            <div className="empty-state large">
              <h3>暂无任务</h3>
              <p>当前项目还没有可记录的测试项。</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
