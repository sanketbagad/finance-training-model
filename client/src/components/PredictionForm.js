import React, { useState } from "react";
import { submitPrediction } from "../api";
import PredictionResult from "./PredictionResult";

const INITIAL = {
  gender: "Male",
  married: "Yes",
  dependents: 0,
  education: "Graduate",
  self_employed: "No",
  applicant_income: 5000,
  coapplicant_income: 0,
  loan_amount: 150,
  loan_amount_term: 360,
  credit_history: 1,
  property_area: "Urban",
};

export default function PredictionForm() {
  const [form, setForm] = useState(INITIAL);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await submitPrediction({
        ...form,
        dependents: Number(form.dependents),
        applicant_income: Number(form.applicant_income),
        coapplicant_income: Number(form.coapplicant_income),
        loan_amount: Number(form.loan_amount),
        loan_amount_term: Number(form.loan_amount_term),
        credit_history: Number(form.credit_history),
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card">
        <h2>Enter Loan Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>Married</label>
              <select name="married" value={form.married} onChange={handleChange}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dependents</label>
              <select name="dependents" value={form.dependents} onChange={handleChange}>
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3+</option>
              </select>
            </div>
            <div className="form-group">
              <label>Education</label>
              <select name="education" value={form.education} onChange={handleChange}>
                <option>Graduate</option>
                <option>Not Graduate</option>
              </select>
            </div>
            <div className="form-group">
              <label>Self Employed</label>
              <select name="self_employed" value={form.self_employed} onChange={handleChange}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Applicant Income ($)</label>
              <input type="number" name="applicant_income" value={form.applicant_income} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label>Co-Applicant Income ($)</label>
              <input type="number" name="coapplicant_income" value={form.coapplicant_income} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label>Loan Amount (K$)</label>
              <input type="number" name="loan_amount" value={form.loan_amount} onChange={handleChange} min="1" />
            </div>
            <div className="form-group">
              <label>Loan Term (months)</label>
              <select name="loan_amount_term" value={form.loan_amount_term} onChange={handleChange}>
                {[36, 60, 84, 120, 180, 240, 300, 360, 480].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Credit History</label>
              <select name="credit_history" value={form.credit_history} onChange={handleChange}>
                <option value={1}>Good (1)</option>
                <option value={0}>Bad (0)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Property Area</label>
              <select name="property_area" value={form.property_area} onChange={handleChange}>
                <option>Urban</option>
                <option>Semiurban</option>
                <option>Rural</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-predict" disabled={loading}>
            {loading ? "Predicting..." : "Run Prediction"}
          </button>
        </form>
        {error && <div className="error-msg">{error}</div>}
      </div>

      {result && <PredictionResult result={result} />}
    </>
  );
}
