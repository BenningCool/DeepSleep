export function notifyMockInvites(onToast, count) {
  if (!count) {
    onToast("Changes saved.");
    return;
  }

  onToast(`Generated ${count} invite link(s) in demo mode. Copy and share the links.`);
}

export function collectInviteCount(project, extraMembers = [], extraSpecialistStaff = []) {
  const core = (project.members || []).filter((member) => member.status === "active").length;
  const leads = (project.specialistTeams || []).length;
  return core + leads + extraMembers.length + extraSpecialistStaff.length;
}
