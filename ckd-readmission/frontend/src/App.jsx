import "./App.css";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Results from "./pages/Results";

export default function App() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    // App is locked to a single theme (dark) for consistent presentation.
    document.documentElement.dataset.theme = "dark";
  }, []);

  return (
    <div className="app-shell">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      <header className="app-topbar">
        <div className="brand-lockup">
          <div className="brand-mark">CKD</div>
          <div>
            <p className="brand-kicker">Renal review workspace</p>
            <p className="brand-name">Readmission Predictor</p>
          </div>
        </div>

        <div className="topbar-actions" />
      </header>

      <main className="app-main">
        {result === null ? (
          <Home onResultsReady={setResult} />
        ) : (
          <Results result={result} onReset={() => setResult(null)} />
        )}
      </main>

      <footer className="app-footer">
        <span>CKD Readmission Predictor</span>
        <span>Final year project build</span>
      </footer>
    </div>
  );
}
