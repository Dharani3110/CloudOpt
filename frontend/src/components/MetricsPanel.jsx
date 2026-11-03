import React, { useEffect, useState } from 'react';
import api from '../api';

export default function MetricsPanel() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/metrics/summary').then(({ data }) => setSummary(data)).catch(() => {});
  }, []);

  if (!summary) return <p style={{ color: '#94a3b8' }}>Loading metrics…</p>;

  return (
    <div className="grid">
      <div className="card"><div className="stat-value">{summary.totalJobs}</div><div className="stat-label">Total Jobs Submitted</div></div>
      <div className="card"><div className="stat-value">{summary.completedJobs}</div><div className="stat-label">Completed Jobs</div></div>
      <div className="card"><div className="stat-value">{summary.avgMemoryMB}</div><div className="stat-label">Avg Memory / Job (MB)</div></div>
      <div className="card"><div className="stat-value">{summary.flaggedSecurityEvents}</div><div className="stat-label">Flagged Security Events</div></div>
    </div>
  );
}
