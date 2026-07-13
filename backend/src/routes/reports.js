import rateLimit from "express-rate-limit";
import { buildSummaryReport, buildDetailedReport } from "../services/reporting.js";

// Stopgap against automated scraping of respondent PII until these routes
// have real authentication in front of them.
const reportsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
});

const normalizeBase = (basePath) => {
  if (!basePath) {
    return "";
  }
  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
};

export function registerReportRoutes(app, db, basePath = "/api") {
  const normalized = normalizeBase(basePath);
  const prefixes = new Set(["/api"]);

  if (normalized && normalized !== "/api") {
    prefixes.add(normalized);
  }

  if (!normalized) {
    prefixes.add("");
  }

  prefixes.forEach((prefix) => {
    const safePrefix = prefix === "" ? "" : prefix;

    app.get(`${safePrefix}/reports/summary`, reportsLimiter, (req, res) => {
      const summary = buildSummaryReport(db);
      res.json(summary);
    });

    app.get(`${safePrefix}/reports/detail/:language`, reportsLimiter, (req, res) => {
      const languageParam = req.params.language;
      const language = languageParam === "all" ? null : languageParam;
      const detail = buildDetailedReport(db, language);
      res.json(detail);
    });
  });
}

