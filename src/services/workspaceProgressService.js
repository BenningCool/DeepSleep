import { getPhaseOrder, normalizeAuditPhase } from "../modules/scope-init/scopeRules";

export const WORKSPACE_PROGRESS_STORAGE_KEY = "deepsleep-workspace-progress-v1";
const STORE_SCHEMA_VERSION = 2;

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
  EVIDENCE: "evidence",
  POLICY: "policy",
  SUPPORTING_MATERIAL: "supporting_material",
  REQUIREMENT_LIST: "requirement_list",
  SAMPLE_POOL: "sample_pool",
  RETURNED_SAMPLE_SUPPORT: "returned_sample_support"
};

const DEFAULT_TEST_CONTENT = {
  objective: "",
  procedure: "",
  sampleInfo: "",
  result: ""
};

const DEFAULT_MILESTONES = {
  planning: false,
  review: false
};

const WORD_FILE_ACCEPT = ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const FIELD_REVIEW_STATUS = {
  OPEN: "open",
  REPLIED: "replied",
  ACCEPTED: "accepted"
};

const RAWTC_FACTORS = [
  { id: "substantive_not_sufficient", label: "Substantive procedures alone will not be sufficient" },
  { id: "transaction_changes", label: "交易数量或性质发生变化" },
  { id: "history_of_errors", label: "相关科目存在历史错报" },
  { id: "prior_deficiencies", label: "以前年度或相关测试发现缺陷" },
  { id: "complex_control", label: "控制性质复杂" },
  { id: "infrequent_operation", label: "控制运行频率较低" },
  { id: "other_controls_reliance", label: "依赖其他控制的有效性" },
  { id: "operator_competence", label: "控制执行人或监控人胜任能力存在疑虑" },
  { id: "key_personnel_change", label: "关键控制人员发生变化" },
  { id: "significant_judgement", label: "控制运行涉及重大判断" },
  { id: "process_change", label: "控制或流程运行方式发生变化" },
  { id: "information_reliability", label: "控制依赖信息的可靠性重要" }
];

const CONTROL_ATTRIBUTE_ROWS = [
  { id: "attribute-a", label: "Attribute A" },
  { id: "attribute-b", label: "Attribute B" }
];

