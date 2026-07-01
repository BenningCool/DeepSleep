import { daysUntilDate, formatReportCountdown } from "./commandCenterUtils";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function personScore(person) {
  const levelWeight = person.loadLevelClass === "load-high"
    ? 1000
    : person.loadLevelClass === "load-medium"
      ? 500
      : 0;
  return levelWeight
    + (person.overdue || 0) * 100
    + (person.assignedTotal || 0) * 10
    + (person.projectCount || 0);
}

function receiverScore(person) {
  const levelWeight = person.loadLevelClass === "load-low"
    ? 0
    : person.loadLevelClass === "load-medium"
      ? 500
      : 1000;
  return levelWeight
    + (person.overdue || 0) * 100
    + (person.assignedTotal || 0) * 10
    + (person.projectCount || 0);
}

function duePriority(task, project) {
  const taskDays = daysUntilDate(task?.due);
  const reportDays = daysUntilDate(project?.reportDate);
  let score = 0;
  if (taskDays !== null && taskDays < 0) score += 1000 + Math.abs(taskDays) * 10;
  if (taskDays !== null && taskDays >= 0 && taskDays <= 7) score += 700 - taskDays * 20;
  if (reportDays !== null && reportDays >= 0 && reportDays <= 7) score += 400 - reportDays * 20;
  if (reportDays !== null && reportDays > 7 && reportDays <= 14) score += 180 - reportDays * 5;
  return score;
}

function buildProjectMap(projects = []) {
  return new Map(projects.map((project) => [project.id, project]));
}

function getPersonTasks(person, tasks = [], projectMap) {
  const email = normalizeEmail(person?.email);
  if (!email) return [];

  return tasks
    .filter((task) => (
      task.status !== "done"
      && normalizeEmail(task.owner) === email
      && projectMap.has(task.projectId)
    ))
    .map((task) => ({
      task,
      project: projectMap.get(task.projectId),
      score: duePriority(task, projectMap.get(task.projectId))
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

function uniquePeople(groups = []) {
  const byEmail = new Map();
  groups.forEach((group) => {
    (group.personTeams || []).forEach((person) => {
      const email = normalizeEmail(person.email);
      if (!email) return;
      const existing = byEmail.get(email);
      if (!existing || personScore(person) > personScore(existing)) {
        byEmail.set(email, person);
      }
    });
  });
  return [...byEmail.values()];
}

function selectReceiver(people, source, usedReceivers) {
  return people
    .filter((person) => normalizeEmail(person.email) !== normalizeEmail(source.email))
    .filter((person) => !usedReceivers.has(normalizeEmail(person.email)) || person.loadLevelClass === "load-low")
    .sort((a, b) => receiverScore(a) - receiverScore(b))[0] || null;
}

function formatReason(task, project, source, receiver) {
  const taskDays = daysUntilDate(task?.due);
  const reportDays = daysUntilDate(project?.reportDate);
  if (taskDays !== null && taskDays < 0) {
    return `${task.id} 已逾期 ${Math.abs(taskDays)} 天，${source.email} 当前负荷${source.loadLevel || "偏高"}；${receiver.email} 可承接以降低报告日前积压。`;
  }
  if (reportDays !== null && reportDays <= 7) {
    return `${project?.clientName || "该项目"} ${formatReportCountdown(project?.reportDate)}，建议提前腾挪 ${task.id}，避免报告日前集中交付。`;
  }
  return `${source.email} 的未完成测试点较集中，${receiver.email} 当前负荷较低，可先协助 ${task.id}。`;
}

export function buildResourceDispatchInsights({
  mode,
  projects = [],
  tasks = [],
  resourceGroups = []
}) {
  if (!["ep", "em", "ic"].includes(mode)) {
    return null;
  }

  const people = uniquePeople(resourceGroups);
  if (!people.length) return null;

  const projectMap = buildProjectMap(projects);
  const highLoad = people.filter((person) => person.loadLevelClass === "load-high").length;
  const lowLoad = people.filter((person) => person.loadLevelClass === "load-low").length;
  const totalAssigned = people.reduce((sum, person) => sum + (person.assignedTotal || 0), 0);
  const totalOverdue = people.reduce((sum, person) => sum + (person.overdue || 0), 0);

  const sourcePeople = [...people]
    .filter((person) => person.assignedTotal || person.overdue)
    .sort((a, b) => personScore(b) - personScore(a));

  const usedReceivers = new Set();
  const usedTasks = new Set();
  const recommendations = [];

  sourcePeople.forEach((source) => {
    if (recommendations.length >= 3) return;
    const receiver = selectReceiver(people, source, usedReceivers);
    if (!receiver) return;

    const candidate = getPersonTasks(source, tasks, projectMap)
      .find((item) => !usedTasks.has(item.task.id));
    if (!candidate) return;

    usedReceivers.add(normalizeEmail(receiver.email));
    usedTasks.add(candidate.task.id);
    recommendations.push({
      id: `${candidate.task.id}-${source.email}-${receiver.email}`,
      source,
      receiver,
      task: candidate.task,
      project: candidate.project,
      reportLabel: formatReportCountdown(candidate.project?.reportDate),
      reason: formatReason(candidate.task, candidate.project, source, receiver)
    });
  });

  if (!recommendations.length && sourcePeople[0]) {
    const source = sourcePeople[0];
    const candidate = getPersonTasks(source, tasks, projectMap)[0];
    if (candidate) {
      recommendations.push({
        id: `${candidate.task.id}-escalate`,
        source,
        receiver: null,
        task: candidate.task,
        project: candidate.project,
        reportLabel: formatReportCountdown(candidate.project?.reportDate),
        reason: `${source.email} 已形成交付瓶颈，建议 EM 升级协调临时支援并优先查看 ${candidate.task.id}。`
      });
    }
  }

  return {
    peopleCount: people.length,
    highLoad,
    lowLoad,
    totalAssigned,
    totalOverdue,
    recommendations: recommendations.slice(0, 3)
  };
}
