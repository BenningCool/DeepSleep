import { CommandCenterPage } from "../command-center/CommandCenterPage";
import { ProjectsHomePage } from "./ProjectsHomePage";
import { isPortfolioBrowseView } from "../../data/viewAsPresets";

export function EngagementHomePage({
  projects,
  tasks,
  currentProjectId,
  viewAs,
  onViewAsChange,
  onCreate,
  onOpen,
  onOpenProgress,
  onOpenDetail,
  onOpenMemberProgress,
  onCreateAnnual,
  onBrowseTemplates
}) {
  if (isPortfolioBrowseView(viewAs)) {
    return (
      <ProjectsHomePage
        projects={projects}
        tasks={tasks}
        currentProjectId={currentProjectId}
        viewAs={viewAs}
        onViewAsChange={onViewAsChange}
        onCreate={onCreate}
        onOpen={onOpen}
      />
    );
  }

  return (
    <CommandCenterPage
      projects={projects}
      tasks={tasks}
      viewAs={viewAs}
      onViewAsChange={onViewAsChange}
      onOpenProgress={onOpenProgress}
      onOpenDetail={onOpenDetail}
      onOpenMemberProgress={onOpenMemberProgress}
      onCreateAnnual={onCreateAnnual}
      onBrowseTemplates={onBrowseTemplates}
    />
  );
}
