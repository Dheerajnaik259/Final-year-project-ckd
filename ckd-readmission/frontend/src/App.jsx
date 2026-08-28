import "./App.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
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
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function NavPredictIcon() {
  return (
    <svg
      width="17"
      height="17"
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

function NavHistoryIcon() {
  return (
    <svg
      width="17"
      height="17"
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

function SignOutIcon() {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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

  const [result, setResult] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Derive current page from URL path
  const currentPath = location.pathname;
  const page = (() => {
    if (currentPath === "/predict") return "predict";
    if (currentPath === "/results") return "results";
    if (currentPath === "/history") return "history";
    return "landing"; // "/" and everything else
  })();

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

  const handleResultsReady = useCallback((data) => {
    setResult(data);

    // Persist prediction to Supabase (cross-device sync) and localStorage (fast local cache)
    if (data) {
      const recordId = data.prediction_id || `pred_${Date.now()}`;
      const newRecord = {
        user_id: session?.user?.id || null,
        created_at: new Date().toISOString(),
        patient_age: data.patient_data?.Age || data.patient_data?.age || 50,
        patient_gender: data.patient_data?.Gender || data.patient_data?.gender || 1,
        risk_level: data.risk_level,
        probability: data.probability,
        ckd_stage:
          typeof data.clinical_assessment?.ckd_stage === "object"
            ? data.clinical_assessment?.ckd_stage?.code
            : data.clinical_assessment?.ckd_stage || "G2",
        kdigo_risk: data.clinical_assessment?.kdigo_risk || "Moderate",
        severity_score: data.clinical_assessment?.severity_score || 0,
        patient_data: data.patient_data,
        top_factors: data.top_clinical_factors || [],
        clinical_recommendation: data.clinical_recommendation || {},
        full_result: data,
      };

      // Save to Supabase (async, non-blocking — enables cross-device history)
      supabase
        .from("predictions")
        .insert([newRecord])
        .then(({ error }) => {
          if (error) console.warn("Supabase prediction save note:", error.message);
          else console.log("Prediction saved to Supabase for cross-device sync.");
        });

      // Also keep localStorage as fast local cache
      try {
        const localRecord = { ...newRecord, id: recordId };
        if (session?.user?.id) {
          const userKey = `ckd_history_${session.user.id}`;
          const existingUser = JSON.parse(localStorage.getItem(userKey) || "[]");
          localStorage.setItem(userKey, JSON.stringify([localRecord, ...existingUser.filter((i) => i.id !== recordId)]));
        }
        const existingFallback = JSON.parse(localStorage.getItem("ckd_local_prediction_history") || "[]");
        localStorage.setItem(
          "ckd_local_prediction_history",
          JSON.stringify([localRecord, ...existingFallback.filter((i) => i.id !== recordId)])
        );
      } catch (err) {
        console.error("Failed to save local prediction history:", err);
      }
    }

    navigate("/results");
  }, [navigate, session]);


  const handleReset = useCallback(() => {
    setResult(null);
    navigate("/dashboard");
  }, [navigate]);

  const handleGoPredict = useCallback(() => {
    setResult(null);
    navigate("/predict");
  }, [navigate]);

  const handleGoHistory = useCallback(() => {
    navigate("/history");
  }, [navigate]);

  const handleViewDetail = useCallback(async (predictionArg) => {
    try {
      // 1. If an object with full_result or prediction result fields is passed directly
      if (predictionArg && typeof predictionArg === "object") {
        if (predictionArg.full_result) {
          setResult(predictionArg.full_result);
          navigate("/results");
          return;
        }
        if (predictionArg.risk_level && predictionArg.probability) {
          setResult(predictionArg);
          navigate("/results");
          return;
        }
      }

      const predictionId = typeof predictionArg === "object" ? predictionArg?.id : predictionArg;

      // 2. Check local user-scoped storage for immediate snapshot match
      const userStorageKey = session?.user?.id
        ? `ckd_history_${session.user.id}`
        : "ckd_local_prediction_history";

      let localHistory = [];
      try {
        localHistory = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
      } catch (_e) {
        localHistory = [];
      }

      try {
        const fallbackHistory = JSON.parse(
          localStorage.getItem("ckd_local_prediction_history") || "[]"
        );
        localHistory = [...localHistory, ...fallbackHistory];
      } catch (_e) {
        // Ignore fallback parse error
      }

      const foundLocal = localHistory.find(
        (item) => item && (item.id === predictionId || item.prediction_id === predictionId)
      );

      if (foundLocal) {
        if (foundLocal.full_result) {
          setResult(foundLocal.full_result);
          navigate("/results");
          return;
        }
        if (foundLocal.risk_level && foundLocal.probability) {
          setResult(foundLocal);
          navigate("/results");
          return;
        }
      }

      // 3. Query remote backend API if non-local ID
      if (predictionId && !String(predictionId).startsWith("pred_")) {
        try {
          const data = await fetchPredictionDetail(predictionId);
          if (data && !data.error) {
            setResult(data);
            navigate("/results");
            return;
          }
        } catch (_err) {
          console.warn("Backend detail fetch note:", _err);
        }
      }

      // 4. Fallback: if prediction object was provided
      if (predictionArg && typeof predictionArg === "object") {
        setResult(predictionArg);
        navigate("/results");
        return;
      }

      throw new Error("Prediction record details not found");
    } catch (err) {
      alert("Failed to load historical prediction detail: " + err.message);
    }
  }, [navigate, session]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    setUnauthMode("public");
    navigate("/");
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
        onAuthSuccess={() => navigate("/dashboard")}
        onBackToLanding={() => setUnauthMode("public")}
      />
    );
  }

  // Authenticated Patient Workspace
  const user = session.user;
  const fullName = user?.user_metadata?.full_name || user?.email || "User";
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
        <div className="brand-lockup" onClick={handleReset} style={{ cursor: "pointer" }}>
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
                    navigate("/dashboard");
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

                <button className="dropdown-action-row danger" onClick={handleSignOut}>
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
        <Routes>
          <Route
            path="/"
            element={
              <Landing
                user={user}
                onNavigate={(targetPage) => navigate(`/${targetPage}`)}
                onViewDetail={handleViewDetail}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <Landing
                user={user}
                onNavigate={(targetPage) => navigate(`/${targetPage}`)}
                onViewDetail={handleViewDetail}
              />
            }
          />
          <Route
            path="/predict"
            element={<Home user={user} onResultsReady={handleResultsReady} />}
          />
          <Route
            path="/results"
            element={
              result ? (
                <Results result={result} onReset={handleGoPredict} />
              ) : (
                <Navigate to="/predict" replace />
              )
            }
          />
          <Route
            path="/history"
            element={
              <History
                user={user}
                onBack={handleReset}
                onNewPredict={handleGoPredict}
                onViewDetail={handleViewDetail}
              />
            }
          />
          {/* Default fallback: authenticated users go to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <span>CKD Readmission Predictor</span>
        <span>Decision Support System · Non-diagnostic Reference</span>
      </footer>
    </div>
  );
}
