# Progress Board Module（进度看板 · v1.7.0）

只读聚合层，消费 `workspaceProgressService` snapshot/detail。

主要页面与组件：

- `ProgressBoardPage.jsx` — 页顶负责组筛选、**View as 提示条**、测试点列表、只读抽屉
- `ProgressDashboard.jsx` — **测试点进度 KPI 四格**（含 GITC/ITAC 分布）、**测试节点进度**概览、近期动态
- `ControlNodeProgressCard.jsx` — 测试点节点进度（含负责人筛选）
- `TeamMemberProgressCard.jsx` — 组内成员进度（IC + Staff）
- `ProgressOwnerLabel.jsx` / `ProgressOwnerFilter.jsx` — 负责人彩色标签与筛选

接口约定见 `PROGRESS_API.md`（含 v1.7 指挥中心聚合与 View as）；产品需求见 `docs/product-requirements-document.md` §13 与 §七点五–七点八。
