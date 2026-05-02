import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username:'', email:'', password:'', first_name:'', last_name:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Username and password are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msg = Object.values(data).flat().join(' ');
        setError(msg);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-heart-gradient flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['💝','🌸','💫','🌺','✨','💐'].map((e,i) => (
          <motion.div key={i} className="absolute text-2xl opacity-20"
            style={{ left:`${8+i*15}%`, top:`${10+(i%3)*28}%` }}
            animate={{ y:[-8,8], rotate:[-4,4] }}
            transition={{ duration:2.5+i*0.4, repeat:Infinity, repeatType:'reverse' }}>
            {e}
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌸</div>
          <h1 className="font-display text-3xl font-bold text-rose-700">Begin Your Journey</h1>
          <p className="text-gray-500 mt-2">Start understanding your relationship health</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </motion.div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                <input className="input-field" placeholder="Jane"
                  value={form.first_name} onChange={e => setForm({...form, first_name:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                <input className="input-field" placeholder="Doe"
                  value={form.last_name} onChange={e => setForm({...form, last_name:e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Username *</label>
              <input className="input-field" placeholder="jane_doe"
                value={form.username} onChange={e => setForm({...form, username:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input className="input-field" type="email" placeholder="jane@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password *</label>
              <input className="input-field" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><span className="animate-spin">⏳</span> Creating Account...</> : '🌸 Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-rose-600 font-semibold hover:text-rose-700">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
