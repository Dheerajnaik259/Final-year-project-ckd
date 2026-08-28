import "./PatientForm.css";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import {
  FIELD_RANGES,
  requiredFields,
  validateFields,
  validatePatientForm,
} from "../validation/patientSchema";

// Field Specific SVG Icons
function CalendarIcon() {
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
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function SexGenderIcon() {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
    </svg>
  );
}

function HeartPulseIcon() {
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
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}

function BmiScaleIcon() {
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
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M12 7v2" />
    </svg>
  );
}

function MedicalBagIcon() {
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
      <rect width="18" height="14" x="3" y="7" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M12 11v4M10 13h4" />
    </svg>
  );
}

function FlaskIcon() {
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
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55A2 2 0 0 0 6.516 23h10.968a2 2 0 0 0 1.796-2.45L14.21 10.423a2 2 0 0 1-.21-.896V2" />
      <line x1="8.5" y1="2" x2="15.5" y2="2" />
    </svg>
  );
}

function DropletIcon() {
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
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function InfoCircleIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function LightbulbIcon() {
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
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function UserCircleIcon() {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ClipboardListIcon() {
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
      <rect width="16" height="18" x="4" y="3" rx="2" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  );
}

// Get icon component based on field key
function getFieldIcon(key) {
  switch (key) {
    case "Age":
    case "LengthOfStay":
      return <CalendarIcon />;
    case "Gender":
      return <SexGenderIcon />;
    case "SystolicBP":
    case "DiastolicBP":
      return <HeartPulseIcon />;
    case "BMI":
      return <BmiScaleIcon />;
    case "ComorbidityCount":
    case "PriorAdmissions":
      return <MedicalBagIcon />;
    case "SerumCreatinine":
    case "GFR":
    case "ACR":
    case "ProteinInUrine":
      return <FlaskIcon />;
    case "BUNLevels":
    case "SerumElectrolytesPotassium":
    case "SerumElectrolytesSodium":
    case "HemoglobinLevels":
      return <DropletIcon />;
    default:
      return <MedicalBagIcon />;
  }
}

const fields = [
  // Step 1: Baseline Demographics & Vitals
  { key: "Age", label: "Age", type: "number", placeholder: "45", unit: "years" },
  {
    key: "Gender",
    label: "Sex",
    type: "select",
    options: [
      { value: 0, label: "Female" },
      { value: 1, label: "Male" },
    ],
  },
  {
    key: "SystolicBP",
    label: "Systolic BP",
    type: "number",
    placeholder: "120",
    unit: "mmHg",
    refRange: "normal < 120",
  },
  {
    key: "DiastolicBP",
    label: "Diastolic BP",
    type: "number",
    placeholder: "80",
    unit: "mmHg",
    refRange: "normal < 80",
  },
  {
    key: "BMI",
    label: "BMI",
    type: "number",
    placeholder: "24.5",
    unit: "kg/m²",
    refRange: "normal 18.5 – 24.9",
  },
  {
    key: "ComorbidityCount",
    label: "Comorbidity count",
    type: "number",
    placeholder: "2",
    unit: "conditions",
  },

  // Step 2: Renal & Metabolic Lab Panel
  {
    key: "SerumCreatinine",
    label: "Serum creatinine",
    type: "number",
    placeholder: "1.2",
    unit: "mg/dL",
    refRange: "normal 0.6 – 1.2",
  },
  {
    key: "GFR",
    label: "eGFR",
    type: "number",
    placeholder: "60",
    unit: "mL/min/1.73m²",
    refRange: "normal ≥ 90",
  },
  {
    key: "BUNLevels",
    label: "BUN",
    type: "number",
    placeholder: "18",
    unit: "mg/dL",
    refRange: "normal 7 – 20",
  },
  {
    key: "ACR",
    label: "Urine ACR",
    type: "number",
    placeholder: "30",
    unit: "mg/g",
    refRange: "normal < 30",
  },
  {
    key: "SerumElectrolytesPotassium",
    label: "Serum potassium",
    type: "number",
    placeholder: "4.0",
    unit: "mEq/L",
    refRange: "normal 3.5 – 5.0",
  },
  {
    key: "SerumElectrolytesSodium",
    label: "Serum sodium",
    type: "number",
    placeholder: "138",
    unit: "mEq/L",
    refRange: "normal 135 – 145",
  },
  {
    key: "HemoglobinLevels",
    label: "Hemoglobin",
    type: "number",
    placeholder: "13.5",
    unit: "g/dL",
    refRange: "normal 12.0 – 17.5",
  },
  {
    key: "ProteinInUrine",
    label: "Protein in urine",
    type: "number",
    placeholder: "0.1",
    unit: "g/day",
    refRange: "normal < 0.15",
  },

  // Step 3: Clinical History & Risk Factors
  {
    key: "PriorAdmissions",
    label: "Prior admissions",
    type: "number",
    placeholder: "1",
    unit: "count",
  },
  { key: "LengthOfStay", label: "Length of stay", type: "number", placeholder: "5", unit: "days" },
  { key: "Diabetes", label: "Diabetes history", type: "toggle" },
  { key: "Hypertension", label: "Hypertension history", type: "toggle" },
  { key: "Smoking", label: "Smoking history", type: "toggle" },
  { key: "FamilyHistoryKidneyDisease", label: "Family kidney history", type: "toggle" },
];

const stepMeta = [
  { title: "Demographics & Vitals", sub: "Basic patient information" },
  { title: "Laboratory Panel", sub: "Lab results & values" },
  { title: "History & Risk Factors", sub: "Clinical history & lifestyle" },
];

const defaultValues = {
  Age: "",
  Gender: 0,
  BMI: "",
  SystolicBP: "",
  DiastolicBP: "",
  Hypertension: 0,
  SerumCreatinine: "",
  GFR: "",
  BUNLevels: "",
  HbA1c: "",
  FastingBloodSugar: "",
  HemoglobinLevels: "",
  ProteinInUrine: "",
  SerumElectrolytesPotassium: "",
  SerumElectrolytesSodium: "",
  CholesterolTotal: "",
  Smoking: 0,
  Diabetes: 0,
  PriorAdmissions: "",
  LengthOfStay: "",
  ComorbidityCount: "",
  FamilyHistoryKidneyDisease: 0,
  ACR: "",
};

const numericValue = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  return parseFloat(value);
};

const deriveCkdStage = (gfrValue) => {
  const gfr = numericValue(gfrValue);
  if (gfr >= 90) return 1;
  if (gfr >= 60) return 2;
  if (gfr >= 30) return 3;
  if (gfr >= 15) return 4;
  return 5;
};

const defaultFallback = {
  Age: 45,
  Gender: 0,
  SystolicBP: 120,
  DiastolicBP: 80,
  BMI: 24.5,
  ComorbidityCount: 2,
  SerumCreatinine: 1.2,
  GFR: 60,
  BUNLevels: 18,
  ACR: 30,
  SerumElectrolytesPotassium: 4.0,
  SerumElectrolytesSodium: 138,
  HemoglobinLevels: 13.5,
  ProteinInUrine: 0.1,
  PriorAdmissions: 1,
  LengthOfStay: 5,
};

const toPredictionPayload = (formData) => {
  const data = { ...formData };
  let blankCount = 0;
  Object.keys(defaultFallback).forEach((key) => {
    if (data[key] === "" || data[key] === null || data[key] === undefined) {
      data[key] = defaultFallback[key];
      blankCount++;
    } else {
      data[key] = numericValue(data[key]);
    }
  });

  return {
    ...data,
    age: data.Age,
    gender: data.Gender,
    blood_pressure_systolic: data.SystolicBP,
    blood_pressure_diastolic: data.DiastolicBP,
    serum_creatinine: data.SerumCreatinine,
    egfr: data.GFR,
    hemoglobin: data.HemoglobinLevels,
    diabetes: data.Diabetes || 0,
    hypertension: data.Hypertension || 0,
    prior_admissions: data.PriorAdmissions,
    length_of_stay: data.LengthOfStay,
    comorbidity_count: data.ComorbidityCount,
    ckd_stage: deriveCkdStage(data.GFR),
    has_blank_defaults: blankCount > 0,
  };
};

export default function PatientForm({ onSubmit, loading, user }) {
  const [form, setForm] = useState(defaultValues);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!user?.id) return;
    async function loadProfile() {
      try {
        const { data } = await supabase
          .from("patient_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          setForm((current) => {
            const next = { ...current };
            if (data.age && !next.Age) next.Age = data.age;
            if (data.sex === "Male") next.Gender = 1;
            else if (data.sex === "Female") next.Gender = 0;
            return next;
          });
        }
      } catch (err) {
        console.error("Error prefilling patient form:", err);
      }
    }
    loadProfile();
  }, [user]);

  const chunks = [fields.slice(0, 6), fields.slice(6, 14), fields.slice(14)];
  const visibleFields = chunks[step];

  const handle = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validateVisibleStep = () => {
    const keys = visibleFields
      .map((field) => field.key)
      .filter((key) => requiredFields.includes(key));
    const result = validateFields(form, keys);
    setFieldErrors(result.errors);
    if (!result.ok) {
      setError("Please verify highlighted fields contain valid clinical measurements.");
      return false;
    }
    setError("");
    return true;
  };

  const handleContinue = () => {
    if (!validateVisibleStep()) return;
    setStep((current) => current + 1);
  };

  const handleSubmit = () => {
    const result = validatePatientForm(form);
    if (!result.ok) {
      setFieldErrors(result.errors);
      setError("Please complete required clinical measurements.");
      // Auto-navigate to the step containing the first invalid field
      const firstErrKey = Object.keys(result.errors)[0];
      const errStepIndex = chunks.findIndex((chunk) => chunk.some((f) => f.key === firstErrKey));
      if (errStepIndex !== -1) setStep(errStepIndex);
      return;
    }
    setFieldErrors({});
    setError("");
    const payload = toPredictionPayload(form);
    if (user?.id) {
      payload.user_id = user.id;
    }
    onSubmit(payload);
  };

  return (
    <div className="entry-workspace-split">
      {/* Left Main Form Card */}
      <div className="entry-form-card">
        {/* Step Tracker Header Tabs */}
        <div className="step-tracker-header" role="tablist">
          {stepMeta.map((item, index) => {
            const isDone = index < step;
            const isActive = index === step;
            return (
              <div
                key={item.title}
                className={`step-tab-item ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
                onClick={() => index < step && setStep(index)}
              >
                <div className="step-num-badge">{isDone ? "✓" : index + 1}</div>
                <div className="step-tab-text">
                  <span className="step-tab-title">{item.title}</span>
                  <span className="step-tab-sub">{item.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="error-banner" style={{ margin: "1.25rem 2rem 0 2rem" }}>
            {error}
          </div>
        )}

        {/* EHR Field Grid */}
        <div className="entry-fields-grid">
          {visibleFields.map((field) => {
            const isRequired = requiredFields.includes(field.key);
            return (
              <div
                className={`entry-field-card ${fieldErrors[field.key] ? "invalid" : ""}`}
                key={field.key}
              >
                <div className="field-top-label-row">
                  <span className="field-label-title">
                    {field.label} {isRequired && <span className="req-star">*</span>}
                  </span>
                </div>

                <div className="field-input-box-wrap">
                  <div className="field-left-icon">{getFieldIcon(field.key)}</div>

                  {field.type === "select" ? (
                    <select
                      className="styled-dark-input"
                      value={form[field.key]}
                      onChange={(e) => handle(field.key, Number(e.target.value))}
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "toggle" ? (
                    <div className="styled-toggle-group">
                      <button
                        type="button"
                        className={`toggle-option-btn ${Number(form[field.key]) === 0 ? "active" : ""}`}
                        onClick={() => handle(field.key, 0)}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        className={`toggle-option-btn ${Number(form[field.key]) === 1 ? "active" : ""}`}
                        onClick={() => handle(field.key, 1)}
                      >
                        Yes
                      </button>
                    </div>
                  ) : (
                    <div className="input-with-unit-wrap">
                      <input
                        className="styled-dark-input mono"
                        type="number"
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        min={FIELD_RANGES[field.key]?.min}
                        max={FIELD_RANGES[field.key]?.max}
                        step="any"
                        onChange={(e) => handle(field.key, e.target.value)}
                      />
                      {field.unit && <span className="input-unit-tag">{field.unit}</span>}
                    </div>
                  )}
                </div>

                {field.refRange && <span className="ref-range-hint">{field.refRange}</span>}
                {fieldErrors[field.key] && (
                  <span className="field-error">{fieldErrors[field.key]}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Card Action Notice Bar */}
        <div className="form-bottom-notice-bar">
          <div className="notice-left-info">
            <InfoCircleIcon />
            <span>
              Optional lab fields left blank will assume standard baseline defaults.{" "}
              <strong>Note:</strong> Prediction accuracy may vary if actual lab values differ.
            </span>
          </div>

          <div className="notice-actions-right">
            {step > 0 && (
              <button
                className="btn-signin-outline"
                type="button"
                onClick={() => setStep((current) => current - 1)}
              >
                Back
              </button>
            )}
            {step < 2 ? (
              <button className="btn-next-gradient" type="button" onClick={handleContinue}>
                <span>Next: {stepMeta[step + 1].title}</span>
                <ArrowRightIcon />
              </button>
            ) : (
              <button
                className={`btn-next-gradient ${loading ? "loading" : ""}`}
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                <span>{loading ? "Calculating…" : "Predict Readmission Risk"}</span>
                {!loading && <ArrowRightIcon />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar Timeline */}
      <aside className="entry-right-sidebar">
        <div className="whats-next-card">
          <h3 className="whats-next-title">What's next?</h3>

          <div className="timeline-steps-list">
            <div className={`timeline-item ${step === 0 ? "active" : step > 0 ? "done" : ""}`}>
              <div className="timeline-icon-box">
                <UserCircleIcon />
              </div>
              <div className="timeline-text">
                <span className="timeline-title">1. Demographics &amp; Vitals</span>
                <span className="timeline-sub">Basic patient information and vital signs.</span>
              </div>
            </div>

            <div className="timeline-connector-line" />

            <div className={`timeline-item ${step === 1 ? "active" : step > 1 ? "done" : ""}`}>
              <div className="timeline-icon-box">
                <FlaskIcon />
              </div>
              <div className="timeline-text">
                <span className="timeline-title">2. Laboratory Panel</span>
                <span className="timeline-sub">Enter lab results and test values.</span>
              </div>
            </div>

            <div className="timeline-connector-line" />

            <div className={`timeline-item ${step === 2 ? "active" : ""}`}>
              <div className="timeline-icon-box">
                <ClipboardListIcon />
              </div>
              <div className="timeline-text">
                <span className="timeline-title">3. History &amp; Risk Factors</span>
                <span className="timeline-sub">Add clinical history and lifestyle factors.</span>
              </div>
            </div>
          </div>

          <div className="sidebar-tip-box">
            <LightbulbIcon />
            <span>
              Complete all sections to generate an accurate risk assessment and prognosis.
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
