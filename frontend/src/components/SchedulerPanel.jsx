import React, { useState } from 'react';
import api from '../api';
import GanttChart from './GanttChart';

const ALGORITHMS = [
  { value: 'FCFS', label: 'FCFS — First Come First Served' },
  { value: 'SJF', label: 'SJF — Shortest Job First' },
  { value: 'RR', label: 'Round Robin' },
  { value: 'PRIORITY', label: 'Priority Scheduling' },
  { value: 'MLFQ', label: 'MLFQ — Multi-Level Feedback Queue' }
];

export default function SchedulerPanel() {
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [quantum, setQuantum] = useState(4);
  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/scheduler/run', { algorithm, quantum });
      setResult(data);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/scheduler/compare', {});
      setComparison(data.comparison);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row-flex">
        <div className="col">
          <label>Algorithm</label>
          <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
            {ALGORITHMS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
        {algorithm === 'RR' && (
          <div className="col">
            <label>Time quantum</label>
            <input type="number" value={quantum} onChange={e => setQuantum(Number(e.target.value))} min="1" />
          </div>
        )}
      </div>
      <button className="primary" onClick={run} disabled={loading}>Run Scheduler</button>
      <button className="primary" style={{ marginLeft: 10, background: '#a78bfa' }} onClick={runComparison} disabled={loading}>
        Compare All 5 Algorithms
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Gantt Chart — {result.algorithm}</h2>
          <GanttChart gantt={result.gantt} />
          <div className="grid" style={{ marginTop: 14 }}>
            <div className="card">
              <div className="stat-value">{result.stats.avgWaitingTime}</div>
              <div className="stat-label">Avg Waiting Time</div>
            </div>
            <div className="card">
              <div className="stat-value">{result.stats.avgTurnaroundTime}</div>
              <div className="stat-label">Avg Turnaround Time</div>
            </div>
          </div>
        </div>
      )}

      {comparison && (
        <div style={{ marginTop: 20 }}>
          <h2>Algorithm Comparison</h2>
          <table>
            <thead><tr><th>Algorithm</th><th>Avg Waiting Time</th><th>Avg Turnaround Time</th></tr></thead>
            <tbody>
              {comparison.map(c => (
                <tr key={c.algorithm}>
                  <td>{c.algorithm}</td>
                  <td>{c.stats.avgWaitingTime}</td>
                  <td>{c.stats.avgTurnaroundTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
