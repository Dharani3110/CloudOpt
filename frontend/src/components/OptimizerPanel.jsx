import React, { useState } from 'react';
import api from '../api';

export default function OptimizerPanel() {
  const [binCapacity, setBinCapacity] = useState(1024);
  const [budget, setBudget] = useState(20);
  const [binResult, setBinResult] = useState(null);
  const [knapResult, setKnapResult] = useState(null);

  const runBinPack = async () => {
    try {
      const { data } = await api.post('/optimizer/binpack', { binCapacityMB: binCapacity });
      setBinResult(data);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const runKnapsack = async () => {
    try {
      const { data } = await api.post('/optimizer/knapsack', { budget });
      setKnapResult(data);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="row-flex">
      <div className="col card">
        <h2>Bin Packing (VM/Pod Allocation)</h2>
        <label>Bin capacity (MB)</label>
        <input type="number" value={binCapacity} onChange={e => setBinCapacity(Number(e.target.value))} />
        <button className="primary" onClick={runBinPack}>Pack Jobs</button>
        {binResult && (
          <div style={{ marginTop: 14 }}>
            <p>Bins (VMs) used: <strong>{binResult.totalBinsUsed}</strong></p>
            {binResult.utilization.map(u => (
              <div key={u.binIndex} style={{ marginBottom: 6, fontSize: 13 }}>
                VM {u.binIndex}: {u.usedMB}/{u.capacityMB} MB ({u.utilizationPct}%)
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="col card">
        <h2>0/1 Knapsack (Cost-Constrained Selection)</h2>
        <label>Compute-cost budget</label>
        <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} />
        <button className="primary" onClick={runKnapsack}>Select Optimal Jobs</button>
        {knapResult && (
          <div style={{ marginTop: 14 }}>
            <p>Max value achieved: <strong>{knapResult.maxValue}</strong></p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Selected: {knapResult.selectedJobs.map(j => j.name).join(', ') || '—'}</p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Rejected: {knapResult.rejectedJobs.map(j => j.name).join(', ') || '—'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
