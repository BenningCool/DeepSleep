export function notifyMockInvites(onToast, count) {
  if (!count) {
    onToast("已保存变更。");
    return;
  }

  onToast(`已生成 ${count} 条邀请链接（演示模式，请复制链接分享）。`);
}

export function collectInviteCount(project, extraMembers = [], extraSpecialistStaff = []) {
  const core = (project.members || []).filter((member) => member.status === "active").length;
  const leads = (project.specialistTeams || []).length;
  return core + leads + extraMembers.length + extraSpecialistStaff.length;
}
