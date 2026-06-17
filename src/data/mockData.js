export const STORAGE_KEY = "deepsleep-project-kanban-v1";

export const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "doing", title: "In Progress" },
  { id: "review", title: "Pending Review" },
  { id: "done", title: "Completed" }
];

export const DEFAULT_TASKS = [
  {
    id: "DS-101",
    title: "Audit Customization Logic / Reconciliation Rules",
    description: "Initialize scope by project type. When creating a project, select industry, audit domain, and project type to automatically complete 80% of setup. Audit stages follow preset paths and cannot skip critical steps.",
    priority: "P0",
    platform: "PC",
    product: "DeepSleep Project Kanban",
    owner: "Cody",
    due: "2026-06-12",
    status: "grooming",
    comments: [
      { author: "PM", text: "Card details need to show critical steps and non-skippable rules." },
      { author: "Audit", text: "Scope initialization should allow quick selection by industry, audit domain, and project type." }
    ]
  },
  {
    id: "DS-102",
    title: "Collaborative Workspace (1.0 ignores permissions)",
    description: "The personal workspace aggregates all projects and workload for each member, helping the audit team quickly see assigned tasks.",
    priority: "P0",
    platform: "PC",
    product: "DeepSleep Project Kanban",
    owner: "Mia",
    due: "2026-06-14",
    status: "todo",
    comments: [
      { author: "Team", text: "For hackathon demo, show workspace entry and member fields first; permissions can be added later." }
    ]
  },
  {
    id: "DS-103",
    title: "Progress Board",
    description: "Visualize ITGC/ITAC dependencies. Cards are arranged by stage so the team can track flow from scoping to completion.",
    priority: "P0",
    platform: "PC",
    product: "DeepSleep Project Kanban",
    owner: "Alex",
    due: "2026-06-15",
    status: "development",
    comments: [
      { author: "Design", text: "UI references JIRA: left project navigation, top filters, horizontal Kanban columns." }
    ]
  },
  {
    id: "DS-104",
    title: "Card Body and Comment Features",
    description: "Card details should support body editing and appending comments so requirement discussions are captured under the task.",
    priority: "P0",
    platform: "PC",
    product: "DeepSleep Project Kanban",
    owner: "Nina",
    due: "2026-06-16",
    status: "review",
    comments: []
  },
  {
    id: "DS-105",
    title: "Mobile Task Overview",
    description: "Mobile focuses on read-only overview, showing my tasks, due dates, and current stage.",
    priority: "P1",
    platform: "Mobile",
    product: "DeepSleep Project Kanban",
    owner: "Ray",
    due: "2026-06-18",
    status: "design",
    comments: [
      { author: "UX", text: "On narrow screens, Kanban can scroll horizontally to keep information from overlapping." }
    ]
  },
  {
    id: "DS-106",
    title: "Save Tasks to Browser",
    description: "Use localStorage to save tasks, filter changes, edits, and comments so refresh does not lose demo data.",
    priority: "P1",
    platform: "Backend",
    product: "DeepSleep Project Kanban",
    owner: "Ivy",
    due: "2026-06-10",
    status: "done",
    comments: [
      { author: "Dev", text: "The static prototype has no backend; it can later be replaced with APIs." }
    ]
  },
  {
    id: "DS-107",
    title: "AI Requirement Summary",
    description: "Generate short summaries from long requirement text for quick card scanning. Hackathon version is an AI-side placeholder.",
    priority: "P2",
    platform: "AI",
    product: "DeepSleep Project Kanban",
    owner: "Leo",
    due: "2026-06-21",
    status: "todo",
    comments: []
  }
];
