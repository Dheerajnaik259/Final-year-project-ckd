import "./App.css";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Results from "./pages/Results";
import History from "./pages/History";

export default function App() {
  // page: "home" | "results" | "history"
  const [page, setPage] = useState("home");
  const [result, setResult] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
  }, []);

  const handleResultsReady = (data) => {
    setResult(data);
    setPage("results");
  };

  const handleReset = () => {
    setResult(null);
    setPage("home");
  };

  const handleGoHistory = () => {
    setPage("history");
  };

  return (
    <div className="app-shell">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      <header className="app-topbar">
        <div className="brand-lockup" onClick={handleReset} style={{ cursor: "pointer" }}>
          <div className="brand-mark">CKD</div>
          <div>
            <p className="brand-kicker">Renal review workspace</p>
            <p className="brand-name">Readmission Predictor</p>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            className={`nav-btn ${page === "home" || page === "results" ? "active" : ""}`}
            onClick={handleReset}
          >
            Predict
          </button>
          <button
            className={`nav-btn ${page === "history" ? "active" : ""}`}
            onClick={handleGoHistory}
          >
            History
          </button>
        </div>
      </header>

      <main className="app-main">
        {page === "home" && <Home onResultsReady={handleResultsReady} />}
        {page === "results" && result && (
          <Results result={result} onReset={handleReset} />
        )}
        {page === "history" && (
          <History onBack={handleReset} />
        )}
      </main>

      <footer className="app-footer">
        <span>CKD Readmission Predictor</span>
        <span>Final year project build</span>
      </footer>
    </div>
  );
}
