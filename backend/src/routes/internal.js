import express from "express";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import rateLimit from "express-rate-limit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../settings.js";
import { createTextPdfBuffer } from "../services/pdf.js";
import { sendEmailWithAttachments } from "../services/email.js";
import { sanitizeFilename } from "../services/filename.js";
import { normalizeWavTo16BitPcm } from "../services/audio.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_UPLOADS_DIR = path.join(__dirname, "../../public/uploads");
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || "https://famkb.ch";

fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });

const uploadDisk = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, PUBLIC_UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      const safeName = sanitizeFilename(file.originalname || "upload");
      cb(null, `upload_${timestamp}_${safeName}`);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

// These routes are unauthenticated but call paid external APIs (Mistral OCR,
// EdenAI STT) and can trigger outbound email — rate-limit as a stopgap
// against cost/spam abuse until real auth is added in front of /internal.
const internalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
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

const extractFirstProviderText = (payload) => {
  if (!payload || typeof payload !== "object") {
    return "";
  }
  const providerKeys = Object.keys(payload);
  for (const key of providerKeys) {
    const value = payload[key];
    if (value && typeof value === "object") {
      if (typeof value.text === "string" && value.text.trim()) {
        return value.text.trim();
      }
      if (typeof value.transcription === "string" && value.transcription.trim()) {
        return value.transcription.trim();
      }
    }
  }
  if (typeof payload.text === "string") {
    return payload.text;
  }
  return "";
};

