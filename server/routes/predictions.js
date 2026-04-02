const express = require("express");
const { execFile } = require("child_process");
const path = require("path");
const Prediction = require("../models/Prediction");

const router = express.Router();

const ALLOWED_FIELDS = [
  "gender", "married", "dependents", "education", "self_employed",
  "applicant_income", "coapplicant_income", "loan_amount",
  "loan_amount_term", "credit_history", "property_area",
];

// POST /api/predictions — run prediction
router.post("/", async (req, res) => {
  try {
    const input = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
      input[field] = req.body[field];
    }

    // Validate numeric fields
    const numericFields = ["applicant_income", "coapplicant_income", "loan_amount", "loan_amount_term", "credit_history", "dependents"];
    for (const field of numericFields) {
      const val = Number(input[field]);
      if (isNaN(val)) {
        return res.status(400).json({ error: `${field} must be a number` });
      }
      input[field] = val;
    }

    if (input.applicant_income < 0 || input.loan_amount < 1) {
      return res.status(400).json({ error: "Income must be >= 0 and loan amount must be >= 1" });
    }

    const scriptPath = path.join(__dirname, "..", "..", "ml", "predict.py");
    const inputJson = JSON.stringify(input);

    const result = await new Promise((resolve, reject) => {
      execFile("python", [scriptPath, inputJson], { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          console.error("Python error:", stderr);
          return reject(new Error(stderr || error.message));
        }
        try {
          // Extract only the last line that contains the JSON output
          const lines = stdout.trim().split("\n");
          const jsonLine = lines[lines.length - 1];
          resolve(JSON.parse(jsonLine));
        } catch (parseErr) {
          reject(new Error("Failed to parse ML output"));
        }
      });
    });

    const prediction = new Prediction({ input, results: result });
    await prediction.save();

    res.json({ id: prediction._id, input, results: result });
  } catch (err) {
    console.error("Prediction error:", err.message);
    res.status(500).json({ error: "Prediction failed. Make sure ML models are trained." });
  }
});

// GET /api/predictions — history
router.get("/", async (_req, res) => {
  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch predictions" });
  }
});

// GET /api/predictions/stats — aggregate stats
router.get("/stats", async (_req, res) => {
  try {
    const predictions = await Prediction.find().lean();
    const total = predictions.length;

    if (total === 0) {
      return res.json({ total: 0, knn: {}, rf: {} });
    }

    const knnApproved = predictions.filter((p) => p.results?.knn?.prediction === "Approved").length;
    const rfApproved = predictions.filter((p) => p.results?.rf?.prediction === "Approved").length;
    const knnAgreement = predictions.filter(
      (p) => p.results?.knn?.prediction === p.results?.rf?.prediction
    ).length;

    res.json({
      total,
      knn: {
        approved: knnApproved,
        rejected: total - knnApproved,
        approvalRate: ((knnApproved / total) * 100).toFixed(2),
      },
      rf: {
        approved: rfApproved,
        rejected: total - rfApproved,
        approvalRate: ((rfApproved / total) * 100).toFixed(2),
      },
      agreement: {
        count: knnAgreement,
        rate: ((knnAgreement / total) * 100).toFixed(2),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to compute stats" });
  }
});

module.exports = router;
