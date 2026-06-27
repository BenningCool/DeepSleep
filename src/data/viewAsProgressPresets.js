import { demoEmailOfViewAs } from "./viewAsPresets";

export function resolveDefaultGroupFilter(viewAs, project) {
  if (viewAs === "ita_lead") return "ita";
  if (viewAs === "tax_lead") return "tax";
  if (viewAs === "ic") {
    return project?.team === "ita" ? "ita" : "audit";
  }
  return "";
}

export function getProgressBoardPreset(viewAs, project) {
  return {
    groupFilter: resolveDefaultGroupFilter(viewAs, project),
    ownerFilter: viewAs === "staff" ? demoEmailOfViewAs("staff") : ""
  };
}
