import nodemailer from "nodemailer";
import { config } from "../settings.js";

let cachedTransporter = null;

const getTransporter = () => {
  if (config.disableEmail) {
    return null;
  }
  if (!config.smtpHost) {
    return null;
  }
  if (cachedTransporter) {
    return cachedTransporter;
  }
  cachedTransporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: Boolean(config.smtpSecure),
    auth:
      config.smtpUser && config.smtpPass
        ? { user: config.smtpUser, pass: config.smtpPass }
        : undefined,
  });
  return cachedTransporter;
};

export async function sendEmailWithAttachments({ to, subject, text, attachments }) {
  const transporter = getTransporter();
  if (!transporter) {
    return {
      delivered: false,
      message: "E-Mail-Versand ist nicht konfiguriert.",
    };
  }

  const mailOptions = {
    from: config.emailFrom || config.smtpUser,
    to,
    subject,
    text,
    attachments,
  };

  await transporter.sendMail(mailOptions);
  return { delivered: true };
}


