const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  name: { type: String, required: true },
  arrivalTime: { type: Number, required: true, default: 0 },
  burstTime: { type: Number, required: true },        // user-declared
  predictedBurstTime: { type: Number, default: null }, // ML-predicted
  priority: { type: Number, default: 5 },              // lower = higher priority
  memoryMB: { type: Number, default: 256 },
  cpuCores: { type: Number, default: 1 },
  status: { type: String, enum: ['queued', 'scheduled', 'running', 'completed'], default: 'queued' },
  assignedBin: { type: Number, default: null },         // which "VM"/bin it was packed into
  waitingTime: { type: Number, default: null },
  turnaroundTime: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Job || mongoose.model('Job', JobSchema);
