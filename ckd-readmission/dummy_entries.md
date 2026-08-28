# Clinical Predictor Test Entries (Low, Medium & High Risk)

Use these calibrated clinical patient profiles during demonstration to test and verify **Low Risk**, **Medium Risk**, and **High Risk** readmission predictions.

---

## 1. 🟢 Low Risk Test Case

> **Expected Outcome:**  
> * **Risk Level:** `Low Risk`  
> * **30-Day Readmission Probability:** `~15.0%`  
> * **CKD Stage:** `G1` (Normal / Mild)  
> * **KDIGO Risk:** `Low`

### Step 1: Basic Info & Vitals
* **Age:** `35`
* **Sex:** `Female` (0)
* **Systolic BP:** `118` mmHg
* **Diastolic BP:** `76` mmHg
* **BMI:** `22.5`
* **Comorbidity count:** `0`

### Step 2: Laboratory Panel
* **Serum creatinine:** `0.8` mg/dL
* **eGFR:** `98` mL/min/1.73m²
* **BUN:** `14` mg/dL
* **Urine ACR:** `12` mg/g
* **Serum potassium:** `4.1` mEq/L
* **Serum sodium:** `140` mEq/L
* **Hemoglobin:** `14.2` g/dL
* **Protein in urine:** `0.0` g/L

### Step 3: History & Risk Factors
* **Prior admissions:** `0`
* **Length of stay:** `1` day
* **Diabetes history:** `No`
* **Hypertension history:** `No`
* **Smoking history:** `No`
* **Family kidney history:** `No`

---

## 2. 🟡 Medium Risk Test Case

> **Expected Outcome:**  
> * **Risk Level:** `Medium Risk`  
> * **30-Day Readmission Probability:** `~45.0%` – `55.0%`  
> * **CKD Stage:** `G3a` (Mildly-Moderately Decreased)  
> * **KDIGO Risk:** `Moderate`

### Step 1: Basic Info & Vitals
* **Age:** `58`
* **Sex:** `Male` (1)
* **Systolic BP:** `138` mmHg
* **Diastolic BP:** `86` mmHg
* **BMI:** `28.2`
* **Comorbidity count:** `1`

### Step 2: Laboratory Panel
* **Serum creatinine:** `1.6` mg/dL
* **eGFR:** `52` mL/min/1.73m²
* **BUN:** `24` mg/dL
* **Urine ACR:** `110` mg/g
* **Serum potassium:** `4.7` mEq/L
* **Serum sodium:** `136` mEq/L
* **Hemoglobin:** `11.8` g/dL
* **Protein in urine:** `0.4` g/L

### Step 3: History & Risk Factors
* **Prior admissions:** `1`
* **Length of stay:** `3` days
* **Diabetes history:** `Yes`
* **Hypertension history:** `Yes`
* **Smoking history:** `No`
* **Family kidney history:** `Yes`

---

## 3. 🔴 High Risk Test Case

> **Expected Outcome:**  
> * **Risk Level:** `High Risk`  
> * **30-Day Readmission Probability:** `~80.0%` – `90.0%`  
> * **CKD Stage:** `G4` / `G5` (Severely Decreased / Failure)  
> * **KDIGO Risk:** `High` / `Very High`

### Step 1: Basic Info & Vitals
* **Age:** `68`
* **Sex:** `Male` (1)
* **Systolic BP:** `165` mmHg
* **Diastolic BP:** `95` mmHg
* **BMI:** `32.4`
* **Comorbidity count:** `3`

### Step 2: Laboratory Panel
* **Serum creatinine:** `3.8` mg/dL
* **eGFR:** `18` mL/min/1.73m²
* **BUN:** `48` mg/dL
* **Urine ACR:** `450` mg/g
* **Serum potassium:** `5.8` mEq/L
* **Serum sodium:** `128` mEq/L
* **Hemoglobin:** `9.2` g/dL
* **Protein in urine:** `1.8` g/L

### Step 3: History & Risk Factors
* **Prior admissions:** `3`
* **Length of stay:** `7` days
* **Diabetes history:** `Yes`
* **Hypertension history:** `Yes`
* **Smoking history:** `Yes`
* **Family kidney history:** `Yes`
