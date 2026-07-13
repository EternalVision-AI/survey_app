import { Link } from "react-router-dom";
import { headers } from "../i18n/content";
import { buildAppPath } from "../utils/routes";

const LandingPage = () => {
  return (
    <div className="card">
      <h1 className="card-title">
        <strong>{headers.landingTitle}</strong>
      </h1>
      <div className="language-grid">
        {headers.languages.map((language) => (
          <Link key={language.path} className="language-card" to={buildAppPath(language.path)}>
            <span className="language-bullet">{language.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;

