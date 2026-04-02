const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// GET /api/metrics — model performance metrics
router.get("/", (_req, res) => {
  try {
    const metricsPath = path.join(__dirname, "..", "..", "ml", "metrics.json");
    if (!fs.existsSync(metricsPath)) {
      return res.status(404).json({ error: "Metrics not found. Train the models first." });
    }
    const raw = fs.readFileSync(metricsPath, "utf-8");
    const metrics = JSON.parse(raw);
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: "Failed to load metrics" });
  }
});

module.exports = router;
