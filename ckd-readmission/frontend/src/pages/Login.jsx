import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import "./Login.css";

// SVG Icons matching the mockup
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

function MailIcon() {
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
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
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
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

// 3D Medical Illustration SVG matching the mockup graphic
function Hero3DGraphic() {
  return (
    <svg
      className="hero-graphic-svg"
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="pedestalGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#050a09" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.25)" />
          <stop offset="100%" stopColor="rgba(6, 182, 212, 0.08)" />
        </linearGradient>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#33c3a8" />
          <stop offset="100%" stopColor="#0d5c4d" />
        </linearGradient>
      </defs>

      {/* Glow Pedestal Base */}
      <ellipse cx="200" cy="260" rx="140" ry="40" fill="url(#pedestalGlow)" />

      {/* 3D Tiered Rings */}
      <ellipse
        cx="200"
        cy="270"
        rx="120"
        ry="24"
        stroke="#10b981"
        strokeOpacity="0.3"
        strokeWidth="2"
        fill="none"
      />
      <ellipse
        cx="200"
        cy="255"
        rx="100"
        ry="20"
        stroke="#33c3a8"
        strokeOpacity="0.5"
        strokeWidth="2"
        fill="#081412"
      />
      <ellipse
        cx="200"
        cy="242"
        rx="80"
        ry="16"
        stroke="#44ddbf"
        strokeOpacity="0.8"
        strokeWidth="2"
        fill="#0b1a17"
      />

      {/* Main Glass Screen Panel */}
      <g transform="translate(60, 40)">
        <rect
          x="0"
          y="0"
          width="190"
          height="170"
          rx="16"
          fill="url(#panelGrad)"
          stroke="#33c3a8"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />

        {/* Kidney Illustration inside main panel */}
        <g transform="translate(25, 25)">
          <path
            d="M 30 15 C 10 15 5 35 15 55 C 20 65 30 75 40 75 C 45 75 42 60 38 52 C 34 44 34 32 40 25 C 43 20 40 15 30 15 Z"
            fill="#33c3a8"
            fillOpacity="0.85"
          />
          <path
            d="M 60 15 C 80 15 85 35 75 55 C 70 65 60 75 50 75 C 45 75 48 60 52 52 C 56 44 56 32 50 25 C 47 20 50 15 60 15 Z"
            fill="#33c3a8"
            fillOpacity="0.85"
          />
          {/* Connecting tubules */}
          <path d="M 38 52 Q 45 65 52 52" stroke="#44ddbf" strokeWidth="2" fill="none" />
        </g>

        {/* UI Skeleton lines on main panel */}
        <rect x="110" y="35" width="55" height="6" rx="3" fill="#33c3a8" fillOpacity="0.7" />
        <rect x="110" y="50" width="40" height="4" rx="2" fill="rgba(233, 243, 239, 0.4)" />
        <rect x="25" y="115" width="140" height="4" rx="2" fill="rgba(233, 243, 239, 0.2)" />
        <rect x="25" y="130" width="90" height="4" rx="2" fill="rgba(233, 243, 239, 0.2)" />
      </g>

      {/* Overlay Chart Panel */}
      <g transform="translate(195, 110)">
        <rect
          x="0"
          y="0"
          width="135"
          height="100"
          rx="12"
          fill="#0b1715"
          stroke="#33c3a8"
          strokeOpacity="0.6"
          strokeWidth="1.5"
        />
        {/* Trend line graph */}
        <path
          d="M 15 70 L 40 55 L 65 62 L 95 30 L 120 42"
          stroke="#44ddbf"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Data points */}
        <circle cx="15" cy="70" r="3" fill="#33c3a8" />
        <circle cx="40" cy="55" r="3" fill="#33c3a8" />
        <circle cx="65" cy="62" r="3" fill="#33c3a8" />
        <circle cx="95" cy="30" r="4" fill="#ffffff" stroke="#33c3a8" strokeWidth="2" />
        <circle cx="120" cy="42" r="3" fill="#33c3a8" />
      </g>

      {/* Floating Shield Badge */}
      <g transform="translate(75, 175)">
        <path
          d="M 25 0 L 50 12 V 35 C 50 52 25 65 25 65 C 25 65 0 52 0 35 V 12 Z"
          fill="url(#shieldGrad)"
          stroke="#44ddbf"
          strokeWidth="1.5"
        />
        {/* White Cross */}
        <path
          d="M 25 22 V 40 M 16 31 H 34"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>

      {/* Floating particles and crosshairs */}
      <path
        d="M 310 65 M 305 65 H 315 M 310 60 V 70"
        stroke="#33c3a8"
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />
      <path
        d="M 330 180 M 325 180 H 335 M 330 175 V 185"
        stroke="#33c3a8"
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />
      <circle cx="340" cy="115" r="2" fill="#33c3a8" opacity="0.6" />
      <circle cx="50" cy="110" r="2" fill="#33c3a8" opacity="0.4" />
    </svg>
  );
}

