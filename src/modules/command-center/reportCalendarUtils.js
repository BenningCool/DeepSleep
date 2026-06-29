const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

function pad2(value) {
  return String(value).padStart(2, "0");
}

export function toDateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseReportMonth(reportDate) {
  if (!reportDate) return null;
  const date = new Date(reportDate);
  if (Number.isNaN(date.getTime())) return null;
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function monthLabel({ year, month }) {
  return `${year} 年 ${month + 1} 月`;
}

export function addMonthOffset({ year, month }, delta) {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function resolveInitialReportMonth(rows = [], nearestReport = null) {
  const nearestMonth = parseReportMonth(nearestReport?.project?.reportDate);
  if (nearestMonth) return nearestMonth;

  let best = null;
  rows.forEach((row) => {
    const days = row.urgency?.days;
    if (days === null || days === undefined || days < 0) return;
    const month = parseReportMonth(row.project?.reportDate);
    if (!month) return;
    if (!best || days < best.days) {
      best = { ...month, days };
    }
  });

  if (best) {
    return { year: best.year, month: best.month };
  }

  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() };
}

export function filterRowsByReportMonth(rows = [], visibleMonth) {
  if (!visibleMonth) return rows;
  return rows.filter((row) => {
    const month = parseReportMonth(row.project?.reportDate);
    if (!month) return false;
    return month.year === visibleMonth.year && month.month === visibleMonth.month;
  });
}

export function mergeAttentionWithMonthRows(monthRows = [], attentionQueue = [], limit = 3) {
  const rankMap = new Map();
  attentionQueue.slice(0, limit).forEach((row, index) => {
    rankMap.set(row.project.id, index + 1);
  });

  return [...monthRows]
    .sort((a, b) => {
      const rankA = rankMap.get(a.project.id) || 999;
      const rankB = rankMap.get(b.project.id) || 999;
      if (rankA !== rankB) return rankA - rankB;
      return (a.urgency?.days ?? 9999) - (b.urgency?.days ?? 9999);
    })
    .map((row) => ({
      ...row,
      attentionRank: rankMap.get(row.project.id) || 0
    }));
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const leading = (first.getDay() + 6) % 7;
  const totalCells = Math.ceil((leading + last.getDate()) / 7) * 7;
  const cells = [];

  for (let index = 0; index < totalCells; index += 1) {
    const dayOffset = index - leading + 1;
    const cellDate = new Date(year, month, dayOffset);
    cells.push({
      date: cellDate,
      dateKey: toDateKey(cellDate),
      inMonth: cellDate.getMonth() === month,
      day: cellDate.getDate()
    });
  }

  return {
    year,
    month,
    label: monthLabel({ year, month }),
    weekdayLabels: WEEKDAY_LABELS,
    cells
  };
}

export function buildReportCalendarFromRows(rows, options = {}) {
  const visibleMonth = options.visibleMonth || resolveInitialReportMonth(rows);
  const todayKey = toDateKey(options.anchorDate ? new Date(options.anchorDate) : new Date());

  const byDateKey = new Map();
  const past = [];
  const missing = [];

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
    const reportDate = row.project?.reportDate;
    if (!reportDate) {
      missing.push(row);
      return;
    }
    const bucket = byDateKey.get(reportDate) || [];
    bucket.push(row);
    byDateKey.set(reportDate, bucket);
  });

  return {
    todayKey,
    visibleMonth,
    month: buildMonthGrid(visibleMonth.year, visibleMonth.month),
    byDateKey,
    past,
    missing
  };
}
