const mongoose = require('mongoose');

// Feeds the security/anomaly-detection module
const AuditLogSchema = new mongoose.Schema({
  username: { type: String, default: 'anonymous' },
  action: { type: String, required: true },     // e.g. 'login', 'job_submit', 'scheduler_run'
  ip: { type: String, default: 'unknown' },
  success: { type: Boolean, default: true },
  anomalyScore: { type: Number, default: null }, // filled in by ml-service
  flagged: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
