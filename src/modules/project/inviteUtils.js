import { labelOfRole, labelOfTeam } from "../../data/projectConstants";

export function createInviteToken() {
  return `inv_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function buildInviteLink(projectId, token) {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?project=${projectId}&invite=${token}`;
}

export function formatInviteMessage(project, member) {
  const team = labelOfTeam(project.team);
  const role = labelOfRole(member.role);
  const link = buildInviteLink(project.id, member.inviteToken);

  const zh = [
    `您已被邀请加入审计项目「${project.name}」。`,
    `团队：${team} · 角色：${role}`,
    `请点击链接加入项目：${link}`
  ].join("\n");

  const en = [
    `You have been invited to join the engagement "${project.name}".`,
    `Team: ${team} · Role: ${role}`,
    `Please click the link below to join: ${link}`
  ].join("\n");

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#172b4d;max-width:640px;">
      <h2 style="margin:0 0 12px;font-size:20px;">DeepSleep Project Invitation</h2>
      <p><strong>中文</strong></p>
      <p>${zh.replace(/\n/g, "<br/>")}</p>
      <hr style="border:none;border-top:1px solid #dfe1e6;margin:20px 0;" />
      <p><strong>English</strong></p>
      <p>${en.replace(/\n/g, "<br/>")}</p>
      <p style="margin-top:20px;">
        <a href="${link}" style="display:inline-block;padding:10px 16px;background:#0052cc;color:#fff;text-decoration:none;border-radius:6px;">
          Join Project / 加入项目
        </a>
      </p>
    </div>
  `.trim();

  return {
    link,
    zh,
    en,
    subject: `[DeepSleep] Invitation · ${project.name} · ${role}`,
    text: `${zh}\n\n---\n\n${en}`,
    html
  };
}

export function buildInvitePayload(project, member) {
  const message = formatInviteMessage(project, member);
  return {
    to: member.email,
    subject: message.subject,
    text: message.text,
    html: message.html
  };
}
