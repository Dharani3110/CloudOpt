const express = require('express');
const Job = require('../models/Job');
const binPackingFFD = require('../optimizer/binPacking');
const knapsack01 = require('../optimizer/knapsack');

const router = express.Router();

// Pack jobs into minimum number of fixed-capacity VMs/pods by memory requirement
router.post('/binpack', async (req, res) => {
  try {
    const { binCapacityMB = 1024, jobs: jobsFromBody } = req.body;
    let jobs = jobsFromBody;
    if (!jobs) {
      const dbJobs = await Job.find({ status: { $in: ['queued', 'scheduled'] } });
      jobs = dbJobs.map(j => ({ id: j._id.toString(), name: j.name, memoryMB: j.memoryMB }));
    }
    if (!jobs || jobs.length === 0) return res.status(400).json({ error: 'no jobs available to pack' });
    res.json(binPackingFFD(jobs, Number(binCapacityMB)));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Select the highest-value subset of jobs that fits a compute-cost budget
router.post('/knapsack', async (req, res) => {
  try {
    const { budget = 100, jobs: jobsFromBody } = req.body;
    let jobs = jobsFromBody;
    if (!jobs) {
      const dbJobs = await Job.find({ status: { $in: ['queued', 'scheduled'] } });
      // cost derived from resource footprint, value derived from (inverse) priority
      jobs = dbJobs.map(j => ({
        id: j._id.toString(),
        name: j.name,
        cost: Math.max(1, Math.round((j.memoryMB / 128) + j.cpuCores)),
        value: Math.max(1, 10 - j.priority)
      }));
    }
    if (!jobs || jobs.length === 0) return res.status(400).json({ error: 'no jobs available to select' });
    res.json(knapsack01(jobs, Number(budget)));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
