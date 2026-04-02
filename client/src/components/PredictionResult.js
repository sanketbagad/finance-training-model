import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function PredictionResult({ result }) {
  const { knn, rf } = result.results;

  const confidenceData = {
    labels: ["KNN", "Random Forest"],
    datasets: [
      {
        label: "Approved %",
        data: [knn.probabilities.approved, rf.probabilities.approved],
        backgroundColor: ["rgba(0, 210, 255, 0.7)", "rgba(58, 123, 213, 0.7)"],
        borderColor: ["#00d2ff", "#3a7bd5"],
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "Rejected %",
        data: [knn.probabilities.rejected, rf.probabilities.rejected],
        backgroundColor: ["rgba(239, 83, 80, 0.5)", "rgba(244, 67, 54, 0.5)"],
        borderColor: ["#ef5350", "#f44336"],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const knnDoughnut = {
    labels: ["Approved", "Rejected"],
    datasets: [{
      data: [knn.probabilities.approved, knn.probabilities.rejected],
      backgroundColor: ["rgba(76,175,80,0.7)", "rgba(244,67,54,0.7)"],
      borderWidth: 0,
    }],
  };

  const rfDoughnut = {
    labels: ["Approved", "Rejected"],
    datasets: [{
      data: [rf.probabilities.approved, rf.probabilities.rejected],
      backgroundColor: ["rgba(76,175,80,0.7)", "rgba(244,67,54,0.7)"],
      borderWidth: 0,
    }],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#ccc" } },
    },
    scales: {
      x: { ticks: { color: "#999" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "#999" }, grid: { color: "rgba(255,255,255,0.05)" }, max: 100 },
    },
  };

  const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "#ccc", padding: 16 } },
    },
  };

  return (
    <>
      <div className="card">
        <h2>Prediction Results</h2>
        <div className="results-grid">
          <div className="result-card">
            <h3>KNN Algorithm</h3>
            <span className={`prediction-badge ${knn.prediction.toLowerCase()}`}>
              {knn.prediction}
            </span>
            <p className="confidence">Confidence: {knn.confidence}%</p>
          </div>
          <div className="result-card">
            <h3>Random Forest</h3>
            <span className={`prediction-badge ${rf.prediction.toLowerCase()}`}>
              {rf.prediction}
            </span>
            <p className="confidence">Confidence: {rf.confidence}%</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Probability Comparison</h2>
        <div className="charts-grid">
          <div>
            <div className="chart-container">
              <Bar data={confidenceData} options={chartOpts} />
            </div>
          </div>
          <div className="charts-grid">
            <div>
              <h3 style={{ textAlign: "center", color: "#9e9e9e", marginBottom: 8, fontSize: "0.85rem" }}>KNN</h3>
              <div className="chart-container" style={{ height: 220 }}>
                <Doughnut data={knnDoughnut} options={doughnutOpts} />
              </div>
            </div>
            <div>
              <h3 style={{ textAlign: "center", color: "#9e9e9e", marginBottom: 8, fontSize: "0.85rem" }}>Random Forest</h3>
              <div className="chart-container" style={{ height: 220 }}>
                <Doughnut data={rfDoughnut} options={doughnutOpts} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
