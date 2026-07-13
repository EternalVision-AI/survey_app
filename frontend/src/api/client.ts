import axios, { type AxiosInstance } from "axios";
import type { LanguageCode } from "../state/useSurveyStore";
import { KESB_FALLBACK } from "../content/kesbFallback";
import { buildAppPath } from "../utils/routes";

export interface KesbAuthority {
  id: string;
  name: string;
}

export interface SubmitResponsePayload {
  language: LanguageCode;
  kesb: string;
  name: string;
  role: string;
  q1: "yes" | "no";
  q2?: "yes" | "no";
  q3?: string[];
}

const envApiBase = import.meta.env.VITE_API_BASE as string | undefined;
const rawBase = import.meta.env.BASE_URL ?? "/";
const DEFAULT_BASE = "/unibas/survey";
const baseWithoutTrailingSlash = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;
const normalizedBase =
  baseWithoutTrailingSlash === "" || baseWithoutTrailingSlash === "/"
    ? DEFAULT_BASE
    : baseWithoutTrailingSlash;
const defaultApiBase = `${normalizedBase}/api`.replace(/\/{2,}/g, "/");

const baseCandidates = Array.from(
  new Set(
    [
      envApiBase?.replace(/\/+$/, ""),
      defaultApiBase,
      "/unibas/survey/api",
      "/api",
    ].filter((candidate): candidate is string => Boolean(candidate))
  )
);

const apiClients: AxiosInstance[] = baseCandidates.map((candidate) =>
  axios.create({
    baseURL: candidate,
  })
);

const internalBaseURL = buildAppPath("/internal");
const internalClient = axios.create({
  baseURL: internalBaseURL,
});

function describeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.error;
    if (typeof serverMessage === "string" && serverMessage.trim()) {
      return serverMessage;
    }
  }
  return error instanceof Error ? error.message : String(error);
}

async function requestWithFallback<T>(
  request: (client: AxiosInstance) => Promise<T>,
  descriptor?: string
): Promise<T> {
  const attempts: string[] = [];

  for (const client of apiClients) {
    try {
      return await request(client);
    } catch (error) {
      const base = client.defaults.baseURL ?? "(unbekannter Endpunkt)";
      const reason = describeError(error);
      attempts.push(`${base}: ${reason}`);
    }
  }

  const summary =
    attempts.length === 0
      ? descriptor ?? "API-Anfrage fehlgeschlagen."
      : `${descriptor ?? "API-Anfrage fehlgeschlagen."} Versuchte Endpunkte:\n${attempts.join(
          "\n"
        )}`;

  throw new Error(summary);
}

async function internalRequest<T>(
  request: (client: AxiosInstance) => Promise<T>,
  descriptor?: string
): Promise<T> {
  try {
    return await request(internalClient);
  } catch (error) {
    const reason = describeError(error);
    const summary = descriptor ? `${descriptor}: ${reason}` : reason;
    throw new Error(summary);
  }
}

export async function fetchKesbAuthorities(): Promise<KesbAuthority[]> {
  try {
    return await requestWithFallback(
      async (client) => {
        const { data } = await client.get<KesbAuthority[]>("/kesb");
        if (!Array.isArray(data)) {
          throw new Error(
            `Ungültige API-Antwort: Erwartet wurde ein Array, erhalten: ${JSON.stringify(data)}`
          );
        }
        const invalid = data.find((item) => typeof item?.id !== "string" || typeof item?.name !== "string");
        if (invalid) {
          throw new Error(
            `Ungültiger API-Eintrag: ${JSON.stringify(invalid)}`
          );
        }
        return data;
      },
      "KESB-Liste konnte nicht über die API geladen werden."
    );
  } catch (apiError) {
    const apiMessage = apiError instanceof Error ? apiError.message : String(apiError);

    const staticCandidates = Array.from(
      new Set(
        [
          `${normalizedBase}/data/kesb.json`,
          `/unibas/survey/data/kesb.json`,
          `/data/kesb.json`,
        ].map((candidate) => candidate.replace(/\/{2,}/g, "/"))
      )
    );

    const staticAttempts: string[] = [];

    for (const candidate of staticCandidates) {
      try {
        const response = await fetch(candidate, { credentials: "include" });
        if (!response.ok) {
          staticAttempts.push(`${candidate}: HTTP ${response.status}`);
          continue;
        }
        const payload = (await response.json()) as KesbAuthority[];
        if (!Array.isArray(payload)) {
          staticAttempts.push(
            `${candidate}: Erwartetes Array, erhalten: ${JSON.stringify(payload)}`
          );
          continue;
        }
        const invalid = payload.find(
          (item) => typeof item?.id !== "string" || typeof item?.name !== "string"
        );
        if (invalid) {
          staticAttempts.push(`${candidate}: Ungültiger Eintrag ${JSON.stringify(invalid)}`);
          continue;
        }
        return payload;
      } catch (staticError) {
        const reason = staticError instanceof Error ? staticError.message : String(staticError);
        staticAttempts.push(`${candidate}: ${reason}`);
      }
    }

    if (KESB_FALLBACK.length > 0) {
      console.warn("KESB-API und statische Quellen fehlgeschlagen. Verwende eingebettete Fallback-Daten.");
      return KESB_FALLBACK.map((item) => ({ id: item.id, name: item.name }));
    }

    const staticMessage =
      staticAttempts.length > 0
        ? `Statische Fallbacks fehlgeschlagen:\n${staticAttempts.join("\n")}`
        : "Keine statischen Fallback-Dateien erreichbar.";

    throw new Error(
      `KESB-Liste konnte nicht geladen werden.\n${apiMessage}\n${staticMessage}`
    );
  }
}

export async function submitSurvey(payload: SubmitResponsePayload) {
  return requestWithFallback(async (client) => {
    const { data } = await client.post("/responses", payload);
    return data;
  }, "Antwort konnte nicht gespeichert werden.");
}

export async function fetchSummaryReport() {
  return requestWithFallback(async (client) => {
    const { data } = await client.get("/reports/summary");
    return data;
  }, "Berichtszusammenfassung konnte nicht geladen werden.");
}

export async function fetchDetailedReport(language?: LanguageCode | "all") {
  const path = language && language !== "all" ? `/reports/detail/${language}` : "/reports/detail/all";
  return requestWithFallback(async (client) => {
    const { data } = await client.get(path);
    return data;
  }, "Detailbericht konnte nicht geladen werden.");
}

export interface OcrResponse {
  text: string;
  email?: {
    delivered: boolean;
    message?: string | null;
  };
}

export async function uploadOcrDocument(file: File, email?: string): Promise<OcrResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (email) {
    formData.append("email", email);
  }
  return internalRequest(
    async (client) => {
      const { data } = await client.post("/ocr", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    "OCR-Dokument konnte nicht verarbeitet werden."
  );
}

export interface FilenameResponse {
  originalName: string;
  sanitizedName: string;
}

export async function checkFilenameCompatibility(file: File): Promise<FilenameResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return internalRequest(
    async (client) => {
      const { data } = await client.post("/filename", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    "Dateiname konnte nicht geprüft werden."
  );
}

export interface SpeechToTextResponse {
  text: string;
  email?: {
    delivered: boolean;
    message?: string | null;
  };
}

export async function transcribeAudio(
  file: File,
  options: { email?: string; language?: string } = {}
): Promise<SpeechToTextResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (options.email) {
    formData.append("email", options.email);
  }
  if (options.language) {
    formData.append("language", options.language);
  }

  return internalRequest(
    async (client) => {
      const { data } = await client.post("/speech-to-text", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    "Audio konnte nicht transkribiert werden."
  );
}

