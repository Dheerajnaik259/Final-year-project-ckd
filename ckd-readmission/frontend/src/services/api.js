// src/services/api.js
import { calculateLocalPrediction } from "./clinicalEngine";
import { supabase } from "./supabaseClient";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

/**
 * Get the current Supabase session access token for backend auth.
 * Returns null if no session is active.
 */
async function getAuthToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch (_err) {
    return null;
  }
}

/**
 * Centralised fetch with timeout, auth header, and error handling.
 * All backend calls go through this single function.
 */
async function fetchWithAuth(endpoint, options = {}) {
  const token = await getAuthToken();
  const headers = { ...options.headers };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${res.status}`);
  }
  return await res.json();
}

/**
 * Check if the current host is localhost (dev environment).
 */
function isLocalDev() {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1")
  );
}

/**
 * Check if a real remote backend URL is configured.
 */
function hasRemoteBackend() {
  return (
    import.meta.env.VITE_API_URL &&
    !import.meta.env.VITE_API_URL.includes("localhost") &&
    !import.meta.env.VITE_API_URL.includes("127.0.0.1")
  );
}

export async function predictReadmissionRisk(patientData, userId = null) {
  // On Vercel without a cloud backend URL: use client-side fallback immediately
  if (!isLocalDev() && !hasRemoteBackend()) {
    const fallback = calculateLocalPrediction(patientData);
    fallback.source = "offline_estimate";
    return fallback;
  }

  const payload = userId ? { ...patientData, user_id: userId } : patientData;
  try {
    const result = await fetchWithAuth("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    result.source = "server";
    return result;
  } catch (err) {
    console.warn("Backend API unreachable. Using client-side clinical prediction engine fallback.", err);
    const fallback = calculateLocalPrediction(patientData);
    fallback.source = "offline_estimate";
    return fallback;
  }
}

export async function fetchPredictionHistory(limit = 50, offset = 0, userId = null) {
  let url = `/history?limit=${limit}&offset=${offset}`;
  if (userId) {
    url += `&user_id=${encodeURIComponent(userId)}`;
  }
  try {
    return await fetchWithAuth(url);
  } catch (_err) {
    return { predictions: [], count: 0, source: "local" };
  }
}

export async function fetchPredictionDetail(predictionId) {
  try {
    return await fetchWithAuth(`/history/${predictionId}`);
  } catch (_err) {
    return null;
  }
}
