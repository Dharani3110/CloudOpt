import React, { useEffect, useState } from 'react';
import api from '../api';

export default function SecurityPanel() {
  const [logs, setLogs] = useState([]);
  const [scanResult, setScanResult] = useState(null);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/security/audit-log');
      setLogs(data);
    } catch (err) { /* ignore if not logged in yet */ }
  };

  const runScan = async () => {
    try {
      const { data } = await api.post('/security/scan');
      setScanResult(data);
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div>
      <button className="primary" onClick={runScan}>Run Anomaly Scan (ML)</button>
      {scanResult && (
        <p style={{ marginTop: 10, fontSize: 13, color: '#94a3b8' }}>
          Scanned {scanResult.scanned} events — {scanResult.flagged} flagged as anomalous
        </p>
      )}
      <table style={{ marginTop: 14 }}>
        <thead><tr><th>User</th><th>Action</th><th>Success</th><th>Anomaly Score</th><th>Flagged</th><th>Time</th></tr></thead>
        <tbody>
          {logs.map(l => (
            <tr key={l._id}>
              <td>{l.username}</td>
              <td>{l.action}</td>
              <td>{l.success ? 'yes' : 'no'}</td>
              <td>{l.anomalyScore ?? '—'}</td>
              <td>{l.flagged ? <span className="badge flagged">flagged</span> : <span className="badge ok">ok</span>}</td>
              <td>{new Date(l.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
