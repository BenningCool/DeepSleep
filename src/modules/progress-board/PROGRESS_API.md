# Progress API Handoff

这份文档给模块 3「进度看板 / 依赖可视化」开发者使用。模块 3 只读取共享 service，不直接读取 Workspace 页面组件，也不直接读 localStorage。

## 入口

```js
import {
  getControlProgressSnapshot,
  getControlProgressDetail,
  PROGRESS_STATUS,
  EVIDENCE_STATUS,
  REVIEW_STATUS
} from "../../services/workspaceProgressService";
```

模块 2 写入测试内容、会议纪要、测试资料和复核状态；模块 3 通过以上接口读取进度事实。

## Snapshot

用于进度统计、依赖图节点、阻塞提示。

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
      id: "DS-201",
      title: "访问管理控制测试",
      controlType: "GITC",
      owner: "alice@kpmg.com",
      auditPhase: "control-design",
      taskStatus: "design",
      progressStatus: "evidence_submitted",
      progressPercent: 60,
      evidenceStatus: "uploaded",
      evidenceCount: 2,
      meetingMinutesCount: 1,
      reviewStatus: "pending_review",
      blockers: [],
      dependencies: ["DS-202"],
      updatedAt: "2026-06-15T10:00:00.000Z"
    }
  ]
}
```

字段说明：

| 字段 | 用途 |
| --- | --- |
| `controlType` | 节点类型：`GITC`、`ITAC`、`TASK` |
| `progressStatus` | 模块 3 的主状态，优先用于颜色和聚合 |
| `progressPercent` | 进度百分比，阻塞时保留实际完成度 |
| `blockers` | 当前节点被哪些前置任务阻塞 |
| `dependencies` | 当前节点依赖的前置任务，MVP 与 `blockers` 同源 |
| `evidenceCount` / `meetingMinutesCount` | 材料数量 |
| `reviewStatus` | 复核状态，可用于展示 sign-off |

## Detail

用于点击节点后打开右侧抽屉，展示模块 2 中完成的材料。

```js
const detail = getControlProgressDetail("DS-201");
```

返回结构：

```js
{
  id: "DS-201",
  testContent: {
    objective: "验证访问管理控制在审计期间持续有效运行。",
    procedure: "检查准入审批、权限复核与离职回收样本。",
    sampleInfo: "样本量 25，期间 2026 Q1。",
    result: "No exception noted."
  },
  materials: [
    {
      id: "mat_abc123",
      category: "evidence",
      name: "权限复核截图.pdf",
      fileType: "application/pdf",
      size: 238000,
      uploadedBy: "alice@kpmg.com",
      uploadedAt: "2026-06-15T10:00:00.000Z",
      status: "submitted"
    }
  ],
  reviewStatus: "pending_review",
  reviewComment: "",
  updatedAt: "2026-06-15T10:00:00.000Z"
}
```

材料分类：

| `category` | 含义 |
| --- | --- |
| `meeting_minutes` | 会议纪要 |
| `evidence` | 测试资料 |

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

## 推荐接入方式

1. 依赖图初始化时调用 `getControlProgressSnapshot(projectId, projectTasks)`。
2. 用 `controls` 生成节点，用 `dependencies` 生成边。
3. 节点颜色优先按 `progressStatus`，`BLOCKED` 优先级最高。
4. 点击节点时调用 `getControlProgressDetail(controlId)`，展示 `testContent`、`materials`、`reviewStatus`。
5. 如果模块 2 保存了新材料，模块 3 重新调用 snapshot/detail 即可拿到最新状态。

## 注意事项

- 不要直接读取 `deepsleep-workspace-progress-v1`。
- 不要 import `WorkspacePage.jsx`。
- 当前接口是同步 localStorage 版本；后续接后端时会替换 service 内部实现，模块 3 调用方式不变。
