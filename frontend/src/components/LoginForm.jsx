import React, { useState } from 'react';
import api from '../api';

export default function LoginForm({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'register') {
        await api.post('/auth/register', { username, password });
      }
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('cloudopt_token', data.token);
      onLogin(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 360, margin: '80px auto' }}>
      <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
      <form onSubmit={submit}>
        <label>Username</label>
        <input value={username} onChange={e => setUsername(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
        <button className="primary" type="submit">{mode === 'login' ? 'Sign in' : 'Register & sign in'}</button>
      </form>
      <button
        style={{ background: 'none', border: 'none', color: '#38bdf8', marginTop: 12, cursor: 'pointer', fontSize: 13 }}
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
      </button>
    </div>
  );
}
