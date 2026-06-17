# Progress Board Module

Read-only aggregation layer that consumes `workspaceProgressService` snapshot/detail data.

Main files:

- `ProgressBoardPage.jsx` - owner-group filter, control list, read-only drawer.
- `ProgressDashboard.jsx` - KPI cards, status overview donut, recent activity.
- `ControlNodeProgressCard.jsx` - control node progress, including owner filter.
- `ProgressOwnerLabel.jsx` / `ProgressOwnerFilter.jsx` - owner chips and filters.

API contract: see `PROGRESS_API.md`.
