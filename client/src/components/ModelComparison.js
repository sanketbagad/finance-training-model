import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Radar, Doughnut } from "react-chartjs-2";
import { getMetrics, getPredictionStats } from "../api";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  RadialLinearScale, PointElement, LineElement, Filler,
  Title, Tooltip, Legend
);

export default function ModelComparison() {
  const [metrics, setMetrics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [mRes, sRes] = await Promise.all([getMetrics(), getPredictionStats()]);
        setMetrics(mRes.data);
        setStats(sRes.data);
      } catch {
        setError("Failed to load metrics. Train models first (npm run ml:train).");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading">Loading metrics...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!metrics) return null;

  const { knn, rf } = metrics;

  // Performance bar chart
  const perfData = {
    labels: ["Accuracy", "Precision", "Recall", "F1 Score"],
    datasets: [
      {
        label: "KNN",
        data: [knn.accuracy, knn.precision, knn.recall, knn.f1_score],
        backgroundColor: "rgba(0, 210, 255, 0.6)",
        borderColor: "#00d2ff",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "Random Forest",
        data: [rf.accuracy, rf.precision, rf.recall, rf.f1_score],
        backgroundColor: "rgba(58, 123, 213, 0.6)",
        borderColor: "#3a7bd5",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // Radar chart
  const radarData = {
    labels: ["Accuracy", "Precision", "Recall", "F1 Score", "CV Mean"],
    datasets: [
      {
        label: "KNN",
        data: [knn.accuracy, knn.precision, knn.recall, knn.f1_score, knn.cv_mean],
        backgroundColor: "rgba(0,210,255,0.15)",
        borderColor: "#00d2ff",
        pointBackgroundColor: "#00d2ff",
        borderWidth: 2,
      },
      {
        label: "Random Forest",
        data: [rf.accuracy, rf.precision, rf.recall, rf.f1_score, rf.cv_mean],
        backgroundColor: "rgba(58,123,213,0.15)",
        borderColor: "#3a7bd5",
        pointBackgroundColor: "#3a7bd5",
        borderWidth: 2,
      },
    ],
  };

  // CV scores bar
  const cvData = {
    labels: ["Fold 1", "Fold 2", "Fold 3", "Fold 4", "Fold 5"],
    datasets: [
      { label: "KNN", data: knn.cv_scores, backgroundColor: "rgba(0,210,255,0.6)", borderRadius: 4 },
      { label: "Random Forest", data: rf.cv_scores, backgroundColor: "rgba(58,123,213,0.6)", borderRadius: 4 },
    ],
  };

  // Feature importance doughnut (RF only)
  const featureLabels = rf.feature_importance ? Object.keys(rf.feature_importance) : [];
  const featureValues = rf.feature_importance ? Object.values(rf.feature_importance) : [];
  const featureColors = [
    "#00d2ff", "#3a7bd5", "#66bb6a", "#ffca28", "#ef5350",
    "#ab47bc", "#26a69a", "#ff7043", "#5c6bc0", "#8d6e63", "#78909c",
  ];

  const featureData = {
    labels: featureLabels,
    datasets: [{
      data: featureValues,
      backgroundColor: featureColors.slice(0, featureLabels.length),
      borderWidth: 0,
    }],
  };

  const barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#ccc" } } },
    scales: {
      x: { ticks: { color: "#999" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "#999" }, grid: { color: "rgba(255,255,255,0.05)" }, max: 100, beginAtZero: true },
    },
  };

  const radarOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#ccc" } } },
    scales: {
      r: {
        angleLines: { color: "rgba(255,255,255,0.1)" },
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#999", backdropColor: "transparent" },
        pointLabels: { color: "#bbb" },
        min: 0,
        max: 100,
      },
    },
  };

  const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right", labels: { color: "#ccc", padding: 10, font: { size: 11 } } },
    },
  };

  return (
    <>
      {/* Summary metrics */}
      <div className="metric-cards">
        <div className="metric-card">
          <div className="value">{knn.accuracy}%</div>
          <div className="label">KNN Accuracy</div>
        </div>
        <div className="metric-card">
          <div className="value">{rf.accuracy}%</div>
          <div className="label">RF Accuracy</div>
        </div>
        <div className="metric-card">
          <div className="value">{knn.cv_mean}%</div>
          <div className="label">KNN CV Mean</div>
        </div>
        <div className="metric-card">
          <div className="value">{rf.cv_mean}%</div>
          <div className="label">RF CV Mean</div>
        </div>
        {stats?.total > 0 && (
          <>
            <div className="metric-card">
              <div className="value">{stats.total}</div>
              <div className="label">Predictions</div>
            </div>
            <div className="metric-card">
              <div className="value">{stats.agreement.rate}%</div>
              <div className="label">Model Agreement</div>
            </div>
          </>
        )}
      </div>

      {/* Performance comparison */}
      <div className="card">
        <h2>Performance Metrics Comparison</h2>
        <div className="chart-container">
          <Bar data={perfData} options={barOpts} />
        </div>
      </div>

      {/* Radar + Feature Importance */}
      <div className="charts-grid">
        <div className="card">
          <h2>Radar Overview</h2>
          <div className="chart-container">
            <Radar data={radarData} options={radarOpts} />
          </div>
        </div>
        <div className="card">
          <h2>RF Feature Importance</h2>
          <div className="chart-container">
            <Doughnut data={featureData} options={doughnutOpts} />
          </div>
        </div>
      </div>

      {/* Cross-validation */}
      <div className="card">
        <h2>Cross-Validation Scores (5-Fold)</h2>
        <div className="chart-container">
          <Bar data={cvData} options={barOpts} />
        </div>
      </div>

      {/* Confusion Matrices */}
      <div className="charts-grid">
        <div className="card">
          <h2>KNN Confusion Matrix</h2>
          <ConfusionMatrix matrix={knn.confusion_matrix} />
        </div>
        <div className="card">
          <h2>RF Confusion Matrix</h2>
          <ConfusionMatrix matrix={rf.confusion_matrix} />
        </div>
      </div>
    </>
  );
}

function ConfusionMatrix({ matrix }) {
  if (!matrix) return null;
  const labels = ["Rejected", "Approved"];
  return (
    <table className="history-table" style={{ maxWidth: 320, margin: "0 auto" }}>
      <thead>
        <tr>
          <th></th>
          <th>Pred Rejected</th>
          <th>Pred Approved</th>
        </tr>
      </thead>
      <tbody>
        {matrix.map((row, i) => (
          <tr key={i}>
            <td style={{ fontWeight: 600, color: "#9e9e9e" }}>Actual {labels[i]}</td>
            {row.map((val, j) => (
              <td key={j} style={{
                textAlign: "center",
                fontWeight: 700,
                color: i === j ? "#66bb6a" : "#ef5350",
                fontSize: "1.1rem",
              }}>
                {val}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
