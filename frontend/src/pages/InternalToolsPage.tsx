import { useCallback, useMemo, useRef, useState } from "react";
import {
  uploadOcrDocument,
  checkFilenameCompatibility,
  transcribeAudio,
  type OcrResponse,
  type FilenameResponse,
  type SpeechToTextResponse,
} from "../api/client";

interface UploadStatus {
  loading: boolean;
  error: string | null;
  info: string | null;
}

const initialStatus: UploadStatus = {
  loading: false,
  error: null,
  info: null,
};

const languageOptions = [
  { value: "de-DE", label: "Deutsch (de-DE)" },
  { value: "fr-FR", label: "Français (fr-FR)" },
  { value: "it-IT", label: "Italiano (it-IT)" },
  { value: "en-US", label: "English (en-US)" },
];

const InternalToolsPage = () => {
  const [ocrStatus, setOcrStatus] = useState<UploadStatus>(initialStatus);
  const [ocrText, setOcrText] = useState("");
  const [ocrEmail, setOcrEmail] = useState("");
  const ocrInputRef = useRef<HTMLInputElement | null>(null);

  const [filenameStatus, setFilenameStatus] = useState<UploadStatus>(initialStatus);
  const [filenameResult, setFilenameResult] = useState<FilenameResponse | null>(null);
  const filenameInputRef = useRef<HTMLInputElement | null>(null);

  const [sttStatus, setSttStatus] = useState<UploadStatus>(initialStatus);
  const [sttText, setSttText] = useState("");
  const [sttEmail, setSttEmail] = useState("");
  const [sttLanguage, setSttLanguage] = useState(languageOptions[0].value);
  const [sttFileName, setSttFileName] = useState<string | null>(null);
  const sttInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelection = useCallback((files: FileList | null, fallbackRef: React.RefObject<HTMLInputElement>) => {
    if (!files || files.length === 0) {
      fallbackRef.current?.click();
      return null;
    }
    return files[0];
  }, []);

  const handleOcrUpload = useCallback(
    async (file: File) => {
      setOcrStatus({ loading: true, error: null, info: null });
      try {
        const response: OcrResponse = await uploadOcrDocument(file, ocrEmail || undefined);
        console.log("ocr response", response);
        setOcrText(response.text ?? "111");
        const message = response.email?.delivered
          ? "OCR-Ergebnis wurde per E-Mail verschickt."
          : response.email?.message ?? null;
        setOcrStatus({ loading: false, error: null, info: message });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "OCR-Verarbeitung fehlgeschlagen.";
        setOcrStatus({ loading: false, error: message, info: null });
      }
    },
    [ocrEmail]
  );

  const handleFilenameUpload = useCallback(async (file: File) => {
    setFilenameStatus({ loading: true, error: null, info: null });
    try {
      const response = await checkFilenameCompatibility(file);
      setFilenameResult(response);
      const info =
        response.originalName === response.sanitizedName
          ? "Dateiname ist bereits kompatibel."
          : "Dateiname wurde angepasst.";
      setFilenameStatus({ loading: false, error: null, info });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Dateiname konnte nicht geprüft werden.";
      setFilenameStatus({ loading: false, error: message, info: null });
    }
  }, []);

  const handleSttUpload = useCallback(
    async (file: File) => {
      setSttFileName(file.name);
      setSttStatus({ loading: true, error: null, info: null });
      try {
        const response: SpeechToTextResponse = await transcribeAudio(file, {
          email: sttEmail || undefined,
          language: sttLanguage,
        });
        setSttText(response.text ?? "");
        const message = response.email?.delivered
          ? "Transkript wurde per E-Mail versandt."
          : response.email?.message ?? null;
        setSttStatus({ loading: false, error: null, info: message });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Transkription konnte nicht durchgeführt werden.";
        setSttStatus({ loading: false, error: message, info: null });
      }
    },
    [sttEmail, sttLanguage]
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>, onUpload: (file: File) => Promise<void>) => {
      event.preventDefault();
      event.stopPropagation();
      const file = event.dataTransfer.files?.[0];
      if (file) {
        await onUpload(file);
      }
    },
    []
  );

  const isOcrActionDisabled = useMemo(() => ocrStatus.loading, [ocrStatus.loading]);
  const isFilenameActionDisabled = useMemo(
    () => filenameStatus.loading,
    [filenameStatus.loading]
  );
  const isSttActionDisabled = useMemo(() => sttStatus.loading, [sttStatus.loading]);

  return (
    <div className="internal-page">
      <h1 className="internal-page__title">Interne Arbeitswerkzeuge</h1>
      <p className="internal-page__subtitle">
        Nutzen Sie die folgenden Drag-and-Drop-Felder, um schnell Dokumente zu verarbeiten.
      </p>

      <section className="internal-tools-grid">
        <article className="tool-card">
          <header className="tool-card__header">
            <h2>OCR-Erkennung</h2>
            <p>
              Ziehen Sie Fotos oder PDF-Dateien hierher, um den reinen Text über die Mistral-OCR-API
              zu extrahieren.
            </p>
          </header>
          <div
            className="dropzone"
            onDrop={(event) => handleDrop(event, handleOcrUpload)}
            onDragOver={(event) => event.preventDefault()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                ocrInputRef.current?.click();
              }
            }}
          >
            <p className="dropzone__text">Datei hier ablegen oder auswählen…</p>
            <button
              type="button"
              className="button secondary"
              disabled={isOcrActionDisabled}
              onClick={() => ocrInputRef.current?.click()}
            >
              Datei auswählen
            </button>
            <input
              ref={ocrInputRef}
              type="file"
              accept=".pdf,image/*"
              hidden
              onChange={async (event) => {
                const file = handleFileSelection(event.target.files, ocrInputRef);
                if (file) {
                  await handleOcrUpload(file);
                  event.target.value = "";
                }
              }}
            />
          </div>

          <div className="tool-card__form">
            <label className="tool-card__label" htmlFor="ocr-email">
              Ergebnis zusätzlich per E-Mail erhalten (optional)
            </label>
            <input
              id="ocr-email"
              type="email"
              placeholder="E-Mail-Adresse"
              value={ocrEmail}
              onChange={(event) => setOcrEmail(event.target.value)}
              className="tool-card__input"
            />
          </div>

          {ocrStatus.info && <p className="tool-card__info">{ocrStatus.info}</p>}
          {ocrStatus.error && <p className="tool-card__error">{ocrStatus.error}</p>}

          <textarea
            className="tool-card__result"
            value={ocrText}
            onChange={(event) => setOcrText(event.target.value)}
            placeholder="Der erkannte Text erscheint hier…"
            rows={10}
          />
        </article>

        <article className="tool-card">
          <header className="tool-card__header">
            <h2>Dateinamen-Prüfung</h2>
            <p>
              Ziehen Sie eine Datei hierher, um einen macOS-kompatiblen Dateinamen zu erhalten.
            </p>
          </header>
          <div
            className="dropzone"
            onDrop={(event) => handleDrop(event, handleFilenameUpload)}
            onDragOver={(event) => event.preventDefault()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                filenameInputRef.current?.click();
              }
            }}
          >
            <p className="dropzone__text">Datei hier ablegen oder auswählen…</p>
            <button
              type="button"
              className="button secondary"
              disabled={isFilenameActionDisabled}
              onClick={() => filenameInputRef.current?.click()}
            >
              Datei auswählen
            </button>
            <input
              ref={filenameInputRef}
              type="file"
              hidden
              onChange={async (event) => {
                const file = handleFileSelection(event.target.files, filenameInputRef);
                if (file) {
                  await handleFilenameUpload(file);
                  event.target.value = "";
                }
              }}
            />
          </div>

          {filenameStatus.info && <p className="tool-card__info">{filenameStatus.info}</p>}
          {filenameStatus.error && <p className="tool-card__error">{filenameStatus.error}</p>}

          <div className="tool-card__result-panel">
            <div>
              <span className="tool-card__label">Original:</span>
              <p className="tool-card__filename">{filenameResult?.originalName ?? "—"}</p>
            </div>
            <div>
              <span className="tool-card__label">Kompatibel:</span>
              <p className="tool-card__filename tool-card__filename--highlight">
                {filenameResult?.sanitizedName ?? "—"}
              </p>
            </div>
          </div>
        </article>

        <article className="tool-card">
          <header className="tool-card__header">
            <h2>Speech-to-Text</h2>
            <p>
              Ziehen Sie WAV- oder MP3-Dateien hierher, um lange Audioaufnahmen über die EdenAI-API
              zu transkribieren.
            </p>
          </header>
          <div
            className="dropzone"
            onDrop={(event) => handleDrop(event, handleSttUpload)}
            onDragOver={(event) => event.preventDefault()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                sttInputRef.current?.click();
              }
            }}
          >
            <p className="dropzone__text">Audio hier ablegen oder auswählen…</p>
            <button
              type="button"
              className="button secondary"
              disabled={isSttActionDisabled}
              onClick={() => sttInputRef.current?.click()}
            >
              Datei auswählen
            </button>
            <input
              ref={sttInputRef}
              type="file"
              accept="audio/*"
              hidden
              onChange={async (event) => {
                const file = handleFileSelection(event.target.files, sttInputRef);
                if (file) {
                  await handleSttUpload(file);
                  event.target.value = "";
                }
              }}
            />
          </div>

          {sttFileName && (
            <p className="tool-card__filename">
              Ausgewählte Datei: {sttFileName}
            </p>
          )}
          {sttStatus.loading && (
            <p className="tool-card__info">
              Transkription läuft… dies kann bei längeren Aufnahmen einige Minuten dauern.
            </p>
          )}

          <div className="tool-card__form tool-card__form--inline">
            <div className="tool-card__field">
              <label className="tool-card__label" htmlFor="stt-language">
                Sprache
              </label>
              <select
                id="stt-language"
                className="tool-card__input"
                value={sttLanguage}
                onChange={(event) => setSttLanguage(event.target.value)}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="tool-card__field">
              <label className="tool-card__label" htmlFor="stt-email">
                E-Mail (optional)
              </label>
              <input
                id="stt-email"
                type="email"
                placeholder="E-Mail-Adresse"
                value={sttEmail}
                onChange={(event) => setSttEmail(event.target.value)}
                className="tool-card__input"
              />
            </div>
          </div>

          {sttStatus.info && <p className="tool-card__info">{sttStatus.info}</p>}
          {sttStatus.error && <p className="tool-card__error">{sttStatus.error}</p>}

          <textarea
            className="tool-card__result tool-card__result--scroll"
            value={sttText}
            onChange={(event) => setSttText(event.target.value)}
            placeholder="Das Transkript erscheint hier…"
            rows={12}
          />
        </article>
      </section>
    </div>
  );
};

export default InternalToolsPage;


