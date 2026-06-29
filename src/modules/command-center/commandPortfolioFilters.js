import { useMemo, useState } from "react";
import { applyProjectListFilters, sortProjects } from "../project/projectSearch";
import {
  buildAttentionQueue,
  buildEngagementRiskMatrix,
  buildReportWatchlist,
  countRiskTiers,
  detectReportStack,
  enrichProjectWithReport,
  sortByReportUrgency
} from "./reportDayUtils";

export function useCommandListFilters(initialSort = "recent") {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState(initialSort);

  const filters = useMemo(
    () => ({ search, teamFilter, typeFilter, sortBy }),
    [search, teamFilter, typeFilter, sortBy]
  );

  return {
    filters,
    search,
    setSearch,
    teamFilter,
    setTeamFilter,
    typeFilter,
    setTypeFilter,
    sortBy,
    setSortBy
  };
}

export function filterCommandProjects(projects, filters = {}) {
  const filtered = applyProjectListFilters(projects, {
    search: filters.search,
    team: filters.teamFilter,
    projectType: filters.typeFilter
  });
  return sortProjects(filtered, filters.sortBy || "recent");
}

export function buildFilteredRiskMatrix(projects, tasks, filters, resolveManagerEmail = () => "") {
  const filteredProjects = filterCommandProjects(projects, filters);
  const riskMatrix = buildEngagementRiskMatrix(filteredProjects, tasks, resolveManagerEmail);
  return { filteredProjects, riskMatrix };
}

export function buildCommandListMetrics(filteredProjects, riskMatrix, tasks, attentionLimit = 3) {
  const watchlist = buildReportWatchlist(filteredProjects, tasks);
  const nearestReport = sortByReportUrgency(
    filteredProjects.map((project) => enrichProjectWithReport(project, tasks))
  )[0] || null;

  return {
    attentionQueue: buildAttentionQueue(riskMatrix, attentionLimit),
    watchlist,
    reportStack: detectReportStack(filteredProjects),
    nearestReport,
    riskCounts: countRiskTiers(riskMatrix)
  };
}
