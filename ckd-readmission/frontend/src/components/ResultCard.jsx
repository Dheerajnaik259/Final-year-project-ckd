import { useState } from "react";
import "./ResultCard.css";
import RecommendationCard from "./RecommendationCard";
import RiskCharts from "./RiskCharts";

// SVG Icons matching reference design
function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function KidneyIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 35 20 C 15 20 10 42 20 65 C 26 78 38 88 50 88 C 56 88 53 70 48 60 C 43 50 43 36 50 28 C 54 22 50 20 35 20 Z"
        fill="currentColor"
      />
      <path
        d="M 65 20 C 85 20 90 42 80 65 C 74 78 62 88 50 88 C 44 88 47 70 52 60 C 57 50 57 36 50 28 C 46 22 50 20 65 20 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function BpMonitorIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <line x1="7" y1="20" x2="17" y2="20" />
      <line x1="12" y1="16" x2="12" y2="20" />
      <circle cx="9" cy="10" r="1.5" />
      <circle cx="15" cy="10" r="1.5" />
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function SaltIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 3h6l1 4H8l1-4z" />
      <path d="M6 8h12l1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L6 8z" />
      <circle cx="10" cy="13" r="0.5" fill="currentColor" />
      <circle cx="14" cy="13" r="0.5" fill="currentColor" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 4v16M17 8v8M9 9v6M5 12v0" />
    </svg>
  );
}

function WaterIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

