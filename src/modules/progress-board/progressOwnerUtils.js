export const UNASSIGNED_MEMBER_KEY = "__unassigned__";
export const UNASSIGNED_OWNER_LABEL = "未分配";

export function isUnassignedOwner(owner) {
  const normalized = String(owner || "").trim().toLowerCase();
  return !normalized
    || normalized === UNASSIGNED_OWNER_LABEL
    || normalized === "unassigned";
}

export function normalizeOwnerEmail(owner) {
  return String(owner || "").trim().toLowerCase();
}

export function resolveOwnerBucketKey(owner) {
  if (isUnassignedOwner(owner)) return UNASSIGNED_MEMBER_KEY;
  return normalizeOwnerEmail(owner);
}

export function matchesOwnerFilter(control, ownerFilter) {
  if (!ownerFilter) return true;
  if (ownerFilter === UNASSIGNED_MEMBER_KEY) {
    return isUnassignedOwner(control?.owner);
  }
  return normalizeOwnerEmail(control?.owner) === ownerFilter.toLowerCase();
}
