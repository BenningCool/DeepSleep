import { COLUMNS } from "../data/mockData";

export function cloneTasks(tasks) {
  return JSON.parse(JSON.stringify(tasks));
}

export function nextTaskId(tasks) {
  const max = tasks.reduce((current, task) => {
    const match = String(task.id).match(/DS-(\d+)/);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 100);
  return `DS-${max + 1}`;
}

export function initials(name) {
  return (name || "?").trim().slice(0, 2).toUpperCase();
}

export function platformClass(platform) {
  if (platform === "Mobile") return "mobile";
  if (platform === "Backend") return "backend";
  if (platform === "AI") return "ai";
  return "pc";
}

export function columnTitle(status) {
  return COLUMNS.find((column) => column.id === status)?.title || "To Do";
}
