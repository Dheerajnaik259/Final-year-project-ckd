import "./PatientForm.css";
import { useState } from "react";
import { FIELD_RANGES, requiredFields, validateFields, validatePatientForm } from "../validation/patientSchema";

const fields = [
  { key: "Age", label: "Age", type: "number", placeholder: "45", unit: "years" },
  { key: "Gender", label: "Sex", type: "select", options: [{ value: 0, label: "Female" }, { value: 1, label: "Male" }] },
  { key: "BMI", label: "BMI", type: "number", placeholder: "24.5", unit: "kg/m2" },
  { key: "SystolicBP", label: "Systolic BP", type: "number", placeholder: "120", unit: "mmHg" },
  { key: "DiastolicBP", label: "Diastolic BP", type: "number", placeholder: "80", unit: "mmHg" },
  { key: "Hypertension", label: "Hypertension history", type: "select", options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
  { key: "SerumCreatinine", label: "Serum creatinine", type: "number", placeholder: "1.2", unit: "mg/dL" },
  { key: "GFR", label: "eGFR", type: "number", placeholder: "60", unit: "mL/min/1.73m2" },
  { key: "BUNLevels", label: "BUN", type: "number", placeholder: "18", unit: "mg/dL" },
  { key: "HbA1c", label: "HbA1c", type: "number", placeholder: "5.7", unit: "%" },
  { key: "FastingBloodSugar", label: "Fasting glucose", type: "number", placeholder: "95", unit: "mg/dL" },
  { key: "HemoglobinLevels", label: "Hemoglobin", type: "number", placeholder: "13.5", unit: "g/dL" },
  { key: "ProteinInUrine", label: "Protein in urine", type: "number", placeholder: "0.1", unit: "g/day" },
  { key: "ACR", label: "Urine ACR", type: "number", placeholder: "30", unit: "mg/g" },
  { key: "SerumElectrolytesPotassium", label: "Potassium", type: "number", placeholder: "4.0", unit: "mEq/L" },
  { key: "SerumElectrolytesSodium", label: "Sodium", type: "number", placeholder: "138", unit: "mEq/L" },
  { key: "CholesterolTotal", label: "Total cholesterol", type: "number", placeholder: "180", unit: "mg/dL" },
  { key: "Smoking", label: "Smoking", type: "select", options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
  { key: "Diabetes", label: "Diabetes history", type: "select", options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
  { key: "PriorAdmissions", label: "Prior admissions", type: "number", placeholder: "1", unit: "count" },
  { key: "LengthOfStay", label: "Length of stay", type: "number", placeholder: "5", unit: "days" },
  { key: "ComorbidityCount", label: "Comorbidity count", type: "number", placeholder: "2", unit: "count" },
  { key: "FamilyHistoryKidneyDisease", label: "Family kidney history", type: "select", options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
];

const stepMeta = [
  {
    title: "Basic Info",
    short: "Demographics and baseline vitals",
    caption: "Use the current patient values for age, body size, blood pressure, and creatinine.",
  },
  {
    title: "Lab Results",
    short: "Renal and metabolic laboratory panel",
    caption: "Include urine ACR so the result can show albuminuria context and KFRE output.",
  },
  {
    title: "History & Lifestyle",
    short: "Key history and exposure markers",
    caption: "Capture smoking, diabetes history, and relevant family kidney history.",
  },
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
  Ethnicity: 0,
  SocioeconomicStatus: 0,
  EducationLevel: 0,
  AlcoholConsumption: 0,
  PhysicalActivity: 0,
  DietQuality: 0,
  SleepQuality: 0,
  FamilyHistoryHypertension: 0,
  FamilyHistoryDiabetes: 0,
  PreviousAcuteKidneyInjury: 0,
  UrinaryTractInfections: 0,
  ACR: "",
  SerumElectrolytesCalcium: "",
  SerumElectrolytesPhosphorus: "",
  CholesterolLDL: "",
  CholesterolHDL: "",
  CholesterolTriglycerides: "",
  ACEInhibitors: 0,
  Diuretics: 0,
  NSAIDsUse: 0,
  Statins: 0,
  AntidiabeticMedications: 0,
  Edema: 0,
  FatigueLevels: 0,
  NauseaVomiting: 0,
  MuscleCramps: 0,
  Itching: 0,
  QualityOfLifeScore: "",
  HeavyMetalsExposure: 0,
  OccupationalExposureChemicals: 0,
  WaterQuality: 0,
  MedicalCheckupsFrequency: 0,
  MedicationAdherence: 0,
  HealthLiteracy: 0,
};

const numericValue = (value) => {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

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

export default function PatientForm({ onSubmit, loading }) {
  const [form, setForm] = useState(defaultValues);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const chunks = [fields.slice(0, 6), fields.slice(6, 14), fields.slice(14)];

  const currentStep = stepMeta[step];
  const visibleFields = chunks[step];

  const handle = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }
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
      setError("Please correct the highlighted values. They must be biologically plausible.");
      return false;
    }
    setError("");
    return true;
  };

  const handleContinue = () => {
    if (!validateVisibleStep()) {
      return;
    }
    setStep((current) => current + 1);
  };

  const handleSubmit = () => {
    const result = validatePatientForm(form);

    if (!result.ok) {
      setFieldErrors(result.errors);
      setError("Please complete all required measurements with values inside the expected clinical ranges.");
      return;
    }

    setFieldErrors({});
    setError("");
    onSubmit(toPredictionPayload(form));
  };

  return (
    <section className="form-card">
      <div className="form-heading">
        <div>
          <p className="section-kicker">Patient intake</p>
          <h2 className="form-title">{currentStep.title}</h2>
        </div>
        <p className="section-caption">{currentStep.caption}</p>
      </div>

      <div className="steps" role="tablist" aria-label="Patient intake steps">
        {stepMeta.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`step ${index === step ? "active" : index < step ? "done" : ""}`}
            onClick={() => setStep(index)}
          >
            <span className="step-num">{String(index + 1).padStart(2, "0")}</span>
            <span className="step-copy">
              <strong>{item.title}</strong>
              <small>{item.short}</small>
            </span>
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="fields-grid">
        {visibleFields.map((field) => (
          <label className={`field ${fieldErrors[field.key] ? "invalid" : ""}`} key={field.key}>
            <span className="field-top">
              <span className="field-label">{field.label}</span>
              {field.unit && <span className="field-unit">{field.unit}</span>}
            </span>

            {field.type === "select" ? (
              <select value={form[field.key]} onChange={(e) => handle(field.key, e.target.value)}>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                placeholder={field.placeholder}
                value={form[field.key]}
                min={FIELD_RANGES[field.key]?.min}
                max={FIELD_RANGES[field.key]?.max}
                step="any"
                onChange={(e) => handle(field.key, e.target.value)}
              />
            )}
            {fieldErrors[field.key] && <span className="field-error">{fieldErrors[field.key]}</span>}
          </label>
        ))}
      </div>

      <div className="form-meta">
        <span>{visibleFields.length} fields in this section</span>
        <span>Use current lab values and observed history where available</span>
      </div>

      <div className="form-nav">
        {step > 0 && (
          <button className="btn-secondary" type="button" onClick={() => setStep((current) => current - 1)}>
            Back
          </button>
        )}

        {step < 2 ? (
          <button className="btn-primary" type="button" onClick={handleContinue}>
            Continue
          </button>
        ) : (
          <button className="btn-predict" type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : "Run Prediction"}
          </button>
        )}
      </div>
    </section>
  );
}
