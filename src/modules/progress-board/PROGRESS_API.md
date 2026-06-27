# Progress API Handoff

这份文档给模块 3「进度看板 / 依赖可视化」开发者使用。模块 2 是进度事实来源；模块 3 只读共享 service，不直接读取 Workspace 页面组件，也不直接读 localStorage。

## 入口

```js
import {
  getControlProgressSnapshot,
  getControlProgressDetail,
  PROGRESS_STATUS,
  EVIDENCE_STATUS,
  REVIEW_STATUS,
  NODE_STATUS,
  MATERIAL_CATEGORY,
  FIELD_REVIEW_STATUS
} from "../../services/workspaceProgressService";
```

模块 2 在每个测试点内记录阶段节点、材料和字段级复核意见。模块 3 读取 snapshot 做汇总和依赖图，点击节点时读取 detail 展示材料与明细。Planning / Review 流程按钮已从模块 2 移除，模块 3 不应展示或依赖这两个节点。

GITC 测试点使用专属 12 节点流程：TOD 6 个、TOE 6 个，完成度只按这 12 个 required 节点计算。ITAC 测试点只有 TOD，固定 5 个 required 节点；不会返回 TOE。TASK 使用轻量默认模板。因此模块 3 不要假设 TOD/TOE 一定同时存在，应以接口返回的 `completedNodes`、`totalNodes`、`phaseProgress` 和 `phases[].nodes` 为准。

## Snapshot

用于进度统计、依赖图节点、阻塞提示。调用方需要传入当前项目任务列表。

```js
const snapshot = getControlProgressSnapshot(projectId, projectTasks);
```

返回结构：

```js
{
  projectId: "PRJ-101",
  updatedAt: "2026-06-15T10:00:00.000Z",
  controls: [
    {
      id: "GITC-001",
      title: "访问管理控制测试",
      controlType: "GITC",
      owner: "alice@kpmg.com",
      assigneeEmail: "alice@kpmg.com",
      auditPhase: "control-test",
      taskStatus: "doing",
      progressStatus: "in_progress",
      workspaceStatus: "in_progress",
      progressPercent: 50,
      completedNodes: 6,
      totalNodes: 12,
      phaseProgress: {
        tod: { completedNodes: 4, totalNodes: 6 },
        toe: { completedNodes: 2, totalNodes: 6 }
      },
      currentNodeId: "gitc-tod-design",
      currentNodeLabel: "上传制度",
      currentNodePhaseId: "tod",
      currentNodePhaseLabel: "TOD",
      allNodesComplete: false,
      evidenceStatus: "partial_uploaded",
      evidenceCount: 0,
      meetingMinutesCount: 1,
      sppCount: 0,
      policyCount: 1,
      supportingMaterialCount: 1,
      requirementListCount: 1,
      samplePoolCount: 1,
      returnedSampleSupportCount: 1,
      reviewStatus: "pending_review",
      nodeDueDates: {
        "gitc-tod-policy": "2026-06-23",
        "gitc-tod-design": "2026-06-30",
        "gitc-tod-minutes": "2026-07-07"
      },
      fieldReviewSummary: {
        open: 1,
        replied: 0,
        accepted: 2
      },
      blockers: [],
      dependencies: [],
      updatedAt: "2026-06-15T10:00:00.000Z"
    }
  ]
}
```

字段说明：

| 字段 | 用途 |
| --- | --- |
| `controlType` | 测试点类型：`GITC`、`ITAC`、`TASK` |
| `owner` / `assigneeEmail` | 当前测试点负责人/被指派成员；模块 3 做成员工作量统计时优先使用 `assigneeEmail`，当前值与 `owner` 一致 |
| `progressStatus` | 模块 3 的主状态，优先用于节点颜色和聚合 |
| `workspaceStatus` | 模块 2 页面三态：`not_started`、`in_progress`、`completed`。只要节点文本、结构化字段或材料有内容即进入 `in_progress`；如果模块 3 要和工作台 UI 完全一致，优先展示这个字段 |
| `progressPercent` | 由节点完成度计算，等于 `completedNodes / totalNodes` |
| `completedNodes` / `totalNodes` | 当前测试点总完成节点数，适合显示 `6/12`；不要写死分母 |
| `phaseProgress` | 分阶段完成度，按返回 key 动态显示；GITC 通常有 `tod` / `toe`，ITAC 只有 `tod` |
| `currentNodeId` | 当前所处工作台节点 id（首个未完成 required 节点；全部完成时为最后一个节点） |
| `currentNodeLabel` | 当前节点中文名；进度看板列表/抽屉「当前 · xxx」 |
| `currentNodePhaseId` / `currentNodePhaseLabel` | 当前节点所属阶段 |
| `allNodesComplete` | 全部 required 节点是否已完成 |
| `evidenceCount` / `meetingMinutesCount` / `sppCount` | 旧材料类别数量，继续兼容 |
| `policyCount` / `supportingMaterialCount` | GITC TOD 使用：制度、支持性材料数量 |
| `requirementListCount` / `samplePoolCount` / `returnedSampleSupportCount` | GITC TOE 使用：需求清单、样本池、客户返回样本支持材料数量 |
| `reviewStatus` | 复核状态，可用于 sign-off 标识 |
| `milestones` / `milestoneActors` | 旧版兼容字段。Planning / Review 节点已移除，模块 3 不应展示或依赖 |
| `nodeDueDates` | 节点预计完成日期 map，key 为节点 id，value 为 `YYYY-MM-DD`；抽屉优先读 `detail.phases[].nodes[].dueDate`，回退此 map |
| `fieldReviewSummary` | 字段级复核意见数量汇总（v1.6.10 进度看板抽屉**不展示**，数据仍存在于 snapshot） |
| `blockers` | 当前测试点被哪些前置关键任务阻塞 |
| `dependencies` | 当前测试点依赖的前置任务，MVP 与 `blockers` 同源 |

