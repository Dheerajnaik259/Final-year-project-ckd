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