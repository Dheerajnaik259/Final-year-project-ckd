import { useState } from "react";
import "./PublicLanding.css";

// SVG Icons
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

function ShieldCheckIcon() {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function BrainIcon() {
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
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 1 1 2.526 5.77 4 4 0 1 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M12 5v13" />
    </svg>
  );
}

function AnalyticsIcon() {
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

function ClockHistoryIcon() {
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
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function PrivacyShieldIcon() {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ClinicianUserGroupIcon() {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function KidneyIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 35 20 C 15 20 10 42 20 65 C 26 78 38 88 50 88 C 56 88 53 70 48 60 C 43 50 43 36 50 28 C 54 22 50 20 35 20 Z"
        fill="#33c3a8"
      />
      <path
        d="M 65 20 C 85 20 90 42 80 65 C 74 78 62 88 50 88 C 44 88 47 70 52 60 C 57 50 57 36 50 28 C 46 22 50 20 65 20 Z"
        fill="#33c3a8"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function PublicLanding({ onSignIn, onCreateAccount }) {
  const [activeTab, setActiveTab] = useState("Home");

  const handleNavClick = (tabName, elementId) => {
    setActiveTab(tabName);
    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="public-landing-container">
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* Topbar Header */}
      <header className="public-topbar">
        <div
          className="brand-lockup"
          onClick={() => handleNavClick("Home", null)}
          style={{ cursor: "pointer" }}
        >
          <img src="/logo.png" alt="CKD Logo" className="app-logo-img" />
          <div>
            <span className="brand-name">
              CKD <span style={{ color: "var(--accent-primary)" }}>Readmission Predictor</span>
            </span>
          </div>
        </div>

        <nav className="public-nav-links">
          <span
            className={`public-nav-item ${activeTab === "Home" ? "active" : ""}`}
            onClick={() => handleNavClick("Home", null)}
          >
            Home
          </span>
          <span
            className={`public-nav-item ${activeTab === "Features" ? "active" : ""}`}
            onClick={() => handleNavClick("Features", "why-choose-section")}
          >
            Features
          </span>
          <span
            className={`public-nav-item ${activeTab === "How It Works" ? "active" : ""}`}
            onClick={() => handleNavClick("How It Works", "why-choose-section")}
          >
            How It Works
          </span>
          <span
            className={`public-nav-item ${activeTab === "About" ? "active" : ""}`}
            onClick={() => handleNavClick("About", "why-choose-section")}
          >
            About
          </span>
          <span
            className={`public-nav-item ${activeTab === "Contact" ? "active" : ""}`}
            onClick={() => handleNavClick("Contact", "why-choose-section")}
          >
            Contact
          </span>
        </nav>

        <div className="public-topbar-actions">
          <button className="btn-signin-outline" onClick={onSignIn}>
            Sign In
          </button>
          <button className="btn-create-solid" onClick={onCreateAccount}>
            Create Account
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="public-main-content">
        {/* Hero Section */}
        <section className="hero-grid-split">
          <div className="hero-left-column">
            <div className="hero-pill-tag">AI-Powered • Data-Driven • Clinically Intelligent</div>

            <h1 className="hero-title-main">
              Predict. Prevent.
              <span className="hero-title-teal">Improve Outcomes.</span>
            </h1>

            <p className="hero-subtitle-desc">
              CKD Readmission Predictor uses advanced machine learning to identify high-risk
              patients and help clinicians reduce readmissions and improve patient care.
            </p>

            <div className="hero-cta-buttons">
              <button className="btn-hero-primary" onClick={onCreateAccount}>
                <span>Start Prediction</span>
                <ArrowRightIcon />
              </button>
              <button
                className="btn-hero-secondary"
                onClick={() => handleNavClick("Features", "why-choose-section")}
              >
                Learn More
              </button>
            </div>

            <div className="hero-trust-badge">
              <div className="trust-shield-icon">
                <ShieldCheckIcon />
              </div>
              <div className="trust-text-lockup">
                <span className="trust-title">Trusted by healthcare professionals</span>
                <span className="trust-sub">Secure • Reliable • HIPAA Conscious</span>
              </div>
            </div>
          </div>

          {/* Right Hero Showcase Card */}
          <div className="hero-showcase-card">
            <div className="showcase-icon-ring">
              <KidneyIcon />
              <div className="showcase-badge-mini">
                <PlusIcon />
              </div>
            </div>
            <h3 className="showcase-card-title">Smarter Predictions</h3>
            <p className="showcase-card-sub">Better decisions. Better care. Better outcomes.</p>
          </div>
        </section>

        {/* Why Choose Section */}
        <section id="why-choose-section" className="why-choose-section">
          <h2 className="section-title-large">Why Choose CKD Readmission Predictor?</h2>

          <div className="features-grid-4">
            <div className="feature-glass-card">
              <div className="feature-icon-circle">
                <BrainIcon />
              </div>
              <h3 className="feature-card-title">AI-Powered Predictions</h3>
              <p className="feature-card-desc">
                Advanced machine learning models predict readmission risk accurately.
              </p>
            </div>

            <div className="feature-glass-card">
              <div className="feature-icon-circle">
                <AnalyticsIcon />
              </div>
              <h3 className="feature-card-title">Risk Analytics</h3>
              <p className="feature-card-desc">
                Understand key risk factors and trends with clear analytics.
              </p>
            </div>

            <div className="feature-glass-card">
              <div className="feature-icon-circle">
                <ClockHistoryIcon />
              </div>
              <h3 className="feature-card-title">Prediction History</h3>
              <p className="feature-card-desc">
                Access and review all past predictions in one place.
              </p>
            </div>

            <div className="feature-glass-card">
              <div className="feature-icon-circle">
                <PrivacyShieldIcon />
              </div>
              <h3 className="feature-card-title">Secure &amp; Private</h3>
              <p className="feature-card-desc">
                Your data is protected with enterprise-grade security and privacy.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Banner Row */}
        <section className="bottom-cta-banner">
          <div className="cta-banner-left">
            <div className="cta-banner-icon">
              <ClinicianUserGroupIcon />
            </div>
            <span className="cta-banner-text">
              Built for clinicians. Designed for better patient outcomes.
            </span>
          </div>

          <span className="cta-banner-link" onClick={onCreateAccount}>
            <span>Get Started Today</span>
            <ArrowRightIcon />
          </span>
        </section>
      </main>

      {/* Footer */}
      <footer className="public-footer">
        <span>CKD Readmission Predictor © {new Date().getFullYear()}</span>
        <span>Clinical Decision Support System</span>
      </footer>
    </div>
  );
}
