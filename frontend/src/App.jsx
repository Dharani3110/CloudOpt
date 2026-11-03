import React, { useEffect, useState } from 'react';
import api from './api';
import LoginForm from './components/LoginForm';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import SchedulerPanel from './components/SchedulerPanel';
import OptimizerPanel from './components/OptimizerPanel';
import SecurityPanel from './components/SecurityPanel';
import MetricsPanel from './components/MetricsPanel';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'scheduler', label: 'Scheduler' },
  { key: 'optimizer', label: 'Optimizer' },
  { key: 'security', label: 'Security' }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('overview');
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('cloudopt_token');
    if (token) setUser({ loggedIn: true });
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (err) { /* not logged in yet */ }
  };

  useEffect(() => { if (user) fetchJobs(); }, [user]);

  const logout = () => {
    localStorage.removeItem('cloudopt_token');
    setUser(null);
  };

  if (!user) return <LoginForm onLogin={() => setUser({ loggedIn: true })} />;

  return (
    <div className="app">
      <div className="sidebar">
        <h1>☁️ CloudOpt</h1>
        {TABS.map(t => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
        <button onClick={logout} style={{ marginTop: 30, color: '#f87171' }}>Log out</button>
      </div>
      <div className="main">
        {tab === 'overview' && (
          <>
            <div className="card"><h2>System Overview</h2><MetricsPanel /></div>
          </>
        )}
        {tab === 'jobs' && (
          <>
            <div className="card"><h2>Submit Job</h2><JobForm onJobCreated={() => fetchJobs()} /></div>
            <div className="card"><h2>Job Queue</h2><JobList jobs={jobs} /></div>
          </>
        )}
        {tab === 'scheduler' && <div className="card"><SchedulerPanel /></div>}
        {tab === 'optimizer' && <OptimizerPanel />}
        {tab === 'security' && <div className="card"><h2>Security & Anomaly Monitoring</h2><SecurityPanel /></div>}
      </div>
    </div>
  );
}
