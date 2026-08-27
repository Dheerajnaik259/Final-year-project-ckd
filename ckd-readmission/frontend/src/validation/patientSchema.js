import { z } from "zod";

export const FIELD_RANGES = {
  Age: { min: 0, max: 120, unit: "years" },
  BMI: { min: 10, max: 60, unit: "kg/m2" },
  SystolicBP: { min: 70, max: 260, unit: "mmHg" },
  DiastolicBP: { min: 40, max: 160, unit: "mmHg" },
  SerumCreatinine: { min: 0.2, max: 15, unit: "mg/dL" },
  GFR: { min: 1, max: 150, unit: "mL/min/1.73m2" },
  BUNLevels: { min: 2, max: 200, unit: "mg/dL" },
  HbA1c: { min: 3, max: 16, unit: "%" },
  FastingBloodSugar: { min: 40, max: 600, unit: "mg/dL" },
  HemoglobinLevels: { min: 3, max: 20, unit: "g/dL" },
  ProteinInUrine: { min: 0, max: 20, unit: "g/day" },
  ACR: { min: 0, max: 5000, unit: "mg/g" },
  SerumElectrolytesPotassium: { min: 2, max: 8, unit: "mEq/L" },
  SerumElectrolytesSodium: { min: 110, max: 170, unit: "mEq/L" },
  CholesterolTotal: { min: 50, max: 500, unit: "mg/dL" },
  PriorAdmissions: { min: 0, max: 50, unit: "count" },
  LengthOfStay: { min: 0, max: 365, unit: "days" },
  ComorbidityCount: { min: 0, max: 30, unit: "count" },
};

const numberField = (key) => {
  const range = FIELD_RANGES[key];
  if (!range) {
    return z.coerce.number({ invalid_type_error: `${key} must be a number` });
  }

  return z.coerce
    .number({ invalid_type_error: `${key} must be a number` })
    .min(range.min, `${key} must be between ${range.min} and ${range.max} ${range.unit}`)
    .max(range.max, `${key} must be between ${range.min} and ${range.max} ${range.unit}`);
};

export const requiredFields = [
  "Age",
  "BMI",
  "SystolicBP",
  "DiastolicBP",
  "Hypertension",
  "SerumCreatinine",
  "GFR",
  "BUNLevels",
  "HbA1c",
  "FastingBloodSugar",
  "HemoglobinLevels",
  "ProteinInUrine",
  "ACR",
  "SerumElectrolytesPotassium",
  "SerumElectrolytesSodium",
  "CholesterolTotal",
  "PriorAdmissions",
  "LengthOfStay",
  "ComorbidityCount",
];

const shape = Object.fromEntries(
  requiredFields.map((key) => [
    key,
    key === "Hypertension"
      ? z.coerce.number().min(0).max(1)
      : numberField(key),
  ])
);

export const patientIntakeSchema = z.object(shape);

export function validateFields(form, keys) {
  const errors = {};

  keys.forEach((key) => {
    const value = form[key];
    if (value === "" || value === null || value === undefined) {
      errors[key] = `${key} is required`;
      return;
    }

    const range = FIELD_RANGES[key];
    if (!range) {
      return;
    }

    const result = numberField(key).safeParse(value);
    if (!result.success) {
      errors[key] = result.error.issues[0]?.message || `${key} is invalid`;
    }
  });

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}

export function validatePatientForm(form) {
  return validateFields(form, requiredFields);
}
