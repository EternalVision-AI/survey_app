import path from "node:path";

const DISALLOWED_REGEX = /[<>:"/\\|?*\u0000-\u001F]/g;
const MAX_BYTES = 255;

export function sanitizeFilename(originalName = "datei.txt") {
  const trimmed = originalName.trim() || "datei.txt";
  const ext = path.extname(trimmed);
  const base = path.basename(trimmed, ext);

  let sanitizedBase = base.replace(DISALLOWED_REGEX, "_").replace(/\s+/g, " ").trim();
  let sanitizedExt = ext.replace(DISALLOWED_REGEX, "");

  if (!sanitizedExt.startsWith(".") && sanitizedExt.length > 0) {
    sanitizedExt = `.${sanitizedExt}`;
  }

  if (!sanitizedBase) {
    sanitizedBase = "datei";
  }

  let candidate = `${sanitizedBase}${sanitizedExt}`;
  while (Buffer.from(candidate, "utf8").length > MAX_BYTES) {
    sanitizedBase = sanitizedBase.slice(0, -1);
    if (!sanitizedBase) {
      sanitizedBase = "datei";
      sanitizedExt = sanitizedExt.slice(0, 4);
    }
    candidate = `${sanitizedBase}${sanitizedExt}`;
  }

  return candidate;
}


