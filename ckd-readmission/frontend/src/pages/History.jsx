import { useState, useEffect } from "react";
import "./History.css";

const riskColors = {
  High: { color: "#c45443", tint: "rgba(196, 84, 67, 0.12)" },
  Medium: { color: "#c98a3a", tint: "rgba(201, 138, 58, 0.12)" },
  Low: { color: "#33c3a8", tint: "rgba(51, 195, 168, 0.12)" },
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
  if (typeof val === "string") return val;
  return val === 1 ? "Male" : "Female";
}

export default function History({ user, onBack, onNewPredict, onViewDetail }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      let serverRecords = [];
      try {
        let url = `${API_URL}/history?limit=50`;
        if (user?.id) {
          url += `&user_id=${user.id}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          serverRecords = data.predictions || [];
        }
      } catch (e) {
        console.warn("Could not fetch remote history, using local history fallback:", e);
      }

      // Merge with local storage history snapshot
      let localRecords = [];
      try {
        localRecords = JSON.parse(localStorage.getItem("ckd_local_prediction_history") || "[]");
      } catch (err) {
        localRecords = [];
      }

      const mergedMap = new Map();
      [...serverRecords, ...localRecords].forEach((item) => {
        if (item && item.id && !mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
        }
      });

      const combined = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );

      setPredictions(combined);
      setLoading(false);
    };
    fetchHistory();
  }, [API_URL, user]);

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
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button className="btn-outline" onClick={onBack}>
            ← Back to Dashboard
          </button>
          <button className="btn-solid" onClick={onNewPredict || onBack}>
            New Prediction
          </button>
        </div>
      </section>

      {loading && (
        <div className="history-status">
          <p className="mono" style={{ color: "var(--text-faint)" }}>Loading prediction archive…</p>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {!loading && !error && predictions.length === 0 && (
        <div className="history-empty glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
          <h3 className="serif" style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>No archive records found</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Run your first patient intake prediction to populate the audit record.
          </p>
          <button className="btn-solid" onClick={onNewPredict || onBack}>
            Run First Intake
          </button>
        </div>
      )}

      {!loading && predictions.length > 0 && (
        <section className="history-surface glass-panel">
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
