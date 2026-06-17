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
  { id: "transaction_changes", label: "Changes in transaction volume or nature" },
  { id: "history_of_errors", label: "Related account has a history of errors" },
  { id: "prior_deficiencies", label: "Prior-year or related testing deficiencies identified" },
  { id: "complex_control", label: "Control is complex" },
  { id: "infrequent_operation", label: "Control operates infrequently" },
  { id: "other_controls_reliance", label: "Relies on the effectiveness of other controls" },
  { id: "operator_competence", label: "Concerns over competence of control operator or monitor" },
  { id: "key_personnel_change", label: "Changes in key control personnel" },
  { id: "significant_judgement", label: "Significant judgment involved in control operation" },
  { id: "process_change", label: "Changes in how the control or process operates" },
  { id: "information_reliability", label: "Reliability of information used by the control is important" }
];

const CONTROL_ATTRIBUTE_ROWS = [
  { id: "attribute-a", label: "Attribute A" },
  { id: "attribute-b", label: "Attribute B" }
];

const DEFAULT_WORKSPACE_PHASES = [
  {
    id: "tod",
    label: "TOD",
    description: "Design effectiveness testing: understand process, confirm control design, and retain interview/design evidence.",
    nodes: [
      {
        id: "tod-minutes",
        label: "Upload TOD Meeting Minutes",
        type: "upload_minutes",
        required: true,
        category: MATERIAL_CATEGORY.MEETING_MINUTES
      },
      {
        id: "tod-objective",
        label: "TOD Test Objective",
        type: "text",
        required: true,
        placeholder: "Describe the design effectiveness objective for this test point.",
        legacyField: "objective"
      },
      {
        id: "tod-process",
        label: "Process Understanding and Control Description",
        type: "text",
        required: true,
        placeholder: "Document process understanding, control frequency, control owner, and key systems."
      },
      {
        id: "tod-spp",
        label: "TOD Supporting Materials",
        type: "upload_spp",
        required: true,
        category: MATERIAL_CATEGORY.SPP
      }
    ]
  },
  {
    id: "toe",
    label: "TOE",
    description: "Operating effectiveness testing: complete samples, execute testing, and document conclusions.",
    nodes: [
      {
        id: "toe-sample",
        label: "Sample Information",
        type: "text",
        required: true,
        placeholder: "Document sample size, period, and sampling criteria.",
        legacyField: "sampleInfo"
      },
      {
        id: "toe-procedure",
        label: "TOE Test Procedures",
        type: "text",
        required: true,
        placeholder: "Document inspection, reperformance, walkthrough, or reconciliation steps.",
        legacyField: "procedure"
      },
      {
        id: "toe-execution",
        label: "Execution Notes",
        type: "text",
        required: true,
        placeholder: "Document step-by-step sample execution and key judgments."
      },
      {
        id: "toe-spp",
        label: "Upload TOE Supporting Materials",
        type: "upload_spp",
        required: true,
        category: MATERIAL_CATEGORY.SPP
      },
      {
        id: "toe-minutes",
        label: "Upload TOE Meeting Minutes",
        type: "upload_minutes",
        required: true,
        category: MATERIAL_CATEGORY.MEETING_MINUTES
      },
      {
        id: "toe-result",
        label: "TOE Test Conclusion",
        type: "text",
        required: true,
        placeholder: "Document TOE conclusion.",
        legacyField: "result"
      }
    ]
  }
];

