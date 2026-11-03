const express = require('express');
const Job = require('../models/Job');
const { runScheduler, computeStats } = require('../scheduler');

const router = express.Router();

// Run one algorithm against current queued jobs (or a jobs array passed directly)
router.post('/run', async (req, res) => {
  try {
    const { algorithm, quantum, jobs: jobsFromBody } = req.body;
    let jobs = jobsFromBody;
    if (!jobs) {
      const dbJobs = await Job.find({ status: { $in: ['queued', 'scheduled'] } });
      jobs = dbJobs.map(j => ({
        id: j._id.toString(),
        name: j.name,
        arrivalTime: j.arrivalTime,
        burstTime: j.predictedBurstTime ?? j.burstTime, // prefer ML prediction when available
        priority: j.priority
      }));
    }
    if (!jobs || jobs.length === 0) return res.status(400).json({ error: 'no jobs available to schedule' });

    const output = runScheduler(algorithm, jobs, { quantum: quantum ? Number(quantum) : undefined });
    const stats = computeStats(output.results);
    res.json({ ...output, stats });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Compare all 5 algorithms against the same job set -- powers the benchmark report
router.post('/compare', async (req, res) => {
  try {
    const { jobs: jobsFromBody } = req.body;
    let jobs = jobsFromBody;
    if (!jobs) {
      const dbJobs = await Job.find({ status: { $in: ['queued', 'scheduled'] } });
      jobs = dbJobs.map(j => ({
        id: j._id.toString(),
        name: j.name,
        arrivalTime: j.arrivalTime,
        burstTime: j.predictedBurstTime ?? j.burstTime,
        priority: j.priority
      }));
    }
    if (!jobs || jobs.length === 0) return res.status(400).json({ error: 'no jobs available to schedule' });

    const algorithms = ['FCFS', 'SJF', 'RR', 'PRIORITY', 'MLFQ'];
    const comparison = algorithms.map(algo => {
      const output = runScheduler(algo, jobs, { quantum: 4 });
      return { algorithm: algo, stats: computeStats(output.results), gantt: output.gantt };
    });
    res.json({ comparison });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
