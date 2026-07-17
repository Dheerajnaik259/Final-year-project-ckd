import ResultCard from "../components/ResultCard";

export default function Results({ result, onReset }) {
  const assessment = result.clinical_assessment;
  const highlights = [
    assessment?.ckd_stage && {
      label: "CKD stage",
      value: assessment.ckd_stage.code,
    },
    assessment?.albuminuria && {
      label: "Albuminuria",
      value: assessment.albuminuria.code,
    },
    assessment?.kdigo_risk && {
      label: "KDIGO view",
      value: assessment.kdigo_risk,
    },
  ].filter(Boolean);

  return (
    <div className="page-results">
      <section className="results-banner">
        <div>
          <p className="page-eyebrow">Case review output</p>
          <h1 className="page-title">Prediction results with clinical context.</h1>
          <p className="page-subtitle">
            Readmission probability, kidney staging, and follow-up signals are
            grouped into one review surface for faster interpretation.
          </p>
        </div>

        {highlights.length > 0 && (
          <div className="results-highlights">
            {highlights.map((item) => (
              <article className="highlight-chip" key={item.label}>
                <span className="highlight-label">{item.label}</span>
                <strong className="highlight-value">{item.value}</strong>
              </article>
            ))}
          </div>
        )}
      </section>

      <ResultCard result={result} onReset={onReset} />
    </div>
  );
}
