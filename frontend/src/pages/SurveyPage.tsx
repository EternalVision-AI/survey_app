import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { LanguageCode, SurveyDraft } from "../state/useSurveyStore";
import { useSurveyStore } from "../state/useSurveyStore";
import { fetchKesbAuthorities, submitSurvey } from "../api/client";
import type { KesbAuthority } from "../api/client";
import { languageMap } from "../i18n/content";
import { buildAppPath } from "../utils/routes";
import { privacyContent } from "../content/privacy";

type Step = "consent" | "identity" | "invitation" | "q1" | "q2" | "q3" | "review";

const stripMeta = (value: string) => value.replace(/\[[^\]]*\]\s*/g, "").trim();

const SurveyPage = () => {
  const { language } = useParams();
  const navigate = useNavigate();
  const lang = (language as LanguageCode) || "de";
  const homePath = buildAppPath();
  const thankYouPath = buildAppPath("/thank-you");

  useEffect(() => {
    if (!["de", "fr", "it"].includes(lang)) {
      navigate(homePath, { replace: true });
    }
  }, [lang, navigate, homePath]);

  const [kesbOptions, setKesbOptions] = useState<KesbAuthority[]>([]);
  const [loadingKesb, setLoadingKesb] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("consent");
  const [submitting, setSubmitting] = useState(false);

  const content = languageMap[lang];
  const { draft, setDraft, reset } = useSurveyStore();

  useEffect(() => {
    let mounted = true;
    fetchKesbAuthorities()
      .then((items) => {
        if (!Array.isArray(items)) {
          throw new Error("KESB payload malformed");
        }
        if (mounted) {
          setKesbOptions(items);
          setLoadingKesb(false);
        }
      })
      .catch((reason) => {
        if (mounted) {
          const message =
            reason instanceof Error
              ? reason.message
              : "KESB-Liste konnte nicht geladen werden. Bitte versuchen Sie es später erneut.";
          setError(message);
          setLoadingKesb(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const currentDraft = useMemo<SurveyDraft>(() => {
    const base = draft?.language === lang ? draft : undefined;
    return {
      language: lang,
      consentAccepted: base?.consentAccepted ?? false,
      kesb: base?.kesb,
      name: base?.name,
      role: base?.role,
      q1: base?.q1,
      q2: base?.q2,
      q3: base?.q3 ?? [],
      q3Other: base?.q3Other,
    };
  }, [draft, lang]);

  const updateDraft = (updates: Partial<SurveyDraft>) => {
    setDraft({
      ...currentDraft,
      ...updates,
      language: lang,
    });
  };

  const handleAdvance = (next: Step) => {
    setStep(next);
  };

  const handleSubmit = async () => {
    if (!currentDraft.consentAccepted) {
      setError("Bitte stimmen Sie der Datenschutzerklärung zu.");
      return;
    }
    if (!currentDraft.kesb || !currentDraft.name || !currentDraft.role || !currentDraft.q1) {
      setError("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }
    const payload = {
      language: currentDraft.language,
      kesb: currentDraft.kesb,
      name: currentDraft.name,
      role: currentDraft.role,
      q1: currentDraft.q1,
      q2: currentDraft.q2,
      q3:
        currentDraft.q1 === "no"
          ? [
              ...(currentDraft.q3 ?? []),
              ...(currentDraft.q3Other && currentDraft.q3Other.trim().length > 0
                ? [`Other: ${currentDraft.q3Other.trim()}`]
                : []),
            ]
          : undefined,
    };
    try {
      setSubmitting(true);
      const result = await submitSurvey(payload);
      setSubmitting(false);
      reset();
      navigate(thankYouPath, { state: { successId: result.id, language: lang } });
    } catch (submitError) {
      console.error(submitError);
      setSubmitting(false);
      setError("Beim Speichern der Antworten ist ein Fehler aufgetreten.");
    }
  };

  const showQ2 = currentDraft.q1 === "yes";
  const showQ3 = currentDraft.q1 === "no";

  useEffect(() => {
    if (!currentDraft.consentAccepted && step !== "consent") {
      setStep("consent");
    }
  }, [currentDraft.consentAccepted, step]);

  const headerByStep: Record<Step, string> = {
    consent: privacyContent[lang].header,
    identity: content.selectKesbHeader,
    invitation: content.invitationHeader,
    q1: content.questions.q1Header,
    q2: content.questions.q2Header,
    q3: content.questions.q3Header,
    review: content.reviewLabel,
  };

  const activeHeader = stripMeta(headerByStep[step] ?? content.selectKesbHeader);

  return (
    <div className="card">
      {step !== "consent" ? (
        <button className="button secondary" onClick={() => navigate(homePath)}>
          ← Zurück
        </button>
      ) : (
        <button className="button secondary" onClick={() => navigate(homePath)}>
          ← Zurück zur Sprachauswahl
        </button>
      )}
      {error && <p className="paragraph" style={{ color: "#dc2626", fontWeight: 600 }}>{error}</p>}

      <h1 className="card-title">
        <strong>{activeHeader}</strong>
      </h1>

      {step === "consent" && (
        <>
          <div
            style={{
              maxHeight: "280px",
              overflowY: "auto",
              padding: "1.25rem",
              borderRadius: "0.75rem",
              border: "1px solid #cbd5f5",
              background: "rgba(248, 250, 252, 0.85)",
              marginBottom: "1.5rem",
            }}
          >
            {privacyContent[lang].body.map((paragraph, index) => (
              <p key={index} className="paragraph" style={{ marginBottom: "0.75rem" }}>
                {paragraph}
              </p>
            ))}
          </div>
          <p className="paragraph" style={{ marginBottom: "1.5rem" }}>
            {privacyContent[lang].acknowledgement}
          </p>
          <label className="checkbox-item" style={{ alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={currentDraft.consentAccepted ?? false}
              onChange={(event) =>
                updateDraft({
                  consentAccepted: event.target.checked,
                })
              }
            />
            <span>{privacyContent[lang].acceptLabel}</span>
          </label>
          <div className="button-group" style={{ marginTop: "1.5rem" }}>
            <button
              className="button"
              disabled={!currentDraft.consentAccepted}
              onClick={() => handleAdvance("identity")}
            >
              {languageMap[lang].continueLabel}
            </button>
          </div>
        </>
      )}

      {step === "identity" && (
        <>
          {loadingKesb ? (
            <p className="paragraph">KESB-Liste wird geladen ...</p>
          ) : (
            <>
              <div className="input-group">
                <label htmlFor="kesb">{content.kesbLabel}</label>
                <select
                  id="kesb"
                  value={currentDraft.kesb ?? ""}
                  onChange={(event) => updateDraft({ kesb: event.target.value })}
                >
                  <option value="">{content.kesbPlaceholder}</option>
                  {kesbOptions.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="name">{content.nameLabel}</label>
                <input
                  id="name"
                  value={currentDraft.name ?? ""}
                  onChange={(event) => updateDraft({ name: event.target.value })}
                />
              </div>
              <div className="input-group">
                <label htmlFor="role">{content.roleLabel}</label>
                <input
                  id="role"
                  value={currentDraft.role ?? ""}
                  onChange={(event) => updateDraft({ role: event.target.value })}
                />
              </div>
              <div className="button-group">
                <button
                  className="button"
                  disabled={!currentDraft.kesb || !currentDraft.name || !currentDraft.role}
                  onClick={() => handleAdvance("invitation")}
                >
                  {content.continueLabel}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {step === "invitation" && (
        <>
          <div>
            {content.invitation.map((paragraph, index) => (
              <p key={index} className="paragraph">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="button-group">
            <button className="button" onClick={() => handleAdvance("q1")}>
              {content.continueLabel}
            </button>
            <button className="button secondary" onClick={() => handleAdvance("identity")}>
              Zurück
            </button>
          </div>
        </>
      )}

      {step === "q1" && (
        <>
          {stripMeta(content.questions.q1) !== activeHeader && (
            <p className="question-text">{content.questions.q1}</p>
          )}
          <div className="checkbox-list">
            {content.questions.q1Options.map((option) => (
              <label key={option.value} className="checkbox-item">
                <input
                  type="radio"
                  name="q1"
                  value={option.value}
                  checked={currentDraft.q1 === option.value}
                  onChange={() =>
                    updateDraft({
                      q1: option.value,
                      q2: undefined,
                      q3: [],
                    })
                  }
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <div className="button-group">
            <button
              className="button"
              disabled={!currentDraft.q1}
              onClick={() => handleAdvance(showQ2 ? "q2" : showQ3 ? "q3" : "review")}
            >
              {content.continueLabel}
            </button>
            <button className="button secondary" onClick={() => handleAdvance("invitation")}>
              Zurück
            </button>
          </div>
        </>
      )}

      {step === "q2" && showQ2 && (
        <>
          {stripMeta(content.questions.q2) !== activeHeader && (
            <p className="question-text">{content.questions.q2}</p>
          )}
          <div className="checkbox-list">
            {content.questions.q2Options.map((option) => (
              <label key={option.value} className="checkbox-item">
                <input
                  type="radio"
                  name="q2"
                  value={option.value}
                  checked={currentDraft.q2 === option.value}
                  onChange={() => updateDraft({ q2: option.value })}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <div className="button-group">
            <button
              className="button"
              disabled={!currentDraft.q2}
              onClick={() => handleAdvance("review")}
            >
              {content.continueLabel}
            </button>
            <button className="button secondary" onClick={() => handleAdvance("q1")}>
              Zurück
            </button>
          </div>
        </>
      )}

      {step === "q3" && showQ3 && (
        <>
          {stripMeta(content.questions.q3Intro) !== activeHeader && (
            <p className="question-text">{content.questions.q3Intro}</p>
          )}
          <div className="checkbox-list">
            {content.questions.q3Options.map((option) => (
              <label key={option.value} className="checkbox-item">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={currentDraft.q3?.includes(option.value) ?? false}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    const prev = currentDraft.q3 ?? [];
                    if (checked) {
                      updateDraft({ q3: [...prev, option.value].filter((item, idx, arr) => arr.indexOf(item) === idx) });
                    } else {
                      updateDraft({ q3: prev.filter((item) => item !== option.value) });
                    }
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <div className="input-group">
            <p className="question-text">{content.questions.q3Other}</p>
            <textarea
              rows={3}
              value={currentDraft.q3Other ?? ""}
              onChange={(event) => updateDraft({ q3Other: event.target.value })}
            />
          </div>
          <div className="button-group">
            <button
              className="button"
              disabled={(currentDraft.q3?.length ?? 0) === 0 && !(currentDraft.q3Other && currentDraft.q3Other.trim())}
              onClick={() => handleAdvance("review")}
            >
              {content.continueLabel}
            </button>
            <button className="button secondary" onClick={() => handleAdvance("q1")}>
              Zurück
            </button>
          </div>
        </>
      )}

      {step === "review" && (
        <>
          <div className="review-grid">
            <div className="review-row">
              <strong>{content.kesbLabel}</strong>
              <span>{currentDraft.kesb}</span>
            </div>
            <div className="review-row">
              <strong>{content.nameLabel}</strong>
              <span>{currentDraft.name}</span>
            </div>
            <div className="review-row">
              <strong>{content.roleLabel}</strong>
              <span>{currentDraft.role}</span>
            </div>
            <div className="review-row">
              <strong>{content.questions.q1}</strong>
              <span>
                {content.questions.q1Options.find((item) => item.value === currentDraft.q1)?.label ?? "-"}
              </span>
            </div>
            {showQ2 && (
              <div className="review-row">
                <strong>{content.questions.q2}</strong>
                <span>
                  {content.questions.q2Options.find((item) => item.value === currentDraft.q2)?.label ?? "-"}
                </span>
              </div>
            )}
            {showQ3 && (
              <div className="review-row">
                <strong>{content.questions.q3Intro}</strong>
                <span>
                  {[...(currentDraft.q3 ?? []).map((value) => content.questions.q3Options.find((item) => item.value === value)?.label ?? value), currentDraft.q3Other]
                    .filter(Boolean)
                    .join("; ")}
                </span>
              </div>
            )}
          </div>
          <div className="button-group">
            <button className="button" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "..." : content.submitLabel}
            </button>
            <button className="button secondary" onClick={() => handleAdvance("q1")}>
              Zurück
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SurveyPage;

