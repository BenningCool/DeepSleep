import { ProjectsHomePage } from "./ProjectsHomePage";

export function EngagementHomePage({
  projects,
  tasks,
  currentProjectId,
  onCreate,
  onOpen
}) {
  return (
    <ProjectsHomePage
      projects={projects}
      tasks={tasks}
      currentProjectId={currentProjectId}
      onCreate={onCreate}
      onOpen={onOpen}
    />
  );
}
