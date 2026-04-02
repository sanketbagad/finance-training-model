import React, { useState } from "react";
import PredictionForm from "./components/PredictionForm";
import ModelComparison from "./components/ModelComparison";
import PredictionHistory from "./components/PredictionHistory";

const TABS = [
  { key: "predict", label: "Predict" },
  { key: "compare", label: "Model Comparison" },
  { key: "history", label: "History" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("predict");

  return (
    <div className="app">
      <header className="app-header">
        <h1>Loan Approval Predictor</h1>
        <p>Compare KNN vs Random Forest predictions in real-time</p>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {activeTab === "predict" && <PredictionForm />}
      {activeTab === "compare" && <ModelComparison />}
      {activeTab === "history" && <PredictionHistory />}
    </div>
  );
}
