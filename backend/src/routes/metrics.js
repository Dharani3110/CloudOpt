const express = require('express');
const Job = require('../models/Job');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Lightweight metrics for the cost/usage dashboard (Prometheus scrapes /metrics separately;
// this is app-level JSON for the React dashboard's charts)
router.get('/summary', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const completedJobs = await Job.countDocuments({ status: 'completed' });
    const flaggedEvents = await AuditLog.countDocuments({ flagged: true });
    const avgMemory = await Job.aggregate([{ $group: { _id: null, avg: { $avg: '$memoryMB' } } }]);

    res.json({
      totalJobs,
      completedJobs,
      flaggedSecurityEvents: flaggedEvents,
      avgMemoryMB: avgMemory[0]?.avg ? Number(avgMemory[0].avg.toFixed(1)) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
