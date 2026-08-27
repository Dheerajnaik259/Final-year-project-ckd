-- CKD Readmission Predictor — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Predictions table: stores every prediction run
CREATE TABLE IF NOT EXISTS predictions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Patient demographics
  patient_age   INTEGER,
  patient_gender SMALLINT,  -- 0 = Female, 1 = Male

  -- Prediction results
  risk_level    TEXT NOT NULL,          -- "High", "Medium", "Low"
  probability   REAL NOT NULL,          -- 0–100
  ckd_stage     TEXT,                   -- "G1"–"G5"
  kdigo_risk    TEXT,                   -- "Low", "Moderately increased", "High", "Very high"
  severity_score INTEGER,

  -- Structured data (JSONB)
  top_factors            JSONB DEFAULT '[]'::jsonb,
  clinical_recommendation JSONB DEFAULT '{}'::jsonb,
  patient_data           JSONB DEFAULT '{}'::jsonb
);

-- Index for fast history queries (most recent first)
CREATE INDEX IF NOT EXISTS idx_predictions_created_at
  ON predictions (created_at DESC);

-- Index for filtering by risk level
CREATE INDEX IF NOT EXISTS idx_predictions_risk_level
  ON predictions (risk_level);

-- Disable RLS for academic prototype (anon key can read/write)
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts"
  ON predictions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous reads"
  ON predictions FOR SELECT
  TO anon
  USING (true);
