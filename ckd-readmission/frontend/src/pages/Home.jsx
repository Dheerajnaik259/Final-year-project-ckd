import PatientForm from "../components/PatientForm";
import { predictReadmissionRisk } from "../services/api";
import { useState } from "react";

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
      setError(e.message || "Prediction failed. Check that backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-home">
      <section className="intro-column" style={{ marginBottom: "1.5rem" }}>
        <h1
          className="page-title serif"
          style={{
            fontSize: "2rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: "0.3rem",
            letterSpacing: "-0.01em",
          }}
        >
          New patient intake
        </h1>
        <p className="page-subtitle" style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
          Complete the 3-section clinical profile below to compute readmission risk, KDIGO staging, and KFRE prognosis.
        </p>
      </section>

      <section className="workspace-column">
        {error && <div className="error-banner">{error}</div>}
        <PatientForm onSubmit={handleSubmit} loading={loading} />
      </section>
    </div>
  );
}
