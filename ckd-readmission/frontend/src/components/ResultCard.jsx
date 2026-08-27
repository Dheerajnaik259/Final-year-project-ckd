import "./ResultCard.css";
import RecommendationCard from "./RecommendationCard";
import RiskCharts from "./RiskCharts";

const riskConfig = {
  High: {
    color: "#b23a2e",
    tint: "rgba(178, 58, 46, 0.10)",
    label: "High Risk",
  },
  Medium: {
    color: "#c98a3a",
    tint: "rgba(201, 138, 58, 0.10)",
    label: "Moderate Risk",
  },
  Low: {
    color: "#5b8c5a",
    tint: "rgba(91, 140, 90, 0.10)",
    label: "Low Risk",
  },
};

export default function ResultCard({ result, onReset }) {
  const cfg = riskConfig[result.risk_level] || riskConfig.Low;
  const assessment = result.clinical_assessment;
  const kfre = assessment?.kfre;

  return (
    <div className="result-container">
      {/* Hero Banner: Headline Assessment */}
      <section className="result-hero-sheet">
        <div className="hero-top-row">
          <div className="score-lockup">
            <span className="probability-value mono">{result.probability}%</span>
            <span
              className="risk-badge"
              style={{ color: cfg.color, borderColor: cfg.color, background: cfg.tint }}
            >
              {cfg.label}
            </span>
          </div>
          <button className="btn-outline" onClick={onReset}>
            New Patient Intake
          </button>
        </div>

        <div className="assessment-block">
          <h3 className="section-title-serif">Assessment</h3>
          <p className="assessment-text">{result.message}</p>
          {result.has_blank_defaults && (
            <div className="blank-fields-notice-banner" style={{
              marginTop: "0.85rem",
              padding: "0.75rem 1rem",
              borderRadius: "6px",
              background: "rgba(201, 138, 58, 0.12)",
              border: "1px solid rgba(201, 138, 58, 0.3)",
              color: "#e2ad5c",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ shrink: 0, flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>
                <strong>Clinical Note:</strong> Some optional lab values were left blank and estimated using standard population baseline reference values. Readmission risk estimates may vary if actual lab values differ.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Signature Element & Analytics Charts */}
      <RiskCharts result={result} />

      {/* Clinical Context & Staging Grid */}
      {assessment && (
        <section className="clinical-details-sheet">
          <h3 className="section-title-serif">Kidney Staging &amp; Diagnostic Classification</h3>

          <div className="clinical-grid">
            <div className="detail-item">
              <span className="detail-label">CKD Stage</span>
              <strong className="detail-code mono">{assessment.ckd_stage.code}</strong>
              <p className="detail-desc">{assessment.ckd_stage.label}</p>
            </div>

            <div className="detail-item">
              <span className="detail-label">Albuminuria</span>
              <strong className="detail-code mono">{assessment.albuminuria.code}</strong>
              <p className="detail-desc">{assessment.albuminuria.label}</p>
            </div>

            <div className="detail-item">
              <span className="detail-label">KDIGO Classification</span>
              <strong className="detail-code mono">{assessment.kdigo_risk}</strong>
              <p className="detail-desc">Combined eGFR &amp; ACR rating</p>
            </div>

            <div className="detail-item">
              <span className="detail-label">Severity Score</span>
              <strong className="detail-code mono">{assessment.severity_score} pts</strong>
              <p className="detail-desc">
                Model: {assessment.model_probability}% | Floor: {assessment.clinical_floor}%
              </p>
            </div>
          </div>

          {/* Clinical Flags with SVG Triangles (no emojis) */}
          {(assessment.clinical_flags?.length > 0 || assessment.validation_warnings?.length > 0) && (
            <div className="flags-block">
              {assessment.clinical_flags?.length > 0 && (
                <div className="flag-group">
                  <h4 className="flag-title">Clinical Warning Flags</h4>
                  <ul className="flag-list">
                    {assessment.clinical_flags.map((flag, idx) => (
                      <li key={idx} className="flag-item">
                        <svg className="flag-icon" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 2L15 14H1L8 2Z" />
                        </svg>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {assessment.validation_warnings?.length > 0 && (
                <div className="flag-group warning">
                  <h4 className="flag-title">Input Warnings</h4>
                  <ul className="flag-list">
                    {assessment.validation_warnings.map((warning, idx) => (
                      <li key={idx} className="flag-item">
                        <svg className="flag-icon" viewBox="0 0 16 16" fill="currentColor">
                          <circle cx="8" cy="8" r="6" />
                        </svg>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* AI Recommendation Card */}
      {result.clinical_recommendation && (
        <RecommendationCard recommendation={result.clinical_recommendation} />
      )}
    </div>
  );
}
