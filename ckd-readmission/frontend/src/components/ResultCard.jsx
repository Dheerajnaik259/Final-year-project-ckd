import "./ResultCard.css";
import { useEffect, useState } from "react";
import RecommendationCard from "./RecommendationCard";
import RiskCharts from "./RiskCharts";

const riskConfig = {
  High: {
    color: "#c45443",
    tint: "rgba(196, 84, 67, 0.10)",
    bar: "#c45443",
    label: "High risk",
  },
  Medium: {
    color: "#bf7d2e",
    tint: "rgba(191, 125, 46, 0.12)",
    bar: "#bf7d2e",
    label: "Moderate risk",
  },
  Low: {
    color: "#2e8a57",
    tint: "rgba(46, 138, 87, 0.12)",
    bar: "#2e8a57",
    label: "Low risk",
  },
};

export default function ResultCard({ result, onReset }) {
  const [animVal, setAnimVal] = useState(0);
  const cfg = riskConfig[result.risk_level] || riskConfig.Low;
  const assessment = result.clinical_assessment;
  const kfre = assessment?.kfre;

  useEffect(() => {
    const timer = setTimeout(() => setAnimVal(result.probability), 180);
    return () => clearTimeout(timer);
  }, [result.probability]);

  const metricItems = assessment
    ? [
        {
          label: "CKD stage",
          value: assessment.ckd_stage.code,
          detail: assessment.ckd_stage.label,
          note: assessment.ckd_stage.range,
        },
        {
          label: "Albuminuria",
          value: assessment.albuminuria.code,
          detail: assessment.albuminuria.label,
          note: assessment.albuminuria.range,
        },
        {
          label: "KDIGO view",
          value: assessment.kdigo_risk,
          detail: "Combined eGFR and ACR context",
          note: "Clinical review aid",
        },
        {
          label: "Severity score",
          value: assessment.severity_score,
          detail: `Model score ${assessment.model_probability}%`,
          note: `Clinical floor ${assessment.clinical_floor}%`,
        },
      ]
    : [];

  const suggestionSections = [
    { key: "food", title: "Diet focus" },
    { key: "water", title: "Fluid guidance" },
    { key: "lifestyle", title: "Lifestyle plan" },
  ].filter((section) => result.suggestions?.[section.key]?.length);

  return (
    <div className="result-card">
      <section className="result-hero">
        <div className="hero-copy">
          <span className="risk-badge" style={{ color: cfg.color, borderColor: cfg.color, background: cfg.tint }}>
            {cfg.label}
          </span>
          <h2 className="result-headline">{result.probability}% readmission probability</h2>
          <p className="result-message">{result.message}</p>
        </div>

        <div className="risk-meter">
          <div
            className="risk-ring"
            style={{
              background: `conic-gradient(${cfg.bar} ${animVal * 3.6}deg, var(--ring-track) 0deg)`,
            }}
          >
            <div className="risk-core">
              <strong>{result.probability}%</strong>
              <span>Projected risk</span>
            </div>
          </div>
        </div>
      </section>

      <RiskCharts result={result} />

      {assessment && (
        <>
          <section className="result-surface">
            <div className="surface-header">
              <div>
                <p className="section-kicker">Clinical summary</p>
                <h3 className="surface-title">Kidney status and severity context</h3>
              </div>
              <p className="surface-copy">
                Readmission output is paired with stage, albumin burden, and severity cues for review.
              </p>
            </div>

            <div className="metric-grid">
              {metricItems.map((item) => (
                <article className="metric-surface" key={item.label}>
                  <span className="metric-label">{item.label}</span>
                  <strong className="metric-value">{item.value}</strong>
                  <p className="metric-detail">{item.detail}</p>
                  <small className="metric-note">{item.note}</small>
                </article>
              ))}
            </div>

            {kfre?.applicable && (
              <div className="kfre-strip">
                <div>
                  <span className="metric-label">KFRE outlook</span>
                  <strong className="kfre-value">{kfre.risk_2_year}% / {kfre.risk_5_year}%</strong>
                  <p className="metric-detail">
                    Two-year and five-year kidney failure risk, reported separately from readmission risk.
                  </p>
                </div>
                <small className="metric-note">{kfre.calibration}</small>
              </div>
            )}
          </section>

          {(assessment.clinical_flags?.length > 0 || assessment.validation_warnings?.length > 0) && (
            <section className="result-columns">
              {assessment.clinical_flags?.length > 0 && (
                <article className="list-surface">
                  <h3 className="list-title">Clinical flags</h3>
                  <ul className="detail-list">
                    {assessment.clinical_flags.map((flag, index) => (
                      <li key={index}>{flag}</li>
                    ))}
                  </ul>
                </article>
              )}

              {assessment.validation_warnings?.length > 0 && (
                <article className="list-surface warning-surface">
                  <h3 className="list-title">Input warnings</h3>
                  <ul className="detail-list">
                    {assessment.validation_warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </article>
              )}
            </section>
          )}

          <p className="clinical-note">{assessment.note}</p>
        </>
      )}

      {result.suggestions && (
        <section className="result-surface">
          <div className="surface-header">
            <div>
              <p className="section-kicker">Follow-up guidance</p>
              <h3 className="surface-title">Care planning notes</h3>
            </div>
          </div>

          {result.suggestions.urgent && (
            <div className="urgent-banner" style={{ borderColor: cfg.color, color: cfg.color, background: cfg.tint }}>
              {result.suggestions.urgent}
            </div>
          )}

          {suggestionSections.length > 0 && (
            <div className="advice-grid">
              {suggestionSections.map((section) => (
                <article className="advice-surface" key={section.key}>
                  <h4 className="advice-title">{section.title}</h4>
                  <ul className="detail-list">
                    {result.suggestions[section.key].map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {result.clinical_recommendation && (
        <RecommendationCard recommendation={result.clinical_recommendation} />
      )}

      <div className="result-actions">
        <button className="btn-secondary" onClick={onReset}>
          Run Another Case
        </button>
      </div>
    </div>
  );
}
