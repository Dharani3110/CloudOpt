const express = require('express');
const axios = require('axios');
const Job = require('../models/Job');

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Create a job. Calls the ML service to get a predicted burst time alongside
// the user-declared one -- the prediction is what feeds the DAA optimizer.
router.post('/', async (req, res) => {
  try {
    const { name, arrivalTime = 0, burstTime, priority = 5, memoryMB = 256, cpuCores = 1 } = req.body;
    if (!name || burstTime == null) return res.status(400).json({ error: 'name and burstTime are required' });

    let predictedBurstTime = null;
    try {
      const { data } = await axios.post(`${ML_SERVICE_URL}/predict`, {
        jobs: [{ memoryMB, cpuCores, declaredBurstTime: burstTime, priority }]
      }, { timeout: 3000 });
      predictedBurstTime = data?.predictions?.[0] ?? null;
    } catch (mlErr) {
      console.warn('[jobs] ML prediction unavailable, continuing without it:', mlErr.message);
    }

    const job = await Job.create({ name, arrivalTime, burstTime, predictedBurstTime, priority, memoryMB, cpuCores });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    await Job.deleteMany({});
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
