export const WORKSPACE_PROGRESS_STORAGE_KEY = "deepsleep-workspace-progress-v1";

export const PROGRESS_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  EVIDENCE_SUBMITTED: "evidence_submitted",
  PENDING_REVIEW: "pending_review",
  NEEDS_REWORK: "needs_rework",
  COMPLETED: "completed",
  BLOCKED: "blocked"
};

export const EVIDENCE_STATUS = {
  NONE: "none",
  PARTIAL_UPLOADED: "partial_uploaded",
  UPLOADED: "uploaded",
  APPROVED: "approved",
  REJECTED: "rejected"
};

export const REVIEW_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PENDING_REVIEW: "pending_review",
  COMMENTED: "commented",
  SIGNED_OFF: "signed_off"
};

export const NODE_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed"
};

export const MATERIAL_CATEGORY = {
  SPP: "spp",
  MEETING_MINUTES: "meeting_minutes",
  EVIDENCE: "evidence"
};

const DEFAULT_TEST_CONTENT = {
  objective: "",
  procedure: "",
  sampleInfo: "",
  result: ""
};

export const WORKSPACE_PHASES = [
  {
    id: "tod",
    label: "TOD",
    description: "设计有效性测试：理解流程、确认控制设计、沉淀访谈与设计证据。",
    nodes: [
      {
        id: "tod-minutes",
        label: "上传 TOD 会议纪要",
        type: "upload_minutes",
        required: true,
        category: MATERIAL_CATEGORY.MEETING_MINUTES
      },
      {
        id: "tod-objective",
        label: "TOD 测试目标",
        type: "text",
        required: true,
        placeholder: "说明本测试点的设计有效性测试目标。",
        legacyField: "objective"
      },
      {
        id: "tod-process",
        label: "流程理解与控制描述",
        type: "text",
        required: true,
        placeholder: "记录流程理解、控制频率、控制人和关键系统。"
      },
      {
        id: "tod-spp",
        label: "TOD支持性材料",
        type: "upload_spp",
        required: true,
        category: MATERIAL_CATEGORY.SPP
      }
    ]
  },
  {
    id: "toe",
    label: "TOE",
    description: "运行有效性测试：完成样本、执行测试、记录结论。",
    nodes: [
      {
        id: "toe-sample",
        label: "样本信息",
        type: "text",
        required: true,
        placeholder: "记录样本量、期间、抽样口径。",
        legacyField: "sampleInfo"
      },
      {
        id: "toe-procedure",
        label: "TOE 测试程序",
        type: "text",
        required: true,
        placeholder: "记录检查、重新执行、穿行或核对步骤。",
        legacyField: "procedure"
      },
      {
        id: "toe-execution",
        label: "执行过程记录",
        type: "text",
        required: true,
        placeholder: "记录样本逐项执行过程和关键判断。"
      },
      {
        id: "toe-spp",
        label: "上传TOE支持性材料",
        type: "upload_spp",
        required: true,
        category: MATERIAL_CATEGORY.SPP
      },
      {
        id: "toe-minutes",
        label: "上传 TOE 会议纪要",
        type: "upload_minutes",
        required: true,
        category: MATERIAL_CATEGORY.MEETING_MINUTES
      },
      {
        id: "toe-result",
        label: "TOE 测试结论",
        type: "text",
        required: true,
        placeholder: "记录 TOE 结论。",
        legacyField: "result"
      }
    ]
  }
];

const PHASE_ORDER = {
  "scope-confirm": 0,
  "risk-assessment": 1,
  "control-design": 2,
  "industry-addon": 3,
  "control-test": 4,
  "deficiency-review": 5,
  "wrap-up": 6
};

