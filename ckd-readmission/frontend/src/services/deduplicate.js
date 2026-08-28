/**
 * Shared utility for deduplicating prediction records across local storage,
 * Supabase queries, and backend API responses.
 */

export function deduplicatePredictions(records) {
  if (!Array.isArray(records)) return [];

  const seenIds = new Set();
  const seenSignatures = new Set();
  const uniqueRecords = [];

  for (const item of records) {
    if (!item) continue;

    // Standardize key attributes
    const recordId = item.id || item.prediction_id;
    const timeStr = item.created_at || item.timestamp || "";
    const timeMs = timeStr ? new Date(timeStr).getTime() : 0;
    
    // Minute-level bucket for grouping predictions made within the same 2-minute window
    const timeWindow = timeMs ? Math.floor(timeMs / 120000) : 0;

    const prob = Math.round(item.probability ?? item.full_result?.probability ?? 0);
    const risk = String(item.risk_level ?? item.full_result?.risk_level ?? "").toLowerCase();
    
    const patientData = item.patient_data || item.full_result?.patient_data || {};
    const age = item.patient_age ?? patientData.Age ?? patientData.age ?? 0;
    const gfr = patientData.GFR ?? patientData.gfr ?? item.egfr ?? 0;

    // ID-based deduplication
    if (recordId && seenIds.has(String(recordId))) {
      continue;
    }

    // Clinical signature deduplication: (User/Age + GFR + Prob + Risk + 2-min time window)
    const signature = `${item.user_id || "anon"}_${age}_${gfr}_${prob}_${risk}_${timeWindow}`;
    if (seenSignatures.has(signature)) {
      continue;
    }

    if (recordId) seenIds.add(String(recordId));
    if (timeWindow > 0) seenSignatures.add(signature);

    uniqueRecords.push(item);
  }

  // Sort newest first
  return uniqueRecords.sort((a, b) => {
    const timeA = new Date(a.created_at || a.timestamp || Date.now()).getTime();
    const timeB = new Date(b.created_at || b.timestamp || Date.now()).getTime();
    return timeB - timeA;
  });
}
