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
});
