import { describe, expect, it } from "vitest";
import { validatePatientForm } from "../src/validation/patientSchema";

const validForm = {
  Age: "68",
  BMI: "27",
  SystolicBP: "142",
  DiastolicBP: "88",
  Hypertension: 1,
  SerumCreatinine: "2.1",
  GFR: "44",
  BUNLevels: "28",
  HbA1c: "7.1",
  FastingBloodSugar: "118",
  HemoglobinLevels: "11.2",
  ProteinInUrine: "0.4",
  ACR: "80",
  SerumElectrolytesPotassium: "4.6",
  SerumElectrolytesSodium: "138",
  CholesterolTotal: "190",
  PriorAdmissions: "1",
  LengthOfStay: "4",
  ComorbidityCount: "2",
};

describe("patient intake validation", () => {
  it("accepts a complete in-range case", () => {
    const result = validatePatientForm(validForm);
    expect(result.ok).toBe(true);
  });

  it("rejects empty required labs", () => {
    const result = validatePatientForm({ ...validForm, GFR: "" });
    expect(result.ok).toBe(false);
    expect(result.errors.GFR).toMatch(/required/i);
  });

  it("rejects biologically implausible potassium", () => {
    const result = validatePatientForm({ ...validForm, SerumElectrolytesPotassium: "11" });
    expect(result.ok).toBe(false);
    expect(result.errors.SerumElectrolytesPotassium).toMatch(/between/i);
  });

  it("rejects age above 120", () => {
    const result = validatePatientForm({ ...validForm, Age: "140" });
    expect(result.ok).toBe(false);
    expect(result.errors.Age).toMatch(/between/i);
  });
});
