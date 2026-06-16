import { useMemo } from "react";
import { PROGRESS_LIST_LABELS } from "../../data/progressLabels";
import { getMemberFilterOptions } from "./memberWorkloadUtils";
import {
  UNASSIGNED_MEMBER_KEY,
  UNASSIGNED_OWNER_LABEL
} from "./progressOwnerUtils";

export function ProgressOwnerFilter({
  project,
  groupFilter = "",
  controls = [],
  value = "",
  onChange,
  className = ""
}) {
  const { emails, hasUnassigned } = useMemo(
    () => getMemberFilterOptions(project, groupFilter, controls),
    [project, groupFilter, controls]
  );

  return (
    <label className={`progress-member-filter inline ${className}`.trim()}>
      <span>{PROGRESS_LIST_LABELS.memberFilter}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={PROGRESS_LIST_LABELS.memberFilter}
      >
        <option value="">{PROGRESS_LIST_LABELS.allMembers}</option>
        {emails.map((email) => (
          <option key={email} value={email}>{email}</option>
        ))}
        {hasUnassigned ? (
          <option value={UNASSIGNED_MEMBER_KEY}>{UNASSIGNED_OWNER_LABEL}</option>
        ) : null}
      </select>
      {value ? (
        <button
          type="button"
          className="filter-chip subtle-clear compact"
          onClick={() => onChange("")}
        >
          清除
        </button>
      ) : null}
    </label>
  );
}
