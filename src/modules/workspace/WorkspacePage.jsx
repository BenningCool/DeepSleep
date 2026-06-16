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
  getWorkspacePhases,
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
  [MATERIAL_CATEGORY.EVIDENCE]: "测试资料",
  [MATERIAL_CATEGORY.POLICY]: "制度",
  [MATERIAL_CATEGORY.SUPPORTING_MATERIAL]: "支持性材料",
  [MATERIAL_CATEGORY.REQUIREMENT_LIST]: "需求清单",
  [MATERIAL_CATEGORY.SAMPLE_POOL]: "样本池",
  [MATERIAL_CATEGORY.RETURNED_SAMPLE_SUPPORT]: "客户返回材料"
};

const REVIEW_DOT_LABELS = {
  [FIELD_REVIEW_STATUS.OPEN]: "待回复",
  [FIELD_REVIEW_STATUS.REPLIED]: "已回复",
  [FIELD_REVIEW_STATUS.ACCEPTED]: "已接受"
};

const WORD_FILE_MIME_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const DEFAULT_TABLE_FIELD_COUNT = 3;
const DEFAULT_TRANSCRIPTION_FIELD_COUNT = 4;

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

function supportingMaterialKindLabel(kind) {
  if (kind === "configuration") return "配置";
  if (kind === "code") return "代码";
  if (kind === "test_of_one") return "Test of One";
  return "";
}

function materialDisplayLabel(item) {
  const base = materialLabel(item.category);
  const kind = supportingMaterialKindLabel(item.supportingMaterialKind);
  return kind ? `${base}（${kind}）` : base;
}

function uploadLabel(node) {
  if (node.actionLabel) return node.actionLabel;
  if (node.type === "upload_spp") return "上传 SPP";
  if (node.type === "upload_minutes") return "上传纪要";
  return "上传资料";
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
  if (node?.builderKind === "sample_transcription_table") return "样本抄写";
  if (node?.builderKind === "itac_test_of_one_table") return "ITAC Test of One";
  return "Test of One";
}

function tableGenerateButtonLabel(node) {
  if (node?.builderKind === "sample_transcription_table") return "生成抄写表格";
  return "生成 Test of One 表格";
}

function tableBuilderHelp(node) {
  if (node?.builderKind === "sample_transcription_table") {
    return "先手动填写样本字段，再按字段逐行录入多个样本，全部填完后点击生成抄写表格。";
  }
  if (node?.builderKind === "itac_test_of_one_table") {
    return "先手动填写 ITAC 样本字段，再填写一个完整样本，生成 Test of One 表格。";
  }
  return "先手动填写样本字段，再填写一个完整样本，生成 Test of One 表格。";
}

