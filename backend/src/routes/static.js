import express from "express";

const normalizeBase = (mountPath) => {
  if (!mountPath) {
    return "";
  }
  return mountPath.endsWith("/") ? mountPath.slice(0, -1) : mountPath;
};

export function registerStaticRoutes(app, dataDirectory, mountPath = "/data") {
  const pathToMount = normalizeBase(mountPath) || "/data";
  app.use(pathToMount, express.static(dataDirectory, { index: false, fallthrough: true }));
}

