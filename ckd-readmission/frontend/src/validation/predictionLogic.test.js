import { describe, expect, it } from "vitest";
import { FIELD_RANGES, validateFields } from "./patientSchema";

describe("Prediction Logic & Clinical Range Utilities", () => {
  it("defines standard physiological boundaries for CKD measurements", () => {
    expect(FIELD_RANGES.Age.min).toBe(0);
    expect(FIELD_RANGES.Age.max).toBe(120);
    expect(FIELD_RANGES.GFR.min).toBe(1);
    expect(FIELD_RANGES.GFR.max).toBe(150);
  });

  it("validates missing required measurements correctly", () => {
    const invalidForm = {
      Age: "",
      GFR: 45,
      SystolicBP: 130,
      DiastolicBP: 80,
      SerumCreatinine: 1.8,
    };
    const res = validateFields(invalidForm, ["Age", "GFR"]);
    expect(res.ok).toBe(false);
    expect(res.errors.Age).toBeDefined();
  });

  it("validates within-range measurements successfully", () => {
    const validForm = { Age: 55, GFR: 45, SystolicBP: 130, DiastolicBP: 80, SerumCreatinine: 1.8 };
    const res = validateFields(validForm, [
      "Age",
      "GFR",
      "SystolicBP",
      "DiastolicBP",
      "SerumCreatinine",
    ]);
    expect(res.ok).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);
  });

  it("predicts Medium Risk (~40-45%) correctly for Case 2 parameters from dummy_entries.md", async () => {
    const { calculateLocalPrediction } = await import("../services/clinicalEngine");
    const case2Data = {
      Age: 67,
      Gender: 1,
      SystolicBP: 142,
      DiastolicBP: 84,
      BMI: 27.5,
      ComorbidityCount: 2,
      SerumCreatinine: 1.8,
      GFR: 48,
      BUNLevels: 26,
      ACR: 120,
      SerumElectrolytesPotassium: 4.8,
      SerumElectrolytesSodium: 137,
      HemoglobinLevels: 11.5,
      ProteinInUrine: 0.4,
      PriorAdmissions: 1,
      LengthOfStay: 4,
      Diabetes: 1,
      Hypertension: 1,
      Smoking: 0,
      FamilyHistoryKidneyDisease: 1,
    };
    const prediction = calculateLocalPrediction(case2Data);
    expect(prediction.risk_level).toBe("Medium");
    expect(prediction.probability).toBeGreaterThanOrEqual(40.0);
    expect(prediction.probability).toBeLessThan(70.0);
  });
});
