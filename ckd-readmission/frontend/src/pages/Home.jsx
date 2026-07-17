import { useState } from "react";
import PatientForm from "../components/PatientForm";
import { predictReadmissionRisk } from "../services/api";

export default function Home({ onResultsReady }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await predictReadmissionRisk(data);
      onResultsReady(result);
    } catch (e) {
      setError(e.message || "Prediction failed. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-home">
      <section className="intro-column">
        <p className="page-eyebrow">Clinical intake workspace</p>
        <h1 className="page-title">Sharper CKD intake for readmission review.</h1>
        <p className="page-subtitle">
          Capture the current case once, then move directly into readmission
          scoring, CKD staging, albuminuria context, and guided follow-up cues.
        </p>

        <div className="intro-chips" aria-label="Key capabilities">
          <span className="intro-chip">3-step intake</span>
          <span className="intro-chip">KDIGO context</span>
          <span className="intro-chip">ACR enables KFRE</span>
        </div>
      </section>

      <section className="workspace-column">
        {error && <div className="error-banner">{error}</div>}
        <PatientForm onSubmit={handleSubmit} loading={loading} />
      </section>
    </div>
  );
}
