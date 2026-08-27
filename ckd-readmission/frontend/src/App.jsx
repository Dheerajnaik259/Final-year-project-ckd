import "./App.css";
import { useEffect, useState, useRef } from "react";
import { supabase } from "./services/supabaseClient";
import PublicLanding from "./pages/PublicLanding";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Results from "./pages/Results";
import History from "./pages/History";
import { fetchPredictionDetail } from "./services/api";

// Icons for Topbar Tabs & User Dropdown
function NavHomeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function NavPredictIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function NavHistoryIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Unauthenticated navigation state: "public" | "auth"
  const [unauthMode, setUnauthMode] = useState("public");
  const [initialRegister, setInitialRegister] = useState(true);

  // Authenticated workspace page: "landing" | "predict" | "results" | "history"
  const [page, setPage] = useState("landing");
  const [result, setResult] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultsReady = (data) => {
    setResult(data);
    
    // Immediately persist to local history snapshot
    if (data) {
      try {
        const existing = JSON.parse(localStorage.getItem("ckd_local_prediction_history") || "[]");
        const recordId = data.prediction_id || `pred_${Date.now()}`;
        const newRecord = {
          id: recordId,
          created_at: new Date().toISOString(),
          patient_age: data.patient_data?.Age || data.patient_data?.age || 50,
          patient_gender: data.patient_data?.Gender || data.patient_data?.gender || 1,
          risk_level: data.risk_level,
          probability: data.probability,
          ckd_stage: typeof data.clinical_assessment?.ckd_stage === "object"
            ? data.clinical_assessment?.ckd_stage?.code
            : data.clinical_assessment?.ckd_stage || "G2",
          kdigo_risk: data.clinical_assessment?.kdigo_risk || "Moderate",
          severity_score: data.clinical_assessment?.severity_score || 0,
          patient_data: data.patient_data,
          full_result: data,
        };
        const updatedHistory = [newRecord, ...existing.filter((item) => item.id !== recordId)];
        localStorage.setItem("ckd_local_prediction_history", JSON.stringify(updatedHistory));
      } catch (err) {
        console.error("Failed to save local prediction history:", err);
      }
    }

    setPage("results");
  };

  const handleReset = () => {
    setResult(null);
    setPage("landing");
  };

  const handleGoPredict = () => {
    setResult(null);
    setPage("predict");
  };

  const handleGoHistory = () => {
    setPage("history");
  };

  const handleViewDetail = async (predictionId) => {
    try {
      const data = await fetchPredictionDetail(predictionId);
      setResult(data);
      setPage("results");
    } catch (err) {
      try {
        const localHistory = JSON.parse(localStorage.getItem("ckd_local_prediction_history") || "[]");
        const found = localHistory.find((item) => item.id === predictionId);
        if (found && found.full_result) {
          setResult(found.full_result);
          setPage("results");
          return;
        }
      } catch (e) {
        // Fall through to alert
      }
      alert("Failed to load historical prediction detail: " + err.message);
    }
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    setUnauthMode("public");
  };

  if (loadingAuth) {
    return (
      <div className="loading-screen">
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="loading-spinner" />
        <p className="mono" style={{ color: "var(--text-faint)", fontSize: "0.88rem" }}>
          Authenticating workspace session…
        </p>
      </div>
    );
  }

  // If user is not signed in
  if (!session) {
    if (unauthMode === "public") {
      return (
        <PublicLanding
          onSignIn={() => {
            setInitialRegister(false);
            setUnauthMode("auth");
          }}
          onCreateAccount={() => {
            setInitialRegister(true);
            setUnauthMode("auth");
          }}
        />
      );
    }

    return (
      <Login
        initialIsRegister={initialRegister}
        onAuthSuccess={() => setPage("landing")}
        onBackToLanding={() => setUnauthMode("public")}
      />
    );
  }

  // Authenticated Patient Workspace
  const user = session.user;
  const fullName = user?.user_metadata?.full_name || user?.email || "John Doe";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* Topbar matching reference screenshots */}
      <header className="app-topbar">
        <div
          className="brand-lockup"
          onClick={handleReset}
          style={{ cursor: "pointer" }}
        >
          <img src="/logo.png" alt="CKD Logo" className="app-logo-img" />
          <div>
            <span className="brand-name">
              CKD <span className="brand-sub">Readmission Predictor</span>
            </span>
          </div>
        </div>

        <div className="topbar-right">
          {/* Nav Tabs */}
          <nav className="topbar-actions">
            <button
              className={`nav-btn ${page === "landing" ? "active" : ""}`}
              onClick={handleReset}
            >
              <NavHomeIcon />
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-btn ${page === "predict" || page === "results" ? "active" : ""}`}
              onClick={handleGoPredict}
            >
              <NavPredictIcon />
              <span>Predict</span>
            </button>
            <button
              className={`nav-btn ${page === "history" ? "active" : ""}`}
              onClick={handleGoHistory}
            >
              <NavHistoryIcon />
              <span>History</span>
            </button>
          </nav>

          {/* Avatar & User Dropdown */}
          <div className="user-menu-container" ref={dropdownRef}>
            <button
              className="user-avatar-btn-wrap"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title={fullName}
            >
              <div className="user-avatar-btn">{initials}</div>
              <div className="avatar-chevron">
                <ChevronDownIcon />
              </div>
            </button>

            {dropdownOpen && (
              <div className="user-dropdown-card">
                <button
                  className="dropdown-action-row"
                  onClick={() => {
                    setPage("landing");
                    setDropdownOpen(false);
                  }}
                >
                  <div className="dropdown-icon-wrap">
                    <UserIcon />
                  </div>
                  <div className="dropdown-text-lockup">
                    <span className="dropdown-title">Profile</span>
                    <span className="dropdown-sub">View &amp; edit your profile</span>
                  </div>
                </button>

                <button
                  className="dropdown-action-row danger"
                  onClick={handleSignOut}
                >
                  <div className="dropdown-icon-wrap">
                    <SignOutIcon />
                  </div>
                  <div className="dropdown-text-lockup">
                    <span className="dropdown-title">Sign Out</span>
                    <span className="dropdown-sub">Sign out from your account</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {page === "landing" && (
          <Landing
            user={user}
            onNavigate={(targetPage) => setPage(targetPage)}
            onViewDetail={handleViewDetail}
          />
        )}
        {page === "predict" && (
          <Home
            user={user}
            onResultsReady={handleResultsReady}
          />
        )}
        {page === "results" && result && (
          <Results result={result} onReset={handleGoPredict} />
        )}
        {page === "history" && (
          <History
            user={user}
            onBack={handleReset}
            onNewPredict={handleGoPredict}
            onViewDetail={handleViewDetail}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>CKD Readmission Predictor</span>
        <span>Decision Support System · Non-diagnostic Reference</span>
      </footer>
    </div>
  );
}