const DEFAULT_WORKSPACE_PHASES = [
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

const GITC_WORKSPACE_PHASES = [
  {
    id: "tod",
    label: "TOD",
    description: "GITC 设计有效性：上传制度、生成 Design、记录访谈实施情况并完成 Test of One。",
    nodes: [
      {
        id: "gitc-tod-policy",
        label: "上传制度",
        type: "upload_policy",
        required: true,
        category: MATERIAL_CATEGORY.POLICY,
        actionLabel: "上传制度",
        accept: WORD_FILE_ACCEPT,
        acceptedFileKind: "word",
        fileHint: "仅支持 Word（.doc/.docx）"
      },
      {
        id: "gitc-tod-design",
        label: "自动生成 Design",
        type: "generated_text",
        required: true,
        dependsOnNodeId: "gitc-tod-policy",
        generationKind: "design",
        placeholder: "上传制度后自动生成 Design 草稿，保存后计入完成度。"
      },
      {
        id: "gitc-tod-minutes",
        label: "上传会议纪要",
        type: "upload_minutes",
        required: true,
        category: MATERIAL_CATEGORY.MEETING_MINUTES,
        actionLabel: "上传纪要"
      },
      {
        id: "gitc-tod-implementation",
        label: "自动生成 Implementation",
        type: "generated_text",
        required: true,
        dependsOnNodeId: "gitc-tod-minutes",
        generationKind: "implementation",
        placeholder: "上传会议纪要后自动生成 Implementation 草稿，保存后计入完成度。"
      },
      {
        id: "gitc-tod-supporting-material",
        label: "上传支持性材料",
        type: "upload_supporting_material",
        required: true,
        category: MATERIAL_CATEGORY.SUPPORTING_MATERIAL,
        actionLabel: "上传支持性材料"
      },
      {
        id: "gitc-tod-test-of-one",
        label: "填写 Test of One 样本表",
        type: "generated_text",
        required: true,
        dependsOnNodeId: "gitc-tod-supporting-material",
        generationKind: "test_of_one",
        builderKind: "test_of_one_table",
        placeholder: "手动填写样本字段和样本信息后生成 Test of One 表格，保存后计入完成度。"
      }
    ]
  },
  {
    id: "toe",
    label: "TOE",
    description: "GITC 运行有效性：上传需求和样本清单，生成抽样样本，发送并完成抄写。",
    nodes: [
      {
        id: "gitc-toe-requirement-list",
        label: "上传需求清单",
        type: "upload_requirement_list",
        required: true,
        category: MATERIAL_CATEGORY.REQUIREMENT_LIST,
        actionLabel: "上传需求清单"
      },
      {
        id: "gitc-toe-sample-pool",
        label: "上传样本清单",
        type: "upload_sample_pool",
        required: true,
        category: MATERIAL_CATEGORY.SAMPLE_POOL,
        actionLabel: "上传样本清单",
        requiresExportPath: true,
        exportPathLabel: "客户导出清单路径",
        exportPathPlaceholder: "例如：客户系统 / 程序变更 / 2025变更清单导出.xlsx"
      },
      {
        id: "gitc-toe-sampling",
        label: "自动抽样生成抽样样本",
        type: "generated_file",
        required: true,
        dependsOnNodeId: "gitc-toe-sample-pool",
        generationKind: "sampling",
        fileKind: "sampling_excel",
        placeholder: "上传样本清单后自动生成 25 个抽样样本 Excel，保存后计入完成度。"
      },
      {
        id: "gitc-toe-send-sample",
        label: "是否发送样本",
        type: "send_toggle",
        required: true
      },
      {
        id: "gitc-toe-returned-sample-support",
        label: "上传客户返回的样本支持性材料",
        type: "upload_returned_sample_support",
        required: true,
        category: MATERIAL_CATEGORY.RETURNED_SAMPLE_SUPPORT,
        actionLabel: "上传返回材料"
      },
      {
        id: "gitc-toe-transcription",
        label: "填写样本抄写表",
        type: "generated_text",
        required: true,
        dependsOnNodeId: "gitc-toe-returned-sample-support",
        generationKind: "transcription",
        builderKind: "sample_transcription_table",
        placeholder: "手动填写样本字段并录入多个样本后，点击生成抄写表格，保存后计入完成度。"
      }
    ]
  }
];

const ITAC_WORKSPACE_PHASES = [
  {
    id: "tod",
    label: "TOD",
    description: "ITAC 测试执行：上传会议纪要，生成 Implementation，记录配置/代码支持材料并完成 Test of One 样本表。",
    nodes: [
      {
        id: "itac-tod-minutes",
        label: "上传会议纪要",
        type: "upload_minutes",
        required: true,
        category: MATERIAL_CATEGORY.MEETING_MINUTES,
        actionLabel: "上传纪要"
      },
      {
        id: "itac-tod-implementation",
        label: "自动生成 Implementation",
        type: "generated_text",
        required: true,
        dependsOnNodeId: "itac-tod-minutes",
        generationKind: "implementation",
        placeholder: "上传会议纪要后自动生成 Implementation 草稿，保存后计入完成度。"
      },
      {
        id: "itac-tod-supporting-material",
        label: "上传配置/代码支持性材料",
        type: "upload_supporting_material",
        required: true,
        category: MATERIAL_CATEGORY.SUPPORTING_MATERIAL,
        actionLabel: "上传支持性材料",
        supportKindOptions: [
          { value: "configuration", label: "配置" },
          { value: "code", label: "代码" }
        ],
        defaultSupportingMaterialKind: "configuration"
      },
      {
        id: "itac-tod-test-of-one-support",
        label: "上传 Test of One 支持性材料",
        type: "upload_test_of_one_support",
        required: true,
        category: MATERIAL_CATEGORY.SUPPORTING_MATERIAL,
        actionLabel: "上传 Test of One 支持材料",
        defaultSupportingMaterialKind: "test_of_one"
      },
      {
        id: "itac-tod-test-of-one",
        label: "填写 Test of One 样本表",
        type: "generated_text",
        required: true,
        dependsOnNodeId: "itac-tod-test-of-one-support",
        generationKind: "test_of_one",
        builderKind: "itac_test_of_one_table",
        placeholder: "手动填写样本字段并填写样本信息后生成 Test of One 表格，保存后计入完成度。"
      }
    ]
  }
];

export const WORKSPACE_PHASES = DEFAULT_WORKSPACE_PHASES;

export function getWorkspacePhases(controlType = "") {
  const normalized = String(controlType).toUpperCase();
  if (normalized === "ITAC") return ITAC_WORKSPACE_PHASES;
  if (normalized === "GITC") return GITC_WORKSPACE_PHASES;
  return DEFAULT_WORKSPACE_PHASES;
}

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

function normalizeStore(raw = {}) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      schemaVersion: STORE_SCHEMA_VERSION,
      updatedAt: nowIso(),
      projects: {}
    };
  }

  return {
    schemaVersion: raw.schemaVersion || 1,
    updatedAt: raw.updatedAt || nowIso(),
    projects: raw.projects && typeof raw.projects === "object" ? raw.projects : {},
    records: raw.records && typeof raw.records === "object" ? raw.records : undefined
  };
}

