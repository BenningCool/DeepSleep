import { useEffect, useMemo, useRef, useState } from "react";
import {
  FIELD_REVIEW_STATUS,
  MATERIAL_CATEGORY,
  NODE_STATUS,
  PROGRESS_STATUS,
  REVIEW_STATUS,
  addWorkspaceMaterial,
  getControlProgressDetail,
  getControlProgressSnapshot,
  getWorkspaceNodeSubtitle,
  getWorkspacePhases,
  removeWorkspaceMaterial,
  upsertControlProgress
} from "../../services/workspaceProgressService";

const WORKSPACE_PROGRESS_LABELS = {
  [PROGRESS_STATUS.NOT_STARTED]: "Not Started",
  [PROGRESS_STATUS.IN_PROGRESS]: "Testing",
  [PROGRESS_STATUS.COMPLETED]: "Completed"
};

const MATERIAL_LABELS = {
  [MATERIAL_CATEGORY.SPP]: "SPP",
  [MATERIAL_CATEGORY.MEETING_MINUTES]: "Meeting Minutes",
  [MATERIAL_CATEGORY.EVIDENCE]: "Test Evidence",
  [MATERIAL_CATEGORY.POLICY]: "Policy",
  [MATERIAL_CATEGORY.SUPPORTING_MATERIAL]: "Supporting Materials",
  [MATERIAL_CATEGORY.REQUIREMENT_LIST]: "Requirement List",
  [MATERIAL_CATEGORY.SAMPLE_POOL]: "Sample Population",
  [MATERIAL_CATEGORY.RETURNED_SAMPLE_SUPPORT]: "Client Returned Materials"
};

const REVIEW_DOT_LABELS = {
  [FIELD_REVIEW_STATUS.OPEN]: "Awaiting Reply",
  [FIELD_REVIEW_STATUS.REPLIED]: "Replied",
  [FIELD_REVIEW_STATUS.ACCEPTED]: "Accepted"
};

const WORD_FILE_MIME_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const DEFAULT_TABLE_FIELD_COUNT = 3;
const DEFAULT_TRANSCRIPTION_FIELD_COUNT = 4;
const AI_GENERATION_DELAY_MS = 3000;
const SAMPLING_EXCEL_ROW_COUNT = 25;
const SAMPLING_EXCEL_COLUMNS = [
  { key: "sequence", label: "No." },
  { key: "sampleId", label: "Selected Sample ID" },
  { key: "populationItem", label: "Population Record" },
  { key: "sourcePool", label: "Source Population" },
  { key: "samplingMethod", label: "Sampling Method" },
  { key: "status", label: "Status" }
];

const DEMO_GITC_DESIGN_TEXT = `On September 10, 2025, through inquiry with the auditee's IT information security owner, the audit team understood that the company has established information security policies for program change management. By obtaining and inspecting the Software Change Management Policy, the audit team noted the following requirements:
Change process:
Article 4: The system change process is similar to software development and generally includes four stages: request submission and acceptance, implementation, acceptance testing, and production release.
Article 5: The requesting department raises the system change request and prepares an IT requirement request. Business users submit it to the internal workflow system. After approval, it is routed to IT operations. IT operations completes the operations requirement summary, after which the requirement management system automatically creates a requirement record.
Article 6: IT personnel analyze requirement records through requirement review meetings and provide system change recommendations.
Article 7: Relevant IT departments implement system changes based on whether development is internal, joint, or outsourced. Requirements are submitted to internal developers, partners, or outsourcing vendors to produce releasable programs.
Article 8: Implementation must follow the software development process. System changes must follow unified coding standards and pass testing and acceptance before production release.
Emergency change process:
Article 9: For emergency changes, requesting departments may submit requests by email or work group communication.
Article 10: IT evaluates importance and urgency, determines priority and impact, and handles the change accordingly.
Article 11: Emergency changes are initiated by designated departments or personnel through emergency change procedures. IT must document emergency change handling in a standardized manner.
Article 12: After emergency handling is completed, a formal and complete process must be completed within one week.
No exception was noted by the audit team.`;

const DEMO_GITC_IMPLEMENTATION_TEXT = `Through inquiry with the auditee's IT system development personnel, the audit team understood the program change management process for the relevant business systems as of the fieldwork period from 2025-01-01 to 2025-09-04:
1. Requirement initiation:
For non-bug requirements, the business department raises the change request and prepares an IT requirement request or business request form. Business users submit it to the internal workflow system. After business leadership approval, it is routed to IT operations. IT operations converts the business request into an operations requirement. Once created in the workflow system, the operations requirement is automatically linked to the requirement management platform and a development requirement is created. The item then enters Pending Review status and formally enters the development lifecycle.

For bug requirements, the business department reports the issue directly to IT operations. After IT operations confirms the issue is a system bug, a bug record is created in the requirement/defect management platform and assigned to the relevant developer. The item then enters Pending Review status.

2. Requirement review:
Every Thursday and Friday, the development team holds a requirement review meeting to evaluate, clarify, and schedule requirements and bugs in Pending Review status.
3. Development planning:
Every Monday, the development lead prepares the weekly development plan based on review results, defining owners and expected completion dates.
4. Development and testing:
Developers complete coding based on the plan. After development, IT operations performs functional testing in the test environment. Once testing passes, the requirement/defect management platform status is updated to Resolved.
5. Code merge:
The development team lead merges code from developers' branches into the main branch, preparing for release.
6. System release:
Tuesday and Thursday are fixed release days. Release personnel click Release in the release platform. The platform automatically pulls merged main-branch code from the repository and deploys it to production.
7. Post-release verification:
After release, release personnel notify IT operations to verify the released features or bug fixes in production and confirm the release is accurate.`;

const DEMO_ITAC_PROCESS_DESCRIPTION_TEXT = "The ERP configuration logic is as follows: for sales orders transmitted through the interface, the system automatically validates the order and routes it to the All-Network Order List, which represents the effective sales order report. For manually entered sales orders, users must select the option to skip system validation, meaning the order must go through manual approval. Only when the approval status reaches 100, indicating approval completed, can the order be included in the All-Network Order List and treated as an effective sales order.";

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
  nodeDueDates: {},
  extraTextFields: {},
  fieldReviews: {},
  reviewStatus: REVIEW_STATUS.NOT_SUBMITTED,
  reviewComment: ""
};

const TEST_POINT_TYPES = ["GITC", "ITAC"];

function formatDateParts(year, month, day) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0")
  ].join("-");
}

