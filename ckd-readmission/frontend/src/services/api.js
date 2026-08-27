// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
const ALT_URL = BASE_URL.includes("localhost") ? "http://127.0.0.1:5000" : "http://localhost:5000";

async function fetchWithFallback(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (err.message && err.message.includes("Failed to fetch")) {
      const resAlt = await fetch(`${ALT_URL}${endpoint}`, options);
      if (!resAlt.ok) {
        const errAlt = await resAlt.json().catch(() => ({}));
        throw new Error(errAlt.error || `Server error: ${resAlt.status}`, { cause: err });
      }
      return await resAlt.json();
    }
    throw err;
  }
}

export async function predictReadmissionRisk(patientData, userId = null) {
  const payload = userId ? { ...patientData, user_id: userId } : patientData;
  return fetchWithFallback("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchPredictionHistory(limit = 50, offset = 0, userId = null) {
  let url = `/history?limit=${limit}&offset=${offset}`;
  if (userId) {
    url += `&user_id=${encodeURIComponent(userId)}`;
  }
  return fetchWithFallback(url);
}

export async function fetchPredictionDetail(predictionId) {
  return fetchWithFallback(`/history/${predictionId}`);
}