function loadStore() {
  const storage = safeStorage();
  if (!storage) {
    return normalizeStore();
  }

  try {
    const saved = JSON.parse(storage.getItem(WORKSPACE_PROGRESS_STORAGE_KEY) || "{}");
    return normalizeStore(saved);
  } catch {
    return normalizeStore();
  }
}

function saveStore(store) {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(WORKSPACE_PROGRESS_STORAGE_KEY, JSON.stringify(store));
}

function resolveProjectId(projectId, task) {
  return String(projectId || task?.projectId || "").trim();
}

function ensureProjectBucket(store, projectId) {
  if (!projectId) return null;
  if (!store.projects[projectId]) {
    store.projects[projectId] = { records: {} };
  }
  if (!store.projects[projectId].records) {
    store.projects[projectId].records = {};
  }
  return store.projects[projectId].records;
}

function migrateLegacyRecord(store, projectId, controlId) {
  if (!projectId || !store.records?.[controlId]) return false;

  const bucket = ensureProjectBucket(store, projectId);
  if (!bucket[controlId]) {
    bucket[controlId] = store.records[controlId];
  }
  delete store.records[controlId];
  if (!Object.keys(store.records).length) {
    delete store.records;
  }
  store.schemaVersion = STORE_SCHEMA_VERSION;
  return true;
}

function migrateProjectRecords(store, projectId, controlIds = []) {
  if (!projectId) return false;
  let changed = false;
  controlIds.forEach((controlId) => {
    if (migrateLegacyRecord(store, projectId, controlId)) {
      changed = true;
    }
  });
  return changed;
}

function readProjectRecord(store, projectId, controlId) {
  if (projectId) {
    migrateLegacyRecord(store, projectId, controlId);
    const projectRecord = store.projects?.[projectId]?.records?.[controlId];
    if (projectRecord) return projectRecord;
  }

  return store.records?.[controlId] || null;
}

function writeProjectRecord(store, projectId, controlId, record) {
  if (projectId) {
    const bucket = ensureProjectBucket(store, projectId);
    bucket[controlId] = record;
    if (store.records?.[controlId]) {
      delete store.records[controlId];
      if (!Object.keys(store.records).length) {
        delete store.records;
      }
    }
  } else if (store.records) {
    store.records[controlId] = record;
  } else {
    store.records = { [controlId]: record };
  }

  store.schemaVersion = STORE_SCHEMA_VERSION;
  store.updatedAt = nowIso();
}

