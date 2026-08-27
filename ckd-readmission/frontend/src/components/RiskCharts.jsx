import { useEffect, useState, useRef } from "react";
import "./RiskCharts.css";

/* ──────────────────────────────────────────────
   SHAP Feature Importance horizontal bar chart
   ────────────────────────────────────────────── */
function SHAPBarChart({ factors }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 120);
    return () => clearTimeout(t);
  }, []);

  if (!factors || factors.length === 0) return null;

  const maxImpact = Math.max(...factors.map((f) => f.impact || f.impact_score || 0));

  const friendlyName = (raw) => {
    const map = {
      SerumCreatinine: "Serum Creatinine",
      serum_creatinine: "Serum Creatinine",
      GFR: "eGFR",
      egfr: "eGFR",
      HemoglobinLevels: "Hemoglobin",
      hemoglobin: "Hemoglobin",
      SystolicBP: "Systolic BP",
      blood_pressure_systolic: "Systolic BP",
      blood_pressure_diastolic: "Diastolic BP",
      DiastolicBP: "Diastolic BP",
      BUNLevels: "BUN",
      ACR: "Urine ACR",
      SerumElectrolytesPotassium: "Potassium",
      ProteinInUrine: "Protein in Urine",
      prior_admissions: "Prior Admissions",
      comorbidity_count: "Comorbidities",
      length_of_stay: "Length of Stay",
      ckd_stage: "CKD Stage",
      age: "Age",
      diabetes: "Diabetes",
      hypertension: "Hypertension",
      gender: "Gender",
    };
    return map[raw] || raw;
  };

  return (
    <div className="chart-shap">
      <div className="chart-inner-header">
        <h4 className="chart-label">Top Clinical Risk Factors</h4>
        <span className="chart-sub">Impact on readmission prediction</span>
      </div>

      <div className="shap-bars">
        {factors.map((factor, idx) => {
          const impact = factor.impact || factor.impact_score || 0;
          const pct = maxImpact > 0 ? (impact / maxImpact) * 100 : 0;

          return (
            <div className="shap-row" key={factor.feature}>
              <span className="shap-feature">{friendlyName(factor.feature)}</span>
              <div className="shap-track">
                <div
                  className={`shap-fill ${animate ? "animate" : ""}`}
                  style={{
                    width: animate ? `${pct}%` : "0%",
                    transitionDelay: `${idx * 80}ms`,
                  }}
                />
              </div>
              <span className="shap-value">{factor.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Risk Probability Gauge (SVG arc)
   ────────────────────────────────────────────── */
function RiskGauge({ probability, riskLevel }) {
  const [animPct, setAnimPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(probability), 200);
    return () => clearTimeout(t);
  }, [probability]);

  const riskColors = {
    High: { main: "#c45443", trail: "rgba(196, 84, 67, 0.18)" },
    Medium: { main: "#bf7d2e", trail: "rgba(191, 125, 46, 0.18)" },
    Low: { main: "#2e8a57", trail: "rgba(46, 138, 87, 0.18)" },
  };

  const colors = riskColors[riskLevel] || riskColors.Low;
  const radius = 80;
  const stroke = 12;
  const circumference = Math.PI * radius; // half-circle
  const dashOffset = circumference - (circumference * animPct) / 100;

  return (
    <div className="chart-gauge">
      <div className="chart-inner-header">
        <h4 className="chart-label">Risk Score</h4>
        <span className="chart-sub">Readmission probability</span>
      </div>

      <svg viewBox="0 0 200 120" className="gauge-svg">
        {/* Trail */}
        <path
          d="M 10 110 A 80 80 0 0 1 190 110"
          fill="none"
          stroke={colors.trail}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d="M 10 110 A 80 80 0 0 1 190 110"
          fill="none"
          stroke={colors.main}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="gauge-arc"
        />
        {/* Text */}
        <text x="100" y="95" textAnchor="middle" className="gauge-pct">
          {probability}%
        </text>
        <text x="100" y="113" textAnchor="middle" className="gauge-risk">
          {riskLevel} Risk
        </text>
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────────────
   KFRE Mini-Bar (2-year vs 5-year)
   ────────────────────────────────────────────── */
function KFREChart({ kfre }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 250);
    return () => clearTimeout(t);
  }, []);

  if (!kfre || !kfre.applicable) return null;

  return (
    <div className="chart-kfre">
      <div className="chart-inner-header">
        <h4 className="chart-label">KFRE Outlook</h4>
        <span className="chart-sub">Kidney failure risk estimate</span>
      </div>

      <div className="kfre-bars">
        <div className="kfre-item">
          <div className="kfre-info">
            <span className="kfre-period">2-Year</span>
            <strong className="kfre-pct">{kfre.risk_2_year}%</strong>
          </div>
          <div className="kfre-track">
            <div
              className={`kfre-fill two-yr ${animate ? "animate" : ""}`}
              style={{ width: animate ? `${Math.min(kfre.risk_2_year, 100)}%` : "0%" }}
            />
          </div>
        </div>

        <div className="kfre-item">
          <div className="kfre-info">
            <span className="kfre-period">5-Year</span>
            <strong className="kfre-pct">{kfre.risk_5_year}%</strong>
          </div>
          <div className="kfre-track">
            <div
              className={`kfre-fill five-yr ${animate ? "animate" : ""}`}
              style={{ width: animate ? `${Math.min(kfre.risk_5_year, 100)}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      <small className="kfre-note">{kfre.calibration} — {kfre.outcome}</small>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Severity Score Radar (mini visual)
   ────────────────────────────────────────────── */
function SeverityMeter({ assessment }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (!assessment) return null;

  const severity = assessment.severity_score || 0;
  const maxSeverity = 20;
  const segments = 10;
  const filled = Math.round((severity / maxSeverity) * segments);

  const getColor = (idx) => {
    if (idx >= filled) return "var(--seg-empty)";
    const ratio = idx / segments;
    if (ratio < 0.35) return "#2e8a57";
    if (ratio < 0.65) return "#bf7d2e";
    return "#c45443";
  };

  return (
    <div className="chart-severity">
      <div className="chart-inner-header">
        <h4 className="chart-label">Severity Index</h4>
        <span className="chart-sub">Clinical severity score</span>
      </div>

      <div className="severity-visual">
        <div className="severity-bar-row">
          {Array.from({ length: segments }).map((_, idx) => (
            <div
              key={idx}
              className={`severity-seg ${animate ? "animate" : ""}`}
              style={{
                backgroundColor: animate ? getColor(idx) : "var(--seg-empty)",
                transitionDelay: `${idx * 50}ms`,
              }}
            />
          ))}
        </div>
        <div className="severity-numbers">
          <span>0</span>
          <strong className="severity-current">{severity} / {maxSeverity}</strong>
          <span>{maxSeverity}</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Combined Charts Section Export
   ────────────────────────────────────────────── */
export default function RiskCharts({ result }) {
  const factors = result.top_clinical_factors || [];
  const assessment = result.clinical_assessment;
  const kfre = assessment?.kfre;

  return (
    <section className="charts-section">
      <div className="charts-heading">
        <p className="section-kicker">Visual analytics</p>
        <h3 className="surface-title">Prediction breakdown</h3>
      </div>

      <div className="charts-grid">
        <RiskGauge probability={result.probability} riskLevel={result.risk_level} />
        <SeverityMeter assessment={assessment} />
        <SHAPBarChart factors={factors} />
        <KFREChart kfre={kfre} />
      </div>
    </section>
  );
}
