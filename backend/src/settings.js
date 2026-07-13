import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "../..");

const DEFAULT_BASE_PATH = "/unibas/survey";

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const normalizeBasePath = (value) => {
  const fallback = DEFAULT_BASE_PATH;
  if (!value) {
    return fallback;
  }
  let sanitized = value.trim();
  if (!sanitized.startsWith("/")) {
    sanitized = `/${sanitized}`;
  }
  if (sanitized !== "/" && sanitized.endsWith("/")) {
    sanitized = sanitized.replace(/\/+$/, "");
  }
  return sanitized === "/" ? fallback : sanitized;
};

export const config = {
  port: Number(process.env.PORT || 4000),
  databasePath: process.env.DATABASE_PATH || path.join(rootDir, "data", "responses.db"),
  allowedOrigins: (() => {
    const parsed = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);
    return parsed.length > 0 ? parsed : "*";
  })(),
  basePath: normalizeBasePath(process.env.BASE_PATH || ""),
  mistralApiKey: process.env.MISTRAL_API_KEY || "",
  edenaiApiKey: process.env.EDENAI_API_KEY || "",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: parseBoolean(process.env.SMTP_SECURE, false),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  emailFrom: process.env.EMAIL_FROM || process.env.SMTP_USER || "",
  disableEmail: parseBoolean(process.env.DISABLE_EMAIL, false),
};