模块 3 不要提供拖拽更新测试点进度。进度由模块 2 的节点数据自动计算。

## Detail

用于点击进度图节点后打开详情抽屉，展示阶段子流程、文字记录和材料清单。

```js
const detail = getControlProgressDetail("ITAC-001", task, projectTasks);
```

返回结构：

```js
{
  id: "ITAC-001",
  title: "三单匹配自动控制测试",
  controlType: "ITAC",
  testContent: {
    objective: "Implementation 草稿...",
    procedure: "",
    sampleInfo: "",
    result: "ITAC Test of One\n\n| 样本编号 | 配置/代码对象 | ..."
  },
  nodeResponses: {
    "itac-tod-implementation": "Implementation 草稿\n依据会议纪要整理控制执行人、控制频率、关键配置或代码对象。",
    "itac-tod-test-of-one": "ITAC Test of One\n\n| 样本编号 | 配置/代码对象 | 关键参数 | 支持材料索引 | 检查结果 | 结论 |\n| --- | --- | --- | --- | --- | --- |\n| ITAC-TOO-001 | 三单匹配容差配置 | 金额容差 0.5% | 支持材料.xlsx | 与审批一致 | 未发现例外 |"
  },
  nodeDueDates: {
    "itac-tod-minutes": "2026-06-23",
    "itac-tod-implementation": "2026-06-30",
    "itac-tod-supporting-material": "2026-07-07",
    "itac-tod-test-of-one-support": "2026-07-14",
    "itac-tod-test-of-one": "2026-07-21"
  },
  phases: [
    {
      id: "tod",
      label: "TOD",
      completedNodes: 5,
      totalNodes: 5,
      nodes: [
        {
          id: "itac-tod-minutes",
          phaseId: "tod",
          label: "上传会议纪要",
          type: "upload_minutes",
          required: true,
          category: "meeting_minutes",
          dueDate: "2026-06-23",
          status: "completed",
          materialCount: 1
        },
        {
          id: "itac-tod-implementation",
          phaseId: "tod",
          label: "自动生成 Implementation",
          type: "generated_text",
          required: true,
          dependsOnNodeId: "itac-tod-minutes",
          generationKind: "implementation",
          dueDate: "2026-06-30",
          status: "completed",
          value: "Implementation 草稿..."
        },
        {
          id: "itac-tod-supporting-material",
          phaseId: "tod",
          label: "上传配置/代码支持性材料",
          type: "upload_supporting_material",
          required: true,
          category: "supporting_material",
          supportKindOptions: [
            { value: "configuration", label: "配置" },
            { value: "code", label: "代码" }
          ],
          status: "completed",
          materialCount: 1
        },
        {
          id: "itac-tod-test-of-one-support",
          phaseId: "tod",
          label: "上传 Test of One 支持性材料",
          type: "upload_test_of_one_support",
          required: true,
          category: "supporting_material",
          defaultSupportingMaterialKind: "test_of_one",
          status: "completed",
          materialCount: 1
        },
        {
          id: "itac-tod-test-of-one",
          phaseId: "tod",
          label: "填写 Test of One 样本表",
          type: "generated_text",
          required: true,
          builderKind: "itac_test_of_one_table",
          status: "completed",
          value: "ITAC Test of One\n\n| 样本编号 | 配置/代码对象 | ..."
        }
      ]
    }
  ],
  completedNodes: 5,
  totalNodes: 5,
  phaseProgress: {
    tod: { completedNodes: 5, totalNodes: 5 }
  },
  progressPercent: 100,
  progressStatus: "completed",
  workspaceStatus: "completed",
  extraTextFields: {
    "itac-tod-test-of-one": [
      {
        id: "txt_abc123",
        label: "补充说明",
        value: "补充记录样本表生成依据。",
        createdAt: "2026-06-15T10:00:00.000Z"
      }
    ]
  },
  fieldReviews: {
    "itac-tod-test-of-one": {
      id: "rev_abc123",
      status: "replied",
      comment: "请补充配置参数来源。",
      reply: "已补充支持材料索引。",
      createdBy: "Reviewer",
      repliedBy: "alice@kpmg.com",
      acceptedBy: "",
      createdAt: "2026-06-15T10:00:00.000Z",
      updatedAt: "2026-06-15T10:30:00.000Z"
    }
  },
  materials: [
    {
      id: "mat_abc123",
      category: "supporting_material",
      supportingMaterialKind: "configuration",
      phaseId: "tod",
      nodeId: "itac-tod-supporting-material",
      name: "三单匹配配置截图.xlsx",
      fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 238000,
      uploadedBy: "alice@kpmg.com",
      uploadedAt: "2026-06-15T10:00:00.000Z",
      status: "submitted"
    }
  ],
  reviewStatus: "pending_review",
  reviewComment: "",
  blockers: [],
  updatedAt: "2026-06-15T10:00:00.000Z"
}
```

