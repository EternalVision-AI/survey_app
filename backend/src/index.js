import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { config } from "./settings.js";
import { createDatabaseConnection, migrate } from "./persistence/database.js";
import { registerSurveyRoutes } from "./routes/survey.js";
import { registerReportRoutes } from "./routes/reports.js";
import { registerStaticRoutes } from "./routes/static.js";
import { registerInternalRoutes } from "./routes/internal.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const app = express();
  const db = createDatabaseConnection(config.databasePath);
  await migrate(db);

  const appendBase = (segment) => {
    if (!config.basePath) {
      return segment;
    }
    const normalizedSegment = segment.startsWith("/") ? segment : `/${segment}`;
    return `${config.basePath}${normalizedSegment}`.replace(/\/{2,}/g, "/");
  };

  app.use(helmet());
  app.use(
    cors({
      origin: config.allowedOrigins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("combined"));

  const apiBasePath = appendBase("/api");
  const dataBasePath = appendBase("/data");
  const internalBasePath = appendBase("/internal");

  registerSurveyRoutes(app, db, apiBasePath);
  registerReportRoutes(app, db, apiBasePath);
  registerStaticRoutes(app, path.join(__dirname, "../data"), dataBasePath);
  registerInternalRoutes(app, internalBasePath);

  app.use((err, req, res, next) => {
    console.error("Unhandled error", err);
    res.status(500).json({ error: "Internal server error" });
  });

  const server = app.listen(config.port, () => {
    console.log(`Survey backend listening on port ${config.port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, closing server...`);
    server.close(() => process.exit(0));
    // Force-exit if sockets don't close in time (e.g. keep-alive connections)
    setTimeout(() => process.exit(0), 3000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((error) => {
  console.error("Fatal startup error", error);
  process.exit(1);
});