function normalizeMaterial(material = {}) {
  return {
    id: material.id || `mat_${Math.random().toString(36).slice(2, 9)}`,
    category: material.category || MATERIAL_CATEGORY.EVIDENCE,
    supportingMaterialKind: material.supportingMaterialKind || "",
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

function normalizeMilestones(milestones = {}) {
  const safe = milestones && typeof milestones === "object" && !Array.isArray(milestones)
    ? milestones
    : {};
  return {
    planning: Boolean(safe.planning),
    review: Boolean(safe.review)
  };
}

function normalizeMilestoneActors(actors = {}, milestones = DEFAULT_MILESTONES) {
  return {
    planning: milestones.planning ? (actors.planning || "") : "",
    review: milestones.review ? (actors.review || "") : ""
  };
}

function normalizeExtraTextFields(extraTextFields = {}) {
  if (!extraTextFields || typeof extraTextFields !== "object" || Array.isArray(extraTextFields)) {
    return {};
  }

  return Object.entries(extraTextFields).reduce((result, [nodeId, fields]) => {
    if (!Array.isArray(fields)) return result;
    result[nodeId] = fields.map((field) => ({
      id: field.id || `txt_${Math.random().toString(36).slice(2, 9)}`,
      label: field.label || "补充说明",
      value: field.value || "",
      createdAt: field.createdAt || nowIso()
    }));
    return result;
  }, {});
}

function normalizeFieldReviews(fieldReviews = {}) {
  if (!fieldReviews || typeof fieldReviews !== "object" || Array.isArray(fieldReviews)) {
    return {};
  }

  return Object.entries(fieldReviews).reduce((result, [fieldKey, review]) => {
    if (!review || typeof review !== "object") return result;
    result[fieldKey] = {
      id: review.id || `rev_${Math.random().toString(36).slice(2, 9)}`,
      status: Object.values(FIELD_REVIEW_STATUS).includes(review.status)
        ? review.status
        : FIELD_REVIEW_STATUS.OPEN,
      comment: review.comment || "",
      reply: review.reply || "",
      createdBy: review.createdBy || "Reviewer",
      repliedBy: review.repliedBy || "",
      acceptedBy: review.acceptedBy || "",
      createdAt: review.createdAt || nowIso(),
      updatedAt: review.updatedAt || review.createdAt || nowIso()
    };
    return result;
  }, {});
}

function normalizeNodeDueDates(nodeDueDates = {}) {
  if (!nodeDueDates || typeof nodeDueDates !== "object" || Array.isArray(nodeDueDates)) {
    return {};
  }

  return Object.entries(nodeDueDates).reduce((result, [nodeId, dueDate]) => {
    const normalized = String(dueDate || "").trim();
    if (normalized) result[nodeId] = normalized;
    return result;
  }, {});
}

function normalizeRecord(controlId, record = {}) {
  const safe = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  const milestones = normalizeMilestones(safe.milestones);

  return {
    id: controlId,
    testContent: {
      ...DEFAULT_TEST_CONTENT,
      ...(safe.testContent && typeof safe.testContent === "object" ? safe.testContent : {})
    },
    nodeResponses: safe.nodeResponses && typeof safe.nodeResponses === "object"
      ? safe.nodeResponses
      : {},
    materials: Array.isArray(safe.materials) ? safe.materials.map(normalizeMaterial) : [],
    milestones,
    milestoneActors: normalizeMilestoneActors(safe.milestoneActors, milestones),
    extraTextFields: normalizeExtraTextFields(safe.extraTextFields),
    fieldReviews: normalizeFieldReviews(safe.fieldReviews),
    nodeDueDates: normalizeNodeDueDates(safe.nodeDueDates),
    reviewStatus: safe.reviewStatus || REVIEW_STATUS.NOT_SUBMITTED,
    reviewComment: safe.reviewComment || "",
    updatedAt: safe.updatedAt || nowIso()
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

function hasGeneratedFileForNode(record, node) {
  const value = record.nodeResponses?.[node.id];
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (node.fileKind && value.kind !== node.fileKind) return false;
  return Array.isArray(value.rows) && value.rows.length > 0;
}

function exportPathForNode(record, node) {
  const value = record.nodeResponses?.[node.id];
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  return String(value.exportPath || "").trim();
}

function responseValue(record, key) {
  return record.nodeResponses?.[key];
}

function structuredFieldKey(node, field) {
  return `${node.id}.${field.id}`;
}

function hasTextValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasAnyMatrixCell(rowValue = {}) {
  if (!rowValue || typeof rowValue !== "object" || Array.isArray(rowValue)) return false;
  return Object.values(rowValue).some((cellValue) => {
    if (typeof cellValue === "boolean") return cellValue;
    if (typeof cellValue === "number") return true;
    if (typeof cellValue === "string") return cellValue.trim().length > 0;
    if (Array.isArray(cellValue)) return cellValue.length > 0;
    return cellValue && typeof cellValue === "object" && Object.keys(cellValue).length > 0;
  });
}

function isFieldComplete(record, node, field) {
  const value = responseValue(record, structuredFieldKey(node, field));

  if (field.type === "matrix") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const requiredRows = Array.isArray(field.rows) && field.rows.length ? field.rows : [];
    if (!requiredRows.length) return Object.values(value).some(hasAnyMatrixCell);
    return requiredRows.every((row) => hasAnyMatrixCell(value[row.id]));
  }

  if (field.type === "checkbox_group") {
    return Array.isArray(value) && value.length > 0;
  }

  if (field.type === "checkbox") {
    return value === true;
  }

  if (field.type === "date_range") {
    return Boolean(value?.start && value?.end);
  }

  if (field.type === "yes_no" || field.type === "select" || field.type === "text" || field.type === "textarea") {
    return hasTextValue(value);
  }

  return Boolean(value);
}

function isStructuredNodeComplete(record, node) {
  const fields = Array.isArray(node.fields) ? node.fields : [];
  const requiredFieldIds = Array.isArray(node.requiredFields)
    ? node.requiredFields
    : fields.filter((field) => field.required !== false).map((field) => field.id);
  const requiredFields = fields.filter((field) => requiredFieldIds.includes(field.id));

  if (!requiredFields.length) {
    return fields.some((field) => isFieldComplete(record, node, field));
  }

  return requiredFields.every((field) => isFieldComplete(record, node, field));
}

function getStructuredValues(record, node) {
  return (node.fields || []).reduce((result, field) => ({
    ...result,
    [field.id]: responseValue(record, structuredFieldKey(node, field))
  }), {});
}

function getMaterials(record, category, phaseId, nodeId, supportingMaterialKind = "") {
  return (record?.materials || []).filter((item) => {
    if (category && item.category !== category) return false;
    if (supportingMaterialKind && item.supportingMaterialKind !== supportingMaterialKind) return false;
    if (phaseId && item.phaseId !== phaseId) return false;
    if (nodeId && item.nodeId && item.nodeId !== nodeId) return false;
    return true;
  });
}

function supportingMaterialKindFilterForNode(node) {
  if (node.supportKindOptions?.length) return "";
  return node.defaultSupportingMaterialKind || "";
}

export function inferControlType(task = {}) {
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
  return getPhaseOrder(normalizeAuditPhase(phase));
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
  if (node.type === "text" || node.type === "generated_text") {
    return hasTextForNode(record, node) ? NODE_STATUS.COMPLETED : NODE_STATUS.PENDING;
  }

  if (node.type === "generated_file") {
    return hasGeneratedFileForNode(record, node) ? NODE_STATUS.COMPLETED : NODE_STATUS.PENDING;
  }

  if (node.type === "structured") {
    return isStructuredNodeComplete(record, node) ? NODE_STATUS.COMPLETED : NODE_STATUS.PENDING;
  }

  if (node.type === "send_toggle") {
    return record.nodeResponses?.[node.id]?.sent
      ? NODE_STATUS.COMPLETED
      : NODE_STATUS.PENDING;
  }

  if (node.type?.startsWith("upload")) {
    const hasMaterials = getMaterials(
      record,
      node.category,
      phase.id,
      node.id,
      supportingMaterialKindFilterForNode(node)
    ).length > 0;
    const hasRequiredExportPath = !node.requiresExportPath || Boolean(exportPathForNode(record, node));
    return hasMaterials && hasRequiredExportPath
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

function buildPhaseProgress(record, controlType = "") {
  let completedNodes = 0;
  let totalNodes = 0;
  let completedExecutionNodes = 0;
  let totalExecutionNodes = 0;
  const workspacePhases = getWorkspacePhases(controlType);

  const phases = workspacePhases.map((phase) => {
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
        ? getMaterials(
            record,
            node.category,
            phase.id,
            node.id,
            supportingMaterialKindFilterForNode(node)
          )
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
        dueDate: record.nodeDueDates?.[node.id] || "",
        status,
        value: node.type === "text" || node.type === "generated_text" ? textValueForNode(record, node) : "",
        file: node.type === "generated_file" ? record.nodeResponses?.[node.id] || null : undefined,
        values: node.type === "structured" ? getStructuredValues(record, node) : undefined,
        exportPath: node.requiresExportPath ? exportPathForNode(record, node) : undefined,
        sendState: node.type === "send_toggle" ? record.nodeResponses?.[node.id] || null : undefined,
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

/** 首个未完成 required 节点；若全部完成则返回最后一个节点 */
function resolveCurrentWorkspaceNode(phases = []) {
  for (const phase of phases) {
    const requiredNodes = (phase.nodes || []).filter((node) => node.required !== false);
    for (const node of requiredNodes) {
      if (node.status !== NODE_STATUS.COMPLETED) {
        return {
          id: node.id,
          label: node.label,
          phaseId: phase.id,
          phaseLabel: phase.label || String(phase.id || "").toUpperCase(),
          isComplete: false
        };
      }
    }
  }

  for (let index = phases.length - 1; index >= 0; index -= 1) {
    const phase = phases[index];
    const requiredNodes = (phase.nodes || []).filter((node) => node.required !== false);
    const lastNode = requiredNodes[requiredNodes.length - 1];
    if (lastNode) {
      return {
        id: lastNode.id,
        label: lastNode.label,
        phaseId: phase.id,
        phaseLabel: phase.label || String(phase.id || "").toUpperCase(),
        isComplete: true
      };
    }
  }

  return null;
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

function deriveStatusFromProgress(record, task, allTasks = [], progress = buildPhaseProgress(record, task ? inferControlType(task) : "")) {
  const blockers = task ? getBlockingPredecessors(task, allTasks) : [];

  if (blockers.length) return PROGRESS_STATUS.BLOCKED;
  if (record.reviewStatus === REVIEW_STATUS.COMMENTED) return PROGRESS_STATUS.NEEDS_REWORK;
  if (progress.allRequiredComplete && allFieldReviewsAccepted(record)) {
    return PROGRESS_STATUS.COMPLETED;
  }
  if (record.reviewStatus === REVIEW_STATUS.PENDING_REVIEW || progress.executionComplete) {
    return PROGRESS_STATUS.PENDING_REVIEW;
  }
  if (progress.completedNodes === 0) {
    return hasWorkspaceInput(record, progress)
      ? PROGRESS_STATUS.IN_PROGRESS
      : PROGRESS_STATUS.NOT_STARTED;
  }
  return PROGRESS_STATUS.IN_PROGRESS;
}

function allFieldReviewsAccepted(record) {
  return Object.values(record.fieldReviews || {}).every((review) => (
    review.status === FIELD_REVIEW_STATUS.ACCEPTED
  ));
}

function hasMeaningfulValue(value) {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return true;
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (value && typeof value === "object") return Object.values(value).some(hasMeaningfulValue);
  return false;
}

function hasWorkspaceInput(record, progress) {
  if ((progress?.completedNodes || 0) > 0) return true;
  if ((record.materials || []).length > 0) return true;
  if (Object.values(record.nodeResponses || {}).some(hasMeaningfulValue)) return true;
  if (Object.values(record.extraTextFields || {}).some((fields) => (
    Array.isArray(fields) && fields.some((field) => hasMeaningfulValue(field.value))
  ))) return true;
  return false;
}

function deriveWorkspaceStatus(record, progress) {
  if (progress?.allRequiredComplete && allFieldReviewsAccepted(record)) {
    return PROGRESS_STATUS.COMPLETED;
  }
  if (hasWorkspaceInput(record, progress)) return PROGRESS_STATUS.IN_PROGRESS;
  return PROGRESS_STATUS.NOT_STARTED;
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
    buildPhaseProgress(normalized, task ? inferControlType(task) : "")
  );
}

function buildDetail(controlId, record, task = null, allTasks = []) {
  const normalized = normalizeRecord(controlId, record);
  const controlType = task ? inferControlType(task) : "";
  const progress = buildPhaseProgress(normalized, controlType);
  const blockers = task ? getBlockingPredecessors(task, allTasks).map((candidate) => candidate.id) : [];
  const progressStatus = deriveStatusFromProgress(normalized, task, allTasks, progress);

  return {
    id: controlId,
    title: task?.title || "",
    controlType,
    testContent: normalized.testContent,
    nodeResponses: normalized.nodeResponses,
    materials: normalized.materials,
    phases: progress.phases,
    completedNodes: progress.completedNodes,
    totalNodes: progress.totalNodes,
    phaseProgress: phaseProgressMap(progress.phases),
    progressPercent: progress.progressPercent,
    progressStatus,
    workspaceStatus: deriveWorkspaceStatus(normalized, progress),
    milestones: normalized.milestones,
    milestoneActors: normalized.milestoneActors,
    extraTextFields: normalized.extraTextFields,
    fieldReviews: normalized.fieldReviews,
    nodeDueDates: normalized.nodeDueDates,
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
  const policyCount = getMaterials(detail, MATERIAL_CATEGORY.POLICY).length;
  const supportingMaterialCount = getMaterials(detail, MATERIAL_CATEGORY.SUPPORTING_MATERIAL).length;
  const requirementListCount = getMaterials(detail, MATERIAL_CATEGORY.REQUIREMENT_LIST).length;
  const samplePoolCount = getMaterials(detail, MATERIAL_CATEGORY.SAMPLE_POOL).length;
  const returnedSampleSupportCount = getMaterials(detail, MATERIAL_CATEGORY.RETURNED_SAMPLE_SUPPORT).length;
  const currentNode = resolveCurrentWorkspaceNode(detail.phases);

  return {
    id: task.id,
    title: task.title,
    controlType: inferControlType(task),
    owner: task.owner || "未分配",
    assigneeEmail: task.owner || "未分配",
    auditPhase: task.auditPhase || "",
    taskStatus: task.status || "todo",
    progressStatus: detail.progressStatus,
    workspaceStatus: detail.workspaceStatus,
    progressPercent: detail.progressPercent,
    completedNodes: detail.completedNodes,
    totalNodes: detail.totalNodes,
    phaseProgress: detail.phaseProgress,
    currentNodeId: currentNode?.id || "",
    currentNodeLabel: currentNode?.label || "",
    currentNodePhaseId: currentNode?.phaseId || "",
    currentNodePhaseLabel: currentNode?.phaseLabel || "",
    allNodesComplete: Boolean(currentNode?.isComplete),
    evidenceStatus: getEvidenceStatus(detail, detail),
    evidenceCount,
    meetingMinutesCount,
    sppCount,
    policyCount,
    supportingMaterialCount,
    requirementListCount,
    samplePoolCount,
    returnedSampleSupportCount,
    reviewStatus: detail.reviewStatus,
    milestones: detail.milestones,
    milestoneActors: detail.milestoneActors,
    nodeDueDates: detail.nodeDueDates,
    fieldReviewSummary: Object.values(detail.fieldReviews || {}).reduce((summary, review) => ({
      ...summary,
      [review.status]: (summary[review.status] || 0) + 1
    }), {}),
    blockers: detail.blockers,
    dependencies: getDependencies(task, allTasks),
    updatedAt: detail.updatedAt
  };
}

export function getControlProgressSnapshot(projectId, tasks = []) {
  const store = loadStore();
  const projectTasks = tasks.filter((task) => !projectId || task.projectId === projectId);
  if (migrateProjectRecords(store, projectId, projectTasks.map((task) => task.id))) {
    saveStore(store);
  }

  const controls = projectTasks.flatMap((task) => {
    try {
      return [buildSnapshotItem(
        task,
        readProjectRecord(store, projectId, task.id),
        projectTasks
      )];
    } catch (error) {
      console.error("[progress] snapshot build failed:", task?.id, error);
      return [];
    }
  });

  return {
    projectId,
    updatedAt: store.updatedAt || nowIso(),
    controls
  };
}

export function getControlProgressDetail(controlId, task = null, allTasks = []) {
  const projectId = resolveProjectId("", task);
  const store = loadStore();
  if (projectId) {
    migrateLegacyRecord(store, projectId, controlId);
    saveStore(store);
  }
  const record = readProjectRecord(store, projectId, controlId);
  return buildDetail(controlId, record, task, allTasks);
}

export function upsertControlProgress(controlId, patch, projectId = "") {
  const store = loadStore();
  const resolvedProjectId = resolveProjectId(projectId);
  const current = normalizeRecord(controlId, readProjectRecord(store, resolvedProjectId, controlId));
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
    milestones: {
      ...current.milestones,
      ...(patch.milestones || {})
    },
    milestoneActors: {
      ...current.milestoneActors,
      ...(patch.milestoneActors || {})
    },
    nodeDueDates: {
      ...current.nodeDueDates,
      ...(patch.nodeDueDates || {})
    },
    extraTextFields: patch.extraTextFields || current.extraTextFields,
    fieldReviews: patch.fieldReviews || current.fieldReviews,
    materials: patch.materials || current.materials,
    updatedAt
  });

  writeProjectRecord(store, resolvedProjectId, controlId, nextRecord);
  saveStore(store);
  return clone(nextRecord);
}

/** 删除项目时清理工作台进度（按 projectId 分区 + 遗留 flat records） */
export function deleteProjectWorkspaceProgress(projectId, controlIds = []) {
  if (!projectId) return;

  const store = loadStore();
  let changed = false;

  if (store.projects?.[projectId]) {
    delete store.projects[projectId];
    changed = true;
  }

  if (store.records && controlIds.length) {
    controlIds.forEach((controlId) => {
      if (store.records[controlId]) {
        delete store.records[controlId];
        changed = true;
      }
    });
    if (!Object.keys(store.records).length) {
      delete store.records;
    }
  }

  if (changed) {
    store.updatedAt = nowIso();
    saveStore(store);
  }
}

export function updateWorkspaceNodeResponse(controlId, nodeId, value, projectId = "") {
  const current = getControlProgressDetail(controlId, projectId ? { id: controlId, projectId } : null);
  return upsertControlProgress(controlId, {
    nodeResponses: {
      ...current.nodeResponses,
      [nodeId]: value
    }
  }, projectId);
}

export function addWorkspaceMaterial(controlId, material, projectId = "") {
  const current = getControlProgressDetail(controlId, projectId ? { id: controlId, projectId } : null);
  const nextMaterial = normalizeMaterial({
    ...material,
    uploadedAt: nowIso()
  });

  return upsertControlProgress(controlId, {
    materials: [nextMaterial, ...current.materials]
  }, projectId);
}

export function removeWorkspaceMaterial(controlId, materialId, projectId = "") {
  const current = getControlProgressDetail(controlId, projectId ? { id: controlId, projectId } : null);
  return upsertControlProgress(controlId, {
    materials: current.materials.filter((item) => item.id !== materialId)
  }, projectId);
}
