import { normalizeAuditPhase } from "../modules/scope-init/scopeRules";

const LEGACY_STATUS_MAP = {
  grooming: "todo",
  design: "todo",
  development: "doing"
};

export function normalizeTaskStatus(status) {
  return LEGACY_STATUS_MAP[status] || status || "todo";
}

export function migrateTask(task) {
  if (!task || typeof task !== "object") return task;
  const migrated = {
    ...task,
    status: normalizeTaskStatus(task.status)
  };

  if (migrated.auditPhase) {
    migrated.auditPhase = normalizeAuditPhase(migrated.auditPhase);
  }

  return migrated;
}

export function migrateTasks(tasks) {
  return (tasks || []).map(migrateTask);
}
