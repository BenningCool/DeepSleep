function resolveNodeProgressPercent(control) {
  if (typeof control?.progressPercent === "number") {
    return control.progressPercent;
  }
  const completedNodes = control?.completedNodes || 0;
  const totalNodes = control?.totalNodes || 0;
  return totalNodes ? Math.round((completedNodes / totalNodes) * 100) : 0;
}

export { resolveNodeProgressPercent };

export function formatNodeProgressPhaseCounts(control) {
  const completedNodes = control?.completedNodes || 0;
  const totalNodes = control?.totalNodes || 0;
  const parts = [`${completedNodes}/${totalNodes}`];
  Object.entries(control.phaseProgress || {}).forEach(([phaseId, phase]) => {
    parts.push(`${phaseId.toUpperCase()} ${phase.completedNodes}/${phase.totalNodes}`);
  });
  return parts.join(" · ");
}

export function formatNodeProgressCounts(control) {
  const percent = resolveNodeProgressPercent(control);
  return `${formatNodeProgressPhaseCounts(control)} · ${percent}%`;
}

/** 按工作台阶段顺序收集全部节点的预计完成日 */
export function collectNodeDueDateEntries(detail) {
  const phases = detail?.phases || [];
  if (phases.length) {
    return phases.flatMap((phase) => (
      (phase.nodes || []).map((node) => ({
        id: node.id,
        label: node.label || node.id,
        phaseId: phase.id || "",
        dueDate: String(node.dueDate || detail?.nodeDueDates?.[node.id] || "").trim()
      }))
    ));
  }

  return Object.entries(detail?.nodeDueDates || {}).map(([nodeId, dueDate]) => ({
    id: nodeId,
    label: nodeId,
    phaseId: "",
    dueDate: String(dueDate || "").trim()
  }));
}

export function formatCurrentNodeHeadline(control) {
  if (!control?.currentNodeLabel) return "—";
  if (control.allNodesComplete) {
    return `已完成 · ${control.currentNodeLabel}`;
  }
  return `当前 · ${control.currentNodeLabel}`;
}

export function formatNodePhaseSummary(control) {
  const headline = formatCurrentNodeHeadline(control);
  const counts = formatNodeProgressCounts(control);
  if (headline === "—") return counts;
  return `${headline} · ${counts}`;
}