// Semicircle Arc Gauge Component
function SemicircleGauge({ probability, color }) {
  const radius = 75;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // 180 degrees arc
  const offset = circumference - (probability / 100) * circumference;

  return (
    <div className="gauge-wrap">
      <svg width="180" height="105" viewBox="0 0 180 105">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>

        {/* Background Track Arc */}
        <path
          d="M 15 95 A 75 75 0 0 1 165 95"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Dynamic Filled Arc */}
        <path
          d="M 15 95 A 75 75 0 0 1 165 95"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
        />
      </svg>
      <div className="gauge-center-text">
        <span className="gauge-percent-num">{probability}%</span>
      </div>
      <div className="gauge-scale-labels">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export default function ResultCard({ result, onReset }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!result) return null;

  const prob = result.probability || 0;
  const riskLevel = result.risk_level || "Low";

  // Color config based on risk level
  const isHigh = riskLevel === "High";
  const isMod = riskLevel === "Medium" || riskLevel === "Moderate";
  const themeColor = isHigh ? "#ef4444" : isMod ? "#f59e0b" : "#10b981";
  const riskLabel = isHigh ? "High Risk" : isMod ? "Moderate Risk" : "Low Risk";

  const assessment = result.clinical_assessment || {};
  const patientData = result.patient_data || {};

  // Extract key numbers
  const egfr = patientData.GFR || patientData.gfr || 60;
  const sysBp = patientData.SystolicBP || patientData.systolic_bp || 130;
  const diaBp = patientData.DiastolicBP || patientData.diastolic_bp || 85;
  const acrCode =
    typeof assessment.albuminuria === "object"
      ? assessment.albuminuria?.code
      : assessment.albuminuria || "A2";
  const ckdStageCode =
    typeof assessment.ckd_stage === "object"
      ? assessment.ckd_stage?.code
      : assessment.ckd_stage || "G2";

  // Determine badges dynamically
  const egfrBadge =
    egfr >= 90
      ? "Normal"
      : egfr >= 60
        ? "Mildly decreased"
        : egfr >= 30
          ? "Moderately decreased"
          : "Severely decreased";
  const egfrBadgeClass = egfr >= 90 ? "normal" : egfr >= 60 ? "mild" : "warning";

  const acrBadge =
    acrCode === "A1" ? "Normal" : acrCode === "A2" ? "Moderately increased" : "Severely increased";
  const acrBadgeClass = acrCode === "A1" ? "normal" : "warning";

  const bpBadge = sysBp > 120 || diaBp > 80 ? "Above target" : "Optimal";
  const bpBadgeClass = sysBp > 120 || diaBp > 80 ? "warning" : "normal";

  const ckdBadge = ckdStageCode.startsWith("G1")
    ? "Normal"
    : ckdStageCode.startsWith("G2")
      ? "Mild"
      : "Moderate";

  const handlePrintSave = () => {
    window.print();
  };

  return (
    <div className="summary-page-layout">
      {/* Top Header Row */}
      <header className="summary-header-row">
        <div className="header-title-block">
          <button className="back-link-btn" onClick={onReset}>
            <ArrowLeftIcon />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="summary-main-title">Your Kidney Health Summary</h1>
          <p className="summary-sub-desc">
            Here is your risk of hospital readmission within the next 30 days and what you can do to
            stay healthy.
          </p>
        </div>

        {/* Security Badge Card */}
        <div className="summary-security-card">
          <div className="security-shield-icon">
            <ShieldIcon />
          </div>
          <div className="security-text-group">
            <strong className="sec-title">Your data is secure</strong>
            <span className="sec-sub">All information is encrypted and stored securely.</span>
          </div>
        </div>
      </header>

      {/* Optional Blank Defaults Warning Banner */}
      {result.has_blank_defaults && (
        <div className="summary-blank-notice-bar">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            <strong>Clinical Note:</strong> Optional lab fields left blank were filled using
            standard baseline population reference values. Readmission risk estimates may vary if
            actual lab values differ.
          </span>
        </div>
      )}

      {/* Main 2-Column Hero Row */}
      <section className="hero-risk-grid">
        {/* Left Card: Readmission Risk Gauge */}
        <div className="hero-risk-card">
          <div className="card-top-head">
            <span className="card-micro-label">READMISSION RISK ⓘ</span>
          </div>

          <div className="hero-risk-body">
            <div className="risk-left-text">
              <h2 className="risk-level-heading" style={{ color: themeColor }}>
                {riskLabel}
              </h2>
              <p className="risk-chance-subtitle">
                <strong>{prob}%</strong> chance of readmission within 30 days
              </p>
              <div className="care-reassurance-pill">
                <HeartIcon />
                <span>With care and monitoring, you can reduce this risk.</span>
              </div>
            </div>

            {/* Arc Gauge */}
            <SemicircleGauge probability={prob} color={themeColor} />
          </div>
        </div>

        {/* Right Card: What this means */}
        <div className="hero-meaning-card">
          <div className="card-top-head">
            <DocumentIcon />
            <span className="card-micro-label">What this means</span>
          </div>
          <div className="meaning-card-content">
            <p className="meaning-main-text">
              {isHigh
                ? "Your results indicate a high chance of hospital readmission within the next 30 days. Close medical supervision and immediate follow-up with your nephrology team are strongly advised."
                : isMod
                  ? "Your results suggest a moderate chance of being readmitted to the hospital in the next 30 days."
                  : "Your results indicate a low chance of hospital readmission in the next 30 days. Maintain your current care regimen and continue regular health check-ups."}
            </p>
            <p className="meaning-sub-text">
              Following your treatment plan, taking medicines regularly, and making healthy
              lifestyle choices can help improve your outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Key Health Numbers & Things to Pay Attention To */}
      <section className="numbers-attention-grid">
        {/* Left: Key Health Numbers Grid */}
        <div className="key-numbers-card">
          <h3 className="section-card-title">Key Health Numbers ⓘ</h3>
          <div className="numbers-sub-grid">
            {/* 1. Kidney Function */}
            <div className="number-stat-box">
              <div className="stat-head-label">
                <span>Kidney Function ⓘ</span>
              </div>
              <span className="stat-large-val teal">{egfr}</span>
              <span className="stat-unit-text">eGFR (mL/min/1.73 m²)</span>
              <span className={`stat-status-pill ${egfrBadgeClass}`}>{egfrBadge}</span>
            </div>

            {/* 2. Protein in Urine */}
            <div className="number-stat-box">
              <div className="stat-head-label">
                <span>Protein in Urine ⓘ</span>
              </div>
              <span className="stat-large-val amber">{acrCode}</span>
              <span className="stat-unit-text">Albuminuria</span>
              <span className={`stat-status-pill ${acrBadgeClass}`}>{acrBadge}</span>
            </div>

            {/* 3. Blood Pressure */}
            <div className="number-stat-box">
              <div className="stat-head-label">
                <span>Blood Pressure ⓘ</span>
              </div>
              <span className="stat-large-val red">
                {sysBp}/{diaBp}
              </span>
              <span className="stat-unit-text">mmHg</span>
              <span className={`stat-status-pill ${bpBadgeClass}`}>{bpBadge}</span>
            </div>

            {/* 4. Stage */}
            <div className="number-stat-box">
              <div className="stat-head-label">
                <span>Stage ⓘ</span>
              </div>
              <span className="stat-large-val blue">{ckdStageCode}</span>
              <span className="stat-unit-text">Mildly decreased kidney function</span>
              <span className="stat-status-pill mild">{ckdBadge}</span>
            </div>
          </div>
        </div>

        {/* Right: Things to Pay Attention To */}
        <div className="attention-card">
          <h3 className="section-card-title">Things to Pay Attention To ⓘ</h3>
          <div className="attention-items-list">
            <div className="attention-item-row">
              <div className="att-icon-box red">
                <DropletIcon />
              </div>
              <div className="att-text-lockup">
                <strong className="att-title">High potassium</strong>
                <span className="att-desc">Your level is higher than normal.</span>
              </div>
            </div>

            <div className="attention-item-row">
              <div className="att-icon-box red">
                <BpMonitorIcon />
              </div>
              <div className="att-text-lockup">
                <strong className="att-title">High blood pressure</strong>
                <span className="att-desc">Your BP is above the target.</span>
              </div>
            </div>

            <div className="attention-item-row">
              <div className="att-icon-box blue">
                <SaltIcon />
              </div>
              <div className="att-text-lockup">
                <strong className="att-title">Low sodium</strong>
                <span className="att-desc">Your sodium level is low.</span>
              </div>
            </div>
          </div>

          <div className="attention-footer-note">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Please follow your doctor's advice and the tips below.</span>
          </div>
        </div>
      </section>

      {/* What You Can Do Section (5 Actionable Cards) */}
      <section className="what-you-can-do-card">
        <h3 className="section-card-title">What You Can Do</h3>
        <p className="card-sub-intro">
          Simple steps that can help you feel better and lower your risk.
        </p>

        <div className="actionable-tiles-row">
          {/* Tile 1 */}
          <div className="action-tile-item">
            <div className="action-tile-icon-wrap teal">
              <BpMonitorIcon />
            </div>
            <strong className="action-tile-heading">Check Blood Pressure</strong>
            <span className="action-tile-desc">Monitor at home regularly.</span>
            <span className="action-pill-target green">Target: &lt;130/80 mmHg</span>
          </div>

          {/* Tile 2 */}
          <div className="action-tile-item">
            <div className="action-tile-icon-wrap amber">
              <SaltIcon />
            </div>
            <strong className="action-tile-heading">Limit Salt</strong>
            <span className="action-tile-desc">Eat less than 2.3g of salt per day.</span>
            <span className="action-pill-target amber">Less salt, better health</span>
          </div>

          {/* Tile 3 */}
          <div className="action-tile-item">
            <div className="action-tile-icon-wrap orange">
              <KidneyIcon />
            </div>
            <strong className="action-tile-heading">Follow Kidney-Friendly Diet</strong>
            <span className="action-tile-desc">
              Eat balanced meals. Limit potassium if advised.
            </span>
            <span className="action-pill-target teal">Eat smart</span>
          </div>

          {/* Tile 4 */}
          <div className="action-tile-item">
            <div className="action-tile-icon-wrap cyan">
              <ActivityIcon />
            </div>
            <strong className="action-tile-heading">Stay Active</strong>
            <span className="action-tile-desc">Walk or exercise for 30 minutes daily.</span>
            <span className="action-pill-target cyan">Keep moving</span>
          </div>

          {/* Tile 5 */}
          <div className="action-tile-item">
            <div className="action-tile-icon-wrap blue">
              <WaterIcon />
            </div>
            <strong className="action-tile-heading">Stay Hydrated</strong>
            <span className="action-tile-desc">
              Drink enough water unless restricted by your doctor.
            </span>
            <span className="action-pill-target blue">Stay hydrated</span>
          </div>
        </div>
      </section>

      {/* Bottom Banners Row */}
      <section className="bottom-banners-grid">
        {/* Banner 1 */}
        <div className="banner-card-teal">
          <div className="banner-icon-box">
            <ShieldIcon />
          </div>
          <div className="banner-text-content">
            <h4 className="banner-title">Small changes today, better health tomorrow.</h4>
            <p className="banner-desc">
              Working together with your healthcare team can help you stay healthy and avoid
              complications.
            </p>
          </div>
        </div>

        {/* Banner 2 */}
        <div className="banner-card-purple">
          <div className="banner-icon-box purple">
            <CalendarIcon />
          </div>
          <div className="banner-text-content">
            <h4 className="banner-title">Keep Your Follow-up Appointments</h4>
            <p className="banner-desc">Regular check-ups and tests help catch problems early.</p>
          </div>
        </div>
      </section>

      {/* Advanced Clinical Analytics Toggle Button & Section */}
      <div className="advanced-analytics-toggle-bar">
        <button
          type="button"
          className="btn-toggle-advanced"
          onClick={() => setShowAdvanced((prev) => !prev)}
        >
          {showAdvanced
            ? "Hide Institutional Clinical Analytics"
            : "View Institutional Clinical Analytics & KDIGO Matrix"}
        </button>
      </div>

      {showAdvanced && (
        <div className="advanced-clinical-section">
          <RiskCharts result={result} />
          {result.clinical_recommendation && (
            <RecommendationCard recommendation={result.clinical_recommendation} />
          )}
        </div>
      )}

      {/* Footer Action Buttons */}
      <footer className="summary-footer-actions">
        <button type="button" className="btn-back-dash" onClick={onReset}>
          <ArrowLeftIcon />
          <span>Back to Dashboard</span>
        </button>
        <button type="button" className="btn-save-summary-gradient" onClick={handlePrintSave}>
          <DownloadIcon />
          <span>Save Summary</span>
        </button>
      </footer>

      <div className="disclaimer-bottom-note">
        <p>
          This prediction is based on the information provided and is not a replacement for medical
          advice. Always consult your nephrologist for personalized care.
        </p>
      </div>
    </div>
  );
}