const GITC_WORKSPACE_PHASES = [
  {
    id: "tod",
    label: "TOD",
    description: "GITC design effectiveness: upload policy, generate Design, record interview implementation, and complete Test of One.",
    nodes: [
      {
        id: "gitc-tod-policy",
        label: "Upload Policy",
        type: "upload_policy",
        required: true,
        category: MATERIAL_CATEGORY.POLICY,
        actionLabel: "Upload Policy",
        accept: WORD_FILE_ACCEPT,
        acceptedFileKind: "word",
        fileHint: "Word files only (.doc/.docx)"
      },
      {
        id: "gitc-tod-design",
        label: "Auto-generate Design",
        type: "generated_text",
        required: true,
        dependsOnNodeId: "gitc-tod-policy",
        generationKind: "design",
        placeholder: "After policy upload, a Design draft is generated automatically. Save to count it as complete."
      },
      {
        id: "gitc-tod-minutes",
        label: "Upload Meeting Minutes",
        type: "upload_minutes",
        required: true,
        category: MATERIAL_CATEGORY.MEETING_MINUTES,
        actionLabel: "Upload Minutes"
      },
      {
        id: "gitc-tod-implementation",
        label: "Auto-generate Implementation",
        type: "generated_text",
        required: true,
        dependsOnNodeId: "gitc-tod-minutes",
        generationKind: "implementation",
        placeholder: "After meeting minutes upload, an Implementation draft is generated automatically. Save to count it as complete."
      },
      {
        id: "gitc-tod-supporting-material",
        label: "Upload Supporting Materials",
        type: "upload_supporting_material",
        required: true,
        category: MATERIAL_CATEGORY.SUPPORTING_MATERIAL,
        actionLabel: "Upload Supporting Materials"
      },
      {
        id: "gitc-tod-test-of-one",
        label: "Complete Test of One Sample Table",
        type: "generated_text",
        required: true,
        dependsOnNodeId: "gitc-tod-supporting-material",
        generationKind: "test_of_one",
        builderKind: "test_of_one_table",
        placeholder: "Manually define sample fields and sample information, then generate the Test of One table. Save to count it as complete."
      }
    ]
  },
  {
    id: "toe",
    label: "TOE",
    description: "GITC operating effectiveness: upload requirements and sample list, generate selections, send sample request, and complete transcription.",
    nodes: [
      {
        id: "gitc-toe-requirement-list",
        label: "Upload Requirement List",
        type: "upload_requirement_list",
        required: true,
        category: MATERIAL_CATEGORY.REQUIREMENT_LIST,
        actionLabel: "Upload Requirement List"
      },
      {
        id: "gitc-toe-sample-pool",
        label: "Upload Sample List",
        type: "upload_sample_pool",
        required: true,
        category: MATERIAL_CATEGORY.SAMPLE_POOL,
        actionLabel: "Upload Sample List",
        requiresExportPath: true,
        exportPathLabel: "Client Export Path",
        exportPathPlaceholder: "Example: Client system / Program changes / 2025 change list export.xlsx"
      },
      {
        id: "gitc-toe-sampling",
        label: "Auto-generate Sample Selection",
        type: "generated_file",
        required: true,
        dependsOnNodeId: "gitc-toe-sample-pool",
        generationKind: "sampling",
        fileKind: "sampling_excel",
        placeholder: "After uploading the sample list, the system generates an Excel file with 25 selected samples. Save to count it as complete."
      },
      {
        id: "gitc-toe-send-sample",
        label: "Send Sample Request",
        type: "send_toggle",
        required: true
      },
      {
        id: "gitc-toe-returned-sample-support",
        label: "Upload Returned Sample Supporting Materials",
        type: "upload_returned_sample_support",
        required: true,
        category: MATERIAL_CATEGORY.RETURNED_SAMPLE_SUPPORT,
        actionLabel: "Upload Returned Materials"
      },
      {
        id: "gitc-toe-transcription",
        label: "Complete Sample Transcription Table",
        type: "generated_text",
        required: true,
        dependsOnNodeId: "gitc-toe-returned-sample-support",
        generationKind: "transcription",
        builderKind: "sample_transcription_table",
        placeholder: "Manually define sample fields and enter multiple samples, then generate the transcription table. Save to count it as complete."
      }
    ]
  }
];

