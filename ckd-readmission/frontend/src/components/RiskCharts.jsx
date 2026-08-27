import "./RiskCharts.css";

// Risk Colors
const COLOR_SAGE = "#5b8c5a";
const COLOR_OCHRE = "#c98a3a";
const COLOR_BRICK = "#b23a2e";
const COLOR_SPRUCE = "#0f5c53";

/* ═══════════════════════════════════════════════
   1. KDIGO Heatmap Staging Grid (Signature Element)
   ═══════════════════════════════════════════════ */
export function KDIGOHeatmapGrid({ ckdStage = "G3a", albuminuriaCode = "A2" }) {
  // Normalize codes for matching
  const gCode = (ckdStage?.code || ckdStage || "G3a").toUpperCase();
  const aCode = (albuminuriaCode?.code || albuminuriaCode || "A2").toUpperCase();

  const gRows = [
    { code: "G1", label: "≥90" },
    { code: "G2", label: "60–89" },
    { code: "G3a", label: "45–59" },
    { code: "G3b", label: "30–44" },
    { code: "G4", label: "15–29" },
    { code: "G5", label: "<15" },
  ];

  const aCols = [
    { code: "A1", label: "<30" },
    { code: "A2", label: "30–300" },
    { code: "A3", label: ">300" },
  ];

  // Standard KDIGO Matrix Tinting
  const getRiskTint = (g, a) => {
    if ((g === "G1" || g === "G2") && a === "A1") return "cell-green";
    if ((g === "G1" || g === "G2") && a === "A2") return "cell-yellow";
    if (g === "G3a" && a === "A1") return "cell-yellow";
    if ((g === "G1" || g === "G2") && a === "A3") return "cell-orange";
    if (g === "G3a" && a === "A2") return "cell-orange";
    if (g === "G3b" && a === "A1") return "cell-orange";
    return "cell-red";
  };

  return (
    <div className="kdigo-container">
      <div className="chart-title-row">
        <span className="chart-heading">KDIGO Clinical Staging Grid</span>
        <span className="chart-mono-tag">{gCode} / {aCode}</span>
      </div>

      <div className="kdigo-grid">
        {/* Header Column Label */}
        <div className="kdigo-cell header-cell">eGFR \ ACR</div>
        {aCols.map((col) => (
          <div key={col.code} className="kdigo-cell header-cell">
            <strong>{col.code}</strong>
            <small>{col.label}</small>
          </div>
        ))}

        {/* Grid Rows */}
        {gRows.map((row) => (
          <>
            <div key={row.code} className="kdigo-cell row-label-cell">
              <strong>{row.code}</strong>
              <small>{row.label}</small>
            </div>
            {aCols.map((col) => {
              const isMatch =
                (row.code === gCode || (row.code === "G3a" && gCode === "G3")) &&
                col.code === aCode;
              const tintClass = getRiskTint(row.code, col.code);

              return (
                <div
                  key={`${row.code}-${col.code}`}
                  className={`kdigo-cell ${tintClass} ${isMatch ? "selected-cell" : "dimmed-cell"}`}
                >
                  {isMatch && <span className="patient-dot" />}
                  <span className="cell-code">{row.code}-{col.code}</span>
                </div>
              );
            })}
          </>
        ))}
      </div>
      <p className="kdigo-caption mono">
        Patient Stage: <strong>{gCode}</strong> | Albuminuria: <strong>{aCode}</strong>
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   2. Severity Meter (Continuous Segmented Scale)
   ═══════════════════════════════════════════════ */
export function SeverityMeter({ score = 4 }) {
  const maxScore = 20;
  const clampedScore = Math.max(0, Math.min(score, maxScore));
  const fillPercentage = (clampedScore / maxScore) * 100;

  const getMeterColor = () => {
    if (score >= 12) return COLOR_BRICK;
    if (score >= 6) return COLOR_OCHRE;
    return COLOR_SAGE;
  };

  return (
    <div className="severity-meter-box">
      <div className="chart-title-row">
        <span className="chart-heading">Clinical Severity Index</span>
        <span className="chart-mono-tag">{score} / {maxScore} pts</span>
      </div>

      <div className="meter-track">
        <div
          className="meter-fill"
          style={{ width: `${fillPercentage}%`, backgroundColor: getMeterColor() }}
        />
      </div>

      <div className="meter-scale mono">
        <span>0 (Mild)</span>
        <span>10 (Moderate)</span>
        <span>20 (Critical)</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   3. SHAP Feature Importance (Flat Mono Chart)
   ═══════════════════════════════════════════════ */
export function SHAPBarChart({ factors = [] }) {
  const sampleFactors = [
    { feature: "SerumCreatinine", value: "2.1 mg/dL", impact: 0.35 },
    { feature: "PriorAdmissions", value: "2 count", impact: 0.28 },
    { feature: "GFR", value: "45 mL/min", impact: 0.22 },
    { feature: "SystolicBP", value: "145 mmHg", impact: 0.15 },
    { feature: "HemoglobinLevels", value: "11.0 g/dL", impact: 0.11 },
  ];

  const dataList = factors && factors.length > 0 ? factors : sampleFactors;
  const maxImpact = Math.max(...dataList.map((f) => f.impact || 0.1), 0.1);

  const formatName = (key) => {
    const map = {
      SerumCreatinine: "Serum Creatinine",
      serum_creatinine: "Serum Creatinine",
      PriorAdmissions: "Prior Admissions",
      prior_admissions: "Prior Admissions",
      GFR: "eGFR",
      egfr: "eGFR",
      SystolicBP: "Systolic BP",
      blood_pressure_systolic: "Systolic BP",
      HemoglobinLevels: "Hemoglobin",
      hemoglobin: "Hemoglobin",
      BUNLevels: "BUN",
      ACR: "Urine ACR",
    };
    return map[key] || key;
  };

  return (
    <div className="shap-container">
      <div className="chart-title-row">
        <span className="chart-heading">Top Risk Drivers (SHAP Analysis)</span>
        <span className="chart-mono-tag">Feature Weight</span>
      </div>

      <div className="shap-list">
        {dataList.map((item, idx) => {
          const widthPct = Math.min(100, Math.round(((item.impact || 0.1) / maxImpact) * 100));
          return (
            <div key={idx} className="shap-row">
              <span className="shap-label mono">{formatName(item.feature)}</span>
              <div className="shap-track">
                <div className="shap-bar" style={{ width: `${widthPct}%` }} />
              </div>
              <span className="shap-val mono">{item.value !== undefined ? item.value : `${item.impact}`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   4. KFRE Outlook Chart (Flat Dual Bars)
   ═══════════════════════════════════════════════ */
export function KFREChart({ kfreData }) {
  if (!kfreData || !kfreData.applicable) {
    return (
      <div className="kfre-box muted">
        <span className="chart-heading">KFRE 4-Variable Prognosis</span>
        <p className="kfre-note mono">KFRE requires eGFR &lt;60 &amp; valid urine ACR.</p>
      </div>
    );
  }

  const risk2y = kfreData.risk_2_year || 0;
  const risk5y = kfreData.risk_5_year || 0;

  return (
    <div className="kfre-box">
      <div className="chart-title-row">
        <span className="chart-heading">Kidney Failure Risk (KFRE)</span>
        <span className="chart-mono-tag">4-Var Model</span>
      </div>

      <div className="kfre-rows">
        <div className="kfre-row">
          <span className="kfre-label mono">2-Year Progression</span>
          <div className="kfre-track">
            <div className="kfre-bar" style={{ width: `${risk2y}%`, backgroundColor: COLOR_OCHRE }} />
          </div>
          <span className="kfre-val mono">{risk2y}%</span>
        </div>

        <div className="kfre-row">
          <span className="kfre-label mono">5-Year Progression</span>
          <div className="kfre-track">
            <div className="kfre-bar" style={{ width: `${risk5y}%`, backgroundColor: COLOR_BRICK }} />
          </div>
          <span className="kfre-val mono">{risk5y}%</span>
        </div>
      </div>
      <p className="kfre-citation mono">4-VARIABLE KFRE, NON-NORTH AMERICA BASELINE</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main RiskCharts Composition Component
   ═══════════════════════════════════════════════ */
export default function RiskCharts({ result }) {
  const assessment = result?.clinical_assessment || {};
  const ckdStage = assessment.ckd_stage || "G3a";
  const albuminuriaCode = assessment.albuminuria?.code || "A2";
  const severityScore = assessment.severity_score || 4;
  const topFactors = result?.top_clinical_factors || [];
  const kfreData = assessment.kfre || {};

  return (
    <div className="clinical-analytics-grid">
      <KDIGOHeatmapGrid ckdStage={ckdStage} albuminuriaCode={albuminuriaCode} />
      <SeverityMeter score={severityScore} />
      <SHAPBarChart factors={topFactors} />
      <KFREChart kfreData={kfreData} />
    </div>
  );
}