function shouldAutoGenerateTable(node) {
  return node?.builderKind === "test_of_one_table"
    || node?.builderKind === "itac_test_of_one_table";
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
    return <p className="workspace-empty-line">暂无材料</p>;
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
            移除
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
      onToast?.("请填写测试点名称。");
      return;
    }
    if (!owner) {
      onToast?.("请先指派项目组成员。");
      return;
    }
    if (!createDraft.firstDueDate) {
      onToast?.("请先选择第一个节点预计完成日期。");
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
      onToast?.("新建测试点失败。");
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
    onToast?.("测试点已创建。");
  }

  useEffect(() => {
    setActivePhase("tod");
    setOpenTextMenuKey("");
    setOpenReviewKey("");
    setDraftResponses({});
    setTestOfOneBuilders({});
    setSupportingMaterialKinds({});
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
    upsertControlProgress(selectedControl.id, detailPatch(nextDetail));
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
    persist(nextDetail, "工作台内容已保存，模块 3 进度接口已更新。");
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
    notify("已取消未保存修改。");
  }

  function generatedTargetsForUploadNode(uploadNode) {
    return (detail.phases || []).flatMap((phase) => phase.nodes || []).filter((node) => (
      node.type === "generated_text" && node.dependsOnNodeId === uploadNode.id
    ));
  }

  function materialSummary(items = []) {
    if (!items.length) return "暂无材料";
    return items.map((item) => `${item.name || "未命名材料"}${item.size ? ` (${Math.round(item.size / 1024)} KB)` : ""}`).join("、");
  }

  function buildGeneratedText(node, materials = []) {
    const controlTitle = selectedControl?.title || "当前测试点";
    const source = materialSummary(materials);
    const generatedAt = formatDateTime(new Date().toISOString());

    if (node.generationKind === "design") {
      return `Design 草稿\n测试点：${controlTitle}\n依据制度：${source}\n\n系统根据上传制度识别控制目标、关键控制活动、控制频率、责任人与证据要求。请复核制度条款是否完整覆盖该 GITC 控制设计。`;
    }
    if (node.generationKind === "implementation") {
      if (node.id.startsWith("itac-")) {
        return `Implementation 草稿\n测试点：${controlTitle}\n依据会议纪要：${source}\n\n系统根据会议纪要整理控制执行人、控制频率、关键配置或代码对象、执行证据来源和实施结论。请复核访谈内容是否足以支持该 ITAC 已按设计实施。`;
      }
      return `Implementation 草稿\n测试点：${controlTitle}\n依据会议纪要：${source}\n\n系统根据会议纪要整理控制执行方式、访谈对象、执行频率和系统支持情况。请确认访谈结论是否支持控制已按设计实施。`;
    }
    if (node.generationKind === "test_of_one") {
      return "";
    }
    if (node.generationKind === "sampling") {
      return `抽样样本草稿\n测试点：${controlTitle}\n依据样本池：${source}\n\n系统模拟抽样结果：Sample-01、Sample-08、Sample-15、Sample-22、Sample-30。\n生成时间：${generatedAt}\n请复核样本池期间、总体完整性和样本数量。`;
    }
    if (node.generationKind === "transcription") {
      if (node.builderKind === "sample_transcription_table") return "";
      return `测试抄写草稿\n测试点：${controlTitle}\n依据客户返回材料：${source}\n\n系统根据客户返回的样本支持性材料模拟完成抄写，整理每个样本的控制属性、支持证据和初步测试结果。请复核抄写内容与附件是否一致。`;
    }
    return `自动生成草稿\n测试点：${controlTitle}\n依据材料：${source}\n生成时间：${generatedAt}`;
  }

  function setGeneratedDraft(node, materials = []) {
    if (isTableBuilderNode(node)) {
      setTestOfOneBuilders((current) => ({
        ...current,
        [node.id]: current[node.id] || createTestOfOneBuilder(initialFieldCountForTableBuilder(node))
      }));
      return;
    }
    setDraftResponses((current) => ({
      ...current,
      [node.id]: buildGeneratedText(node, materials)
    }));
  }

  function regenerateGeneratedNode(node) {
    const sourceMaterials = detail.materials.filter((item) => item.nodeId === node.dependsOnNodeId);
    if (!sourceMaterials.length) {
      notify("请先上传该节点所需材料。");
      return;
    }
    setGeneratedDraft(node, sourceMaterials);
    notify("已重新生成草稿，点击 Save 后计入进度。");
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
      notify(`${node.label}仅支持 Word 文件（.doc/.docx）。`);
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
      uploadedBy: selectedControl.owner || "成员",
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
        uploadedBy: selectedControl.owner || "成员"
      });
    });
    event.target.value = "";
    generatedTargetsForUploadNode(node).forEach((targetNode) => {
      setGeneratedDraft(targetNode, uploadedMaterials);
    });
    setDetail(getControlProgressDetail(selectedControl.id, selectedTask, tasks));
    refresh();
    if (files.length) {
      notify(`已记录 ${files.length} 个${materialLabel(node.category)}。`);
    }
  }

  function removeMaterial(materialId) {
    if (!selectedControl) return;
    removeWorkspaceMaterial(selectedControl.id, materialId);
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
    return responseText(detail.nodeResponses[node.id] ?? node.value ?? "");
  }

  function generatedValueForNode(node) {
    return responseText(draftResponses[node.id] ?? detail.nodeResponses[node.id] ?? node.value ?? "");
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
      notify("请先填写至少一个完整样本。");
      return;
    }
    updateGeneratedDraft(node.id, table);
    notify(`${tableTitleForBuilder(node)}表格已生成，点击 Save 后计入进度。`);
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
    persist(nextDetail, nextSent ? "样本已标记为发送。" : "样本发送标记已取消。");
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
              aria-label="表格操作"
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
                <button type="button" onClick={() => addFieldReview(fieldKey)}>
                  添加复核意见
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
          <p className="workspace-empty-line">生成后将在这里显示实际表格。</p>
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
            <option value="">请选择</option>
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
          <span>样本字段</span>
          <div className="workspace-field-name-list">
            {builder.fields.map((field, fieldIndex) => (
              <div className="workspace-field-name-row" key={field.id}>
                <span>字段 {fieldIndex + 1}</span>
                <input
                  type="text"
                  value={field.label || ""}
                  onChange={(event) => updateTableFieldLabel(node, field.id, event.target.value)}
                  placeholder="手动填写字段名"
                />
                <button className="button subtle" type="button" onClick={() => removeTableField(node, field.id)}>
                  移除
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
                  <th>样本</th>
                  {fields.map((field) => (
                    <th key={field.id}>{field.label}</th>
                  ))}
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {builder.rows.map((row, rowIndex) => (
                  <tr key={row.id}>
                    <th>样本 {rowIndex + 1}</th>
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
                        移除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="workspace-empty-line">先填写至少一个样本字段，系统会在下方生成录入表。</p>
        )}

        <div className="workspace-test-one-actions">
          <button className="button subtle" type="button" onClick={() => addTableField(node)}>
            新增字段
          </button>
          <button className="button subtle" type="button" onClick={() => addTestOfOneRow(node)}>
            新增样本
          </button>
          <button className="button primary" type="button" onClick={() => generateTableDraft(node)}>
            {tableGenerateButtonLabel(node)}
          </button>
          <span>{tableBuilderHelp(node)}</span>
        </div>
      </div>
    );
  }

  function renderGeneratedNode(node) {
    const value = generatedValueForNode(node);
    const hasDraft = Object.prototype.hasOwnProperty.call(draftResponses, node.id);

    return (
      <div className="workspace-generated-node">
        <div className="workspace-generated-actions">
          {isTableBuilderNode(node) ? (
            <span>按样本字段填表生成{tableTitleForBuilder(node)}</span>
          ) : (
            <button className="button subtle" type="button" onClick={() => regenerateGeneratedNode(node)}>
              重新生成
            </button>
          )}
          {hasDraft ? <span>未保存草稿</span> : null}
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
        {sent ? <span>已发送 · {formatDateTime(sendState.sentAt)}</span> : <span>未发送</span>}
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
            <button className="button primary" type="button" onClick={openCreateDialog}>
              新建测试点
            </button>
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
                    {Object.entries(control.phaseProgress || {}).map(([phaseId, phase]) => (
                      <span key={phaseId}>
                        {phaseId.toUpperCase()} {phase.completedNodes || 0}/{phase.totalNodes || 0}
                      </span>
                    ))}
                  </div>
                  <small>
                    制度 {control.policyCount || 0} · 纪要 {control.meetingMinutesCount || 0} · 支持 {control.supportingMaterialCount || control.sppCount || 0}
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
                            </>
                          ) : null}

                          {node.type === "structured" ? renderStructuredNode(node) : null}

                          {node.type === "generated_text" ? renderGeneratedNode(node) : null}

                          {node.type === "send_toggle" ? renderSendToggleNode(node) : null}

                          {(node.type === "text" || node.type === "structured") ? (
                            extraFields.map((field) => renderTextBox({
                              node,
                              fieldKey: `${node.id}::${field.id}`,
                              value: field.value,
                              placeholder: field.label || "补充说明",
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

      {createOpen ? (
        <div className="workspace-modal-backdrop" role="presentation">
          <form className="workspace-modal" onSubmit={createControlTask}>
            <div className="workspace-modal-head">
              <div>
                <h3>新建测试点</h3>
                <p>选择类型后自动生成节点预计完成时间，保存后同步给模块 3。</p>
              </div>
              <button className="button subtle" type="button" onClick={closeCreateDialog}>
                关闭
              </button>
            </div>

            <div className="workspace-create-grid">
              <label className="field full">
                <span className="label">测试点名称</span>
                <input
                  value={createDraft.title}
                  onChange={(event) => setCreateDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="例如：APD-1 Password"
                />
              </label>

              <label className="field">
                <span className="label">测试点类型</span>
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
                <span className="label">指派成员</span>
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
                <span className="label">第一个节点预计完成日期</span>
                <input
                  type="date"
                  value={createDraft.firstDueDate}
                  onChange={(event) => updateCreateFirstDueDate(event.target.value)}
                />
              </label>
            </div>

            <div className="workspace-due-table">
              <div className="workspace-due-table-head">
                <span>节点</span>
                <span>预计完成日期</span>
              </div>
              {createNodes.map((node, index) => (
                <label className="workspace-due-row" key={node.id}>
                  <span>
                    <strong>{index + 1}. {node.label}</strong>
                    <small>{node.phaseLabel} · {node.type}</small>
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
