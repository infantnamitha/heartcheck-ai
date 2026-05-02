import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    partner_name: user?.partner_name || '',
    anniversary_date: user?.anniversary_date || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await api.patch('/profile', form);
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError('Failed to save. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-heart-gradient pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <h1 className="font-display text-3xl font-bold text-rose-700">Your Profile 👤</h1>
          <p className="text-gray-500">Personalize your HeartCheck experience</p>
        </motion.div>

        {/* Avatar */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
          className="card flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-4xl shadow-lg">
            {user?.first_name ? user.first_name[0].toUpperCase() : '💗'}
          </div>
          <div>
            <div className="font-display text-xl font-bold text-gray-800">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="text-gray-500 text-sm">@{user?.username}</div>
            <div className="text-gray-400 text-sm">{user?.email}</div>
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="card">
          <h3 className="font-display font-bold text-gray-700 mb-5 text-lg">Edit Details</h3>
          <form onSubmit={handleSave} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
            {saved && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
                ✅ Profile saved successfully!
              </motion.div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                <input className="input-field" value={form.first_name}
                  onChange={e => setForm({...form, first_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                <input className="input-field" value={form.last_name}
                  onChange={e => setForm({...form, last_name: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Partner's Name 💕</label>
              <input className="input-field" placeholder="Your partner's name..."
                value={form.partner_name} onChange={e => setForm({...form, partner_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Anniversary Date 📅</label>
              <input type="date" className="input-field"
                value={form.anniversary_date} onChange={e => setForm({...form, anniversary_date: e.target.value})} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="card">
          <h3 className="font-display font-bold text-gray-700 mb-3">Account Info</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Username</span><span className="font-medium">@{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span>Email</span><span className="font-medium">{user?.email || 'Not set'}</span>
            </div>
            {user?.partner_name && (
              <div className="flex justify-between">
                <span>Partner</span><span className="font-medium">💕 {user.partner_name}</span>
              </div>
            )}
            {user?.mood_today && (
              <div className="flex justify-between">
                <span>Today's Mood</span><span className="text-xl">{user.mood_today}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
