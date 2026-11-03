const express = require('express');
const axios = require('axios');
const AuditLog = require('../models/AuditLog');

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Fetch recent audit log entries, scored for anomalies by the ml-service
router.get('/audit-log', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Re-score recent logs through the anomaly detector and persist flags
router.post('/scan', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(200);
    if (logs.length === 0) return res.json({ scanned: 0, flagged: 0 });

    const payload = logs.map(l => ({
      id: l._id.toString(),
      success: l.success ? 1 : 0,
      action: l.action
    }));

    const { data } = await axios.post(`${ML_SERVICE_URL}/anomaly`, { events: payload }, { timeout: 5000 });
    let flaggedCount = 0;
    for (const result of data.results) {
      const log = logs.find(l => l._id.toString() === result.id);
      if (!log) continue;
      log.anomalyScore = result.score;
      log.flagged = result.flagged;
      if (result.flagged) flaggedCount++;
      await log.save();
    }
    res.json({ scanned: logs.length, flagged: flaggedCount });
  } catch (err) {
    res.status(502).json({ error: 'ml-service unreachable or scan failed: ' + err.message });
  }
});

module.exports = router;
