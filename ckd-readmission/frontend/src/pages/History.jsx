import { useState, useEffect } from "react";
import "./History.css";

const riskColors = {
  High: { color: "#c45443", tint: "rgba(196, 84, 67, 0.10)" },
  Medium: { color: "#bf7d2e", tint: "rgba(191, 125, 46, 0.12)" },
  Low: { color: "#2e8a57", tint: "rgba(46, 138, 87, 0.12)" },
};

function formatDate(iso) {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${mins}`;
}

function genderLabel(val) {
  return val === 1 ? "Male" : "Female";
}

export default function History({ onBack, onViewDetail }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/history?limit=50`);
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        setPredictions(data.predictions || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [API_URL]);

  return (
    <div className="page-history">
      <section className="history-banner">
        <div>
          <p className="page-eyebrow">Prediction archive</p>
          <h1 className="page-title">Case history and past results.</h1>
          <p className="page-subtitle">
            Every prediction is stored automatically. Review past cases, track
            trends, and compare risk levels over time.
          </p>
        </div>
        <button className="btn-secondary" onClick={onBack}>
          New Prediction
        </button>
      </section>

      {loading && (
        <div className="history-status">
          <div className="history-spinner" />
          <p>Loading prediction history…</p>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {!loading && !error && predictions.length === 0 && (
        <div className="history-empty">
          <div className="empty-icon">📋</div>
          <h3>No predictions yet</h3>
          <p>Run your first prediction and it will appear here automatically.</p>
          <button className="btn-primary" onClick={onBack}>
            Run First Prediction
          </button>
        </div>
      )}

      {!loading && predictions.length > 0 && (
        <section className="history-surface">
          <div className="history-header-row">
            <span className="col-date">Date</span>
            <span className="col-patient">Patient</span>
            <span className="col-risk">Risk Level</span>
            <span className="col-prob">Probability</span>
            <span className="col-stage">CKD Stage</span>
            <span className="col-kdigo">KDIGO</span>
            <span className="col-action" />
          </div>

          {predictions.map((p) => {
            const risk = riskColors[p.risk_level] || riskColors.Low;
            return (
              <div className="history-row" key={p.id}>
                <span className="col-date">{formatDate(p.created_at)}</span>
                <span className="col-patient">
                  {genderLabel(p.patient_gender)}, {p.patient_age}y
                </span>
                <span className="col-risk">
                  <span
                    className="risk-pill"
                    style={{
                      color: risk.color,
                      borderColor: risk.color,
                      background: risk.tint,
                    }}
                  >
                    {p.risk_level}
                  </span>
                </span>
                <span className="col-prob">
                  <strong>{p.probability}%</strong>
                </span>
                <span className="col-stage">{p.ckd_stage || "—"}</span>
                <span className="col-kdigo">{p.kdigo_risk || "—"}</span>
                <span className="col-action">
                  <button
                    className="btn-detail"
                    onClick={() => onViewDetail && onViewDetail(p.id)}
                    title="View full details"
                  >
                    View
                  </button>
                </span>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
