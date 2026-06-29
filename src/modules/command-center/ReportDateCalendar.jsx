import { useMemo } from "react";
import { formatProcedureOverdue } from "./managementCopy";
import {
  buildReportCalendarFromRows,
  monthLabel
} from "./reportCalendarUtils";

function CalendarDayCell({ cell, entries = [], isToday, onOpenProgress }) {
  const hasEntries = entries.length > 0;

  return (
    <div
      className={[
        "report-calendar-day",
        cell.inMonth ? "" : "is-outside",
        isToday ? "is-today" : "",
        hasEntries ? "has-events" : ""
      ].filter(Boolean).join(" ")}
    >
      <span className="report-calendar-day-num">{cell.day}</span>
      {hasEntries ? (
        <div className="report-calendar-events">
          {entries.map((row) => {
            const client = row.project.clientName || row.project.name;
            return (
              <button
                key={row.project.id}
                type="button"
                className={`report-calendar-event ${row.urgency.className}`}
                title={`${client} · ${row.urgency.readableLabel} · ${formatProcedureOverdue(row.overdueCount)}`}
                onClick={() => onOpenProgress(row.project.id)}
              >
                <span className="report-calendar-event-name">{client}</span>
                {row.overdueCount ? (
                  <span className="report-calendar-event-badge">{row.overdueCount}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
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

export function ReportMonthNavigator({
  visibleMonth,
  onPrev,
  onNext
}) {
  return (
    <div className="report-month-nav">
      <button className="button subtle compact" type="button" onClick={onPrev}>
        ‹ 上月
      </button>
      <strong className="report-month-nav-label">{monthLabel(visibleMonth)}</strong>
      <button className="button subtle compact" type="button" onClick={onNext}>
        下月 ›
      </button>
    </div>
  );
}

export function ReportDateCalendar({
  rows = [],
  visibleMonth,
  onPrevMonth,
  onNextMonth,
  showMonthNav = true,
  embedded = false,
  onOpenProgress
}) {
  const model = useMemo(
    () => buildReportCalendarFromRows(rows, { visibleMonth }),
    [rows, visibleMonth]
  );

  if (!rows.length || !visibleMonth) return null;

  const body = (
    <div className={embedded ? "report-calendar-embedded" : "report-calendar-card"}>
      {showMonthNav ? (
        <ReportMonthNavigator
          visibleMonth={visibleMonth}
          onPrev={onPrevMonth}
          onNext={onNextMonth}
        />
      ) : null}

      <div className="report-calendar-legend">
        <span><i className="legend-swatch report-critical" /> 7 天内</span>
        <span><i className="legend-swatch report-warning" /> 14 天内</span>
        <span><i className="legend-swatch report-upcoming" /> 30 天内</span>
        <span><i className="legend-swatch report-ok" /> 更远</span>
      </div>

      <section className="report-calendar-month">
        <div className="report-calendar-weekdays">
          {model.month.weekdayLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="report-calendar-grid">
          {model.month.cells.map((cell) => (
            <CalendarDayCell
              key={`${model.month.year}-${model.month.month}-${cell.dateKey}`}
              cell={cell}
              entries={model.byDateKey.get(cell.dateKey) || []}
              isToday={cell.dateKey === model.todayKey}
              onOpenProgress={onOpenProgress}
            />
          ))}
        </div>
      </section>

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
    <section className="report-calendar-section">
      {body}
    </section>
  );
}