const REVIEW_ORDER = {
  [REVIEW_STATUS.NOT_SUBMITTED]: 0,
  [REVIEW_STATUS.COMMENTED]: 1,
  [REVIEW_STATUS.PENDING_REVIEW]: 2,
  [REVIEW_STATUS.SIGNED_OFF]: 3
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function safeStorage() {
  return typeof window !== "undefined" ? window.localStorage : null;
}

function loadStore() {
  const storage = safeStorage();
  if (!storage) return {};

  try {
    const saved = JSON.parse(storage.getItem(WORKSPACE_PROGRESS_STORAGE_KEY) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

function saveStore(store) {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(WORKSPACE_PROGRESS_STORAGE_KEY, JSON.stringify(store));
}

function normalizeMaterial(material = {}) {
  return {
    id: material.id || `mat_${Math.random().toString(36).slice(2, 9)}`,
    category: material.category || MATERIAL_CATEGORY.EVIDENCE,
    phaseId: material.phaseId || material.phase || "general",
    nodeId: material.nodeId || "",
    name: material.name || "未命名材料",
    fileType: material.fileType || "",
    size: material.size || 0,
    uploadedBy: material.uploadedBy || "成员",
    uploadedAt: material.uploadedAt || nowIso(),
    status: material.status || "submitted"
  };
}

function normalizeRecord(controlId, record = {}) {
  return {
    id: controlId,
    testContent: {
      ...DEFAULT_TEST_CONTENT,
      ...(record.testContent || {})
    },
    nodeResponses: record.nodeResponses && typeof record.nodeResponses === "object"
      ? record.nodeResponses
      : {},
    materials: Array.isArray(record.materials) ? record.materials.map(normalizeMaterial) : [],
    reviewStatus: record.reviewStatus || REVIEW_STATUS.NOT_SUBMITTED,
    reviewComment: record.reviewComment || "",
    updatedAt: record.updatedAt || nowIso()
  };
}

function textValueForNode(record, node) {
  const value = record.nodeResponses?.[node.id];
  if (typeof value === "string" && value.trim()) return value;

  if (node.legacyField) {
    return record.testContent?.[node.legacyField] || "";
  }

  return "";
}

function hasTextForNode(record, node) {
  return Boolean(textValueForNode(record, node).trim());
}

function getMaterials(record, category, phaseId, nodeId) {
  return (record?.materials || []).filter((item) => {
    if (category && item.category !== category) return false;
    if (phaseId && item.phaseId !== phaseId) return false;
    if (nodeId && item.nodeId && item.nodeId !== nodeId) return false;
    return true;
  });
}

function inferControlType(task = {}) {
  const source = [
    task.title,
    task.description,
    task.scopeMeta?.auditDomain,
    task.auditDomain
  ].filter(Boolean).join(" ").toLowerCase();

  if (source.includes("itac") || source.includes("应用控制") || source.includes("自动化控制")) {
    return "ITAC";
  }

  if (source.includes("itgc") || source.includes("gitc") || source.includes("访问管理") || source.includes("变更管理")) {
    return "GITC";
  }

  return "TASK";
}

function phaseOrder(phase) {
  return PHASE_ORDER[phase] ?? 99;
}

function sameScopeProject(task, target) {
  if (task?.projectId && target?.projectId) return task.projectId === target.projectId;
  if (!task?.scopeMeta?.projectName || !target?.scopeMeta?.projectName) return false;
  return task.scopeMeta.projectName === target.scopeMeta.projectName;
}

function getBlockingPredecessors(task, allTasks = []) {
  if (!task?.scopeGenerated || !task.auditPhase) return [];

  const currentOrder = phaseOrder(task.auditPhase);
  return allTasks.filter((candidate) => {
    if (!candidate || candidate.id === task.id) return false;
    if (!candidate.scopeCritical || !candidate.auditPhase) return false;
    if (!sameScopeProject(task, candidate)) return false;
    if (phaseOrder(candidate.auditPhase) >= currentOrder) return false;
    return candidate.status !== "done";
  });
}

function getDependencies(task, allTasks = []) {
  return getBlockingPredecessors(task, allTasks).map((candidate) => candidate.id);
}

function reviewReached(current, threshold) {
  return (REVIEW_ORDER[current] || 0) >= (REVIEW_ORDER[threshold] || 0);
}

function getNodeStatus(record, phase, node) {
  if (node.type === "text") {
    return hasTextForNode(record, node) ? NODE_STATUS.COMPLETED : NODE_STATUS.PENDING;
  }

  if (node.type?.startsWith("upload")) {
    return getMaterials(record, node.category, phase.id, node.id).length
      ? NODE_STATUS.COMPLETED
      : NODE_STATUS.PENDING;
  }

  if (node.type === "review") {
    return reviewReached(record.reviewStatus, node.threshold)
      ? NODE_STATUS.COMPLETED
      : NODE_STATUS.PENDING;
  }

  return NODE_STATUS.PENDING;
}

function buildPhaseProgress(record) {
  let completedNodes = 0;
  let totalNodes = 0;
  let completedExecutionNodes = 0;
  let totalExecutionNodes = 0;

  const phases = WORKSPACE_PHASES.map((phase) => {
    let phaseCompleted = 0;
    let phaseTotal = 0;
    let phaseExecutionCompleted = 0;
    let phaseExecutionTotal = 0;

    const nodes = phase.nodes.map((node) => {
      const status = getNodeStatus(record, phase, node);
      const completed = status === NODE_STATUS.COMPLETED;
      const required = node.required !== false;
      const executionNode = required && !node.signoff;
      const materials = node.type?.startsWith("upload")
        ? getMaterials(record, node.category, phase.id, node.id)
        : [];

      if (required) {
        phaseTotal += 1;
        totalNodes += 1;
      }
      if (required && completed) {
        phaseCompleted += 1;
        completedNodes += 1;
      }
      if (executionNode) {
        phaseExecutionTotal += 1;
        totalExecutionNodes += 1;
      }
      if (executionNode && completed) {
        phaseExecutionCompleted += 1;
        completedExecutionNodes += 1;
      }

      return {
        ...node,
        phaseId: phase.id,
        status,
        value: node.type === "text" ? textValueForNode(record, node) : "",
        materialCount: materials.length
      };
    });

    return {
      id: phase.id,
      label: phase.label,
      description: phase.description,
      completedNodes: phaseCompleted,
      totalNodes: phaseTotal,
      completedExecutionNodes: phaseExecutionCompleted,
      totalExecutionNodes: phaseExecutionTotal,
      nodes
    };
  });

  return {
    phases,
    completedNodes,
    totalNodes,
    completedExecutionNodes,
    totalExecutionNodes,
    progressPercent: totalNodes ? Math.round((completedNodes / totalNodes) * 100) : 0,
    executionComplete: totalExecutionNodes > 0 && completedExecutionNodes === totalExecutionNodes,
    allRequiredComplete: totalNodes > 0 && completedNodes === totalNodes
  };
}

function getEvidenceStatus(record, progress) {
  const evidenceCount = getMaterials(record, MATERIAL_CATEGORY.EVIDENCE).length;
  const sppCount = getMaterials(record, MATERIAL_CATEGORY.SPP).length;
  const meetingCount = getMaterials(record, MATERIAL_CATEGORY.MEETING_MINUTES).length;

  if (record.reviewStatus === REVIEW_STATUS.SIGNED_OFF) return EVIDENCE_STATUS.APPROVED;
  if (record.reviewStatus === REVIEW_STATUS.COMMENTED) return EVIDENCE_STATUS.REJECTED;
  if (evidenceCount > 0 && sppCount > 0) return EVIDENCE_STATUS.UPLOADED;
  if (evidenceCount > 0 || sppCount > 0 || meetingCount > 0 || progress.completedNodes > 0) {
    return EVIDENCE_STATUS.PARTIAL_UPLOADED;
  }
  return EVIDENCE_STATUS.NONE;
}

function deriveStatusFromProgress(record, task, allTasks = [], progress = buildPhaseProgress(record)) {
  const blockers = task ? getBlockingPredecessors(task, allTasks) : [];

  if (blockers.length) return PROGRESS_STATUS.BLOCKED;
  if (record.reviewStatus === REVIEW_STATUS.COMMENTED) return PROGRESS_STATUS.NEEDS_REWORK;
  if (record.reviewStatus === REVIEW_STATUS.SIGNED_OFF && progress.allRequiredComplete) {
    return PROGRESS_STATUS.COMPLETED;
  }
  if (record.reviewStatus === REVIEW_STATUS.PENDING_REVIEW || progress.executionComplete) {
    return PROGRESS_STATUS.PENDING_REVIEW;
  }
  if (progress.completedNodes === 0) return PROGRESS_STATUS.NOT_STARTED;
  return PROGRESS_STATUS.IN_PROGRESS;
}

function phaseProgressMap(phases) {
  return phases.reduce((result, phase) => ({
    ...result,
    [phase.id]: {
      completedNodes: phase.completedNodes,
      totalNodes: phase.totalNodes
    }
  }), {});
}

export function deriveProgressStatus(record, task, allTasks = []) {
  const normalized = normalizeRecord(task?.id || record?.id || "", record);
  return deriveStatusFromProgress(
    normalized,
    task,
    allTasks,
    buildPhaseProgress(normalized)
  );
}

function buildDetail(controlId, record, task = null, allTasks = []) {
  const normalized = normalizeRecord(controlId, record);
  const progress = buildPhaseProgress(normalized);
  const blockers = task ? getBlockingPredecessors(task, allTasks).map((candidate) => candidate.id) : [];
  const progressStatus = deriveStatusFromProgress(normalized, task, allTasks, progress);

  return {
    id: controlId,
    title: task?.title || "",
    controlType: task ? inferControlType(task) : "",
    testContent: normalized.testContent,
    nodeResponses: normalized.nodeResponses,
    materials: normalized.materials,
    phases: progress.phases,
    completedNodes: progress.completedNodes,
    totalNodes: progress.totalNodes,
    phaseProgress: phaseProgressMap(progress.phases),
    progressPercent: progress.progressPercent,
    progressStatus,
    reviewStatus: normalized.reviewStatus,
    reviewComment: normalized.reviewComment,
    blockers,
    updatedAt: normalized.updatedAt
  };
}

function buildSnapshotItem(task, record, allTasks) {
  const detail = buildDetail(task.id, record, task, allTasks);
  const evidenceCount = getMaterials(detail, MATERIAL_CATEGORY.EVIDENCE).length;
  const meetingMinutesCount = getMaterials(detail, MATERIAL_CATEGORY.MEETING_MINUTES).length;
  const sppCount = getMaterials(detail, MATERIAL_CATEGORY.SPP).length;

  return {
    id: task.id,
    title: task.title,
    controlType: inferControlType(task),
    owner: task.owner || "未分配",
    auditPhase: task.auditPhase || "",
    taskStatus: task.status || "todo",
    progressStatus: detail.progressStatus,
    progressPercent: detail.progressPercent,
    completedNodes: detail.completedNodes,
    totalNodes: detail.totalNodes,
    phaseProgress: detail.phaseProgress,
    evidenceStatus: getEvidenceStatus(detail, detail),
    evidenceCount,
    meetingMinutesCount,
    sppCount,
    reviewStatus: detail.reviewStatus,
    blockers: detail.blockers,
    dependencies: getDependencies(task, allTasks),
    updatedAt: detail.updatedAt
  };
}

export function getControlProgressSnapshot(projectId, tasks = []) {
  const store = loadStore();
  const records = store.records || {};
  const projectTasks = tasks.filter((task) => !projectId || task.projectId === projectId);
  const controls = projectTasks.map((task) => (
    buildSnapshotItem(task, normalizeRecord(task.id, records[task.id]), projectTasks)
  ));

  return {
    projectId,
    updatedAt: store.updatedAt || nowIso(),
    controls
  };
}

export function getControlProgressDetail(controlId, task = null, allTasks = []) {
  const records = loadStore().records || {};
  return buildDetail(controlId, records[controlId], task, allTasks);
}

export function upsertControlProgress(controlId, patch) {
  const store = loadStore();
  const records = store.records || {};
  const current = normalizeRecord(controlId, records[controlId]);
  const updatedAt = nowIso();
  const nextRecord = normalizeRecord(controlId, {
    ...current,
    ...patch,
    testContent: {
      ...current.testContent,
      ...(patch.testContent || {})
    },
    nodeResponses: {
      ...current.nodeResponses,
      ...(patch.nodeResponses || {})
    },
    materials: patch.materials || current.materials,
    updatedAt
  });

  const nextStore = {
    ...store,
    updatedAt,
    records: {
      ...records,
      [controlId]: nextRecord
    }
  };
  saveStore(nextStore);
  return clone(nextRecord);
}

export function updateWorkspaceNodeResponse(controlId, nodeId, value) {
  const current = getControlProgressDetail(controlId);
  return upsertControlProgress(controlId, {
    nodeResponses: {
      ...current.nodeResponses,
      [nodeId]: value
    }
  });
}

export function addWorkspaceMaterial(controlId, material) {
  const current = getControlProgressDetail(controlId);
  const nextMaterial = normalizeMaterial({
    ...material,
    uploadedAt: nowIso()
  });

  return upsertControlProgress(controlId, {
    materials: [nextMaterial, ...current.materials]
  });
}

export function removeWorkspaceMaterial(controlId, materialId) {
  const current = getControlProgressDetail(controlId);
  return upsertControlProgress(controlId, {
    materials: current.materials.filter((item) => item.id !== materialId)
  });
}
