import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "../../data/kesb.json");

let cache;

export function loadKesbAuthorities() {
  if (cache) {
    return cache;
  }
  const raw = fs.readFileSync(dataPath, "utf8");
  cache = JSON.parse(raw);
  return cache;
}

