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

const DEFAULT_TEST_CONTENT = {
  objective: "",
  procedure: "",
  sampleInfo: "",
  result: ""
};

const PHASE_ORDER = {
  "scope-confirm": 0,
  "risk-assessment": 1,
  "control-design": 2,
  "industry-addon": 3,
  "control-test": 4,
  "deficiency-review": 5,
  "wrap-up": 6
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

function normalizeRecord(controlId, record = {}) {
  return {
    id: controlId,
    testContent: {
      ...DEFAULT_TEST_CONTENT,
      ...(record.testContent || {})
    },
    materials: Array.isArray(record.materials) ? record.materials : [],
    reviewStatus: record.reviewStatus || REVIEW_STATUS.NOT_SUBMITTED,
    reviewComment: record.reviewComment || "",
    updatedAt: record.updatedAt || nowIso()
  };
}

function hasTestContent(record) {
  const content = record?.testContent || {};
  return Boolean(
    content.objective?.trim()
    || content.procedure?.trim()
    || content.sampleInfo?.trim()
    || content.result?.trim()
  );
}

function getMaterials(record, category) {
  return (record?.materials || []).filter((item) => item.category === category);
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

function getEvidenceStatus(record) {
  const evidenceCount = getMaterials(record, "evidence").length;
  const meetingCount = getMaterials(record, "meeting_minutes").length;

  if (record.reviewStatus === REVIEW_STATUS.SIGNED_OFF) return EVIDENCE_STATUS.APPROVED;
  if (record.reviewStatus === REVIEW_STATUS.COMMENTED) return EVIDENCE_STATUS.REJECTED;
  if (evidenceCount > 0) return EVIDENCE_STATUS.UPLOADED;
  if (meetingCount > 0 || hasTestContent(record)) return EVIDENCE_STATUS.PARTIAL_UPLOADED;
  return EVIDENCE_STATUS.NONE;
}

function getProgressPercent(record) {
  let percent = 0;

  if (record.testContent?.objective?.trim() || record.testContent?.procedure?.trim()) {
    percent = 25;
  } else if (hasTestContent(record)) {
    percent = 15;
  }

  if (getMaterials(record, "meeting_minutes").length) percent = Math.max(percent, 40);
  if (getMaterials(record, "evidence").length) percent = Math.max(percent, 60);
  if (record.reviewStatus === REVIEW_STATUS.PENDING_REVIEW) percent = Math.max(percent, 75);
  if (record.reviewStatus === REVIEW_STATUS.COMMENTED) percent = Math.max(percent, 70);
  if (record.reviewStatus === REVIEW_STATUS.SIGNED_OFF) percent = 100;

  return percent;
}

export function deriveProgressStatus(record, task, allTasks = []) {
  const normalized = normalizeRecord(task?.id || record?.id || "", record);
  const blockers = task ? getBlockingPredecessors(task, allTasks) : [];

  if (blockers.length) return PROGRESS_STATUS.BLOCKED;
  if (normalized.reviewStatus === REVIEW_STATUS.SIGNED_OFF) return PROGRESS_STATUS.COMPLETED;
  if (normalized.reviewStatus === REVIEW_STATUS.COMMENTED) return PROGRESS_STATUS.NEEDS_REWORK;
  if (normalized.reviewStatus === REVIEW_STATUS.PENDING_REVIEW) return PROGRESS_STATUS.PENDING_REVIEW;
  if (getMaterials(normalized, "evidence").length) return PROGRESS_STATUS.EVIDENCE_SUBMITTED;
  if (hasTestContent(normalized) || getMaterials(normalized, "meeting_minutes").length) {
    return PROGRESS_STATUS.IN_PROGRESS;
  }
  return PROGRESS_STATUS.NOT_STARTED;
}

function buildSnapshotItem(task, record, allTasks) {
  const normalized = normalizeRecord(task.id, record);
  const blockers = getBlockingPredecessors(task, allTasks).map((candidate) => candidate.id);
  const meetingMinutesCount = getMaterials(normalized, "meeting_minutes").length;
  const evidenceCount = getMaterials(normalized, "evidence").length;

  return {
    id: task.id,
    title: task.title,
    controlType: inferControlType(task),
    owner: task.owner || "未分配",
    auditPhase: task.auditPhase || "",
    taskStatus: task.status || "todo",
    progressStatus: deriveProgressStatus(normalized, task, allTasks),
    progressPercent: getProgressPercent(normalized),
    evidenceStatus: getEvidenceStatus(normalized),
    evidenceCount,
    meetingMinutesCount,
    reviewStatus: normalized.reviewStatus,
    blockers,
    dependencies: getDependencies(task, allTasks),
    updatedAt: normalized.updatedAt
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

export function getControlProgressDetail(controlId) {
  const records = loadStore().records || {};
  return normalizeRecord(controlId, records[controlId]);
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

export function addWorkspaceMaterial(controlId, material) {
  const current = getControlProgressDetail(controlId);
  const uploadedAt = nowIso();
  const nextMaterial = {
    id: material.id || `mat_${Math.random().toString(36).slice(2, 9)}`,
    category: material.category || "evidence",
    name: material.name || "未命名材料",
    fileType: material.fileType || "",
    size: material.size || 0,
    uploadedBy: material.uploadedBy || "成员",
    uploadedAt,
    status: material.status || "submitted"
  };

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
