import { StaffCommandView } from "./StaffCommandView";
import { TeamRollupCommandView } from "./TeamRollupCommandView";
import { EpCommandView } from "./EpCommandView";
import { ContributorLeadCommandView } from "./ContributorLeadCommandView";

export function CommandCenterPage({
  projects,
  tasks,
  viewAs,
  onViewAsChange,
  onOpenProgress,
  onOpenDetail,
  onOpenMemberProgress
}) {
  if (viewAs === "staff") {
    return (
      <StaffCommandView
        projects={projects}
        tasks={tasks}
        viewAs={viewAs}
        onViewAsChange={onViewAsChange}
        onOpenProgress={onOpenProgress}
        onOpenDetail={onOpenDetail}
      />
    );
  }

  if (viewAs === "ic" || viewAs === "em") {
    return (
      <TeamRollupCommandView
        projects={projects}
        tasks={tasks}
        viewAs={viewAs}
        onViewAsChange={onViewAsChange}
        onOpenProgress={onOpenProgress}
        onOpenDetail={onOpenDetail}
        onOpenMemberProgress={onOpenMemberProgress}
      />
    );
  }

  if (viewAs === "ep") {
    return (
      <EpCommandView
        projects={projects}
        tasks={tasks}
        viewAs={viewAs}
        onViewAsChange={onViewAsChange}
        onOpenProgress={onOpenProgress}
        onOpenDetail={onOpenDetail}
      />
    );
  }

  if (viewAs === "ita_lead" || viewAs === "tax_lead") {
    return (
      <ContributorLeadCommandView
        projects={projects}
        tasks={tasks}
        viewAs={viewAs}
        onViewAsChange={onViewAsChange}
        onOpenProgress={onOpenProgress}
        onOpenDetail={onOpenDetail}
      />
    );
  }

  return null;
}
