import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = Number(process.env.MAIL_PORT || 3001);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function getTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mailConfigured: Boolean(getTransporter())
  });
});

app.post("/api/send-invites", async (req, res) => {
  const invites = Array.isArray(req.body?.invites) ? req.body.invites : [];
  if (!invites.length) {
    return res.status(400).json({ ok: false, message: "No invites provided." });
  }

  const transporter = getTransporter();
  if (!transporter) {
    return res.status(503).json({
      ok: false,
      message: "SMTP 未配置。请在 .env 中设置 SMTP_HOST / SMTP_USER / SMTP_PASS。"
    });
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const results = [];

  for (const invite of invites) {
    const { to, subject, text, html } = invite;
    if (!to || !subject) {
      results.push({ to, ok: false, message: "Missing recipient or subject." });
      continue;
    }

    try {
      await transporter.sendMail({ from, to, subject, text, html });
      results.push({ to, ok: true });
    } catch (error) {
      results.push({ to, ok: false, message: error.message });
    }
  }

  const sent = results.filter((item) => item.ok).length;
  const failed = results.length - sent;

  res.json({
    ok: failed === 0,
    sent,
    failed,
    results
  });
});

app.listen(PORT, () => {
  console.log(`DeepSleep mail server listening on http://localhost:${PORT}`);
});
