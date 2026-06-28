import { REPORT_WINDOWS, enrichProjectWithReport } from "./reportDayUtils";

export const TIMELINE_HORIZON_DAYS = 90;

const TIMELINE_ZONE_SEGMENTS = [
  { days: REPORT_WINDOWS.critical, className: "timeline-zone-critical" },
  {
    days: REPORT_WINDOWS.warning - REPORT_WINDOWS.critical,
    className: "timeline-zone-warning"
  },
  {
    days: REPORT_WINDOWS.upcoming - REPORT_WINDOWS.warning,
    className: "timeline-zone-upcoming"
  },
  { days: null, className: "timeline-zone-ok" }
];

export function buildReportTimelineFromRows(rows, options = {}) {
  const horizonDays = options.horizonDays ?? TIMELINE_HORIZON_DAYS;
  const stackWithinDays = options.stackWithinDays ?? REPORT_WINDOWS.warning;

  const plotted = [];
  const past = [];
  const missing = [];
  const beyond = [];

  rows.forEach((row) => {
    const days = row.urgency?.days;

    if (days === null || days === undefined) {
      missing.push(row);
      return;
    }

    if (days < 0) {
      past.push(row);
      return;
    }

    if (days > horizonDays) {
      beyond.push({ ...row, daysBeyond: days - horizonDays });
      return;
    }

    plotted.push({
      ...row,
      positionPercent: (days / horizonDays) * 100,
      lane: 0
    });
  });

  plotted.sort((a, b) => a.positionPercent - b.positionPercent);
  plotted.forEach((item, index) => {
    if (index === 0) return;
    const prev = plotted[index - 1];
    if (item.positionPercent - prev.positionPercent < 5) {
      item.lane = (prev.lane || 0) + 1;
    }
  });

  const stackEndPercent = (stackWithinDays / horizonDays) * 100;
  let consumedDays = 0;
  const zoneSegments = TIMELINE_ZONE_SEGMENTS.map((segment) => {
    const spanDays = segment.days ?? Math.max(0, horizonDays - consumedDays);
    consumedDays += spanDays;
    return {
      ...segment,
      spanDays,
      widthPercent: (spanDays / horizonDays) * 100
    };
  });

  return {
    horizonDays,
    stackWithinDays,
    stackEndPercent,
    zoneSegments,
    plotted,
    past,
    missing,
    beyond
  };
}

export function buildReportTimeline(projects, tasks, options = {}) {
  const rows = projects.map((project) => enrichProjectWithReport(project, tasks));
  return buildReportTimelineFromRows(rows, options);
}

export function markerSizeForOverdue(overdueCount) {
  if (!overdueCount) return 14;
  return Math.min(26, 14 + overdueCount * 3);
}
