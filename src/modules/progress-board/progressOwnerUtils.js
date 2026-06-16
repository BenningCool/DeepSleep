export const UNASSIGNED_MEMBER_KEY = "__unassigned__";
export const UNASSIGNED_OWNER_LABEL = "未分配";

const OWNER_COLOR_PALETTE = [
  { bg: "#deebff", text: "#0747a6", border: "#85a8ff" },
  { bg: "#e3fcef", text: "#006644", border: "#57d9a3" },
  { bg: "#fff0b3", text: "#7a5200", border: "#ffc400" },
  { bg: "#ffebe6", text: "#bf2600", border: "#ff8f73" },
  { bg: "#eae6ff", text: "#403294", border: "#998dd9" },
  { bg: "#e6fcff", text: "#00657a", border: "#79e2f2" },
  { bg: "#fffae6", text: "#974f0c", border: "#ffab00" },
  { bg: "#f4f5f7", text: "#253858", border: "#c1c7d0" }
];

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

export function resolveOwnerColorIndex(owner) {
  const key = normalizeOwnerEmail(owner);
  if (!key || isUnassignedOwner(owner)) return -1;

  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = ((hash << 5) - hash) + key.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash) % OWNER_COLOR_PALETTE.length;
}

export function getOwnerColorTokens(owner) {
  const colorIndex = resolveOwnerColorIndex(owner);
  if (colorIndex < 0) {
    return {
      className: "is-unassigned",
      style: {}
    };
  }

  const colors = OWNER_COLOR_PALETTE[colorIndex];
  return {
    className: "",
    style: {
      "--progress-owner-bg": colors.bg,
      "--progress-owner-text": colors.text,
      "--progress-owner-border": colors.border
    }
  };
}
