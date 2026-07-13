import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";

const ensureLeadingSlash = (value: string) => (value.startsWith("/") ? value : `/${value}`);
const ensureTrailingSlash = (value: string) => (value.endsWith("/") ? value : `${value}/`);

const baseUrl = ensureTrailingSlash(import.meta.env.BASE_URL || "/");

const buildAssetUrl = (filePath: string) => {
  const normalizedPath = ensureLeadingSlash(filePath.replace(/\s+/g, ""));
  const relativePath = `${baseUrl}${normalizedPath.replace(/^\//, "")}`;
  const absoluteUrl = new URL(relativePath, window.location.origin).toString();
  return absoluteUrl;
};

const isInternalRoute = window.location.pathname.startsWith("/internal");
const routerBaseName = isInternalRoute ? "/internal" : import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename={routerBaseName}>
      <App isInternal={isInternalRoute} />
    </BrowserRouter>
  </React.StrictMode>
);

