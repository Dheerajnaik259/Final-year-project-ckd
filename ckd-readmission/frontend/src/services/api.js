// src/services/api.js
import { calculateLocalPrediction } from "./clinicalEngine";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
const ALT_URL = BASE_URL.includes("localhost") ? "http://127.0.0.1:5000" : "http://localhost:5000";

async function fetchWithFallback(endpoint, options = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (BASE_URL !== ALT_URL) {
      try {
        const controllerAlt = new AbortController();
        const timeoutAlt = setTimeout(() => controllerAlt.abort(), 2000);
        const resAlt = await fetch(`${ALT_URL}${endpoint}`, {
          ...options,
          signal: controllerAlt.signal,
        }).finally(() => clearTimeout(timeoutAlt));

        if (resAlt.ok) {
          return await resAlt.json();
        }
      } catch (_altErr) {
        // Ignore alt failure
      }
    }
    throw err;
  }
}

export async function predictReadmissionRisk(patientData, userId = null) {
  const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1");

  const hasRemoteConfiguredApi =
    import.meta.env.VITE_API_URL &&
    !import.meta.env.VITE_API_URL.includes("localhost") &&
    !import.meta.env.VITE_API_URL.includes("127.0.0.1");

  // On Vercel / remote production deployments without a cloud backend URL:
  // Immediately return clinical prediction engine calculation (0ms latency, 0 network errors)
  if (!isLocalHost && !hasRemoteConfiguredApi) {
    return calculateLocalPrediction(patientData);
  }

  const payload = userId ? { ...patientData, user_id: userId } : patientData;
  try {
    const result = await fetchWithFallback("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return result;
  } catch (err) {
    console.warn("Backend API unreachable. Using client-side clinical prediction engine fallback.", err);
    return calculateLocalPrediction(patientData);
  }
}

export async function fetchPredictionHistory(limit = 50, offset = 0, userId = null) {
  let url = `/history?limit=${limit}&offset=${offset}`;
  if (userId) {
    url += `&user_id=${encodeURIComponent(userId)}`;
  }
  try {
    return await fetchWithFallback(url);
  } catch (_err) {
    return { history: [], source: "local" };
  }
}

export async function fetchPredictionDetail(predictionId) {
  try {
    return await fetchWithFallback(`/history/${predictionId}`);
  } catch (_err) {
    return null;
  }
}
