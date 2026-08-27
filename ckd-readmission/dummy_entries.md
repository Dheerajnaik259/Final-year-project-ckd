# Quick Demo Test Entries

Use these values during the review to test different risk predictions in the app.

---

## 1. Low Risk Test Case

**Expected Result:** `Low Risk` (Readmission probability < 25%)

### Step 1: Basic Info & Vitals
* **Age:** `35`
* **Sex:** `Female`
* **Systolic BP:** `118`
* **Diastolic BP:** `76`
* **BMI:** `22.5`
* **Comorbidity count:** `0`

### Step 2: Laboratory Panel
* **Serum creatinine:** `0.8`
* **eGFR:** `98`
* **BUN:** `14`
* **Urine ACR:** `12`
* **Serum potassium:** `4.1`
* **Serum sodium:** `140`
* **Hemoglobin:** `14.2`
* **Protein in urine:** `0.05`

### Step 3: History & Risk Factors
* **Prior admissions:** `0`
* **Length of stay:** `1`
* **Diabetes history:** `No`
* **Hypertension history:** `No`
* **Smoking history:** `No`
* **Family kidney history:** `No`

---

## 2. Medium Risk Test Case

**Expected Result:** `Medium Risk` (Readmission probability ~40%)

### Step 1: Basic Info & Vitals
* **Age:** `67`
* **Sex:** `Male`
* **Systolic BP:** `142`
* **Diastolic BP:** `84`
* **BMI:** `27.5`
* **Comorbidity count:** `2`

### Step 2: Laboratory Panel
* **Serum creatinine:** `1.8`
* **eGFR:** `48`
* **BUN:** `26`
* **Urine ACR:** `120`
* **Serum potassium:** `4.8`
* **Serum sodium:** `137`
* **Hemoglobin:** `11.5`
* **Protein in urine:** `0.4`

### Step 3: History & Risk Factors
* **Prior admissions:** `1`
* **Length of stay:** `4`
* **Diabetes history:** `Yes`
* **Hypertension history:** `Yes`
* **Smoking history:** `No`
* **Family kidney history:** `Yes`

---

## 3. High Risk Test Case

**Expected Result:** `High Risk` (Readmission probability 70% or higher)

### Step 1: Basic Info & Vitals
* **Age:** `63`
* **Sex:** `Female`
* **Systolic BP:** `172`
* **Diastolic BP:** `98`
* **BMI:** `32.0`
* **Comorbidity count:** `5`

### Step 2: Laboratory Panel
* **Serum creatinine:** `5.5`
* **eGFR:** `12`
* **BUN:** `65`
* **Urine ACR:** `850`
* **Serum potassium:** `6.2`
* **Serum sodium:** `128`
* **Hemoglobin:** `8.5`
* **Protein in urine:** `3.2`

### Step 3: History & Risk Factors
* **Prior admissions:** `4`
* **Length of stay:** `10`
* **Diabetes history:** `Yes`
* **Hypertension history:** `Yes`
* **Smoking history:** `Yes`
* **Family kidney history:** `Yes`

---

## Testing Any Custom / Random Inputs

If the reviewer wants to test random numbers live:
* **For Low Risk:** Enter high eGFR (>90), normal creatinine (<1.2), and 0 prior admissions.
* **For High Risk:** Enter low eGFR (<30), high creatinine (>3.0), high potassium (>5.5), or prior admissions (2+).
* **Missing Fields:** Optional lab fields left blank will automatically use normal baseline defaults.
