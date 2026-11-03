import React, { useState } from 'react';
import api from '../api';

export default function JobForm({ onJobCreated }) {
  const [form, setForm] = useState({ name: '', arrivalTime: 0, burstTime: 5, priority: 5, memoryMB: 256, cpuCores: 1 });
  const [submitting, setSubmitting] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/jobs', form);
      onJobCreated(data);
      setForm({ name: '', arrivalTime: 0, burstTime: 5, priority: 5, memoryMB: 256, cpuCores: 1 });
    } catch (err) {
      alert('Failed to create job: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <label>Job name</label>
      <input value={form.name} onChange={e => update('name', e.target.value)} required placeholder="e.g. render-job-1" />

      <div className="row-flex">
        <div className="col">
          <label>Arrival time</label>
          <input type="number" value={form.arrivalTime} onChange={e => update('arrivalTime', Number(e.target.value))} min="0" />
        </div>
        <div className="col">
          <label>Declared burst time</label>
          <input type="number" value={form.burstTime} onChange={e => update('burstTime', Number(e.target.value))} min="1" required />
        </div>
      </div>

      <div className="row-flex">
        <div className="col">
          <label>Priority (1 = highest)</label>
          <input type="number" value={form.priority} onChange={e => update('priority', Number(e.target.value))} min="1" max="10" />
        </div>
        <div className="col">
          <label>Memory (MB)</label>
          <input type="number" value={form.memoryMB} onChange={e => update('memoryMB', Number(e.target.value))} min="64" />
        </div>
        <div className="col">
          <label>CPU cores</label>
          <input type="number" value={form.cpuCores} onChange={e => update('cpuCores', Number(e.target.value))} min="1" max="8" />
        </div>
      </div>

      <button className="primary" type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Job'}
      </button>
    </form>
  );
}
