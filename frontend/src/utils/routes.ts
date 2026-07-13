const rawBase = import.meta.env.BASE_URL ?? "/";
const DEFAULT_BASE = "/unibas/survey";
const baseWithoutTrailingSlash = rawBase.replace(/\/$/, "");
const normalizedBase =
  rawBase === "/"
    ? DEFAULT_BASE
    : baseWithoutTrailingSlash || DEFAULT_BASE;

export const APP_BASE_PATH = normalizedBase;

export const buildAppPath = (path = "/") => {
  if (!path || path === "/") {
    return normalizedBase || DEFAULT_BASE;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}` || normalizedPath;
};

export const buildInternalApiPath = (path = "/") => {
  const internalBase = buildAppPath("/internal");
  if (!path || path === "/") {
    return internalBase;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${internalBase}${normalizedPath}`;
};