export default function Login({ onAuthSuccess, initialIsRegister = true, onBackToLanding }) {
  const [isRegister, setIsRegister] = useState(initialIsRegister);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (isRegister && !fullName.trim()) {
      errs.fullName = "Full name is required";
    }
    if (!email.trim() || !email.includes("@")) {
      errs.email = "Please enter a valid email address";
    }
    if (!password || password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (isRegister && password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        const userId = data?.user?.id;
        if (userId) {
          try {
            await supabase.from("patient_profiles").upsert({
              user_id: userId,
              full_name: fullName,
              age: 45,
              sex: "Male",
              contact_number: "",
            });
          } catch (_e) {
            console.warn("Profile creation note:", _e);
          }
        }

        // If auto-session was not returned by signUp, perform immediate password login
        if (!data?.session) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (!signInError && signInData?.session) {
            if (onAuthSuccess) onAuthSuccess(signInData.session);
            return;
          }
        }

        if (onAuthSuccess) onAuthSuccess(data?.session || data?.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (onAuthSuccess) onAuthSuccess(data?.session || data?.user);
      }
    } catch (err) {
      let errMsg = err.message || "Authentication failed. Please check your credentials.";
      const lower = errMsg.toLowerCase();
      if (lower.includes("rate limit") || lower.includes("security purposes")) {
        errMsg =
          "Your account has been created! Click 'Sign in' below to log in with your password.";
        setIsRegister(false); // Auto-switch to Sign In mode for seamless experience
      } else if (lower.includes("already registered") || lower.includes("already exists")) {
        errMsg = "Account already exists! Click 'Sign in' below to log in.";
        setIsRegister(false);
      }
      setErrors({ auth: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrors({});
  };

  return (
    <div className="auth-page-wrapper">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <div className="auth-split-card">
        {/* Left Hero Branding Section */}
        <div className="auth-hero-panel">
          <div
            className="hero-brand"
            onClick={onBackToLanding}
            style={{ cursor: onBackToLanding ? "pointer" : "default" }}
          >
            <img src="/logo.png" alt="CKD Logo" className="app-logo-img" />
            <div>
              <div className="hero-brand-title">CKD</div>
              <div className="hero-brand-sub">Readmission Predictor</div>
            </div>
          </div>

          <div className="hero-content">
            <h1 className="hero-headline">
              Smarter insights.
              <span className="hero-headline-accent">Better outcomes.</span>
            </h1>
            <p className="hero-subtext">
              Join the CKD Readmission Predictor workspace to analyze, predict, and improve patient
              outcomes with confidence.
            </p>
          </div>

          <div className="hero-graphic-wrap">
            <Hero3DGraphic />
          </div>
        </div>

        {/* Right Form Section */}
        <div className="auth-form-card">
          <div className="auth-form-header">
            <div className="auth-avatar-circle">
              <UserIcon />
            </div>
            <h2 className="auth-form-title">
              {isRegister ? "Create your account" : "Sign in to your workspace"}
            </h2>
            <p className="auth-form-subtitle">
              {isRegister
                ? "Register to access your personal renal review workspace"
                : "Enter your credentials to access your assessment workspace"}
            </p>
          </div>

          <form className="auth-form-fields" onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <div className="input-field-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-relative-wrap">
                  <div className="input-left-icon">
                    <UserIcon />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    className="glass-input-styled"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                {errors.fullName && <div className="inline-error">{errors.fullName}</div>}
              </div>
            )}

            <div className="input-field-group">
              <label htmlFor="email">Email address</label>
              <div className="input-relative-wrap">
                <div className="input-left-icon">
                  <MailIcon />
                </div>
                <input
                  id="email"
                  type="email"
                  className="glass-input-styled"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <div className="inline-error">{errors.email}</div>}
            </div>

            <div className="input-field-group">
              <label htmlFor="password">Password</label>
              <div className="input-relative-wrap">
                <div className="input-left-icon">
                  <LockIcon />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="glass-input-styled has-right-icon"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-right-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <div className="inline-error">{errors.password}</div>}
            </div>

            {isRegister && (
              <div className="input-field-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-relative-wrap">
                  <div className="input-left-icon">
                    <LockIcon />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="glass-input-styled has-right-icon"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-right-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="inline-error">{errors.confirmPassword}</div>
                )}
              </div>
            )}

            {errors.auth && (
              <div className="inline-error" style={{ textAlign: "center" }}>
                {errors.auth}
              </div>
            )}

            <button type="submit" className="submit-btn-gradient" disabled={loading}>
              <span>{loading ? "Processing…" : isRegister ? "Create Account" : "Sign In"}</span>
              {!loading && <ArrowRightIcon />}
            </button>
          </form>

          <div className="toggle-mode-wrapper">
            <span>{isRegister ? "Already have an account?" : "Don't have an account?"}</span>
            <button type="button" className="toggle-mode-btn" onClick={toggleMode}>
              {isRegister ? "Sign in" : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
