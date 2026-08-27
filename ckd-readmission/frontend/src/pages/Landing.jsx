import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { fetchPredictionHistory } from "../services/api";
import "./Landing.css";

// SVG Icons
function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function EditPencilIcon() {
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
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function PulseIcon() {
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
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function KidneyIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 35 20 C 15 20 10 42 20 65 C 26 78 38 88 50 88 C 56 88 53 70 48 60 C 43 50 43 36 50 28 C 54 22 50 20 35 20 Z"
        fill="currentColor"
      />
      <path
        d="M 65 20 C 85 20 90 42 80 65 C 74 78 62 88 50 88 C 44 88 47 70 52 60 C 57 50 57 36 50 28 C 46 22 50 20 65 20 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

// 3D Clipboard Graphic matching the bottom right card in mockup
function Clipboard3DGraphic() {
  return (
    <svg
      className="health-graphic-svg"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="clipGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#080e0d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shieldFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="140" rx="70" ry="18" fill="url(#clipGlow)" />
      <rect
        x="45"
        y="25"
        width="90"
        height="110"
        rx="10"
        fill="#0c1715"
        stroke="#33c3a8"
        strokeOpacity="0.4"
        strokeWidth="1.5"
        transform="rotate(-6 90 80)"
      />
      <rect
        x="75"
        y="18"
        width="30"
        height="10"
        rx="3"
        fill="#33c3a8"
        transform="rotate(-6 90 80)"
      />
      <rect
        x="60"
        y="48"
        width="60"
        height="4"
        rx="2"
        fill="#33c3a8"
        fillOpacity="0.8"
        transform="rotate(-6 90 80)"
      />
      <rect
        x="60"
        y="60"
        width="45"
        height="3"
        rx="1.5"
        fill="rgba(233, 243, 239, 0.4)"
        transform="rotate(-6 90 80)"
      />
      <rect
        x="60"
        y="70"
        width="50"
        height="3"
        rx="1.5"
        fill="rgba(233, 243, 239, 0.4)"
        transform="rotate(-6 90 80)"
      />

      <g transform="translate(120, 85)">
        <path
          d="M 22 0 L 44 10 V 30 C 44 45 22 55 22 55 C 22 55 0 45 0 30 V 10 Z"
          fill="url(#shieldFill)"
          stroke="#44ddbf"
          strokeWidth="1.5"
        />
        <path
          d="M 22 18 V 34 M 14 26 H 30"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function formatDate(iso) {
  if (!iso) return { date: "—", time: "" };
  const d = new Date(iso);
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
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return {
    date: `${month} ${day}, ${year}`,
    time: `${hours}:${minutes} ${ampm}`,
  };
}

export default function Landing({ user, onNavigate, onViewDetail }) {
  const [profile, setProfile] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [latestVitals, setLatestVitals] = useState(null);

  // Edit Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    age: "",
    sex: "",
    contact_number: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        // 1. Check local user-scoped profile snapshot first
        let localProf = null;
        try {
          const cached = localStorage.getItem(`ckd_profile_${user.id}`);
          if (cached) localProf = JSON.parse(cached);
        } catch (_e) {
          localProf = null;
        }

        // 2. Fetch real patient profile from Supabase
        let profData = null;
        try {
          const { data } = await supabase
            .from("patient_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          profData = data;
        } catch (_err) {
          console.warn("Remote patient_profiles table query note:", _err);
        }

        const realName =
          localProf?.full_name ||
          profData?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "User";

        const mergedProfile = {
          user_id: user.id,
          full_name: realName,
          age: localProf?.age ?? profData?.age ?? null,
          sex: localProf?.sex ?? profData?.sex ?? null,
          contact_number: localProf?.contact_number ?? profData?.contact_number ?? null,
        };

        setProfile(mergedProfile);
        setEditForm({
          full_name: mergedProfile.full_name,
          age: mergedProfile.age ? String(mergedProfile.age) : "",
          sex: mergedProfile.sex || "",
          contact_number: mergedProfile.contact_number || "",
        });

        // 3. Fetch real prediction history for this authenticated user
        let serverPreds = [];
        try {
          const data = await fetchPredictionHistory(10, 0, user.id);
          serverPreds = data.predictions || [];
        } catch (err) {
          console.warn("Could not fetch remote predictions for landing dashboard:", err);
        }

        let localPreds = [];
        try {
          localPreds = JSON.parse(localStorage.getItem(`ckd_history_${user.id}`) || "[]");
        } catch (_e) {
          localPreds = [];
        }

        const mergedMap = new Map();
        [...serverPreds, ...localPreds].forEach((item) => {
          if (item && item.id && !mergedMap.has(item.id)) {
            if (!item.user_id || item.user_id === user.id) {
              mergedMap.set(item.id, item);
            }
          }
        });

        const userPreds = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now())
        );

        setRecentPredictions(userPreds.slice(0, 3));
        setHistoryCount(userPreds.length);

        if (userPreds.length > 0) {
          const topPred = userPreds[0];
          const vitals =
            topPred.patient_data ||
            (topPred.full_result && topPred.full_result.patient_data) ||
            topPred;
          if (vitals) {
            setLatestVitals(vitals);
          }
        }
      } catch (err) {
        console.error("Error loading landing dashboard:", err);
      }
    }

    loadData();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = {
        user_id: user.id,
        full_name: editForm.full_name ? editForm.full_name.trim() : "",
        age: editForm.age ? parseInt(editForm.age, 10) : null,
        sex: editForm.sex || null,
        contact_number: editForm.contact_number ? editForm.contact_number.trim() : "",
      };

      // 1. Instant user-scoped local persistence
      try {
        localStorage.setItem(`ckd_profile_${user.id}`, JSON.stringify(updated));
      } catch (_e) {
        console.warn("Local profile cache warning:", _e);
      }

      // 2. Update Supabase Auth user metadata
      try {
        await supabase.auth.updateUser({
          data: { full_name: updated.full_name },
        });
      } catch (_e) {
        console.warn("Supabase auth updateUser note:", _e);
      }

      // 3. Upsert to Supabase patient_profiles table
      try {
        await supabase.from("patient_profiles").upsert(updated, { onConflict: "user_id" });
      } catch (err) {
        console.warn("Supabase patient_profiles upsert note:", err);
      }

      setProfile(updated);
      setIsEditOpen(false);
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const fullName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "—";

  // Robust Vital & Demographics extraction from latest prediction data
  const egfrVal =
    latestVitals?.GFR ?? latestVitals?.gfr ?? latestVitals?.egfr ?? latestVitals?.eGFR;

  const sysBp =
    latestVitals?.SystolicBP ??
    latestVitals?.systolic_bp ??
    latestVitals?.Systolic_BP ??
    latestVitals?.systolic;

  const diaBp =
    latestVitals?.DiastolicBP ??
    latestVitals?.diastolic_bp ??
    latestVitals?.Diastolic_BP ??
    latestVitals?.diastolic;

  const predAge = latestVitals?.Age ?? latestVitals?.age ?? latestVitals?.patient_age;

  const predGenderVal =
    latestVitals?.Gender ?? latestVitals?.gender ?? latestVitals?.patient_gender;

  const formattedGender =
    predGenderVal !== undefined && predGenderVal !== null
      ? predGenderVal === 1 ||
        predGenderVal === "1" ||
        String(predGenderVal).toLowerCase() === "male"
        ? "Male"
        : "Female"
      : null;

  const displayAge = profile?.age ? `${profile.age}` : predAge ? `${predAge}` : "Not specified";
  const displayGender = profile?.sex || formattedGender || "Not specified";

  const getBpStatus = (sys, dia) => {
    if (sys === undefined || dia === undefined || sys === null || dia === null) {
      return { label: "N/A", cls: "na" };
    }
    const s = Number(sys);
    const d = Number(dia);
    if (s >= 140 || d >= 90) return { label: "High", cls: "moderate" };
    if (s >= 120 || d >= 80) return { label: "Elevated", cls: "normal" };
    return { label: "Normal", cls: "normal" };
  };
  const bpStatus = getBpStatus(sysBp, diaBp);

  const getEgfrStatus = (val) => {
    if (val === undefined || val === null) return { label: "N/A", cls: "na" };
    const v = Number(val);
    if (v < 30) return { label: "Severely Low", cls: "moderate" };
    if (v < 60) return { label: "Moderate", cls: "moderate" };
    return { label: "Normal", cls: "normal" };
  };
  const egfrStatus = getEgfrStatus(egfrVal);

  return (
    <div className="dashboard-page-container">
      {/* Welcome Header */}
      <div className="dashboard-welcome-header">
        <h1 className="welcome-title">Welcome back, {fullName} 👋</h1>
        <p className="welcome-sub">Here's your health overview and latest insights.</p>
      </div>

      {/* Main 2-Column Dashboard Layout */}
      <div className="dashboard-main-grid">
        {/* Left Column */}
        <div className="dashboard-left-column">
          {/* Patient Profile Card */}
          <div className="dash-card">
            <div className="card-header-row">
              <div className="card-title-lockup">
                <div className="card-title-icon">
                  <UserIcon />
                </div>
                <span className="card-title-text">Patient Profile</span>
              </div>
              <button className="card-action-link" onClick={() => setIsEditOpen(true)}>
                <span>Edit details</span>
                <EditPencilIcon />
              </button>
            </div>

            <div className="patient-profile-split">
              {/* Demographics List */}
              <div className="profile-info-list">
                <div className="profile-info-row">
                  <span className="profile-info-label">Full Name</span>
                  <span className="profile-info-val">{fullName}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Age</span>
                  <span className="profile-info-val">{displayAge}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Gender</span>
                  <span className="profile-info-val">{displayGender}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Phone</span>
                  <span className="profile-info-val">
                    {profile?.contact_number || "Not specified"}
                  </span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Email</span>
                  <span className="profile-info-val">{email}</span>
                </div>
              </div>

              {/* Latest Vitals Nested Box */}
              <div className="vitals-nested-panel">
                <div className="vitals-panel-title">
                  <PulseIcon />
                  <span>Latest Vitals</span>
                </div>

                <div className="vital-item-row">
                  <div className="vital-left">
                    <div className="vital-icon-box">
                      <KidneyIcon />
                    </div>
                    <div className="vital-details">
                      <span className="vital-name">eGFR</span>
                      <div className="vital-value-unit">
                        {egfrVal !== undefined && egfrVal !== null ? egfrVal : "—"}{" "}
                        {egfrVal !== undefined && egfrVal !== null && (
                          <span className="vital-unit-text">mL/min/1.73m²</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`vital-status-pill ${egfrStatus.cls}`}>{egfrStatus.label}</span>
                </div>

                <div className="vital-item-row">
                  <div className="vital-left">
                    <div className="vital-icon-box">
                      <DropletIcon />
                    </div>
                    <div className="vital-details">
                      <span className="vital-name">Blood Pressure</span>
                      <div className="vital-value-unit">
                        {sysBp !== undefined &&
                        sysBp !== null &&
                        diaBp !== undefined &&
                        diaBp !== null
                          ? `${sysBp} / ${diaBp}`
                          : "—"}{" "}
                        {sysBp !== undefined && sysBp !== null && (
                          <span className="vital-unit-text">mmHg</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`vital-status-pill ${bpStatus.cls}`}>{bpStatus.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Predictions Card */}
          <div className="dash-card">
            <div className="card-header-row">
              <div className="card-title-lockup">
                <div className="card-title-icon">
                  <ClockIcon />
                </div>
                <span className="card-title-text">Recent Predictions</span>
              </div>
              <button className="card-action-link" onClick={() => onNavigate("history")}>
                <span>View all history</span>
                <ChevronRightIcon />
              </button>
            </div>

            {recentPredictions.length === 0 ? (
              <div className="empty-predictions-box">
                <p>No readmission predictions recorded yet.</p>
                <button
                  className="btn-hero-primary"
                  onClick={() => onNavigate("predict")}
                  style={{ padding: "0.55rem 1.2rem", fontSize: "0.85rem", marginTop: "0.4rem" }}
                >
                  <PlusIcon />
                  <span>Start First Assessment</span>
                </button>
              </div>
            ) : (
              <div className="recent-preds-list">
                {recentPredictions.map((pred) => {
                  const { date, time } = formatDate(pred.created_at);
                  const levelClass = (pred.risk_level || "Low").toLowerCase();
                  return (
                    <div
                      key={pred.id}
                      className="recent-pred-row"
                      onClick={() => onViewDetail && onViewDetail(pred)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="pred-date-cell">
                        <CalendarIcon />
                        <div className="pred-date-info">
                          <span className="pred-date-text">{date}</span>
                          <span className="pred-time-text">{time}</span>
                        </div>
                      </div>
                      <span className={`pred-risk-badge ${levelClass}`}>
                        {pred.risk_level} Risk
                      </span>
                      <div className="pred-prob-cell">
                        <span className={`pred-prob-percent ${levelClass}`}>
                          {pred.probability}%
                        </span>
                        <span className="pred-prob-label">Readmission Risk</span>
                      </div>
                      <button
                        className="btn-view-report"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewDetail) onViewDetail(pred);
                        }}
                      >
                        <EyeIcon /> View Report
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column Action Tiles */}
        <div className="dashboard-right-column">
          {/* New Prediction Tile */}
          <div className="action-tile-new-pred" onClick={() => onNavigate("predict")}>
            <div className="tile-icon-square-teal">
              <PlusIcon />
            </div>
            <div className="tile-text-group">
              <span className="tile-main-title">New Prediction</span>
              <span className="tile-sub-desc">
                Start a new assessment and check readmission risk.
              </span>
            </div>
            <div className="tile-arrow-icon">
              <ChevronRightIcon />
            </div>
          </div>

          {/* View History Tile */}
          <div className="action-tile-view-history" onClick={() => onNavigate("history")}>
            <div className="tile-icon-square-purple">
              <BarChartIcon />
            </div>
            <div className="tile-text-group">
              <span className="tile-main-title">View History</span>
              <span className="tile-sub-desc">View all your past predictions and reports.</span>
            </div>
            <div className="tile-count-lockup">
              <span className="tile-count-num">{historyCount}</span>
              <span className="tile-count-label">Records</span>
            </div>
          </div>

          {/* Stay on top of your health Showcase Card */}
          <div className="health-showcase-card">
            <div className="health-card-header">
              <div className="card-title-icon">
                <ShieldCheckIcon />
              </div>
              <span className="health-card-title">Stay on top of your health</span>
            </div>
            <p className="health-card-desc">
              Regular monitoring and timely assessments can help reduce the risk of readmission.
            </p>
            <div className="health-graphic-wrap">
              <Clipboard3DGraphic />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <footer className="dashboard-copyright-footer">
        © {new Date().getFullYear()} CKD Readmission Predictor. All rights reserved.
      </footer>

      {/* Edit Patient Details Modal */}
      {isEditOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditOpen(false)}>
          <div className="glass-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Patient Profile</h2>
            <form onSubmit={handleSaveProfile} className="auth-form-fields">
              <div className="input-field-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="glass-input-styled"
                  style={{ paddingLeft: "1rem" }}
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="input-field-group">
                <label>Age</label>
                <input
                  type="number"
                  className="glass-input-styled"
                  style={{ paddingLeft: "1rem" }}
                  placeholder="e.g. 56"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                />
              </div>

              <div className="input-field-group">
                <label>Gender</label>
                <select
                  className="glass-input-styled"
                  style={{ paddingLeft: "1rem", color: "#ffffff", backgroundColor: "#0c1715" }}
                  value={editForm.sex}
                  onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                >
                  <option value="" style={{ background: "#0c1715", color: "#ffffff" }}>
                    Select Gender
                  </option>
                  <option value="Female" style={{ background: "#0c1715", color: "#ffffff" }}>
                    Female
                  </option>
                  <option value="Male" style={{ background: "#0c1715", color: "#ffffff" }}>
                    Male
                  </option>
                </select>
              </div>

              <div className="input-field-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="glass-input-styled"
                  style={{ paddingLeft: "1rem" }}
                  placeholder="+91 98765 43210"
                  value={editForm.contact_number}
                  onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-signin-outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn-gradient"
                  disabled={savingProfile}
                  style={{ width: "auto", padding: "0.6rem 1.4rem" }}
                >
                  {savingProfile ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
