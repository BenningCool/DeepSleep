import {
  getOwnerColorTokens,
  isUnassignedOwner,
  UNASSIGNED_OWNER_LABEL
} from "./progressOwnerUtils";

export function ProgressOwnerLabel({ owner, className = "", compact = false, inline = false }) {
  const label = isUnassignedOwner(owner) ? UNASSIGNED_OWNER_LABEL : String(owner || "").trim();
  const tokens = getOwnerColorTokens(owner);

  return (
    <span
      className={[
        "progress-owner-label",
        tokens.className,
        compact ? "compact" : "",
        inline ? "inline" : "",
        className
      ].filter(Boolean).join(" ")}
      style={tokens.style}
      title={label}
    >
      {label}
    </span>
  );
}
