import { useState, useEffect, useMemo } from "react";
import { fetchPredictionHistory } from "../services/api";
import { supabase } from "../services/supabaseClient";
import { deduplicatePredictions } from "../services/deduplicate";
import "./History.css";


// SVG Icons
function FilterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.6 }}
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  );
}

function SmallArcGauge({ percent, color }) {
  const radius = 22;
  const strokeWidth = 5;
  const circumference = Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="mini-gauge-wrap">
      <svg width="56" height="34" viewBox="0 0 56 34">
        <path
          d="M 6 30 A 22 22 0 0 1 50 30"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d="M 6 30 A 22 22 0 0 1 50 30"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="mini-gauge-text">{percent}%</div>
    </div>
  );
}

function formatDateFormatted(isoStr) {
  if (!isoStr) return { date: "Today", time: "10:00 AM" };
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return { date: "Recent", time: "10:00 AM" };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = d.getDate().toString().padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hoursStr = hours.toString().padStart(2, "0");

  return {
    date: `${day} ${month} ${year}`,
    time: `${hoursStr}:${minutes} ${ampm}`,
  };
}

export default function History({ user, onBack, onNewPredict, onViewDetail }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      let serverRecords = [];
      try {
        const data = await fetchPredictionHistory(100, 0, user?.id);
        serverRecords = data.predictions || [];
      } catch (e) {
        console.warn("Could not fetch remote API history:", e);
      }

      let supabaseRecords = [];
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from("predictions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          if (!error && data) {
            supabaseRecords = data;
          } else if (error) {
            console.warn("Supabase history fetch note:", error.message);
          }
        } catch (err) {
          console.warn("Supabase fetch exception:", err);
        }
      }

      let localRecords;
      try {
        const userKey = user?.id ? `ckd_history_${user.id}` : null;
        const userRecs = userKey ? JSON.parse(localStorage.getItem(userKey) || "[]") : [];
        const fallbackRecs = JSON.parse(localStorage.getItem("ckd_local_prediction_history") || "[]");
        localRecords = [...userRecs, ...fallbackRecs];
      } catch (_err) {
        localRecords = [];
      }

      // Cleanly deduplicate records across database, server API, and local storage
      const allRecords = [...supabaseRecords, ...serverRecords, ...localRecords];
      const combined = deduplicatePredictions(allRecords);

      setPredictions(combined);
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  const handleDeleteSingle = async (row) => {
    if (!window.confirm("Are you sure you want to delete this prediction record?")) return;

    if (row.id) {
      try {
        const { error } = await supabase.from("predictions").delete().eq("id", row.id);
        if (error) console.error("Supabase delete single error:", error.message);
        else console.log("Prediction deleted from Supabase.");
      } catch (err) {
        console.warn("Supabase delete note:", err);
      }
    }

    setPredictions((prev) => prev.filter((p) => (p.id ? p.id !== row.id : p !== row)));

    try {
      if (user?.id) {
        const userKey = `ckd_history_${user.id}`;
        const existingUser = JSON.parse(localStorage.getItem(userKey) || "[]");
        localStorage.setItem(userKey, JSON.stringify(existingUser.filter((i) => i.id !== row.id)));
      }
      const fallbackRecs = JSON.parse(localStorage.getItem("ckd_local_prediction_history") || "[]");
      localStorage.setItem(
        "ckd_local_prediction_history",
        JSON.stringify(fallbackRecs.filter((i) => i.id !== row.id))
      );
    } catch (e) {
      console.warn("Local storage delete note:", e);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL prediction history records?")) return;

    if (user?.id) {
      try {
        const { error } = await supabase.from("predictions").delete().eq("user_id", user.id);
        if (error) console.error("Supabase clear all error:", error.message);
        else console.log("All predictions cleared from Supabase.");
      } catch (err) {
        console.warn("Supabase clear all note:", err);
      }
    }

    setPredictions([]);

    try {
      if (user?.id) {
        localStorage.removeItem(`ckd_history_${user.id}`);
      }
      localStorage.removeItem("ckd_local_prediction_history");
    } catch (e) {
      console.warn("Local storage clear note:", e);
    }
  };

  const totalCount = predictions.length;
  const modCount = predictions.filter(
    (p) => p.risk_level === "Medium" || p.risk_level === "Moderate"
  ).length;
  const highCount = predictions.filter((p) => p.risk_level === "High").length;
  const lowCount = predictions.filter((p) => p.risk_level === "Low").length;

  const filteredPredictions = useMemo(() => {
    if (filterRisk === "ALL") return predictions;
    return predictions.filter((p) => {
      if (filterRisk === "HIGH") return p.risk_level === "High";
      if (filterRisk === "MODERATE")
        return p.risk_level === "Medium" || p.risk_level === "Moderate";
      if (filterRisk === "LOW") return p.risk_level === "Low";
      return true;
    });
  }, [predictions, filterRisk]);

  const totalPages = Math.ceil(filteredPredictions.length / rowsPerPage) || 1;
  const displayedPredictions = filteredPredictions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="history-page-layout">
      <header className="history-header-bar">
        <div className="title-block">
          <h1 className="history-main-title">Prediction History</h1>
          <p className="history-sub-title">View and manage all past predictions.</p>
        </div>

        <div className="search-filter-block">
          {predictions.length > 0 && (
            <button
              type="button"
              className="filter-toggle-btn"
              onClick={handleClearAll}
              style={{ color: "#ef4444" }}
            >
              <TrashIcon />
              <span>Clear History</span>
            </button>
          )}
          <button
            type="button"
            className="filter-toggle-btn"
            onClick={() => {
              const options = ["ALL", "HIGH", "MODERATE", "LOW"];
              const nextIdx = (options.indexOf(filterRisk) + 1) % options.length;
              setFilterRisk(options[nextIdx]);
              setCurrentPage(1);
            }}
          >
            <FilterIcon />
            <span>Filter{filterRisk !== "ALL" ? `: ${filterRisk}` : ""}</span>
          </button>
        </div>
      </header>

      {/* Top Stat Overview Cards */}
      <section className="history-stats-grid">
        {/* Total Predictions */}
        <div className="stat-card">
          <div className="stat-icon-wrap teal">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="stat-text-wrap">
            <span className="stat-count-num">{totalCount}</span>
            <span className="stat-label-text">Total Predictions</span>
          </div>
        </div>

        {/* Moderate Risk */}
        <div className="stat-card">
          <div className="stat-dot amber" />
          <div className="stat-text-wrap">
            <span className="stat-count-num">{modCount}</span>
            <span className="stat-label-text">Moderate Risk</span>
          </div>
        </div>

        {/* High Risk */}
        <div className="stat-card">
          <div className="stat-dot red" />
          <div className="stat-text-wrap">
            <span className="stat-count-num">{highCount}</span>
            <span className="stat-label-text">High Risk</span>
          </div>
        </div>

        {/* Low Risk */}
        <div className="stat-card">
          <div className="stat-dot green" />
          <div className="stat-text-wrap">
            <span className="stat-count-num">{lowCount}</span>
            <span className="stat-label-text">Low Risk</span>
          </div>
        </div>
      </section>

      {/* History Table Container */}
      <section className="history-table-container">
        {loading ? (
          <div className="history-loading-box">
            <div className="loading-spinner" />
            <span>Loading prediction history...</span>
          </div>
        ) : predictions.length === 0 ? (
          <div className="history-empty-box">
            <h3>No predictions recorded yet</h3>
            <p>Run your first patient intake prediction to generate history records.</p>
            <button className="btn-new-intake" onClick={onNewPredict || onBack}>
              Start Intake Prediction
            </button>
          </div>
        ) : (
          <>
            {/* Table Header Row */}
            <div className="table-header-row">
              <span className="th-cell">
                Date &amp; Time <SortIcon />
              </span>
              <span className="th-cell">
                Patient <SortIcon />
              </span>
              <span className="th-cell">
                Risk Level <SortIcon />
              </span>
              <span className="th-cell">
                Risk Score <SortIcon />
              </span>
              <span className="th-cell">
                Kidney Function <SortIcon />
              </span>
              <span className="th-cell">
                Blood Pressure <SortIcon />
              </span>
              <span className="th-cell action">Action</span>
            </div>

            {/* Table Data Rows */}
            <div className="table-body-rows">
              {displayedPredictions.map((row, idx) => {
                const { date, time } = formatDateFormatted(row.created_at);

                // Dynamic patient metadata
                const pData = row.patient_data || {};
                const patientName =
                  pData.name ||
                  pData.PatientName ||
                  user?.user_metadata?.full_name ||
                  user?.email?.split("@")[0] ||
                  "Patient Record";
                const patientId = row.id
                  ? `CKD-${row.id.toString().substring(0, 6).toUpperCase()}`
                  : `CKD-8452${idx + 1}`;
                const avatarInitials =
                  patientName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase() || "PT";

                const isHigh = row.risk_level === "High";
                const isMod = row.risk_level === "Medium" || row.risk_level === "Moderate";
                const riskColor = isHigh ? "#ef4444" : isMod ? "#f59e0b" : "#10b981";
                const riskLabelText = isHigh ? "High Risk" : isMod ? "Moderate Risk" : "Low Risk";

                const prob = Math.round(row.probability || 0);

                const egfrVal = row.patient_data?.GFR || row.patient_data?.gfr || 60;
                const egfrSub =
                  egfrVal >= 90
                    ? "Normal (eGFR)"
                    : egfrVal >= 60
                      ? "Mildly decreased (eGFR)"
                      : "Moderately decreased (eGFR)";

                const sysBp = row.patient_data?.SystolicBP || row.patient_data?.systolic_bp || 130;
                const diaBp = row.patient_data?.DiastolicBP || row.patient_data?.diastolic_bp || 85;
                const bpSub = sysBp > 120 || diaBp > 80 ? "Above target" : "Within target";

                return (
                  <div className="table-data-row" key={row.id || idx}>
                    {/* Date & Time */}
                    <div className="td-cell date-col">
                      <span className="cell-main-date">📅 {date}</span>
                      <span className="cell-sub-time">{time}</span>
                    </div>

                    {/* Patient Name & Avatar */}
                    <div className="td-cell patient-col">
                      <div className="patient-avatar-circle">{avatarInitials}</div>
                      <div className="patient-name-lockup">
                        <strong className="patient-name-str">{patientName}</strong>
                        <span className="patient-id-str">ID: {patientId}</span>
                      </div>
                    </div>

                    {/* Risk Level */}
                    <div className="td-cell risk-col">
                      <div className="risk-status-line">
                        <span className="risk-dot-indicator" style={{ background: riskColor }} />
                        <strong className="risk-text-label" style={{ color: riskColor }}>
                          {riskLabelText}
                        </strong>
                      </div>
                      <span className="risk-sub-tag">Readmission risk</span>
                    </div>

                    {/* Risk Score Semicircle Arc */}
                    <div className="td-cell score-col">
                      <SmallArcGauge percent={prob} color={riskColor} />
                      <span className="score-sub-time">within 30 days</span>
                    </div>

                    {/* Kidney Function */}
                    <div className="td-cell function-col">
                      <span className="func-large-num">{egfrVal}</span>
                      <span className="func-sub-desc">{egfrSub}</span>
                    </div>

                    {/* Blood Pressure */}
                    <div className="td-cell bp-col">
                      <span className={`bp-large-str ${sysBp > 120 ? "amber" : "green"}`}>
                        {sysBp}/{diaBp}
                      </span>
                      <span className="bp-sub-desc">{bpSub}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="td-cell action-col" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <button
                        type="button"
                        className="btn-view-record"
                        onClick={() => onViewDetail && onViewDetail(row)}
                      >
                        <EyeIcon />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        className="btn-view-record"
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          color: "#ef4444",
                          borderColor: "rgba(239, 68, 68, 0.3)",
                          padding: "0.4rem 0.6rem",
                        }}
                        onClick={() => handleDeleteSingle(row)}
                        title="Delete prediction"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table Footer Pagination Bar */}
            <footer className="table-pagination-footer">
              <span className="showing-results-text">
                Showing {Math.min(1, filteredPredictions.length)} to {displayedPredictions.length}{" "}
                of {filteredPredictions.length} results
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="page-nav-arrow"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`page-num-btn ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  className="page-nav-arrow"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  ›
                </button>
              </div>

              <div className="rows-per-page-wrap">
                <span>Rows per page:</span>
                <select className="rows-select-dropdown" defaultValue="10">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </footer>
          </>
        )}
      </section>

      {/* Bottom Medical Disclaimer Note */}
      <footer className="history-disclaimer-banner">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          This prediction is based on the information provided and is not a replacement for medical
          advice. Always consult your nephrologist for personalized care.
        </span>
      </footer>
    </div>
  );
}