## 节点模板

当前模板按测试点类型区分。模块 3 不需要根据类型推导节点，只读取返回的 `phases`。

GITC 专属模板：

| 阶段 | 节点数 | 内容 |
| --- | ---: | --- |
| `tod` | 6 | 上传制度、自动生成 Design、上传会议纪要、自动生成 Implementation、上传支持性材料、手动填写字段并生成 Test of One 表格 |
| `toe` | 6 | 上传需求清单、上传样本清单、自动抽样生成 25 个抽样样本 Excel、是否发送样本、上传客户返回的样本支持性材料、手动填写字段并生成样本抄写表 |

GITC 的生成类节点会在模块 2 本地生成草稿或文件对象，但只有用户点击 `Save` 后，内容才写入 service 并计入 `completedNodes`。其中 `gitc-tod-test-of-one`、`gitc-toe-transcription` 都改为先由操作人员手动填写样本字段名，再按字段录入样本信息并生成表格。模块 2 页面会渲染为实际表格；模块 3 只会看到已经保存进对应 `nodeResponses` 的表格文本，可按表格展示。

`gitc-toe-sampling` 是 `generated_file` 节点，保存后的 `nodeResponses["gitc-toe-sampling"]` 形态为：

```js
{
  kind: "sampling_excel",
  fileName: "PC-1-程序变更-抽样样本.xls",
  fileType: "application/vnd.ms-excel",
  sheetName: "抽样样本",
  generatedAt: "2026-06-17T10:00:00.000Z",
  rowCount: 25,
  columns: [
    { key: "sequence", label: "序号" },
    { key: "sampleId", label: "抽样样本编号" },
    { key: "populationItem", label: "样本池记录" },
    { key: "sourcePool", label: "来源样本池" },
    { key: "samplingMethod", label: "抽样方法" },
    { key: "status", label: "状态" }
  ],
  rows: [
    {
      sequence: 1,
      sampleId: "SAMPLE-001",
      populationItem: "sample-pool-ROW-0007",
      sourcePool: "客户提供的样本池.xlsx (438 KB)",
      samplingMethod: "系统随机抽样（Demo）",
      status: "待发送"
    }
  ]
}
```

模块 3 如需展示抽样结果，可以读取 `nodeResponses["gitc-toe-sampling"].rows`，也可以直接读取 `phases[].nodes[]` 中该节点的 `file.rows`；如只做进度/逾期展示，只需要识别该节点 `status` 和 `dueDate`。

TASK 轻量模板：

| 阶段 | 节点数 | 内容 |
| --- | ---: | --- |
| `tod` | 4 | TOD 会议纪要、测试目标、流程理解、TOD支持性材料 |
| `toe` | 6 | 样本信息、测试程序、执行过程、上传TOE支持性材料、TOE 会议纪要、TOE 结论 |

ITAC TOD-only 模板：

| 阶段 | 节点数 | 内容 |
| --- | ---: | --- |
| `tod` | 5 | 上传会议纪要、自动生成 Implementation、上传配置/代码支持性材料、上传 Test of One 支持性材料、填写 Test of One 样本表 |

