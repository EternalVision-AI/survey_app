import { randomUUID } from "node:crypto";
import rateLimit from "express-rate-limit";
import { loadKesbAuthorities } from "../services/kesb.js";
import { validateSurveyPayload } from "../services/validation.js";

const kesbAuthorities = loadKesbAuthorities();

// Stopgap against spam-flooding the (unauthenticated, by design) submission endpoint.
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Zu viele Einreichungen. Bitte später erneut versuchen." },
});

const normalizeBase = (basePath) => {
  if (!basePath) {
    return "";
  }
  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
};

export function registerSurveyRoutes(app, db, basePath = "/api") {
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

    app.get(`${safePrefix}/kesb`, (req, res) => {
      res.json(kesbAuthorities);
    });

    app.post(`${safePrefix}/responses`, submitLimiter, (req, res) => {
      const parsingResult = validateSurveyPayload(req.body, kesbAuthorities);
      if (!parsingResult.valid) {
        return res.status(400).json({ error: parsingResult.error });
      }

      const now = new Date().toISOString();
      const id = randomUUID();
      const stmt = db.prepare(
        `INSERT INTO responses
          (id, created_at, language, kesb, name, role, q1_value, q2_value, q3_value)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      stmt.run(
        id,
        now,
        parsingResult.value.language,
        parsingResult.value.kesb,
        parsingResult.value.name,
        parsingResult.value.role,
        parsingResult.value.q1,
        parsingResult.value.q2 || null,
        parsingResult.value.q3 || null
      );

      res.status(201).json({ id, createdAt: now });
    });
  });
}

