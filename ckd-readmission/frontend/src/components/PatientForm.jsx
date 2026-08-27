import "./PatientForm.css";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { FIELD_RANGES, requiredFields, validateFields, validatePatientForm } from "../validation/patientSchema";

const fields = [
  // Step 1: Baseline Demographics & Vitals
  { key: "Age", label: "Age", type: "number", placeholder: "45", unit: "years" },
  { key: "Gender", label: "Sex", type: "select", options: [{ value: 0, label: "Female" }, { value: 1, label: "Male" }] },
  { key: "SystolicBP", label: "Systolic BP", type: "number", placeholder: "120", unit: "mmHg", refRange: "normal < 120" },
  { key: "DiastolicBP", label: "Diastolic BP", type: "number", placeholder: "80", unit: "mmHg", refRange: "normal < 80" },
  { key: "BMI", label: "BMI", type: "number", placeholder: "24.5", unit: "kg/m²", refRange: "normal 18.5–24.9" },
  { key: "ComorbidityCount", label: "Comorbidity count", type: "number", placeholder: "2", unit: "conditions" },

  // Step 2: Renal & Metabolic Lab Panel
  { key: "SerumCreatinine", label: "Serum creatinine", type: "number", placeholder: "1.2", unit: "mg/dL", refRange: "normal 0.6–1.2" },
  { key: "GFR", label: "eGFR", type: "number", placeholder: "60", unit: "mL/min/1.73m²", refRange: "normal ≥ 90" },
  { key: "BUNLevels", label: "BUN", type: "number", placeholder: "18", unit: "mg/dL", refRange: "normal 7–20" },
  { key: "ACR", label: "Urine ACR", type: "number", placeholder: "30", unit: "mg/g", refRange: "normal < 30" },
  { key: "SerumElectrolytesPotassium", label: "Serum potassium", type: "number", placeholder: "4.0", unit: "mEq/L", refRange: "normal 3.5–5.0" },
  { key: "SerumElectrolytesSodium", label: "Serum sodium", type: "number", placeholder: "138", unit: "mEq/L", refRange: "normal 135–145" },
  { key: "HemoglobinLevels", label: "Hemoglobin", type: "number", placeholder: "13.5", unit: "g/dL", refRange: "normal 12.0–17.5" },
  { key: "ProteinInUrine", label: "Protein in urine", type: "number", placeholder: "0.1", unit: "g/day", refRange: "normal < 0.15" },

  // Step 3: Clinical History & Risk Factors
  { key: "PriorAdmissions", label: "Prior admissions", type: "number", placeholder: "1", unit: "count" },
  { key: "LengthOfStay", label: "Length of stay", type: "number", placeholder: "5", unit: "days" },
  { key: "Diabetes", label: "Diabetes history", type: "toggle" },
  { key: "Hypertension", label: "Hypertension history", type: "toggle" },
  { key: "Smoking", label: "Smoking history", type: "toggle" },
  { key: "FamilyHistoryKidneyDisease", label: "Family kidney history", type: "toggle" },
];

const stepMeta = [
  { title: "Demographics & Vitals", short: "Section 1" },
  { title: "Laboratory Panel", short: "Section 2" },
  { title: "History & Risk Factors", short: "Section 3" },
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

const toPredictionPayload = (formData) => {
  const data = { ...formData };
  Object.keys(data).forEach((key) => {
    data[key] = numericValue(data[key]);
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
    diabetes: data.Diabetes,
    hypertension: data.Hypertension,
    prior_admissions: data.PriorAdmissions,
    length_of_stay: data.LengthOfStay,
    comorbidity_count: data.ComorbidityCount,
    ckd_stage: deriveCkdStage(data.GFR),
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
          setForm((current) => ({
            ...current,
            Age: current.Age || data.age || "",
            Gender: data.sex === "Male" ? 1 : 0,
          }));
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
    const keys = visibleFields.map((field) => field.key).filter((key) => requiredFields.includes(key));
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
      return;
    }
    setFieldErrors({});
    setError("");
    onSubmit(toPredictionPayload(form));
  };

  return (
    <div className="clinical-sheet">
      {/* Section Tracker Bar */}
      <div className="section-tracker" role="tablist">
        {stepMeta.map((item, index) => {
          const isDone = index < step;
          const isActive = index === step;
          return (
            <div
              key={item.title}
              className={`tracker-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
              onClick={() => index < step && setStep(index)}
            >
              <span className="step-indicator">
                {isDone ? "✓" : index + 1}
              </span>
              <span className="step-label">{item.title}</span>
            </div>
          );
        })}
      </div>

      {error && <div className="error-banner" style={{ marginBottom: "1.25rem" }}>{error}</div>}

      {/* EHR Field Grid */}
      <div className="ehr-grid">
        {visibleFields.map((field) => (
          <div className={`ehr-field ${fieldErrors[field.key] ? "invalid" : ""}`} key={field.key}>
            <label className="field-label">{field.label}</label>

            {field.type === "select" ? (
              <div className="input-wrap">
                <select
                  className="ehr-input"
                  value={form[field.key]}
                  onChange={(e) => handle(field.key, Number(e.target.value))}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : field.type === "toggle" ? (
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segment-btn ${Number(form[field.key]) === 0 ? "selected" : ""}`}
                  onClick={() => handle(field.key, 0)}
                >
                  No
                </button>
                <button
                  type="button"
                  className={`segment-btn ${Number(form[field.key]) === 1 ? "selected" : ""}`}
                  onClick={() => handle(field.key, 1)}
                >
                  Yes
                </button>
              </div>
            ) : (
              <div className="input-wrap">
                <input
                  className="ehr-input mono"
                  type="number"
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  min={FIELD_RANGES[field.key]?.min}
                  max={FIELD_RANGES[field.key]?.max}
                  step="any"
                  onChange={(e) => handle(field.key, e.target.value)}
                />
                {field.unit && <span className="unit-suffix">{field.unit}</span>}
              </div>
            )}

            {field.refRange && <span className="ref-range">{field.refRange}</span>}
            {fieldErrors[field.key] && <span className="field-error">{fieldErrors[field.key]}</span>}
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="sheet-actions">
        {step > 0 && (
          <button className="btn-outline" type="button" onClick={() => setStep((current) => current - 1)}>
            Back
          </button>
        )}
        <div style={{ marginLeft: "auto" }}>
          {step < 2 ? (
            <button className="btn-outline" type="button" onClick={handleContinue}>
              Next Section →
            </button>
          ) : (
            <button
              className={`btn-solid ${loading ? "loading" : ""}`}
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Calculating…" : "Predict Readmission Risk"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
