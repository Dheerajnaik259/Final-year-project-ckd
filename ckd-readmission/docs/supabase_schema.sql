-- CKD Readmission Predictor — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Predictions table: stores every prediction run
CREATE TABLE IF NOT EXISTS predictions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID,                    -- links prediction to authenticated user
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
  patient_data           JSONB DEFAULT '{}'::jsonb,
  full_result            JSONB DEFAULT '{}'::jsonb
);

-- Index for fast history queries per user (most recent first)
CREATE INDEX IF NOT EXISTS idx_predictions_user_created
  ON predictions (user_id, created_at DESC);

-- Index for filtering by risk level
CREATE INDEX IF NOT EXISTS idx_predictions_risk_level
  ON predictions (risk_level);

-- Enable RLS so users can only access their own records
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own predictions
CREATE POLICY "Users can insert own predictions"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can read their own predictions
CREATE POLICY "Users can read own predictions"
  ON predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anonymous inserts (backward compatibility for unauthenticated flow)
CREATE POLICY "Allow anonymous inserts"
  ON predictions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous reads
CREATE POLICY "Allow anonymous reads"
  ON predictions FOR SELECT
  TO anon
  USING (true);