async function runMistralOcr(filePath, fileUrl) {
  if (!config.mistralApiKey) {
    throw new Error("Mistral OCR ist nicht konfiguriert.");
  }

  if (!fileUrl) {
    throw new Error("File URL fehlt für Mistral OCR.");
  }

  const payload = {
    model: "mistral-ocr-latest",
    document: {
      type: "document_url",
      document_url: fileUrl,
    },
  };

  const headers = {
    Authorization: `Bearer ${config.mistralApiKey}`,
    "Content-Type": "application/json",
  };

  const response = await axios.post("https://api.mistral.ai/v1/ocr", payload, {
    headers,
    timeout: 60000,
  });

  if (response.status !== 200) {
    throw new Error(`OCR fehlgeschlagen: API ${response.status}`);
  }

  const data = response.data;

  // Preferred extraction pathway
  const pages = data?.pages || [];
  const parts = pages
    .map(p => (p.markdown || p.text || "").trim())
    .filter(Boolean);

  const text = parts.join("\n\n").trim() || (data?.output_text || "").trim();

  if (!text) {
    throw new Error("OCR lieferte keinen Text");
  }

  return text;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runEdenAiStt(file, languageCode) {
  if (!config.edenaiApiKey) {
    throw new Error("EdenAI ist nicht konfiguriert.");
  }

  const normalizedBuffer = normalizeWavTo16BitPcm(file.buffer, file.originalname);
  const wasNormalized = normalizedBuffer !== file.buffer;

  const formData = new FormData();
  formData.append("providers", "google");
  formData.append("language", languageCode || "de-DE");
  formData.append("model", "latest_long");
  formData.append("file", normalizedBuffer, {
    filename: file.originalname,
    contentType: wasNormalized ? "audio/wav" : file.mimetype || "audio/mpeg",
  });

  const headers = {
    Authorization: `Bearer ${config.edenaiApiKey}`,
    ...formData.getHeaders(),
  };

  const submitResponse = await axios.post(
    "https://api.edenai.run/v2/audio/speech_to_text_async",
    formData,
    { headers }
  );

  const jobId = submitResponse.data?.public_id;
  if (!jobId) {
    throw new Error("EdenAI hat keine Job-ID zurückgegeben.");
  }

  const pollUrl = `https://api.edenai.run/v2/audio/speech_to_text_async/${jobId}`;
  const maxAttempts = 90;
  const pollIntervalMs = 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await sleep(pollIntervalMs);
    const pollResponse = await axios.get(pollUrl, {
      headers: { Authorization: `Bearer ${config.edenaiApiKey}` },
    });

    if (pollResponse.data?.status === "finished" || pollResponse.data?.status === "failed") {
      const results = pollResponse.data.results || {};
      const text = extractFirstProviderText(results);
      if (text) {
        return text;
      }

      const providerError = Object.values(results).find((result) => result?.error)?.error;
      console.error("EdenAI-Job ohne Transkript:", JSON.stringify(pollResponse.data));
      throw new Error(providerError || "Keine Transkription erhalten (Anbieter lieferte keinen Text).");
    }
  }

  throw new Error("Transkription hat das Zeitlimit überschritten (3 Minuten).");
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function maybeSendEmail(toAddress, subject, plainText, pdfBuffer, attachmentName) {
  if (!toAddress || !plainText) {
    return { delivered: false, message: "Keine E-Mail-Adresse übermittelt." };
  }

  if (typeof toAddress !== "string" || !EMAIL_REGEX.test(toAddress.trim())) {
    return { delivered: false, message: "Ungültige E-Mail-Adresse." };
  }

  try {
    const response = await sendEmailWithAttachments({
      to: toAddress,
      subject,
      text: plainText,
      attachments: [
        {
          filename: `${attachmentName}.txt`,
          content: plainText,
        },
        {
          filename: `${attachmentName}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    return response;
  } catch (error) {
    return {
      delivered: false,
      message: error instanceof Error ? error.message : "E-Mail konnte nicht gesendet werden.",
    };
  }
}

export function registerInternalRoutes(app, basePath = "/internal") {
  const normalized = normalizeBase(basePath);
  
  // Serve public uploads directory statically
  const publicUrlPath = normalized ? `${normalized}/public` : "/public";
  app.use(publicUrlPath, express.static(PUBLIC_UPLOADS_DIR, { maxAge: "1h" }));

  const prefixes = new Set(["/internal"]);

  if (normalized && normalized !== "/internal") {
    prefixes.add(normalized);
  }
  if (!normalized) {
    prefixes.add("");
  }

  prefixes.forEach((prefix) => {
    const safePrefix = prefix === "" ? "" : prefix;

    app.post(`${safePrefix}/ocr`, internalApiLimiter, uploadDisk.single("file"), async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: "Keine Datei übermittelt." });
      }
      try {
        const filePath = req.file.path;
        const fileName = path.basename(filePath);
const fileUrl = `${PUBLIC_BASE_URL}/uploads/${encodeURIComponent(fileName)}`;
        
        console.log(`→ Upload gespeichert: ${filePath}`);
        console.log(`→ Öffentliche URL: ${fileUrl}`);

const text = await runMistralOcr(filePath, fileUrl);
        let emailResult = { delivered: false, message: null };
        if (req.body?.email) {
          const pdfBuffer = await createTextPdfBuffer(text);
          emailResult = await maybeSendEmail(
            req.body.email,
            "OCR-Ergebnis",
            text,
            pdfBuffer,
            "ocr-export"
          );
        }
        res.json({
          text,
          file_url: fileUrl,
          email: emailResult,
        });
      } catch (error) {
        console.error(error);
        
        // Clean up file on error
        if (req.file?.path && fs.existsSync(req.file.path)) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.error("Fehler beim Löschen der Datei:", cleanupError);
          }
        }
        
        const errorMessage = error instanceof Error ? error.message : "Verarbeitung fehlgeschlagen.";
        const statusCode = errorMessage.includes("API") || errorMessage.includes("fehlgeschlagen") ? 502 : 500;
        res.status(statusCode).json({
          error: errorMessage,
          ...(error?.response?.data ? { body: JSON.stringify(error.response.data).slice(0, 400) } : {}),
        });
      }
    });

    app.post(`${safePrefix}/filename`, uploadMemory.single("file"), async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: "Keine Datei übermittelt." });
      }
      const sanitized = sanitizeFilename(req.file.originalname || "datei.txt");
      res.json({
        originalName: req.file.originalname,
        sanitizedName: sanitized,
      });
    });

    app.post(`${safePrefix}/speech-to-text`, internalApiLimiter, uploadMemory.single("file"), async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: "Keine Datei übermittelt." });
      }
      try {
        const languageCode = req.body?.language || "de-DE";
        const transcript = await runEdenAiStt(req.file, languageCode);
        let emailResult = { delivered: false, message: null };
        if (req.body?.email) {
          const pdfBuffer = await createTextPdfBuffer(transcript);
          emailResult = await maybeSendEmail(
            req.body.email,
            "Sprach-Transkript",
            transcript,
            pdfBuffer,
            "transkript"
          );
        }
        res.json({
          text: transcript,
          email: emailResult,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          error:
            error instanceof Error ? error.message : "Verarbeitung fehlgeschlagen.",
        });
      }
    });
  });
}


