import React from 'react';

export default function JobList({ jobs }) {
  if (!jobs || jobs.length === 0) return <p style={{ color: '#94a3b8' }}>No jobs yet — submit one above.</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th><th>Arrival</th><th>Declared</th><th>Predicted (AI)</th><th>Priority</th><th>Mem (MB)</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map(j => (
          <tr key={j._id}>
            <td>{j.name}</td>
            <td>{j.arrivalTime}</td>
            <td>{j.burstTime}</td>
            <td>{j.predictedBurstTime != null ? j.predictedBurstTime : '—'}</td>
            <td>{j.priority}</td>
            <td>{j.memoryMB}</td>
            <td><span className="badge ok">{j.status}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