const ITAC_WORKSPACE_PHASES = [
  {
    id: "tod",
    label: "TOD",
    description: "ITAC test execution: upload meeting minutes, generate process description, record configuration/code support, and complete the Test of One sample table.",
    nodes: [
      {
        id: "itac-tod-minutes",
        label: "Upload Meeting Minutes",
        type: "upload_minutes",
        required: true,
        category: MATERIAL_CATEGORY.MEETING_MINUTES,
        actionLabel: "Upload Minutes"
      },
      {
        id: "itac-tod-implementation",
        label: "Auto-generate Process Description",
        type: "generated_text",
        required: true,
        dependsOnNodeId: "itac-tod-minutes",
        generationKind: "implementation",
        placeholder: "After meeting minutes upload, a process description is generated automatically. Save to count it as complete."
      },
      {
        id: "itac-tod-supporting-material",
        label: "Upload Configuration / Code Supporting Materials",
        type: "upload_supporting_material",
        required: true,
        category: MATERIAL_CATEGORY.SUPPORTING_MATERIAL,
        actionLabel: "Upload Supporting Materials",
        supportKindOptions: [
          { value: "configuration", label: "Configuration" },
          { value: "code", label: "Code" }
        ],
        defaultSupportingMaterialKind: "configuration"
      },
      {
        id: "itac-tod-test-of-one-support",
        label: "Upload Test of One Supporting Materials",
        type: "upload_test_of_one_support",
        required: true,
        category: MATERIAL_CATEGORY.SUPPORTING_MATERIAL,
        actionLabel: "Upload Test of One Materials",
        defaultSupportingMaterialKind: "test_of_one"
      },
      {
        id: "itac-tod-test-of-one",
        label: "Complete Test of One Sample Table",
        type: "generated_text",
        required: true,
        dependsOnNodeId: "itac-tod-test-of-one-support",
        generationKind: "test_of_one",
        builderKind: "itac_test_of_one_table",
        placeholder: "Manually define sample fields and enter sample information, then generate the Test of One table. Save to count it as complete."
      }
    ]
  }
];

export const WORKSPACE_PHASES = DEFAULT_WORKSPACE_PHASES;

const WORKSPACE_NODE_SUBTITLES = {
  "tod-minutes": "Upload TOD meeting minutes",
  "tod-objective": "TOD test objective",
  "tod-process": "Process understanding and control description",
  "tod-spp": "TOD supporting materials",
  "toe-sample": "Sample information",
  "toe-procedure": "TOE test procedure",
  "toe-execution": "Execution record",
  "toe-spp": "Upload TOE supporting materials",
  "toe-minutes": "Upload TOE meeting minutes",
  "toe-result": "TOE test conclusion",
  "gitc-tod-policy": "Upload policy document",
  "gitc-tod-design": "Auto-generate Design",
  "gitc-tod-minutes": "Upload meeting minutes",
  "gitc-tod-implementation": "Auto-generate Implementation",
  "gitc-tod-supporting-material": "Upload supporting materials",
  "gitc-tod-test-of-one": "Complete Test of One sample table",
  "gitc-toe-requirement-list": "Upload requirement list",
  "gitc-toe-sample-pool": "Upload sample list",
  "gitc-toe-sampling": "Auto-generate sampled items",
  "gitc-toe-send-sample": "Send samples",
  "gitc-toe-returned-sample-support": "Upload returned sample supporting materials",
  "gitc-toe-transcription": "Complete sample transcription table",
  "itac-tod-minutes": "Upload meeting minutes",
  "itac-tod-implementation": "Auto-generate process description",
  "itac-tod-supporting-material": "Upload configuration/code supporting materials",
  "itac-tod-test-of-one-support": "Upload Test of One supporting materials",
  "itac-tod-test-of-one": "Complete Test of One sample table"
};

export function getWorkspaceNodeSubtitle(node = {}) {
  if (node.subtitle) return node.subtitle;
  if (WORKSPACE_NODE_SUBTITLES[node.id]) return WORKSPACE_NODE_SUBTITLES[node.id];
  if (node.type === "generated_file") return "Auto-generate file";
  if (node.type === "generated_text") return "Auto-generate text";
  if (node.type === "send_toggle") return "Action confirmation";
  if (node.type?.startsWith("upload")) return "Upload supporting material";
  if (node.type === "structured") return "Structured form";
  if (node.type === "text") return "Text input";
  return "Workspace step";
}

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
    name: material.name || "Untitled Material",
    fileType: material.fileType || "",
    size: material.size || 0,
    uploadedBy: material.uploadedBy || "Member",
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
      label: field.label || "Additional Notes",
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

  if (source.includes("itac") || source.includes("Application Control") || source.includes("Automated Control")) {
    return "ITAC";
  }

  if (source.includes("itgc") || source.includes("gitc") || source.includes("Access Management") || source.includes("Change Management")) {
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
        subtitle: getWorkspaceNodeSubtitle(node),
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

/** First incomplete required node; returns the last node when all required nodes are complete. */
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
    owner: task.owner || "Unassigned",
    assigneeEmail: task.owner || "Unassigned",
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

/** Clear workspace progress for a deleted project, including project partitions and legacy flat records. */
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
