import { buildInvitePayload } from "./inviteUtils";

export async function checkMailServer() {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) return { configured: false };
    return response.json();
  } catch {
    return { configured: false };
  }
}

export async function sendProjectInvites(project, members) {
  const activeMembers = members.filter((member) => member.status === "active");
  const invites = activeMembers.map((member) => buildInvitePayload(project, member));

  if (!invites.length) {
    return { ok: true, sent: 0, failed: 0, results: [] };
  }

  const response = await fetch("/api/send-invites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invites })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      sent: data.sent || 0,
      failed: data.failed ?? invites.length,
      message: data.message || "Email sending failed. Check SMTP configuration and whether the mail service is running.",
      results: data.results || []
    };
  }

  return data;
}

export async function sendInvitesToMembers(project, members) {
  return sendProjectInvites(project, members);
}
