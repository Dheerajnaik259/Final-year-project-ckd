// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export async function predictReadmissionRisk(patientData) {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patientData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${res.status}`);
  }

  return res.json();
}

export async function fetchPredictionHistory(limit = 50, offset = 0) {
  const res = await fetch(`${API_URL}/history?limit=${limit}&offset=${offset}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch history: ${res.status}`);
  }
  return res.json();
}

export async function fetchPredictionDetail(predictionId) {
  const res = await fetch(`${API_URL}/history/${predictionId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch prediction detail: ${res.status}`);
  }
  return res.json();
}