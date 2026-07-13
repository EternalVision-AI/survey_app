import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { LanguageCode } from "../state/useSurveyStore";
import { languageMap } from "../i18n/content";
import { buildAppPath } from "../utils/routes";

interface LocationState {
  successId?: string;
  language?: LanguageCode;
}

const stripMeta = (value: string) => value.replace(/\[[^\]]*\]\s*/g, "").trim();

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState | null) ?? {};

  const lang: LanguageCode =
    state.language && ["de", "fr", "it"].includes(state.language) ? state.language : "de";
  const content = languageMap[lang];

  const thankYouMessage = stripMeta(content.thankYou);
  const newSurveyLabel = stripMeta(content.thankYouNewSurveyLabel);
  const reportsLabel = stripMeta(content.thankYouReportsLabel);
  const homePath = buildAppPath();
  const reportsPath = buildAppPath("/reports");

  useEffect(() => {
    if (!state.successId) {
      navigate(homePath, { replace: true });
    }
  }, [state.successId, homePath, navigate]);

  return (
    <div className="card">
      <h1 className="card-title">
        <strong>{thankYouMessage}</strong>
      </h1>
      {state.successId && (
        <p className="paragraph" style={{ textAlign: "center" }}>
          Antwort-ID: {state.successId}
        </p>
      )}
      <div className="button-group" style={{ justifyContent: "center" }}>
        <button className="button" onClick={() => navigate(homePath)}>
          {newSurveyLabel}
        </button>
        {/* <button className="button secondary" onClick={() => navigate(reportsPath)}>
          {reportsLabel}
        </button> */}
      </div>
    </div>
  );
};

export default ThankYouPage;


