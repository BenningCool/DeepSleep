import { useMemo } from "react";
import { formatProcedureOverdue } from "./managementCopy";
import {
  buildReportTimelineFromRows,
  markerSizeForOverdue
} from "./reportTimelineUtils";
import { formatReportStackMessage } from "./reportDayUtils";

function TimelineMarker({ row, onOpenProgress }) {
  const { project, urgency, overdueCount, risk, positionPercent, lane = 0 } = row;
  const size = markerSizeForOverdue(overdueCount);
  const client = project.clientName || project.name;

  return (
    <button
      type="button"
      className={`report-timeline-marker ${urgency.className} ${risk?.className || ""}`}
      style={{
        left: `${positionPercent}%`,
        top: `${8 + lane * 34}px`,
        width: `${size}px`,
        height: `${size}px`
      }}
      title={`${client} · ${urgency.readableLabel} · ${formatProcedureOverdue(overdueCount)}`}
      onClick={() => onOpenProgress(project.id)}
    >
      <span className="report-timeline-marker-label">{client}</span>
      {overdueCount ? (
        <span className="report-timeline-marker-badge">{overdueCount}</span>
      ) : null}
    </button>
  );
}

function SideBucket({ title, rows, tone, onOpenProgress }) {
  if (!rows.length) return null;

  return (
    <div className={`report-timeline-bucket ${tone}`}>
      <span className="report-timeline-bucket-title">{title}</span>
      <div className="report-timeline-bucket-list">
        {rows.map((row) => (
          <button
            key={row.project.id}
            type="button"
            className="report-timeline-bucket-item"
            onClick={() => onOpenProgress(row.project.id)}
          >
            <strong>{row.project.clientName || row.project.name}</strong>
            <span>{row.urgency.readableLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReportTimelineStrip({
  rows = [],
  reportStack = null,
  horizonDays = 90,
  embedded = false,
  onOpenProgress
}) {
  const model = useMemo(
    () => buildReportTimelineFromRows(rows, { horizonDays }),
    [rows, horizonDays]
  );

  if (!rows.length) return null;

  const maxLane = model.plotted.reduce((max, item) => Math.max(max, item.lane || 0), 0);
  const trackHeight = 56 + maxLane * 34;

  const body = (
    <div className={embedded ? "report-timeline-embedded" : "report-timeline-card"}>
        <div className="report-timeline-legend">
          <span><i className="legend-swatch report-critical" /> 7 天内</span>
          <span><i className="legend-swatch report-warning" /> 14 天内</span>
          <span><i className="legend-swatch report-upcoming" /> 30 天内</span>
          <span><i className="legend-swatch report-ok" /> 更远</span>
        </div>

        {reportStack?.triggered ? (
          <p className="team-collision-note report-stack-note">
            {formatReportStackMessage(reportStack)}
          </p>
        ) : null}

        <div className="report-timeline-axis-labels">
          <span>今天</span>
          <span>{Math.round(horizonDays / 3)} 天</span>
          <span>{Math.round((horizonDays * 2) / 3)} 天</span>
          <span>{horizonDays} 天</span>
        </div>

        <div className="report-timeline-track-wrap">
          <div
            className="report-timeline-track"
            style={{ minHeight: `${trackHeight}px` }}
            role="img"
            aria-label="报告日时间轴"
          >
            <div className="report-timeline-zones" aria-hidden="true">
              {model.zoneSegments.map((zone) => (
                <span
                  key={zone.className}
                  className={`report-timeline-zone ${zone.className}`}
                  style={{ width: `${zone.widthPercent}%` }}
                />
              ))}
            </div>

            {reportStack?.triggered ? (
              <span
                className="report-timeline-stack-band"
                style={{ width: `${model.stackEndPercent}%` }}
                aria-hidden="true"
              />
            ) : null}

            <span className="report-timeline-today-line" aria-hidden="true" />

            {model.plotted.map((row) => (
              <TimelineMarker
                key={row.project.id}
                row={row}
                onOpenProgress={onOpenProgress}
              />
            ))}
          </div>
        </div>

        <div className="report-timeline-footnotes">
          {model.beyond.length ? (
            <p className="report-timeline-footnote">
              {horizonDays} 天以外：
              {model.beyond.map((row, index) => (
                <span key={row.project.id}>
                  {index > 0 ? " · " : " "}
                  <button
                    type="button"
                    className="report-timeline-inline-link"
                    onClick={() => onOpenProgress(row.project.id)}
                  >
                    {row.project.clientName || row.project.name}
                    （{row.urgency.readableLabel}）
                  </button>
                </span>
              ))}
            </p>
          ) : null}
        </div>

        <div className="report-timeline-buckets">
          <SideBucket
            title="报告日已过"
            rows={model.past}
            tone="past"
            onOpenProgress={onOpenProgress}
          />
          <SideBucket
            title="未填写报告日"
            rows={model.missing}
            tone="missing"
            onOpenProgress={onOpenProgress}
          />
        </div>
      </div>
  );

  if (embedded) {
    return body;
  }

  return (
    <section className="report-timeline-section">
      <div className="report-timeline-head">
        <h3 className="staff-section-title">
          报告日时间轴 · 未来 {horizonDays} 天
        </h3>
        <p className="management-role-note">
          横轴为距报告日天数；点越大表示逾期程序越多；点击可进入项目进度
        </p>
      </div>
      {body}
    </section>
  );
}
