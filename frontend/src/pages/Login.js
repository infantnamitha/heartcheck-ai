import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid username or password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-heart-gradient flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['💗','💕','🌸','💫','✨','🌹'].map((e, i) => (
          <motion.div key={i} className="absolute text-2xl opacity-20"
            style={{ left: `${10 + i * 16}%`, top: `${15 + (i % 3) * 25}%` }}
            animate={{ y: [-10, 10], rotate: [-5, 5] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, repeatType: 'reverse' }}>
            {e}
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💗</div>
          <h1 className="font-display text-3xl font-bold text-rose-700">Welcome Back</h1>
          <p className="text-gray-500 mt-2 font-body">Check in on your relationship health</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </motion.div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
              <input className="input-field" type="text" placeholder="your_username"
                value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <input className="input-field" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><span className="animate-spin">⏳</span> Signing In...</> : '💕 Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 text-sm">
            New here?{' '}
            <Link to="/register" className="text-rose-600 font-semibold hover:text-rose-700">Create account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
