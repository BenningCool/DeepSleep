# Module 3 Progress API

This document is for the Module 3 Progress Board / dependency visualization developer.
Module 2 is the source of truth for execution progress. Module 3 must read the shared
service only, and must not read Workspace component state or the localStorage key directly.

## Entry Points

```js
import {
  getControlProgressSnapshot,
  getControlProgressDetail
} from "../../services/workspaceProgressService";
```

Use these APIs:

```js
getControlProgressSnapshot(projectId, projectTasks);
getControlProgressDetail(controlId, task, projectTasks);
```

## Core Principle

Module 2 records execution nodes, uploaded material metadata, generated drafts, sample
tables, and field-level review comments. Module 3 reads snapshots for dashboards and
dependency diagrams, and reads detail only when a user opens a node or drawer.

Planning / Review milestone buttons have been removed from Module 2. Module 3 should not
render or depend on those legacy milestones.

## Templates

GITC test points use 12 required nodes:

| Phase | Required nodes | Flow |
| --- | ---: | --- |
| `tod` | 6 | Upload Policy, Auto-generate Design, Upload Meeting Minutes, Auto-generate Implementation, Upload Supporting Materials, Complete Test of One sample table |
| `toe` | 6 | Upload Requirement List, Upload Sample List, Auto-generate 25-row sampling Excel, Send Sample Request, Upload Returned Sample Supporting Materials, Complete Sample Transcription table |

ITAC test points use TOD only, with 5 required nodes:

| Phase | Required nodes | Flow |
| --- | ---: | --- |
| `tod` | 5 | Upload Meeting Minutes, Auto-generate Process Description, Upload Configuration / Code Supporting Materials, Upload Test of One Supporting Materials, Complete Test of One sample table |

TASK test points keep the lightweight fallback template. Module 3 must not hard-code
TOD / TOE or any denominator. Always render from `phaseProgress`, `phases`, `completedNodes`,
and `totalNodes`.

## Snapshot Contract

`getControlProgressSnapshot(projectId, projectTasks)` returns:

```js
{
  projectId: "PRJ-101",
  updatedAt: "2026-06-17T10:00:00.000Z",
  controls: [
    {
      id: "PC-1",
      title: "Program Change",
      controlType: "GITC",
      owner: "alice@kpmg.com",
      assigneeEmail: "alice@kpmg.com",
      auditPhase: "control-test",
      taskStatus: "todo",
      progressStatus: "in_progress",
      workspaceStatus: "in_progress",
      progressPercent: 50,
      completedNodes: 6,
      totalNodes: 12,
      phaseProgress: {
        tod: { completedNodes: 6, totalNodes: 6 },
        toe: { completedNodes: 0, totalNodes: 6 }
      },
      currentNodeId: "gitc-toe-requirement-list",
      currentNodeLabel: "Upload Requirement List",
      currentNodePhaseId: "toe",
      currentNodePhaseLabel: "TOE",
      allNodesComplete: false,
      policyCount: 1,
      meetingMinutesCount: 1,
      supportingMaterialCount: 1,
      requirementListCount: 0,
      samplePoolCount: 0,
      returnedSampleSupportCount: 0,
      nodeDueDates: {
        "gitc-tod-policy": "2026-06-24",
        "gitc-tod-design": "2026-07-01"
      },
      fieldReviewSummary: {
        open: 0,
        replied: 0,
        accepted: 0,
        total: 0
      },
      blockers: [],
      dependencies: [],
      updatedAt: "2026-06-17T10:00:00.000Z"
    }
  ]
}
```

Important fields:

| Field | Meaning |
| --- | --- |
| `owner` / `assigneeEmail` | Person assigned to the test point. Use `assigneeEmail` for workload analysis. |
| `progressStatus` | Main progress status for colors and aggregation. |
| `workspaceStatus` | Simplified Module 2 status: `not_started`, `in_progress`, `completed`. |
| `completedNodes` / `totalNodes` | Display as `6/12`, `5/5`, etc. Never hard-code the denominator. |
| `phaseProgress` | Dynamic phase map. GITC has `tod` and `toe`; ITAC only has `tod`. |
| `currentNodeId` / `currentNodeLabel` | First incomplete required node, or the last node when all are complete. |
| `nodeDueDates` | Node-level due date map in `YYYY-MM-DD` format. Use for overdue reminders. |
| material count fields | Category counts for dashboard/list summaries. |
| `blockers` / `dependencies` | Prerequisite task references for dependency view and blocker display. |

