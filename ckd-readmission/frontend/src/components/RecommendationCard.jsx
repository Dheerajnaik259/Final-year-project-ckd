import "./RecommendationCard.css";
import { useState } from "react";

const urgencyConfig = {
  Critical: { color: "#7a1f1f", tint: "rgba(122, 31, 31, 0.08)", border: "#7a1f1f" },
  High: { color: "#b23a2e", tint: "rgba(178, 58, 46, 0.08)", border: "#b23a2e" },
  Medium: { color: "#c98a3a", tint: "rgba(201, 138, 58, 0.08)", border: "#c98a3a" },
  Low: { color: "#5b8c5a", tint: "rgba(91, 140, 90, 0.08)", border: "#5b8c5a" },
};

export default function RecommendationCard({ recommendation }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!recommendation) return null;

  const config = urgencyConfig[recommendation.urgency_level] || urgencyConfig.Medium;

  return (
    <section className="recommendation-sheet">
      <div className="recommendation-header">
        <div className="header-left">
          <span
            className="urgency-badge"
            style={{
              backgroundColor: config.tint,
              color: config.color,
              borderColor: config.border,
            }}
          >
            {recommendation.urgency_level} Priority
          </span>
          <h3 className="section-title-serif" style={{ margin: 0 }}>
            Clinical Recommendation
          </h3>
        </div>

        <button
          className="btn-outline"
          style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}
          type="button"
          onClick={() => setIsExpanded((curr) => !curr)}
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {isExpanded && (
        <div className="recommendation-body">
          <p className="summary-paragraph">{recommendation.summary}</p>

          {recommendation.immediate_actions?.length > 0 && (
            <div className="rec-section">
              <h4 className="rec-section-title">Immediate Actions</h4>
              <ul className="rec-list">
                {recommendation.immediate_actions.map((action, idx) => (
                  <li key={idx}>• {action}</li>
                ))}
              </ul>
            </div>
          )}

          {recommendation.lifestyle_advice?.length > 0 && (
            <div className="rec-section">
              <h4 className="rec-section-title">Lifestyle &amp; Dietary Guidance</h4>
              <ul className="rec-list">
                {recommendation.lifestyle_advice.map((advice, idx) => (
                  <li key={idx}>• {advice}</li>
                ))}
              </ul>
            </div>
          )}

          {recommendation.follow_up && (
            <div className="rec-section">
              <h4 className="rec-section-title">Follow-up Protocol</h4>
              <p className="rec-text">{recommendation.follow_up}</p>
            </div>
          )}

          <div className="medical-disclaimer-box">
            <p>
              <strong>Decision Support Disclaimer:</strong> Recommendations are calculated for
              clinical reference and institutional protocol review. Always consult a qualified
              nephrologist before altering treatment plans.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
