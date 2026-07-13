import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const MIGRATION = `
CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  language TEXT NOT NULL,
  kesb TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  q1_value TEXT NOT NULL,
  q2_value TEXT,
  q3_value TEXT
);
`;

export function createDatabaseConnection(databasePath) {
  const directory = path.dirname(databasePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  return db;
}

export async function migrate(db) {
  db.exec(MIGRATION);
}

