require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const schedulerRoutes = require('./routes/scheduler');
const optimizerRoutes = require('./routes/optimizer');
const securityRoutes = require('./routes/security');
const metricsRoutes = require('./routes/metrics');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'cloudopt-backend', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/optimizer', optimizerRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/metrics', metricsRoutes);

app.use((req, res) => res.status(404).json({ error: 'not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`[server] CloudOpt backend listening on :${PORT}`));
});
