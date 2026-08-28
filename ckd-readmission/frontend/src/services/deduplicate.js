/**
 * Shared utility for deduplicating prediction records across local storage,
 * Supabase queries, and backend API responses.
 */

export function deduplicatePredictions(records) {
  if (!Array.isArray(records)) return [];

  const validRecords = records.filter((r) => r && typeof r === "object");
  
  // Sort server/UUID records first, then newest first
  validRecords.sort((a, b) => {
    const isAServer = (a.id || a.prediction_id || "").includes("-");
    const isBServer = (b.id || b.prediction_id || "").includes("-");
    if (isAServer && !isBServer) return -1;
    if (!isAServer && isBServer) return 1;

    const timeA = new Date(a.created_at || a.timestamp || Date.now()).getTime();
    const timeB = new Date(b.created_at || b.timestamp || Date.now()).getTime();
    return timeB - timeA;
  });

  const uniqueRecords = [];

  for (const item of validRecords) {
    const recordId = String(item.id || item.prediction_id || "");
    const timeStr = item.created_at || item.timestamp || "";
    const timeMs = timeStr ? new Date(timeStr).getTime() : 0;

    const prob = Math.round(item.probability ?? item.full_result?.probability ?? 0);
    const risk = String(item.risk_level ?? item.full_result?.risk_level ?? "").toLowerCase();
    
    const patientData = item.patient_data || item.full_result?.patient_data || {};
    const age = item.patient_age ?? patientData.Age ?? patientData.age ?? 0;
    const gfr = patientData.GFR ?? patientData.gfr ?? item.egfr ?? 0;
    const userId = item.user_id || "anon";

    // 1. Direct ID match
    const idMatch = recordId && uniqueRecords.some((existing) => {
      const exId = String(existing.id || existing.prediction_id || "");
      return exId && exId === recordId;
    });

    if (idMatch) continue;

    // 2. Sliding window clinical signature match (within 2 minutes)
    const isDuplicateSignature = uniqueRecords.some((existing) => {
      const exTimeStr = existing.created_at || existing.timestamp || "";
      const exTimeMs = exTimeStr ? new Date(exTimeStr).getTime() : 0;
      
      const exProb = Math.round(existing.probability ?? existing.full_result?.probability ?? 0);
      const exRisk = String(existing.risk_level ?? existing.full_result?.risk_level ?? "").toLowerCase();
      const exPatientData = existing.patient_data || existing.full_result?.patient_data || {};
      const exAge = existing.patient_age ?? exPatientData.Age ?? exPatientData.age ?? 0;
      const exGfr = exPatientData.GFR ?? exPatientData.gfr ?? existing.egfr ?? 0;
      const exUserId = existing.user_id || "anon";

      const sameClinicalState =
        userId === exUserId &&
        Math.abs(age - exAge) < 0.1 &&
        Math.abs(gfr - exGfr) < 0.1 &&
        Math.abs(prob - exProb) <= 1 &&
        risk === exRisk;

      if (!sameClinicalState) return false;

      // Sliding window time diff check (within 120 seconds / 2 minutes)
      if (timeMs && exTimeMs && Math.abs(timeMs - exTimeMs) < 120000) {
        return true;
      }
      return false;
    });

    if (isDuplicateSignature) continue;

    uniqueRecords.push(item);
  }

  // Final sort newest first for display
  return uniqueRecords.sort((a, b) => {
    const timeA = new Date(a.created_at || a.timestamp || Date.now()).getTime();
    const timeB = new Date(b.created_at || b.timestamp || Date.now()).getTime();
    return timeB - timeA;
  });
}