ITAC 不返回 `toe` 阶段。模块 3 如果要展示分阶段进度，应遍历 `Object.entries(phaseProgress)` 或 `detail.phases`，不要固定读取 `phaseProgress.toe`。

ITAC 的 `itac-tod-supporting-material` 是一个二选一上传节点，材料仍使用 `category = "supporting_material"`，并通过 `supportingMaterialKind` 区分：

| `supportingMaterialKind` | 含义 |
| --- | --- |
| `configuration` | 配置支持性材料 |
| `code` | 代码支持性材料 |
| `test_of_one` | Test of One 支持性材料 |

ITAC 的 `itac-tod-test-of-one` 使用 `builderKind = "itac_test_of_one_table"`。模块 2 会让操作人员先手动填写样本字段名，再填写样本信息，并把生成的表格写入 `nodeResponses["itac-tod-test-of-one"]`；模块 2 页面渲染为实际表格，模块 3 只展示保存后的内容即可。

新建测试点时，模块 2 会按所选类型列出当前模板的 required 节点，并为每个节点写入预计完成日期。操作员选择第一个节点日期后，后续节点默认逐个后推 7 天，且每个节点都可人工覆盖。模块 3 不需要自己推导默认日期，只读取 `nodeDueDates` 或 `phases[].nodes[].dueDate`。

后续如果模块 2 继续按行业或项目类型扩展模板，模块 3 不需要改读取方式，只按返回的 `phases[].nodes` 渲染即可。

## 节点和材料枚举

```js
NODE_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed"
}

MATERIAL_CATEGORY = {
  SPP: "spp",
  MEETING_MINUTES: "meeting_minutes",
  EVIDENCE: "evidence",
  POLICY: "policy",
  SUPPORTING_MATERIAL: "supporting_material",
  REQUIREMENT_LIST: "requirement_list",
  SAMPLE_POOL: "sample_pool",
  RETURNED_SAMPLE_SUPPORT: "returned_sample_support"
}

FIELD_REVIEW_STATUS = {
  OPEN: "open",
  REPLIED: "replied",
  ACCEPTED: "accepted"
}
```

节点类型：

| `type` | 完成规则 |
| --- | --- |
| `text` | 对应 `nodeResponses[node.id]` 或 legacy 字段非空 |
| `structured` | 对应 `nodeResponses["{nodeId}.{fieldId}"]`；必填字段按字段类型完成规则判断 |
| `generated_text` | 对应 `nodeResponses[node.id]` 非空。上传依赖材料后模块 2 可生成草稿，但 Save 前不计入完成 |
| `generated_file` | 对应 `nodeResponses[node.id]` 为文件对象，且 `rows.length > 0`；当前用于 GITC TOE 抽样 Excel |
| `send_toggle` | 对应 `nodeResponses[node.id].sent === true`；再次点击会取消并扣回完成度 |
| `upload_spp` | 当前节点下至少有一个 `category = "spp"` 材料 |
| `upload_minutes` | 当前节点下至少有一个 `category = "meeting_minutes"` 材料 |
| `upload_evidence` | 当前节点下至少有一个 `category = "evidence"` 材料 |
| `upload_policy` | 当前节点下至少有一个 `category = "policy"` 材料；GITC 制度节点仅允许 Word 文件（`.doc` / `.docx`），节点会返回 `accept` 和 `fileHint` |
| `upload_supporting_material` | 当前节点下至少有一个 `category = "supporting_material"` 材料；ITAC 该节点还会记录 `supportingMaterialKind = "configuration" | "code"` |
| `upload_test_of_one_support` | 当前节点下至少有一个 `category = "supporting_material"` 且 `supportingMaterialKind = "test_of_one"` 的材料 |
| `upload_requirement_list` | 当前节点下至少有一个 `category = "requirement_list"` 材料 |
| `upload_sample_pool` | 当前节点下至少有一个 `category = "sample_pool"` 材料；GITC TOE 样本池节点还要求 `nodeResponses["gitc-toe-sample-pool"].exportPath` 非空 |
| `upload_returned_sample_support` | 当前节点下至少有一个 `category = "returned_sample_support"` 材料 |
生成表格类节点通过 `builderKind` 区分交互形态：`test_of_one_table` 用于 GITC TOD 单样本 Test of One，`itac_test_of_one_table` 用于 ITAC TOD 单样本 Test of One，`sample_transcription_table` 用于 GITC TOE 多样本抄写。三者都由模块 2 先手动录入字段名，再录入样本值并生成表格；模块 3 不需要实现填表器，只读取保存后的 `nodeResponses[node.id]` 内容并渲染为表格。

