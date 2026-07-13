import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDetailedReport, fetchSummaryReport } from "../api/client";
import type { LanguageCode } from "../state/useSurveyStore";
import { buildAppPath } from "../utils/routes";

interface SummaryResponse {
  totalsByLanguage: Record<string, { label: string; responses: number }>;
  q1Distribution: Record<string, number>;
  timestamp: string;
}

interface DetailedResponse {
  language: string;
  total: number;
  responses: Array<{
    id: string;
    createdAt: string;
    language: LanguageCode;
    kesb: string;
    name: string;
    role: string;
    q1: string;
    q2?: string;
    q3?: string;
  }>;
}

const ReportsPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [detail, setDetail] = useState<DetailedResponse | null>(null);
  const [languageFilter, setLanguageFilter] = useState<LanguageCode | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const homePath = buildAppPath();

  useEffect(() => {
    let mounted = true;
    async function loadReports() {
      try {
        setLoading(true);
        const [summaryResult, detailResult] = await Promise.all([
          fetchSummaryReport(),
          fetchDetailedReport(languageFilter),
        ]);
        if (mounted) {
          setSummary(summaryResult);
          setDetail(detailResult);
          setLoading(false);
        }
      } catch (reportError) {
        console.error(reportError);
        if (mounted) {
          setError("Berichte konnten nicht geladen werden.");
          setLoading(false);
        }
      }
    }
    loadReports();
    return () => {
      mounted = false;
    };
  }, [languageFilter]);

  return (
    <div className="card">
      <button className="button secondary" onClick={() => navigate(homePath)}>
        ← Zurück zur Auswahl
      </button>
      <h1 className="card-title">Auswertungen</h1>
      {error && <p className="paragraph" style={{ color: "#dc2626", fontWeight: 600 }}>{error}</p>}
      {loading && <p className="paragraph">Berichte werden geladen ...</p>}

      {!loading && summary && (
        <>
          <section>
            <h2 className="section-header">Teilnahmen nach Sprache</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Sprache</th>
                  <th>Antworten</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.totalsByLanguage).map(([key, value]) => (
                  <tr key={key}>
                    <td>{value.label}</td>
                    <td>{value.responses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="section-header">Verteilung Frage 1</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Antwort</th>
                  <th>Anzahl</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.q1Distribution).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key === "yes" ? "Ja / Oui / Sì" : "Nein / Non / No"}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {!loading && detail && (
        <section>
          <div className="button-group" style={{ justifyContent: "space-between" }}>
            <h2 className="section-header">Detailberichte</h2>
            <select
              value={languageFilter}
              onChange={(event) => setLanguageFilter(event.target.value as LanguageCode | "all")}
            >
              <option value="all">Alle Sprachen</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="it">Italiano</option>
            </select>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Zeitpunkt</th>
                <th>Sprache</th>
                <th>KESB</th>
                <th>Name</th>
                <th>Funktion</th>
                <th>Frage 1</th>
                <th>Frage 2</th>
                <th>Frage 3</th>
              </tr>
            </thead>
            <tbody>
              {detail.responses.length === 0 && (
                <tr>
                  <td colSpan={9}>Noch keine Einträge</td>
                </tr>
              )}
              {detail.responses.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{new Date(row.createdAt).toLocaleString()}</td>
                  <td>{row.language.toUpperCase()}</td>
                  <td>{row.kesb}</td>
                  <td>{row.name}</td>
                  <td>{row.role}</td>
                  <td>{row.q1}</td>
                  <td>{row.q2 ?? "-"}</td>
                  <td>{row.q3 ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export default ReportsPage;

