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
  MATERIAL_CATEGORY
} from "../../services/workspaceProgressService";
```

模块 2 在每个测试点内记录 TOD / TOE 节点、材料和复核状态。模块 3 读取 snapshot 做汇总和依赖图，点击节点时读取 detail 展示材料与明细。

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
      id: "ITAC-001",
      title: "三单匹配自动控制测试",
      controlType: "ITAC",
      owner: "alice@kpmg.com",
      auditPhase: "control-test",
      taskStatus: "doing",
      progressStatus: "in_progress",
      progressPercent: 90,
      completedNodes: 9,
      totalNodes: 10,
      phaseProgress: {
        tod: { completedNodes: 3, totalNodes: 4 },
        toe: { completedNodes: 6, totalNodes: 6 }
      },
      evidenceStatus: "partial_uploaded",
      evidenceCount: 0,
      meetingMinutesCount: 2,
      sppCount: 2,
      reviewStatus: "pending_review",
      blockers: [],
      dependencies: ["GITC-001"],
      updatedAt: "2026-06-15T10:00:00.000Z"
    }
  ]
}
```

字段说明：

| 字段 | 用途 |
| --- | --- |
| `controlType` | 测试点类型：`GITC`、`ITAC`、`TASK` |
| `progressStatus` | 模块 3 的主状态，优先用于节点颜色和聚合 |
| `progressPercent` | 由节点完成度计算，等于 `completedNodes / totalNodes` |
| `completedNodes` / `totalNodes` | 当前测试点总完成节点数，适合显示 `9/10` |
| `phaseProgress` | TOD / TOE 分阶段完成度，适合显示 `TOD 3/4`、`TOE 6/6` |
| `evidenceCount` / `meetingMinutesCount` / `sppCount` | 已上传材料数量 |
| `reviewStatus` | 复核状态，可用于 sign-off 标识 |
| `blockers` | 当前测试点被哪些前置关键任务阻塞 |
| `dependencies` | 当前测试点依赖的前置任务，MVP 与 `blockers` 同源 |

模块 3 不要提供拖拽更新测试点进度。进度由模块 2 的节点数据自动计算。

## Detail

用于点击进度图节点后打开详情抽屉，展示 TOD / TOE 子流程、文字记录和材料清单。

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
    objective: "验证自动控制设计有效。",
    procedure: "检查配置、样本和重新执行结果。",
    sampleInfo: "样本量 25，期间 2026 Q1。",
    result: "No exception noted."
  },
  nodeResponses: {
    "tod-objective": "验证自动控制设计有效。",
    "toe-result": "No exception noted."
  },
  phases: [
    {
      id: "tod",
      label: "TOD",
      completedNodes: 3,
      totalNodes: 4,
      nodes: [
        {
          id: "tod-objective",
          phaseId: "tod",
          label: "TOD 测试目标",
          type: "text",
          required: true,
          status: "completed",
          value: "验证自动控制设计有效。",
          materialCount: 0
        },
        {
          id: "tod-spp",
          phaseId: "tod",
          label: "TOD支持性材料",
          type: "upload_spp",
          required: true,
          category: "spp",
          status: "pending",
          materialCount: 0
        }
      ]
    }
  ],
  completedNodes: 9,
  totalNodes: 10,
  phaseProgress: {
    tod: { completedNodes: 3, totalNodes: 4 },
    toe: { completedNodes: 6, totalNodes: 6 }
  },
  progressPercent: 90,
  progressStatus: "in_progress",
  materials: [
    {
      id: "mat_abc123",
      category: "spp",
      phaseId: "toe",
      nodeId: "toe-spp",
      name: "三单匹配 TOE 支持性材料.xlsx",
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

当前 MVP 使用统一 TOD / TOE 模板：

| 阶段 | 节点数 | 内容 |
| --- | ---: | --- |
| `tod` | 4 | TOD 会议纪要、测试目标、流程理解、TOD支持性材料 |
| `toe` | 6 | 样本信息、测试程序、执行过程、上传TOE支持性材料、TOE 会议纪要、TOE 结论 |

后续如果模块 2 按 `GITC/ITAC` 或行业扩展模板，模块 3 不需要改读取方式，只按返回的 `phases[].nodes` 渲染即可。

## 节点和材料枚举

```js
NODE_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed"
}

MATERIAL_CATEGORY = {
  SPP: "spp",
  MEETING_MINUTES: "meeting_minutes",
  EVIDENCE: "evidence"
}
```

节点类型：

| `type` | 完成规则 |
| --- | --- |
| `text` | 对应 `nodeResponses[node.id]` 或 legacy 字段非空 |
| `upload_spp` | 当前节点下至少有一个 `category = "spp"` 材料 |
| `upload_minutes` | 当前节点下至少有一个 `category = "meeting_minutes"` 材料 |
| `upload_evidence` | 当前节点下至少有一个 `category = "evidence"` 材料 |
| `review` | `reviewStatus` 达到节点定义的 `threshold` |

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

`progressStatus` 推导优先级：

1. 有 blocker：`blocked`
2. Reviewer 退回：`needs_rework`
3. 全部 required 节点完成且已签核：`completed`
4. 已提交复核，或全部执行节点完成但未完成复核：`pending_review`
5. `completedNodes = 0`：`not_started`
6. 其他：`in_progress`

## 推荐接入方式

1. 依赖图初始化时调用 `getControlProgressSnapshot(projectId, projectTasks)`。
2. 用 `controls` 生成图节点，用 `dependencies` 生成边。
3. 节点主标签显示 `title`，副标签显示 `completedNodes/totalNodes` 和 `progressPercent`。
4. 节点颜色按 `progressStatus`，其中 `blocked` 优先级最高。
5. 点击节点时调用 `getControlProgressDetail(controlId, task, projectTasks)`。
6. 详情抽屉展示 `phases`、`materials`、`reviewStatus`、`reviewComment`。
7. 模块 2 保存后，模块 3 重新调用 snapshot/detail 即可拿到最新进度。

## 注意事项

- 不要直接读取 `deepsleep-workspace-progress-v1`。
- 不要 import `WorkspacePage.jsx`。
- 不要在模块 3 里手动修改 `progressPercent`、`completedNodes` 或节点状态。
- 当前接口是同步 localStorage 版本；后续接后端时会替换 service 内部实现，模块 3 调用方式不变。
