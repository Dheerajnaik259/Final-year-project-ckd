import ResultCard from "../components/ResultCard";

export default function Results({ result, onReset }) {
  return (
    <div className="page-results">
      <section className="results-banner" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className="page-title serif" style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>
            Patient risk evaluation
          </h1>
          <p className="page-subtitle" style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
            30-day readmission risk model output, KDIGO heatmap classification, and decision support guidance.
          </p>
        </div>
      </section>

      <ResultCard result={result} onReset={onReset} />
    </div>
  );
}
