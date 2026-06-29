export function KpiIcon({ type }) {
  if (type === "not-started") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
        <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "in-progress") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "completed") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12.5l2.5 2.5L16 9.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "procedures") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M8 9h8M8 13h8M8 17h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "flag") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4v16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 5h9l-2 3 2 3H6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.5 20.5 19H3.5L12 3.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 9v5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function KpiTypeSplit({ typeSplit }) {
  if (!typeSplit) return null;

  return (
    <ul className="progress-kpi-type-split" aria-label="GITC 与 ITAC 分布">
      {["GITC", "ITAC"].map((type) => (
        <li key={type}>
          <span className="progress-kpi-type-name">{type}</span>
          <span className="progress-kpi-type-stat">
            {typeSplit[type].count}
            {" · "}
            {typeSplit[type].percent}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function StatusKpiCard({
  iconType,
  label,
  value,
  percent,
  typeSplit,
  tone,
  alert = false,
  badge = "",
  extraClassName = "",
  muted = false,
  subject = "测试点"
}) {
  const numericValue = typeof value === "number" ? value : 0;
  const hasValue = numericValue > 0;

  return (
    <div
      className={[
        "progress-dashboard-kpi",
        "readonly",
        `tone-${tone}`,
        extraClassName,
        hasValue ? "has-value" : "is-idle",
        alert && hasValue ? "is-alert" : "",
        badge ? "has-badge" : "",
        muted ? "is-muted" : ""
      ].filter(Boolean).join(" ")}
      aria-label={percent ? `${label} ${value}，占 ${percent}` : `${label} ${value}`}
    >
      <span className={`progress-kpi-icon icon-${iconType}`} aria-hidden="true">
        <KpiIcon type={iconType} />
      </span>
      <div className="progress-kpi-copy">
        <div className="progress-kpi-label-row">
          <span className="progress-kpi-label">{label}</span>
          {badge ? <span className="progress-kpi-badge inline">{badge}</span> : null}
        </div>
        {subject ? <span className="progress-kpi-subject">{subject}</span> : null}
        <KpiTypeSplit typeSplit={typeSplit} />
      </div>
      <div className="progress-kpi-stat">
        <strong className="progress-kpi-value">{value}</strong>
        {percent ? <span className="progress-kpi-percent">{percent}</span> : null}
      </div>
    </div>
  );
}