GITC TOE 的 `gitc-toe-sample-pool` 会在上传样本清单后要求操作人员补充客户导出清单路径，保存形态为：

```js
nodeResponses: {
  "gitc-toe-sample-pool": {
    exportPath: "客户系统 / 程序变更 / 2025变更清单导出.xlsx"
  }
}
```

该节点只有在样本池材料和 `exportPath` 都存在时才会被 service 标记为 `completed`。

`structured` 字段类型：

| 字段类型 | `nodeResponses` 形态 | 完成规则 |
| --- | --- | --- |
| `text` / `textarea` / `select` / `yes_no` | 字符串 | 非空 |
| `checkbox` | 布尔值 | `true` |
| `checkbox_group` | 字符串数组 | 至少选择一项 |
| `date_range` | `{ start, end }` | 起止日期均非空 |
| `matrix` | `{ [rowId]: { [columnId]: value } }` | 默认至少一行有有效单元格；后续模板可通过配置提高要求 |

字段级复核意见不改变节点完成数，但会影响模块 2 的 `workspaceStatus`：全部 required 节点完成且所有字段级复核意见都为 `accepted` 后，`workspaceStatus` 变为 `completed`。

## 状态枚举

```js
PROGRESS_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  EVIDENCE_SUBMITTED: "evidence_submitted",
  PENDING_REVIEW: "pending_review",
  NEEDS_REWORK: "needs_rework",
  COMPLETED: "completed",
  BLOCKED: "blocked"
}

EVIDENCE_STATUS = {
  NONE: "none",
  PARTIAL_UPLOADED: "partial_uploaded",
  UPLOADED: "uploaded",
  APPROVED: "approved",
  REJECTED: "rejected"
}

REVIEW_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PENDING_REVIEW: "pending_review",
  COMMENTED: "commented",
  SIGNED_OFF: "signed_off"
}
```

`progressStatus` 推导优先级（**当前 service 实际产出**）：

1. 有 blocker：`blocked`
2. Reviewer 退回：`needs_rework`
3. 全部 required 节点完成且字段复核均为 `accepted`：`completed`
4. 已提交复核，或执行节点全部完成但未完成复核：`pending_review`
5. `completedNodes = 0` 且无工作台输入：`not_started`
6. 其他：`in_progress`

> 枚举中的 `evidence_submitted` 等值**保留供文案扩展**，当前 `deriveStatusFromProgress` **不会返回** `evidence_submitted`。

`workspaceStatus` 是模块 2 页面用的简化三态：

1. 没有任何节点文本、结构化字段、补充文本或材料：`not_started`
2. 识别到任一节点文本、结构化字段、补充文本或材料：`in_progress`
3. 全部 required 节点完成，且全部字段级复核意见 accepted：`completed`

## 推荐接入方式

1. 依赖图初始化时调用 `getControlProgressSnapshot(projectId, projectTasks)`。
2. 用 `controls` 生成图节点，用 `dependencies` 生成边。
3. 节点主标签显示 `title`，副标签显示 `completedNodes/totalNodes`、`progressPercent` 与 `currentNodeLabel`。
4. **进度看板列表/抽屉/KPI 主状态**按 `workspaceStatus` 三态着色；细态 `progressStatus` 仅作补充文案。
5. 点击节点时调用 `getControlProgressDetail(controlId, task, projectTasks)`。
6. 详情抽屉（v1.6.10 / v1.6.12）展示：**测试点状态**（`workspaceStatus`）、**节点进度**（`currentNodeLabel` + 计数 + 百分比 + 进度条）、计划完成日、**全部节点预计完成日**（`phases[].nodes`）、材料计数；**不展示**看板 `task.status`、字段复核、测试摘要、Planning/Review 旧流程节点。
7. **摘要仪表盘（v1.6.12）**：
   - KPI 四格：按 `workspaceStatus` 统计，可附 GITC/ITAC 分布（`computeTypeSplitForControls`）。
   - **测试节点进度**概览：按 `completedNodes/totalNodes` 汇总，分 **全部 / GITC / ITAC** 三行横条（`computeNodeProgressOverviewRows`）；**不再**使用 workspaceStatus 环形图。
8. 模块 2 保存后，模块 3 重新调用 snapshot/detail 即可拿到最新进度。

## 注意事项

- 不要直接读取 `deepsleep-workspace-progress-v1`。
- 不要 import `WorkspacePage.jsx`。
- 不要在模块 3 里手动修改 `progressPercent`、`completedNodes` 或节点状态。
- 当前接口是同步 localStorage 版本；后续接后端时会替换 service 内部实现，模块 3 调用方式不变。
