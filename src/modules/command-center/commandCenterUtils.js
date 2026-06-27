const DAY_MS = 1000 * 60 * 60 * 24;

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function daysUntilDate(dateValue) {
  if (!dateValue) return null;
  const due = startOfDay(dateValue);
  if (Number.isNaN(due.getTime())) return null;
  const today = startOfDay(new Date());
  return Math.ceil((due - today) / DAY_MS);
}

export function formatReportCountdown(reportDate) {
  const until = daysUntilDate(reportDate);
  if (until === null) return "";
  if (until < 0) return `报告日已过 ${Math.abs(until)} 天`;
  if (until === 0) return "报告日 · 今天";
  return `D-${until}`;
}

export function ledTeamLabel(team) {
  return team === "ita" ? "ITA-led" : "Audit-led";
}
