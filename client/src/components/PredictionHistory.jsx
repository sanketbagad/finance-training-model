import React, { useEffect, useState } from "react";
import { getPredictions } from "../api";

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPredictions()
      .then(({ data }) => setPredictions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading history...</div>;

  if (predictions.length === 0) {
    return (
      <div className="card">
        <h2>Prediction History</h2>
        <p style={{ color: "#9e9e9e" }}>No predictions yet. Submit one from the Predict tab.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Prediction History</h2>
      <div style={{ overflowX: "auto" }}>
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Income</th>
              <th>Loan Amt</th>
              <th>Credit</th>
              <th>Education</th>
              <th>KNN</th>
              <th>RF</th>
              <th>Match</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((p) => {
              const match = p.results?.knn?.prediction === p.results?.rf?.prediction;
              return (
                <tr key={p._id}>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>${p.input?.applicant_income?.toLocaleString()}</td>
                  <td>{p.input?.loan_amount}K</td>
                  <td>{p.input?.credit_history === 1 ? "Good" : "Bad"}</td>
                  <td>{p.input?.education}</td>
                  <td>
                    <span className={`mini-badge ${p.results?.knn?.prediction?.toLowerCase()}`}>
                      {p.results?.knn?.prediction}
                    </span>
                  </td>
                  <td>
                    <span className={`mini-badge ${p.results?.rf?.prediction?.toLowerCase()}`}>
                      {p.results?.rf?.prediction}
                    </span>
                  </td>
                  <td style={{ color: match ? "#66bb6a" : "#ef5350" }}>
                    {match ? "Yes" : "No"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
