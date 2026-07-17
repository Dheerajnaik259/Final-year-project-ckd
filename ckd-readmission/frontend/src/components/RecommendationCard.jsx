import "./RecommendationCard.css";
import { useState } from "react";

const urgencyConfig = {
  Critical: {
    color: "#c45443",
    bgColor: "rgba(196, 84, 67, 0.08)",
    borderColor: "#c45443",
    icon: "!",
  },
  High: {
    color: "#bf7d2e",
    bgColor: "rgba(191, 125, 46, 0.08)",
    borderColor: "#bf7d2e",
    icon: "!",
  },
  Medium: {
    color: "#d4a500",
    bgColor: "rgba(212, 165, 0, 0.08)",
    borderColor: "#d4a500",
    icon: "i",
  },
  Low: {
    color: "#2e8a57",
    bgColor: "rgba(46, 138, 87, 0.08)",
    borderColor: "#2e8a57",
    icon: "OK",
  },
};

export default function RecommendationCard({ recommendation }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!recommendation) {
    return null;
  }

  const config = urgencyConfig[recommendation.urgency_level] || urgencyConfig.Medium;

  return (
    <section className="recommendation-card" style={{ borderLeft: `4px solid ${config.borderColor}` }}>
      <div className="recommendation-header">
        <div className="header-content">
          <span
            className="urgency-badge"
            style={{
              backgroundColor: config.bgColor,
              color: config.color,
              borderColor: config.borderColor,
            }}
          >
            {config.icon} {recommendation.urgency_level} Priority
          </span>
          <h3 className="recommendation-title">Clinical Recommendation</h3>
        </div>
        <button
          className="expand-btn"
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          aria-label="Toggle recommendation details"
        >
          {isExpanded ? "Hide" : "Show"}
        </button>
      </div>

      {isExpanded && (
        <div className="recommendation-content">
          <div className="recommendation-section summary-section">
            <p className="summary-text">{recommendation.summary}</p>
          </div>

          {recommendation.immediate_actions?.length > 0 && (
            <div className="recommendation-section">
              <h4 className="section-title">Immediate actions</h4>
              <ul className="actions-list">
                {recommendation.immediate_actions.map((action, index) => (
                  <li key={index} className="action-item">
                    <span className="action-marker">-</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendation.lifestyle_advice?.length > 0 && (
            <div className="recommendation-section">
              <h4 className="section-title">Lifestyle advice</h4>
              <ul className="advice-list">
                {recommendation.lifestyle_advice.map((advice, index) => (
                  <li key={index} className="advice-item">
                    <span className="advice-marker">-</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendation.follow_up && (
            <div className="recommendation-section follow-up-section">
              <h4 className="section-title">Follow-up plan</h4>
              <p className="follow-up-text">{recommendation.follow_up}</p>
            </div>
          )}

          <div className="recommendation-disclaimer">
            <p>
              <strong>Medical disclaimer:</strong> These recommendations are for clinical decision support only and do
              not replace professional medical advice. Always consult with a qualified nephrologist or healthcare
              provider before making any treatment or lifestyle changes.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
