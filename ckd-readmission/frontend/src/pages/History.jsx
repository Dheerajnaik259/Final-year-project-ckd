import { useState, useEffect } from "react";
import "./History.css";

const riskColors = {
  High: { color: "#b23a2e", tint: "rgba(178, 58, 46, 0.10)" },
  Medium: { color: "#c98a3a", tint: "rgba(201, 138, 58, 0.10)" },
  Low: { color: "#5b8c5a", tint: "rgba(91, 140, 90, 0.10)" },
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
          <h1 className="page-title serif" style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>
            Prediction archive
          </h1>
          <p className="page-subtitle" style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
            Audit trail of computed clinical predictions, KDIGO staging, and risk profiles.
          </p>
        </div>
        <button className="btn-outline" onClick={onBack}>
          New Patient Intake
        </button>
      </section>

      {loading && (
        <div className="history-status">
          <p className="mono" style={{ color: "var(--text-faint)" }}>Loading prediction archive…</p>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {!loading && !error && predictions.length === 0 && (
        <div className="history-empty">
          <h3 className="serif">No archive records found</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Run your first patient intake prediction to populate the audit record.
          </p>
          <button className="btn-solid" onClick={onBack} style={{ marginTop: "0.5rem" }}>
            Run First Intake
          </button>
        </div>
      )}

      {!loading && predictions.length > 0 && (
        <section className="history-surface">
          <div className="history-header-row">
            <span className="col-date mono">Date &amp; Time</span>
            <span className="col-patient">Patient</span>
            <span className="col-risk">Risk Level</span>
            <span className="col-prob mono num-col">Readmission Risk</span>
            <span className="col-stage mono num-col">CKD Stage</span>
            <span className="col-kdigo mono">KDIGO</span>
            <span className="col-action" />
          </div>

          {predictions.map((p) => {
            const risk = riskColors[p.risk_level] || riskColors.Low;
            return (
              <div className="history-row" key={p.id}>
                <span className="col-date mono">{formatDate(p.created_at)}</span>
                <span className="col-patient">
                  {genderLabel(p.patient_gender)}, {p.patient_age}y
                </span>
                <span className="col-risk">
                  <span
                    className="risk-badge-flat"
                    style={{
                      color: risk.color,
                      borderColor: risk.color,
                      background: risk.tint,
                    }}
                  >
                    {p.risk_level}
                  </span>
                </span>
                <span className="col-prob mono num-col">
                  <strong>{p.probability}%</strong>
                </span>
                <span className="col-stage mono num-col">{p.ckd_stage ? `G${p.ckd_stage}` : "—"}</span>
                <span className="col-kdigo mono">{p.kdigo_risk || "—"}</span>
                <span className="col-action">
                  <button
                    className="btn-outline"
                    style={{ padding: "0.25rem 0.65rem", fontSize: "0.8rem" }}
                    onClick={() => onViewDetail && onViewDetail(p.id)}
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
