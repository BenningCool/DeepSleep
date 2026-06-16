# Progress Board Module（进度看板 · v1.6.10）

只读聚合层，消费 `workspaceProgressService` snapshot/detail。

主要页面与组件：

- `ProgressBoardPage.jsx` — 页顶负责组筛选、控制点列表、只读抽屉
- `ProgressDashboard.jsx` — KPI 四格、状态概述环形图、近期动态
- `ControlNodeProgressCard.jsx` — 控制点节点进度（含负责人筛选）
- `TeamMemberProgressCard.jsx` — 组内成员进度（IC + Staff）
- `ProgressOwnerLabel.jsx` / `ProgressOwnerFilter.jsx` — 负责人彩色标签与筛选

接口约定见 `PROGRESS_API.md`；产品需求见 `docs/product-requirements-document.md` §13。