function todayDate() {
  const date = new Date();
  return formatDateParts(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function addDays(dateValue, days) {
  if (!dateValue) return "";
  const [year, month, day] = String(dateValue).split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + days);
  return formatDateParts(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function workspaceNodesForType(controlType) {
  return getWorkspacePhases(controlType).flatMap((phase) => (
    phase.nodes
      .filter((node) => node.required !== false)
      .map((node, index) => ({
        ...node,
        phaseId: phase.id,
        phaseLabel: phase.label,
        phaseIndex: index
      }))
  ));
}

function buildNodeDueDates(controlType, firstDate, overrides = {}) {
  return workspaceNodesForType(controlType).reduce((result, node, index) => ({
    ...result,
    [node.id]: overrides[node.id] || addDays(firstDate, index * 7)
  }), {});
}

function normalizeMemberOptions(project) {
  const options = [];
  const add = (email, role = "") => {
    const normalized = String(email || "").trim();
    if (!normalized || options.some((item) => item.email === normalized)) return;
    options.push({ email: normalized, role });
  };

  (project?.members || [])
    .filter((member) => member.status === "active")
    .forEach((member) => add(member.email, member.role));

  (project?.specialistTeams || []).forEach((team) => {
    add(team.leadEmail, `${team.team || "specialist"} lead`);
    (team.staff || [])
      .filter((member) => member.status === "active")
      .forEach((member) => add(member.email, `${team.team || "specialist"} staff`));
  });

  return options;
}

function formatDateTime(value) {
  if (!value) return "Not updated";
  return new Intl.DateTimeFormat("en-US", {
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
  return MATERIAL_LABELS[category] || "Material";
}

function supportingMaterialKindLabel(kind) {
  if (kind === "configuration") return "Configuration";
  if (kind === "code") return "Code";
  if (kind === "test_of_one") return "Test of One";
  return "";
}

function materialDisplayLabel(item) {
  const base = materialLabel(item.category);
  const kind = supportingMaterialKindLabel(item.supportingMaterialKind);
  return kind ? `${base}(${kind})` : base;
}

function uploadLabel(node) {
  if (node.actionLabel) return node.actionLabel;
  if (node.type === "upload_spp") return "Upload SPP";
  if (node.type === "upload_minutes") return "Upload Minutes";
  return "Upload Evidence";
}

function isWordUploadNode(node) {
  return node?.acceptedFileKind === "word";
}

function isWordFile(file) {
  const lowerName = String(file?.name || "").toLowerCase();
  return lowerName.endsWith(".doc")
    || lowerName.endsWith(".docx")
    || WORD_FILE_MIME_TYPES.has(file?.type);
}

function createTestOfOneRow() {
  return {
    id: `sample_${Math.random().toString(36).slice(2, 8)}`,
    values: {}
  };
}

function createTableField(label = "") {
  return {
    id: `field_${Math.random().toString(36).slice(2, 8)}`,
    label
  };
}

function initialFieldCountForTableBuilder(node) {
  return node?.builderKind === "sample_transcription_table"
    ? DEFAULT_TRANSCRIPTION_FIELD_COUNT
    : DEFAULT_TABLE_FIELD_COUNT;
}

function createTestOfOneBuilder(fieldCount = DEFAULT_TABLE_FIELD_COUNT) {
  return {
    fields: Array.from({ length: fieldCount }, () => createTableField()),
    rows: [createTestOfOneRow()]
  };
}

function isTableBuilderNode(node) {
  return node?.builderKind === "test_of_one_table"
    || node?.builderKind === "itac_test_of_one_table"
    || node?.builderKind === "sample_transcription_table";
}

function tableTitleForBuilder(node) {
  if (node?.builderKind === "sample_transcription_table") return "Sample Transcription";
  if (node?.builderKind === "itac_test_of_one_table") return "ITAC Test of One";
  return "Test of One";
}

function tableGenerateButtonLabel(node) {
  if (node?.builderKind === "sample_transcription_table") return "Generate Transcription Table";
  return "Generate Test of One Table";
}

function tableBuilderHelp(node) {
  if (node?.builderKind === "sample_transcription_table") {
    return "Manually define sample fields, then enter multiple samples row by row. After all rows are complete, click Generate Transcription Table.";
  }
  if (node?.builderKind === "itac_test_of_one_table") {
    return "Manually define ITAC sample fields, then enter one complete sample and generate the Test of One table.";
  }
  return "Manually define sample fields, then enter one complete sample and generate the Test of One table.";
}

function shouldAutoGenerateTable(node) {
  return false;
}

function normalizeTestOfOneBuilder(builder, node) {
  if (Array.isArray(builder?.fields)) {
    return {
      ...builder,
      fields: builder.fields.length ? builder.fields : [createTableField()],
      rows: Array.isArray(builder.rows) && builder.rows.length ? builder.rows : [createTestOfOneRow()]
    };
  }

  return createTestOfOneBuilder(initialFieldCountForTableBuilder(node));
}

function activeTableFields(builder) {
  return (builder.fields || [])
    .map((field) => ({
      ...field,
      label: String(field.label || "").trim()
    }))
    .filter((field) => field.label);
}

function buildTestOfOneTable(builder, node) {
  const fields = activeTableFields(builder);
  if (!fields.length) return "";

  const completeRows = (builder.rows || []).filter((row) => (
    fields.every((field) => String(row.values?.[field.id] || "").trim())
  ));
  if (!completeRows.length) return "";

  const header = `| ${fields.map((field) => field.label).join(" | ")} |`;
  const divider = `| ${fields.map(() => "---").join(" | ")} |`;
  const rows = completeRows.map((row) => (
    `| ${fields.map((field) => String(row.values?.[field.id] || "").trim()).join(" | ")} |`
  ));
  return [tableTitleForBuilder(node), "", header, divider, ...rows].join("\n");
}

function parseGeneratedTable(value) {
  const lines = String(value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const tableStart = lines.findIndex((line) => line.startsWith("|") && line.endsWith("|"));
  if (tableStart < 0 || tableStart + 1 >= lines.length) return null;

  const headers = lines[tableStart].slice(1, -1).split("|").map((cell) => cell.trim());
  const rows = lines.slice(tableStart + 2)
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()));

  if (!headers.length || !rows.length) return null;

  return {
    title: tableStart > 0 ? lines.slice(0, tableStart).join(" ") : "",
    headers,
    rows
  };
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

function hasMeaningfulValue(value) {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return true;
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (value && typeof value === "object") return Object.values(value).some(hasMeaningfulValue);
  return false;
}

function workspaceStatusForDetail(detail) {
  const reviewComments = Object.values(detail.fieldReviews || {});
  const commentsCleared = reviewComments.every((review) => (
    review.status === FIELD_REVIEW_STATUS.ACCEPTED
  ));

  if (detail.totalNodes > 0 && detail.completedNodes === detail.totalNodes && commentsCleared) {
    return PROGRESS_STATUS.COMPLETED;
  }

  if (
    detail.completedNodes > 0
    || (detail.materials || []).length > 0
    || Object.values(detail.nodeResponses || {}).some(hasMeaningfulValue)
    || Object.values(detail.extraTextFields || {}).some((fields) => (
      Array.isArray(fields) && fields.some((field) => hasMeaningfulValue(field.value))
    ))
  ) {
    return PROGRESS_STATUS.IN_PROGRESS;
  }

  return PROGRESS_STATUS.NOT_STARTED;
}

function responseText(value) {
  return typeof value === "string" ? value : "";
}

function sanitizeFileName(value = "Selected Sample") {
  const normalized = String(value || "Selected Sample")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "Selected Sample";
}

function excelEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildExcelWorkbookHtml(file) {
  const columns = Array.isArray(file?.columns) && file.columns.length
    ? file.columns
    : SAMPLING_EXCEL_COLUMNS;
  const rows = Array.isArray(file?.rows) ? file.rows : [];
  const title = file?.sheetName || "Selected Sample";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    table { border-collapse: collapse; }
    th, td { border: 1px solid #999; padding: 6px 8px; }
    th { background: #dbeafe; font-weight: 700; }
  </style>
</head>
<body>
  <table>
    <caption>${excelEscape(title)}</caption>
    <thead>
      <tr>${columns.map((column) => `<th>${excelEscape(column.label)}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${rows.map((row) => `
        <tr>${columns.map((column) => `<td>${excelEscape(row[column.key])}</td>`).join("")}</tr>
      `).join("")}
    </tbody>
  </table>
</body>
</html>`;
}

function downloadExcelFile(file) {
  if (!file?.rows?.length) return;
  const blob = new Blob([buildExcelWorkbookHtml(file)], {
    type: "application/vnd.ms-excel;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.fileName || "Selected Sample.xls";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function syncLegacyTestContent(detail) {
  return {
    objective: responseText(detail.nodeResponses["tod-objective"])
      || responseText(detail.nodeResponses["itac-tod-implementation"])
      || responseText(detail.nodeResponses["itac-tod-process-activities.controlActivitySummary"])
      || detail.testContent.objective
      || "",
    procedure: responseText(detail.nodeResponses["toe-procedure"])
      || detail.testContent.procedure
      || "",
    sampleInfo: responseText(detail.nodeResponses["toe-sample"])
      || detail.testContent.sampleInfo
      || "",
    result: responseText(detail.nodeResponses["toe-result"])
      || responseText(detail.nodeResponses["itac-tod-test-of-one"])
      || responseText(detail.nodeResponses["itac-toe-result.toeResult"])
      || detail.testContent.result
      || ""
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
    return <p className="workspace-empty-line">No materials yet</p>;
  }

  return (
    <ul className="workspace-material-list compact">
      {items.map((item) => (
        <li key={item.id}>
          <div>
            <strong>{item.name}</strong>
            <span>
              {materialDisplayLabel(item)} · {item.uploadedBy} · {formatDateTime(item.uploadedAt)}
              {item.size ? ` · ${Math.round(item.size / 1024)} KB` : ""}
            </span>
          </div>
          <button className="button subtle" type="button" onClick={() => onRemove(item.id)}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}

export function WorkspacePage({ project, tasks, focusControlId = "", onCreateControlTask, onToast }) {
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
  const [draftResponses, setDraftResponses] = useState({});
  const [testOfOneBuilders, setTestOfOneBuilders] = useState({});
  const [supportingMaterialKinds, setSupportingMaterialKinds] = useState({});
  const [generatingNodes, setGeneratingNodes] = useState({});
  const generationTimersRef = useRef({});
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState(() => {
    const firstDate = todayDate();
    return {
      title: "",
      controlType: "GITC",
      owner: "",
      firstDueDate: firstDate,
      nodeDueDates: buildNodeDueDates("GITC", firstDate)
    };
  });

  const snapshot = useMemo(
    () => getControlProgressSnapshot(project?.id || "", tasks),
    [project?.id, tasks, refreshToken]
  );

  const owners = useMemo(() => (
    [...new Set(snapshot.controls.map((item) => item.owner).filter(Boolean))].sort()
  ), [snapshot.controls]);

  const memberOptions = useMemo(() => normalizeMemberOptions(project), [project]);

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

  const createNodes = useMemo(
    () => workspaceNodesForType(createDraft.controlType),
    [createDraft.controlType]
  );

  useEffect(() => {
    if (!focusControlId) return;
    setSelectedId(focusControlId);
  }, [focusControlId]);

  useEffect(() => {
    if (createDraft.owner || !memberOptions.length) return;
    setCreateDraft((current) => ({ ...current, owner: memberOptions[0].email }));
  }, [createDraft.owner, memberOptions]);

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

  function resetCreateDraft() {
    const firstDate = todayDate();
    const owner = memberOptions[0]?.email || "";
    setCreateDraft({
      title: "",
      controlType: "GITC",
      owner,
      firstDueDate: firstDate,
      nodeDueDates: buildNodeDueDates("GITC", firstDate)
    });
  }

  function openCreateDialog() {
    resetCreateDraft();
    setCreateOpen(true);
  }

  function closeCreateDialog() {
    setCreateOpen(false);
  }

  function updateCreateType(controlType) {
    const normalizedType = TEST_POINT_TYPES.includes(controlType) ? controlType : "GITC";
    setCreateDraft((current) => ({
      ...current,
      controlType: normalizedType,
      nodeDueDates: buildNodeDueDates(normalizedType, current.firstDueDate || todayDate())
    }));
  }

  function updateCreateFirstDueDate(firstDueDate) {
    setCreateDraft((current) => ({
      ...current,
      firstDueDate,
      nodeDueDates: buildNodeDueDates(current.controlType, firstDueDate)
    }));
  }

  function updateCreateNodeDueDate(nodeId, dueDate) {
    setCreateDraft((current) => ({
      ...current,
      nodeDueDates: {
        ...current.nodeDueDates,
        [nodeId]: dueDate
      }
    }));
  }

  function createControlTask(event) {
    event.preventDefault();
    const title = createDraft.title.trim();
    const owner = createDraft.owner.trim();

    if (!title) {
      onToast?.("Enter a test point name.");
      return;
    }
    if (!owner) {
      onToast?.("Assign a project team member first.");
      return;
    }
    if (!createDraft.firstDueDate) {
      onToast?.("Select the first node due date first.");
      return;
    }

    const nodeDueDates = createNodes.reduce((result, node) => ({
      ...result,
      [node.id]: createDraft.nodeDueDates[node.id] || ""
    }), {});
    const createdTask = onCreateControlTask?.({
      title,
      controlType: createDraft.controlType,
      owner,
      firstDueDate: createDraft.firstDueDate,
      nodeDueDates
    });

    if (!createdTask?.id) {
      onToast?.("Create Test Point failed.");
      return;
    }

    upsertControlProgress(createdTask.id, { nodeDueDates });
    setOwnerFilter("");
    setTypeFilter("");
    setStatusFilter("");
    setActionOnly(false);
    setSelectedId(createdTask.id);
    setRefreshToken((value) => value + 1);
    setCreateOpen(false);
    onToast?.("Test point created.");
  }

  useEffect(() => {
    clearGenerationTimers();
    setActivePhase("tod");
    setOpenTextMenuKey("");
    setOpenReviewKey("");
    setDraftResponses({});
    setTestOfOneBuilders({});
    setSupportingMaterialKinds({});
  }, [selectedControl?.id]);

  useEffect(() => () => clearGenerationTimers(false), []);

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

  function generationKeyFor(nodeId, controlId = selectedControl?.id || "") {
    return `${controlId}:${nodeId}`;
  }

  function isDelayedGenerationNode(node) {
    return node?.type === "generated_text"
      && (node.generationKind === "design" || node.generationKind === "implementation");
  }

  function isGeneratingNode(node) {
    return Boolean(generatingNodes[generationKeyFor(node.id)]);
  }

  function clearGenerationTimers(resetState = true) {
    Object.values(generationTimersRef.current).forEach((timerId) => window.clearTimeout(timerId));
    generationTimersRef.current = {};
    if (resetState) setGeneratingNodes({});
  }

  function scheduleGeneratedDraft(node, createValue, doneMessage = "") {
    if (!selectedControl || !isDelayedGenerationNode(node)) return false;
    const key = generationKeyFor(node.id);
    if (generationTimersRef.current[key]) {
      window.clearTimeout(generationTimersRef.current[key]);
    }
    setGeneratingNodes((current) => ({
      ...current,
      [key]: true
    }));
    notify(node.type === "generated_file"
      ? "AI is generating the sampling Excel. It will update in about 3 seconds."
      : "AI is generating the draft. It will update in about 3 seconds.");

    generationTimersRef.current[key] = window.setTimeout(() => {
      setDraftResponses((current) => ({
        ...current,
        [node.id]: createValue()
      }));
      setGeneratingNodes((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      delete generationTimersRef.current[key];
      if (doneMessage) notify(doneMessage);
    }, AI_GENERATION_DELAY_MS);
    return true;
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

  function uploadNodeResponse(node) {
    const value = detail.nodeResponses?.[node.id];
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function updateUploadExportPath(node, exportPath) {
    updateNodeResponse(node.id, {
      ...uploadNodeResponse(node),
      exportPath
    });
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
            label: "Additional Notes",
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
      repliedBy: selectedControl?.owner || "Member"
    });
  }

  function acceptFieldReview(fieldKey) {
    updateFieldReview(fieldKey, {
      status: FIELD_REVIEW_STATUS.ACCEPTED,
      acceptedBy: "Reviewer"
    });
  }

  function saveDetail() {
    if (!selectedControl) return;
    const nextDetail = {
      ...detail,
      nodeResponses: {
        ...detail.nodeResponses,
        ...draftResponses
      }
    };
    setDetail(nextDetail);
    persist(nextDetail, "Workspace content saved. Module 3 progress API has been updated.");
    setDraftResponses({});
  }

  function cancelDetail() {
    if (!selectedControl) return;
    setDetail(getControlProgressDetail(selectedControl.id, selectedTask, tasks));
    setOpenTextMenuKey("");
    setOpenReviewKey("");
    setDraftResponses({});
    setTestOfOneBuilders({});
    setSupportingMaterialKinds({});
    notify("Unsaved changes canceled.");
  }

  function generatedTargetsForUploadNode(uploadNode) {
    return (detail.phases || []).flatMap((phase) => phase.nodes || []).filter((node) => (
      (node.type === "generated_text" || node.type === "generated_file")
        && node.dependsOnNodeId === uploadNode.id
    ));
  }

  function materialSummary(items = []) {
    if (!items.length) return "No materials yet";
    return items.map((item) => `${item.name || "Untitled Material"}${item.size ? ` (${Math.round(item.size / 1024)} KB)` : ""}`).join(", ");
  }

  function buildGeneratedText(node, materials = []) {
    const controlTitle = selectedControl?.title || "Current Test Point";
    const source = materialSummary(materials);
    const generatedAt = formatDateTime(new Date().toISOString());

    if (node.generationKind === "design") {
      return DEMO_GITC_DESIGN_TEXT;
    }
    if (node.generationKind === "implementation") {
      if (node.id.startsWith("itac-")) {
        return DEMO_ITAC_PROCESS_DESCRIPTION_TEXT;
      }
      return DEMO_GITC_IMPLEMENTATION_TEXT;
    }
    if (node.generationKind === "test_of_one") {
      return "";
    }
    if (node.generationKind === "sampling") {
      return `Selected Sample Draft\nTest point: ${controlTitle}\nBased on sample population: ${source}\n\nSystem simulated sampling result: Sample-01, Sample-08, Sample-15, Sample-22, Sample-30.\nGenerated at: ${generatedAt}\nPlease review the sample population period, population completeness, and sample size.`;
    }
    if (node.generationKind === "transcription") {
      if (node.builderKind === "sample_transcription_table") return "";
      return `Test Transcription Draft\nTest point: ${controlTitle}\nBased on returned client materials: ${source}\n\nThe system simulated transcription from the returned sample support, organizing each sample's control attributes, supporting evidence, and preliminary test result. Please review whether the transcription is consistent with the attachments.`;
    }
    return `Auto-generated Draft\nTest point: ${controlTitle}\nBased on materials: ${source}\nGenerated at: ${generatedAt}`;
  }

  function buildGeneratedFile(node, materials = []) {
    const controlTitle = selectedControl?.title || "Current Test Point";
    const generatedAtIso = new Date().toISOString();
    const sourcePool = materialSummary(materials);
    const sourceBase = sanitizeFileName(materials[0]?.name || "sample-pool");

    if (node.fileKind === "sampling_excel") {
      return {
        kind: "sampling_excel",
        fileName: `${sanitizeFileName(controlTitle)}-Selected Sample.xls`,
        fileType: "application/vnd.ms-excel",
        sheetName: "Selected Sample",
        generatedAt: generatedAtIso,
        rowCount: SAMPLING_EXCEL_ROW_COUNT,
        columns: SAMPLING_EXCEL_COLUMNS,
        rows: Array.from({ length: SAMPLING_EXCEL_ROW_COUNT }, (_, index) => ({
          sequence: index + 1,
          sampleId: `SAMPLE-${String(index + 1).padStart(3, "0")}`,
          populationItem: `${sourceBase}-ROW-${String((index + 1) * 7).padStart(4, "0")}`,
          sourcePool,
          samplingMethod: "System random sampling (Demo)",
          status: "Pending Send"
        }))
      };
    }

    return {
      kind: node.fileKind || "generated_file",
      fileName: `${sanitizeFileName(controlTitle)}-generated-file.xls`,
      fileType: "application/vnd.ms-excel",
      generatedAt: generatedAtIso,
      columns: SAMPLING_EXCEL_COLUMNS,
      rows: []
    };
  }

  function setGeneratedDraft(node, materials = []) {
    if (isTableBuilderNode(node)) {
      setTestOfOneBuilders((current) => ({
        ...current,
        [node.id]: current[node.id] || createTestOfOneBuilder(initialFieldCountForTableBuilder(node))
      }));
      return "immediate";
    }
    if (isDelayedGenerationNode(node)) {
      scheduleGeneratedDraft(
        node,
        () => buildGeneratedText(node, materials),
        "AI draft generated. Click Save to count toward progress."
      );
      return "delayed";
    }
    if (node.type === "generated_file") {
      setDraftResponses((current) => ({
        ...current,
        [node.id]: buildGeneratedFile(node, materials)
      }));
      return "immediate";
    }
    setDraftResponses((current) => ({
      ...current,
      [node.id]: buildGeneratedText(node, materials)
    }));
    return "immediate";
  }

  function regenerateGeneratedNode(node) {
    const sourceMaterials = detail.materials.filter((item) => item.nodeId === node.dependsOnNodeId);
    if (!sourceMaterials.length) {
      notify("Upload the material required by this node first.");
      return;
    }
    const mode = setGeneratedDraft(node, sourceMaterials);
    if (mode === "delayed") return;
    notify(node.type === "generated_file"
      ? "Sampling Excel generated. Click Save to count toward progress."
      : "Draft regenerated. Click Save to count toward progress.");
  }

  function supportingMaterialKindForNode(node) {
    if (node.supportKindOptions?.length) {
      return supportingMaterialKinds[node.id] || node.defaultSupportingMaterialKind || node.supportKindOptions[0].value;
    }
    return node.defaultSupportingMaterialKind || "";
  }

  function changeSupportingMaterialKind(nodeId, value) {
    setSupportingMaterialKinds((current) => ({
      ...current,
      [nodeId]: value
    }));
  }

  function uploadMaterials(event, node) {
    if (!selectedControl) return;
    const selectedFiles = [...(event.target.files || [])];
    const files = isWordUploadNode(node)
      ? selectedFiles.filter(isWordFile)
      : selectedFiles;
    if (files.length !== selectedFiles.length) {
      notify(`${node.label} only supports Word files (.doc/.docx).`);
    }
    if (!files.length) {
      event.target.value = "";
      return;
    }
    const uploadedMaterials = files.map((file) => ({
      category: node.category || MATERIAL_CATEGORY.EVIDENCE,
      supportingMaterialKind: supportingMaterialKindForNode(node),
      phaseId: node.phaseId,
      nodeId: node.id,
      name: file.name,
      fileType: file.type,
      size: file.size,
      uploadedBy: selectedControl.owner || "Member",
      uploadedAt: new Date().toISOString()
    }));
    files.forEach((file) => {
      addWorkspaceMaterial(selectedControl.id, {
        category: node.category || MATERIAL_CATEGORY.EVIDENCE,
        supportingMaterialKind: supportingMaterialKindForNode(node),
        phaseId: node.phaseId,
        nodeId: node.id,
        name: file.name,
        fileType: file.type,
        size: file.size,
        uploadedBy: selectedControl.owner || "Member"
      }, project?.id || selectedTask?.projectId || "");
    });
    event.target.value = "";
    let hasDelayedGeneration = false;
    generatedTargetsForUploadNode(node).forEach((targetNode) => {
      hasDelayedGeneration = setGeneratedDraft(targetNode, uploadedMaterials) === "delayed" || hasDelayedGeneration;
    });
    setDetail(getControlProgressDetail(selectedControl.id, selectedTask, tasks));
    refresh();
    if (files.length && hasDelayedGeneration) {
      notify(`Recorded ${files.length} ${materialLabel(node.category)}, AI is generating the draft.`);
    } else if (files.length) {
      notify(`Recorded ${files.length} ${materialLabel(node.category)}.`);
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
    notify("Material record removed.");
  }

  function materialsForNode(node) {
    return detail.materials.filter((item) => (
      item.phaseId === node.phaseId
      && item.category === node.category
      && (!item.nodeId || item.nodeId === node.id)
    ));
  }

  function textValueForNode(node) {
    return responseText(detail.nodeResponses[node.id] ?? node.value ?? "");
  }

  function generatedValueForNode(node) {
    return responseText(draftResponses[node.id] ?? detail.nodeResponses[node.id] ?? node.value ?? "");
  }

  function generatedFileForNode(node) {
    const value = draftResponses[node.id] ?? detail.nodeResponses[node.id] ?? null;
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  }

  function updateGeneratedDraft(nodeId, value) {
    setDraftResponses((current) => ({
      ...current,
      [nodeId]: value
    }));
  }

  function testOfOneBuilderForNode(node) {
    return normalizeTestOfOneBuilder(
      testOfOneBuilders[node.id] || createTestOfOneBuilder(initialFieldCountForTableBuilder(node)),
      node
    );
  }

  function applyTestOfOneBuilder(node, nextBuilder, generate = shouldAutoGenerateTable(node)) {
    setTestOfOneBuilders((current) => ({
      ...current,
      [node.id]: nextBuilder
    }));
    if (generate) {
      updateGeneratedDraft(node.id, buildTestOfOneTable(nextBuilder, node));
    }
  }

  function generateTableDraft(node) {
    const builder = testOfOneBuilderForNode(node);
    const table = buildTestOfOneTable(builder, node);
    if (!table) {
      notify("Enter at least one complete sample first.");
      return;
    }
    updateGeneratedDraft(node.id, table);
    notify(`${tableTitleForBuilder(node)} table generated. Click Save to count toward progress.`);
  }

  function updateTableFieldLabel(node, fieldId, value) {
    const builder = testOfOneBuilderForNode(node);
    applyTestOfOneBuilder(node, {
      ...builder,
      fields: builder.fields.map((field) => (
        field.id === fieldId ? { ...field, label: value } : field
      ))
    });
  }

  function addTableField(node) {
    const builder = testOfOneBuilderForNode(node);
    applyTestOfOneBuilder(node, {
      ...builder,
      fields: [...builder.fields, createTableField()]
    });
  }

  function removeTableField(node, fieldId) {
    const builder = testOfOneBuilderForNode(node);
    const fields = builder.fields.filter((field) => field.id !== fieldId);
    const rows = builder.rows.map((row) => {
      const nextValues = { ...(row.values || {}) };
      delete nextValues[fieldId];
      return {
        ...row,
        values: nextValues
      };
    });

    applyTestOfOneBuilder(node, {
      ...builder,
      fields: fields.length ? fields : [createTableField()],
      rows
    });
  }

  function updateTestOfOneCell(node, rowId, fieldId, value) {
    const builder = testOfOneBuilderForNode(node);
    const rows = builder.rows.map((row) => (
      row.id === rowId
        ? {
            ...row,
            values: {
              ...row.values,
              [fieldId]: value
            }
          }
        : row
    ));
    applyTestOfOneBuilder(node, {
      ...builder,
      rows
    });
  }

  function addTestOfOneRow(node) {
    const builder = testOfOneBuilderForNode(node);
    applyTestOfOneBuilder(node, {
      ...builder,
      rows: [...builder.rows, createTestOfOneRow()]
    });
  }

  function removeTestOfOneRow(node, rowId) {
    const builder = testOfOneBuilderForNode(node);
    const rows = builder.rows.filter((row) => row.id !== rowId);
    applyTestOfOneBuilder(node, {
      ...builder,
      rows: rows.length ? rows : [createTestOfOneRow()]
    });
  }

  function toggleSendNode(node) {
    const current = detail.nodeResponses?.[node.id];
    const nextSent = !current?.sent;
    const nextDetail = {
      ...detail,
      nodeResponses: {
        ...detail.nodeResponses,
        [node.id]: nextSent
          ? {
              sent: true,
              sentBy: actorInitials(selectedControl?.owner || project?.owner || "member"),
              sentAt: new Date().toISOString()
            }
          : {
              sent: false,
              sentBy: "",
              sentAt: ""
            }
      }
    };
    setDetail(nextDetail);
    persist(nextDetail, nextSent ? "Sample request marked as sent." : "Sample request send mark canceled.");
  }

  function structuredFieldKey(node, field) {
    return `${node.id}.${field.id}`;
  }

  function defaultValueForField(field) {
    if (field.type === "matrix") return {};
    if (field.type === "checkbox_group") return [];
    if (field.type === "checkbox") return false;
    if (field.type === "date_range") return { start: "", end: "" };
    return "";
  }

  function structuredFieldValue(node, field) {
    const key = structuredFieldKey(node, field);
    const value = detail.nodeResponses[key];
    return value ?? defaultValueForField(field);
  }

  function updateStructuredField(node, field, value) {
    updateNodeResponse(structuredFieldKey(node, field), value);
  }

  function updateMatrixCell(node, field, rowId, columnId, value) {
    const matrix = structuredFieldValue(node, field);
    const nextMatrix = {
      ...(matrix && typeof matrix === "object" && !Array.isArray(matrix) ? matrix : {}),
      [rowId]: {
        ...((matrix && typeof matrix === "object" && matrix[rowId]) || {}),
        [columnId]: value
      }
    };
    updateStructuredField(node, field, nextMatrix);
  }

  function toggleCheckboxGroupValue(node, field, optionValue) {
    const current = structuredFieldValue(node, field);
    const values = Array.isArray(current) ? current : [];
    const nextValues = values.includes(optionValue)
      ? values.filter((value) => value !== optionValue)
      : [...values, optionValue];
    updateStructuredField(node, field, nextValues);
  }

  function renderReviewThread(fieldKey) {
    const review = detail.fieldReviews?.[fieldKey];
    if (!review || openReviewKey !== fieldKey) return null;

    return (
      <div className="workspace-review-thread">
        <div className="workspace-review-thread-head">
          <strong>Review Comment</strong>
          <span className={`workspace-review-state ${review.status}`}>
            {REVIEW_DOT_LABELS[review.status] || "Pending"}
          </span>
        </div>
        <textarea
          rows="2"
          value={review.comment}
          onChange={(event) => updateFieldReview(fieldKey, { comment: event.target.value })}
          placeholder="Enter reviewer comment."
        />
        <textarea
          rows="2"
          value={review.reply}
          onChange={(event) => updateFieldReview(fieldKey, { reply: event.target.value })}
          placeholder="Reply to review comment."
        />
        <div className="workspace-review-actions">
          <button className="button subtle" type="button" onClick={() => submitReviewReply(fieldKey)}>
            Reply
          </button>
          <button className="button success" type="button" onClick={() => acceptFieldReview(fieldKey)}>
            Accept
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
              aria-label="Text box actions"
              onClick={() => setOpenTextMenuKey(menuOpen ? "" : fieldKey)}
            >
              ...
            </button>
            {review ? (
              <button
                className={`workspace-comment-dot ${review.status}`}
                type="button"
                aria-label={REVIEW_DOT_LABELS[review.status] || "Review Comment"}
                onClick={() => setOpenReviewKey(openReviewKey === fieldKey ? "" : fieldKey)}
              />
            ) : null}
            {menuOpen ? (
              <div className="workspace-text-menu">
                <button type="button" onClick={() => addExtraTextField(node.id)}>
                  Add Text Box
                </button>
                <button type="button" onClick={() => addFieldReview(fieldKey)}>
                  Add Review Comment
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

  function renderGeneratedTableOutput(node, value) {
    const fieldKey = node.id;
    const review = detail.fieldReviews?.[fieldKey];
    const menuOpen = openTextMenuKey === fieldKey;
    const parsedTable = parseGeneratedTable(value);

    return (
      <div className="workspace-generated-table-output">
        <div className="workspace-text-toolbar">
          <span>{parsedTable?.title || tableTitleForBuilder(node)}</span>
          <div className="workspace-text-menu-wrap">
            <button
              className="workspace-text-menu-button"
              type="button"
              aria-label="Table actions"
              onClick={() => setOpenTextMenuKey(menuOpen ? "" : fieldKey)}
            >
              ...
            </button>
            {review ? (
              <button
                className={`workspace-comment-dot ${review.status}`}
                type="button"
                aria-label={REVIEW_DOT_LABELS[review.status] || "Review Comment"}
                onClick={() => setOpenReviewKey(openReviewKey === fieldKey ? "" : fieldKey)}
              />
            ) : null}
            {menuOpen ? (
              <div className="workspace-text-menu">
                <button type="button" onClick={() => addFieldReview(fieldKey)}>
                  Add Review Comment
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {parsedTable ? (
          <div className="workspace-generated-table-wrap">
            <table className="workspace-generated-table">
              <thead>
                <tr>
                  {parsedTable.headers.map((header, index) => (
                    <th key={`${header}-${index}`}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedTable.rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {parsedTable.headers.map((header, cellIndex) => (
                      <td key={`${header}-${cellIndex}`}>{row[cellIndex] || ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="workspace-empty-line">The generated table will appear here.</p>
        )}

        {renderReviewThread(fieldKey)}
      </div>
    );
  }

  function renderMatrixCell(node, field, row, column) {
    const matrix = structuredFieldValue(node, field);
    const rowValue = matrix?.[row.id] || {};
    const value = rowValue[column.id] ?? (column.type === "checkbox" ? false : "");

    if (column.type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => updateMatrixCell(node, field, row.id, column.id, event.target.checked)}
        />
      );
    }

    if (column.type === "textarea") {
      return (
        <textarea
          rows="2"
          value={responseText(value)}
          onChange={(event) => updateMatrixCell(node, field, row.id, column.id, event.target.value)}
          placeholder={column.placeholder || ""}
        />
      );
    }

    return (
      <input
        type="text"
        value={responseText(value)}
        onChange={(event) => updateMatrixCell(node, field, row.id, column.id, event.target.value)}
        placeholder={column.placeholder || ""}
      />
    );
  }

  function renderStructuredField(node, field) {
    const fieldKey = structuredFieldKey(node, field);
    const value = structuredFieldValue(node, field);

    if (field.type === "textarea") {
      return (
        <div className="workspace-structured-field" key={field.id}>
          <label className="workspace-structured-label">{field.label}</label>
          {renderTextBox({
            node,
            fieldKey,
            value: responseText(value),
            placeholder: field.placeholder,
            onChange: (nextValue) => updateStructuredField(node, field, nextValue)
          })}
        </div>
      );
    }

    if (field.type === "text") {
      return (
        <label className="workspace-structured-field" key={field.id}>
          <span className="workspace-structured-label">{field.label}</span>
          <input
            type="text"
            value={responseText(value)}
            onChange={(event) => updateStructuredField(node, field, event.target.value)}
            placeholder={field.placeholder || ""}
          />
        </label>
      );
    }

    if (field.type === "select" || field.type === "yes_no") {
      return (
        <label className="workspace-structured-field" key={field.id}>
          <span className="workspace-structured-label">{field.label}</span>
          <select
            value={responseText(value)}
            onChange={(event) => updateStructuredField(node, field, event.target.value)}
          >
            <option value="">Select</option>
            {(field.options || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="workspace-structured-check" key={field.id}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => updateStructuredField(node, field, event.target.checked)}
          />
          <span>{field.label}</span>
        </label>
      );
    }

    if (field.type === "checkbox_group") {
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <div className="workspace-structured-field" key={field.id}>
          <span className="workspace-structured-label">{field.label}</span>
          <div className="workspace-checkbox-grid">
            {(field.options || []).map((option) => (
              <label key={option.id || option.value} className="workspace-structured-check">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.id || option.value)}
                  onChange={() => toggleCheckboxGroupValue(node, field, option.id || option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (field.type === "date_range") {
      const range = value && typeof value === "object" && !Array.isArray(value)
        ? value
        : { start: "", end: "" };
      return (
        <div className="workspace-structured-field" key={field.id}>
          <span className="workspace-structured-label">{field.label}</span>
          <div className="workspace-date-range">
            <input
              type="date"
              value={range.start || ""}
              onChange={(event) => updateStructuredField(node, field, {
                ...range,
                start: event.target.value
              })}
            />
            <span>through</span>
            <input
              type="date"
              value={range.end || ""}
              onChange={(event) => updateStructuredField(node, field, {
                ...range,
                end: event.target.value
              })}
            />
          </div>
        </div>
      );
    }

    if (field.type === "matrix") {
      const rows = field.rows?.length ? field.rows : [{ id: "row-1", label: "Row 1" }];
      const columns = field.columns || [];

      return (
        <div className="workspace-structured-field" key={field.id}>
          <span className="workspace-structured-label">{field.label}</span>
          <div className="workspace-matrix-wrap">
            <table className="workspace-matrix">
              <thead>
                <tr>
                  <th>Item</th>
                  {columns.map((column) => (
                    <th key={column.id}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <th>{row.label}</th>
                    {columns.map((column) => (
                      <td key={column.id}>
                        {renderMatrixCell(node, field, row, column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return null;
  }

  function renderStructuredNode(node) {
    return (
      <div className="workspace-structured-node">
        {(node.fields || []).map((field) => renderStructuredField(node, field))}
      </div>
    );
  }

  function renderTestOfOneBuilder(node) {
    const builder = testOfOneBuilderForNode(node);
    const fields = activeTableFields(builder);

    return (
      <div className="workspace-test-one-builder">
        <div className="workspace-test-one-fields">
          <span>Sample Fields</span>
          <div className="workspace-field-name-list">
            {builder.fields.map((field, fieldIndex) => (
              <div className="workspace-field-name-row" key={field.id}>
                <span>Field {fieldIndex + 1}</span>
                <input
                  type="text"
                  value={field.label || ""}
                  onChange={(event) => updateTableFieldLabel(node, field.id, event.target.value)}
                  placeholder="Enter field name"
                />
                <button className="button subtle" type="button" onClick={() => removeTableField(node, field.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {fields.length ? (
          <div className="workspace-test-one-table">
            <table>
              <thead>
                <tr>
                  <th>Sample</th>
                  {fields.map((field) => (
                    <th key={field.id}>{field.label}</th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {builder.rows.map((row, rowIndex) => (
                  <tr key={row.id}>
                    <th>Sample {rowIndex + 1}</th>
                    {fields.map((field) => (
                      <td key={field.id}>
                        <input
                          type="text"
                          value={row.values?.[field.id] || ""}
                          onChange={(event) => updateTestOfOneCell(node, row.id, field.id, event.target.value)}
                          placeholder={field.label}
                        />
                      </td>
                    ))}
                    <td>
                      <button className="button subtle" type="button" onClick={() => removeTestOfOneRow(node, row.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="workspace-empty-line">Enter at least one sample field. The system will generate the entry table below.</p>
        )}

        <div className="workspace-test-one-actions">
          <button className="button subtle" type="button" onClick={() => addTableField(node)}>
            Add Field
          </button>
          <button className="button subtle" type="button" onClick={() => addTestOfOneRow(node)}>
            Add Sample
          </button>
          <button className="button primary" type="button" onClick={() => generateTableDraft(node)}>
            {tableGenerateButtonLabel(node)}
          </button>
          <span>{tableBuilderHelp(node)}</span>
        </div>
      </div>
    );
  }

  function renderGeneratedFileNode(node) {
    const file = generatedFileForNode(node);
    const hasDraft = Object.prototype.hasOwnProperty.call(draftResponses, node.id);
    const rowCount = Array.isArray(file?.rows) ? file.rows.length : 0;

    return (
      <div className="workspace-generated-node">
        <div className="workspace-generated-actions">
          <button className="button subtle" type="button" onClick={() => regenerateGeneratedNode(node)}>
            Regenerate Excel
          </button>
          {hasDraft ? <span>Unsaved file</span> : null}
        </div>

        {file ? (
          <div className="workspace-generated-file">
            <div>
              <strong>{file.fileName || "Selected Sample.xls"}</strong>
              <span>
                {rowCount} Selected Sample · Excel · Generated at {formatDateTime(file.generatedAt)}
              </span>
            </div>
            <button className="button primary" type="button" onClick={() => downloadExcelFile(file)}>
              Download Excel
            </button>
          </div>
        ) : (
          <p className="workspace-empty-line">After uploading the sample list, click “Regenerate Excel” and the system will generate 25 selected samples.</p>
        )}
      </div>
    );
  }

  function renderGeneratedNode(node) {
    const value = generatedValueForNode(node);
    const hasDraft = Object.prototype.hasOwnProperty.call(draftResponses, node.id);
    const generating = isGeneratingNode(node);

    return (
      <div className="workspace-generated-node">
        <div className="workspace-generated-actions">
          {isTableBuilderNode(node) ? (
            <span>Complete the table by sample fields to generate {tableTitleForBuilder(node)}</span>
          ) : (
            <button className="button subtle" type="button" onClick={() => regenerateGeneratedNode(node)} disabled={generating}>
              {generating ? "AI generating..." : "Regenerate"}
            </button>
          )}
          {generating ? <span className="workspace-ai-generating">Reading materials and generating draft</span> : null}
          {hasDraft ? <span>Unsaved draft</span> : null}
        </div>
        {isTableBuilderNode(node) ? renderTestOfOneBuilder(node) : null}
        {isTableBuilderNode(node) ? (
          renderGeneratedTableOutput(node, value)
        ) : (
          renderTextBox({
            node,
            fieldKey: node.id,
            value,
            placeholder: node.placeholder,
            onChange: (nextValue) => updateGeneratedDraft(node.id, nextValue)
          })
        )}
      </div>
    );
  }

  function renderSendToggleNode(node) {
    const sendState = detail.nodeResponses?.[node.id] || {};
    const sent = Boolean(sendState.sent);

    return (
      <div className="workspace-send-node">
        <button
          className={`workspace-send-button ${sent ? "active" : ""}`}
          type="button"
          onClick={() => toggleSendNode(node)}
        >
          {sent ? sendState.sentBy || "SENT" : "Send"}
        </button>
        {sent ? <span>Sent · {formatDateTime(sendState.sentAt)}</span> : <span>Not sent</span>}
      </div>
    );
  }

  return (
    <section className="workspace-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Workspace · Test Point Execution Workspace</p>
          <h2>{project?.clientName || project?.name || "Project Workspace"}</h2>
        </div>
        <div className="workspace-stats">
          <WorkspaceStat value={stats.total} label="Test Points" />
          <WorkspaceStat value={stats.nodeProgress} label="Node Progress" />
          <WorkspaceStat value={stats.testing} label="Testing" />
          <WorkspaceStat value={stats.completed} label="Completed" />
        </div>
      </header>

      <div className="workspace-grid">
        <aside className="workspace-list-panel">
          <div className="panel-toolbar">
            <div>
              <h3>Test Point List</h3>
            </div>
            <button className="button primary" type="button" onClick={openCreateDialog}>
              Create Test Point
            </button>
          </div>

          <div className="workspace-filter-grid">
            <label className="field">
              <span className="label">Owner</span>
              <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
                <option value="">All</option>
                {owners.map((owner) => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">Type</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="">All</option>
                <option value="GITC">GITC</option>
                <option value="ITAC">ITAC</option>
                <option value="TASK">TASK</option>
              </select>
            </label>

            <label className="field full">
              <span className="label">Progress Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All Statuses</option>
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
              <span>Show incomplete / action items only</span>
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
                    {Object.entries(control.phaseProgress || {}).map(([phaseId, phase]) => (
                      <span key={phaseId}>
                        {phaseId.toUpperCase()} {phase.completedNodes || 0}/{phase.totalNodes || 0}
                      </span>
                    ))}
                  </div>
                  <small>
                    Policy {control.policyCount || 0} · Minutes {control.meetingMinutesCount || 0} · Support {control.supportingMaterialCount || control.sppCount || 0}
                  </small>
                </button>
              );
            }) : (
              <div className="empty-state compact">
                <h3>No Test Points Yet</h3>
                <p>Click Create Test Point to add a control, or adjust filters.</p>
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
                    {selectedControl.owner} · Updated {formatDateTime(detail.updatedAt)}
                  </p>
                </div>
                <span className={`progress-pill ${statusClass(detailDisplayStatus)}`}>
                  {WORKSPACE_PROGRESS_LABELS[detailDisplayStatus]}
                </span>
              </div>

              <div className="workspace-progress-summary">
                <ProgressMeter
                  label="Overall"
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
                  </div>

                  <div className="workspace-node-list">
                    {activePhaseDetail.nodes.map((node) => {
                      const textValue = textValueForNode(node);
                      const textComplete = Boolean(textValue.trim());
                      const nodeStatus = node.type === "text" && textComplete
                        ? NODE_STATUS.COMPLETED
                        : node.status;
                      const nodeMaterials = node.type?.startsWith("upload") ? materialsForNode(node) : [];
                      const extraFields = detail.extraTextFields?.[node.id] || [];

                      return (
                        <div key={node.id} className={`workspace-node ${nodeStatus}`}>
                          <div className="workspace-node-main">
                            <span className={`node-status ${nodeStatus}`}>
                              {nodeStatus === NODE_STATUS.COMPLETED ? "Done" : "Pending"}
                            </span>
                            <div>
                              <strong>{node.label}</strong>
                              <span>{getWorkspaceNodeSubtitle(node)}</span>
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
                            </>
                          ) : null}

                          {node.type === "structured" ? renderStructuredNode(node) : null}

                          {node.type === "generated_text" ? renderGeneratedNode(node) : null}

                          {node.type === "generated_file" ? renderGeneratedFileNode(node) : null}

                          {node.type === "send_toggle" ? renderSendToggleNode(node) : null}

                          {(node.type === "text" || node.type === "structured") ? (
                            extraFields.map((field) => renderTextBox({
                              node,
                              fieldKey: `${node.id}::${field.id}`,
                              value: field.value,
                              placeholder: field.label || "Additional Notes",
                              onChange: (value) => updateExtraTextField(node.id, field.id, value)
                            }))
                          ) : null}

                          {node.type?.startsWith("upload") ? (
                            <div className="workspace-node-upload">
                              {node.supportKindOptions?.length ? (
                                <div className="workspace-upload-kind">
                                  {node.supportKindOptions.map((option) => (
                                    <label
                                      key={option.value}
                                      className={supportingMaterialKindForNode(node) === option.value ? "active" : ""}
                                    >
                                      <input
                                        type="radio"
                                        name={`${selectedControl.id}-${node.id}-support-kind`}
                                        value={option.value}
                                        checked={supportingMaterialKindForNode(node) === option.value}
                                        onChange={(event) => changeSupportingMaterialKind(node.id, event.target.value)}
                                      />
                                      <span>{option.label}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : null}
                              <label className="button">
                                {uploadLabel(node)}
                                <input
                                  type="file"
                                  multiple
                                  accept={node.accept || undefined}
                                  onChange={(event) => uploadMaterials(event, node)}
                                />
                              </label>
                              {node.fileHint ? <p className="node-note">{node.fileHint}</p> : null}
                              {node.requiresExportPath ? (
                                <label className="workspace-export-path">
                                  <span>{node.exportPathLabel || "Client Export Path"}</span>
                                  <input
                                    type="text"
                                    value={uploadNodeResponse(node).exportPath || ""}
                                    onChange={(event) => updateUploadExportPath(node, event.target.value)}
                                    placeholder={node.exportPathPlaceholder || "Enter client export path"}
                                  />
                                </label>
                              ) : null}
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
              <h3>No Test Points</h3>
              <p>This project has no test points to document yet.</p>
            </div>
          )}
        </section>
      </div>

      {createOpen ? (
        <div className="workspace-modal-backdrop" role="presentation">
          <form className="workspace-modal" onSubmit={createControlTask}>
            <div className="workspace-modal-head">
              <div>
                <h3>Create Test Point</h3>
                <p>Select a type to generate node due dates automatically. After saving, they sync to Module 3.</p>
              </div>
              <button className="button subtle" type="button" onClick={closeCreateDialog}>
                Close
              </button>
            </div>

            <div className="workspace-create-grid">
              <label className="field full">
                <span className="label">Test Point Name</span>
                <input
                  value={createDraft.title}
                  onChange={(event) => setCreateDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Example: APD-1 Password"
                />
              </label>

              <label className="field">
                <span className="label">Test Point Type</span>
                <select
                  value={createDraft.controlType}
                  onChange={(event) => updateCreateType(event.target.value)}
                >
                  {TEST_POINT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="label">Assignee</span>
                {memberOptions.length ? (
                  <select
                    value={createDraft.owner}
                    onChange={(event) => setCreateDraft((current) => ({ ...current, owner: event.target.value }))}
                  >
                    {memberOptions.map((member) => (
                      <option key={member.email} value={member.email}>
                        {member.email}{member.role ? ` · ${member.role}` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={createDraft.owner}
                    onChange={(event) => setCreateDraft((current) => ({ ...current, owner: event.target.value }))}
                    placeholder="member@kpmg.com"
                  />
                )}
              </label>

              <label className="field">
                <span className="label">First Node Due Date</span>
                <input
                  type="date"
                  value={createDraft.firstDueDate}
                  onChange={(event) => updateCreateFirstDueDate(event.target.value)}
                />
              </label>
            </div>

            <div className="workspace-due-table">
              <div className="workspace-due-table-head">
                <span>Node</span>
                <span>Due Date</span>
              </div>
              {createNodes.map((node, index) => (
                <label className="workspace-due-row" key={node.id}>
                  <span>
                    <strong>{index + 1}. {node.label}</strong>
                    <small>{node.phaseLabel} · {getWorkspaceNodeSubtitle(node)}</small>
                  </span>
                  <input
                    type="date"
                    value={createDraft.nodeDueDates[node.id] || ""}
                    onChange={(event) => updateCreateNodeDueDate(node.id, event.target.value)}
                  />
                </label>
              ))}
            </div>

            <div className="workspace-detail-actions">
              <button className="button subtle" type="button" onClick={closeCreateDialog}>
                Cancel
              </button>
              <button className="button primary" type="submit">
                Create
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