## Detail Contract

`getControlProgressDetail(controlId, task, projectTasks)` returns:

```js
{
  id: "PC-1",
  title: "Program Change",
  controlType: "GITC",
  owner: "alice@kpmg.com",
  assigneeEmail: "alice@kpmg.com",
  nodeDueDates: {
    "gitc-tod-policy": "2026-06-24"
  },
  phases: [
    {
      id: "tod",
      label: "TOD",
      completedNodes: 6,
      totalNodes: 6,
      nodes: [
        {
          id: "gitc-tod-policy",
          label: "Upload Policy",
          type: "upload_policy",
          required: true,
          status: "completed",
          dueDate: "2026-06-24",
          materialCount: 1
        }
      ]
    }
  ],
  nodeResponses: {
    "gitc-tod-design": "Generated design draft...",
    "gitc-toe-sampling": {
      fileName: "PC-1-selected-samples.xls",
      fileType: "application/vnd.ms-excel",
      generatedAt: "2026-06-17T10:00:00.000Z",
      rows: []
    }
  },
  materials: [
    {
      id: "mat_abc123",
      nodeId: "gitc-tod-policy",
      category: "policy",
      name: "Change Management Policy.docx",
      fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      uploadedBy: "alice@kpmg.com",
      uploadedAt: "2026-06-17T10:00:00.000Z",
      status: "submitted"
    }
  ],
  fieldReviews: {},
  updatedAt: "2026-06-17T10:00:00.000Z"
}
```

Each `phases[].nodes[]` item carries `dueDate`, so Module 3 can render node-level
overdue indicators without deriving dates.

## Node Completion Rules

| Type | Completion rule |
| --- | --- |
| `text` | Corresponding `nodeResponses[node.id]` or legacy field is non-empty. |
| `structured` | Required structured fields in `nodeResponses` are complete. |
| `generated_text` | `nodeResponses[node.id]` is non-empty. Generated drafts count only after Save. |
| `generated_file` | `nodeResponses[node.id]` is a file object with non-empty `rows`. |
| `send_toggle` | `nodeResponses[node.id].sent === true`; clicking again cancels it. |
| `upload_policy` | At least one policy material exists under the node. GITC policy upload accepts Word only. |
| `upload_minutes` | At least one meeting-minutes material exists under the node. |
| `upload_supporting_material` | At least one supporting material exists under the node. |
| `upload_test_of_one_support` | At least one `supporting_material` with `supportingMaterialKind = "test_of_one"`. |
| `upload_requirement_list` | At least one requirement-list material exists under the node. |
| `upload_sample_pool` | At least one sample-pool material exists and the client export path is filled. |
| `upload_returned_sample_support` | At least one returned-sample-support material exists. |

Sample-table builders are Module 2 interactions only. Module 3 only needs to display
the saved `nodeResponses[node.id]` content, preferably as a table when it is Markdown table text.

## Status Rules

`workspaceStatus` is the Module 2 simplified status:

1. `not_started`: no node response, structured field, extra text, or material exists.
2. `in_progress`: any node response, structured field, extra text, or material exists.
3. `completed`: all required nodes are complete and all field-level review comments are accepted.

`progressStatus` keeps backward-compatible statuses:

1. `blocked` when blockers exist.
2. `needs_rework` when reviewer comments require rework.
3. `completed` when all required nodes are complete and field comments are accepted.
4. `pending_review` when submitted for review or execution nodes are complete but sign-off is not.
5. `in_progress` when some progress exists.
6. `not_started` when no progress exists.

## Recommended Integration

1. Call `getControlProgressSnapshot(projectId, projectTasks)` when the Progress Board loads.
2. Render graph nodes from `controls` and edges from `dependencies`.
3. Display node labels from `title`, `completedNodes/totalNodes`, `progressPercent`, and `currentNodeLabel`.
4. Color by `progressStatus`; treat `blocked` as highest priority.
5. Call `getControlProgressDetail(controlId, task, projectTasks)` when the user opens a node detail drawer.
6. Display `workspaceStatus`, node progress, planned due dates, all node due dates, and material counts.
7. After Module 2 saves, call snapshot/detail again to get the latest progress.

## Do Not

- Do not read `deepsleep-workspace-progress-v1` directly.
- Do not import `WorkspacePage.jsx`.
- Do not allow manual dragging to change test point progress.
- Do not modify `progressPercent`, `completedNodes`, or node status from Module 3.
