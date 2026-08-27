import "./App.css";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Results from "./pages/Results";
import History from "./pages/History";
import { fetchPredictionDetail } from "./services/api";

export default function App() {
  // page: "home" | "results" | "history"
  const [page, setPage] = useState("home");
  const [result, setResult] = useState(null);

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

  const handleViewDetail = async (predictionId) => {
    try {
      const data = await fetchPredictionDetail(predictionId);
      setResult(data);
      setPage("results");
    } catch (err) {
      alert("Failed to load historical prediction detail: " + err.message);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="brand-lockup" onClick={handleReset} style={{ cursor: "pointer" }}>
          <div className="brand-mark">CKD</div>
          <div>
            <p className="brand-kicker">Nephrology · Readmission Review</p>
            <p className="brand-name">Clinical Risk Calculator</p>
          </div>
        </div>

        <nav className="topbar-actions">
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
        </nav>
      </header>

      <main className="app-main">
        {page === "home" && <Home onResultsReady={handleResultsReady} />}
        {page === "results" && result && (
          <Results result={result} onReset={handleReset} />
        )}
        {page === "history" && (
          <History onBack={handleReset} onViewDetail={handleViewDetail} />
        )}
      </main>

      <footer className="app-footer">
        <span>CKD Readmission Predictor</span>
        <span>Decision Support System · Non-diagnostic Reference</span>
      </footer>
    </div>
  );
}
