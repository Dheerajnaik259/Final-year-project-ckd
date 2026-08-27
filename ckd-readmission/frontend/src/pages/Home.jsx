import PatientForm from "../components/PatientForm";
import { predictReadmissionRisk } from "../services/api";
import { useState } from "react";

// Security Shield Icon
function SecurityShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

// Bookmark / Save Draft Icon
function SaveDraftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function Home({ user, onResultsReady }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await predictReadmissionRisk(data, user?.id);
      
      try {
        const existing = JSON.parse(localStorage.getItem("ckd_local_prediction_history") || "[]");
        const newRecord = {
          id: result.prediction_id || `local_${Date.now()}`,
          created_at: new Date().toISOString(),
          patient_age: data.age || data.Age || 45,
          patient_gender: data.gender !== undefined ? data.gender : (data.Gender || 0),
          risk_level: result.risk_level,
          probability: result.probability,
          ckd_stage: result.clinical_assessment?.ckd_stage?.code?.replace('G','') || '',
          kdigo_risk: result.clinical_assessment?.kdigo_risk || '',
          severity_score: result.clinical_assessment?.severity_score || 0,
          full_result: result,
          patient_data: data
        };
        localStorage.setItem("ckd_local_prediction_history", JSON.stringify([newRecord, ...existing]));
      } catch (err) {
        console.warn("Failed to store local history snapshot:", err);
      }

      onResultsReady(result);
    } catch (e) {
      setError(e.message || "Prediction failed. Check that backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-prediction-page-container">
      {/* Top Header Row with Security Badge */}
      <header className="prediction-header-row">
        <div className="header-title-lockup">
          <h1 className="prediction-main-title">
            New Prediction
            <span className="title-teal-line" />
          </h1>
          <p className="prediction-sub-desc">
            Enter clinical and laboratory details to calculate readmission risk, KDIGO staging, and KFRE prognosis.
          </p>
        </div>

        <div className="security-badge-card">
          <div className="security-icon-box">
            <SecurityShieldIcon />
          </div>
          <div className="security-text-lockup">
            <span className="security-title">Your data is secure</span>
            <span className="security-sub">All information is encrypted and stored securely.</span>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {/* Main Content Area */}
      <main className="prediction-workspace-body">
        <PatientForm onSubmit={handleSubmit} loading={loading} user={user} />
      </main>

      {/* Bottom Sticky Clinical Judgment Notice */}
      <footer className="clinical-disclaimer-banner">
        <div className="disclaimer-left">
          <div className="disclaimer-icon-box">
            <SecurityShieldIcon />
          </div>
          <div className="disclaimer-text-lockup">
            <span className="disclaimer-title">Clinical decision support, not a replacement for judgment</span>
            <span className="disclaimer-sub">
              This tool provides risk estimates to support clinical decisions and should be used along with clinical judgment.
            </span>
          </div>
        </div>

        <button className="btn-save-draft" onClick={() => alert("Draft saved locally.")}>
          <SaveDraftIcon />
          <span>Save as Draft</span>
        </button>
      </footer>
    </div>
  );
}
