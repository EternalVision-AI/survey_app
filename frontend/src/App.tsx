import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SurveyPage from "./pages/SurveyPage";
import ReportsPage from "./pages/ReportsPage";
import ThankYouPage from "./pages/ThankYouPage";
import InternalToolsPage from "./pages/InternalToolsPage";
import NotFoundPage from "./pages/NotFoundPage";

interface AppProps {
  isInternal?: boolean;
}

function SurveyRoutes() {
  return (
    <Routes>
      <Route path="/unibas/survey" element={<LandingPage />} />
      <Route path="/unibas/survey/survey/:language" element={<SurveyPage />} />
      <Route path="/unibas/survey/reports" element={<ReportsPage />} />
      <Route path="/unibas/survey/thank-you" element={<ThankYouPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function InternalRoutes() {
  return (
    <Routes>
      <Route path="/" element={<InternalToolsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App({ isInternal = false }: AppProps) {
  return (
    <div className={`app-shell${isInternal ? " app-shell--internal" : ""}`}>
      <div className={`content-container${isInternal ? " content-container--internal" : ""}`}>
        {isInternal ? <InternalRoutes /> : <SurveyRoutes />}
      </div>
    </div>
  );
}

export default App;

