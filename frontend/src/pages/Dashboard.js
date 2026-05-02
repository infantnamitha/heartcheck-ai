import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const MOODS = ['😊','😐','😢','😠','🥰','😴','😰'];

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [latestScore, setLatestScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(user?.mood_today || '');
  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/history'), api.get('/results').catch(() => null)])
      .then(([hRes, rRes]) => {
        setHistory(hRes.data);
        if (rRes) setLatestScore(rRes.data.score);
      }).catch(() => {}).finally(() => setLoading(false));

    if (user?.anniversary_date) {
      const ann = new Date(user.anniversary_date);
      const today = new Date();
      const next = new Date(today.getFullYear(), ann.getMonth(), ann.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      const diff = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
      setDaysLeft(diff);
    }
  }, [user]);

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    try {
      const res = await api.patch('/profile', { mood_today: mood });
      updateUser(res.data);
    } catch {}
  };

  const statusColor = { 'Healthy': 'text-emerald-600', 'Needs Improvement': 'text-amber-600', 'Toxic Warning': 'text-red-600' };
  const statusBg = { 'Healthy': 'bg-score-healthy', 'Needs Improvement': 'bg-score-improve', 'Toxic Warning': 'bg-score-toxic' };
  const statusEmoji = { 'Healthy': '❤️', 'Needs Improvement': '😊', 'Toxic Warning': '⚠️' };

  const chartData = history.slice().reverse().map((s, i) => ({
    name: `Check ${i+1}`,
    score: s.total_score,
    date: new Date(s.created_at).toLocaleDateString(),
  }));

  const firstName = user?.first_name || user?.username || 'there';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-4xl">💗</motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-heart-gradient pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <h1 className="font-display text-3xl font-bold text-rose-700">Hello, {firstName} 💗</h1>
          <p className="text-gray-500 mt-1">Here's your relationship wellness overview</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Score Card */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className={`card col-span-1 ${latestScore ? statusBg[latestScore.status] : 'bg-white/80'}`}>
            {latestScore ? (
              <>
                <div className="text-4xl mb-2">{statusEmoji[latestScore.status]}</div>
                <div className="font-display text-5xl font-bold text-gray-800">{latestScore.total_score}</div>
                <div className="text-sm text-gray-600 mt-1">out of 250</div>
                <div className={`font-semibold mt-2 ${statusColor[latestScore.status]}`}>{latestScore.status}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(latestScore.created_at).toLocaleDateString()}</div>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">💫</div>
                <div className="font-display text-xl font-bold text-gray-600">No quiz yet</div>
                <p className="text-sm text-gray-500 mt-2">Take your first relationship health check!</p>
              </>
            )}
          </motion.div>

          {/* Mood Tracker */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="card col-span-1">
            <h3 className="font-display font-semibold text-gray-700 mb-3">Today's Mood</h3>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button key={m} onClick={() => handleMoodSelect(m)}
                  className={`text-2xl p-2 rounded-xl transition-all hover:scale-110 ${selectedMood === m ? 'bg-rose-100 ring-2 ring-rose-300 scale-110' : 'hover:bg-rose-50'}`}>
                  {m}
                </button>
              ))}
            </div>
            {selectedMood && <p className="text-sm text-gray-500 mt-3">Feeling {selectedMood} today</p>}
          </motion.div>

          {/* Anniversary / Quick Action */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="card col-span-1 flex flex-col justify-between">
            {daysLeft !== null ? (
              <>
                <div>
                  <div className="text-3xl mb-2">🎉</div>
                  <h3 className="font-display font-semibold text-gray-700">Anniversary</h3>
                  <div className="font-display text-4xl font-bold text-rose-600 mt-1">{daysLeft}</div>
                  <div className="text-sm text-gray-500">days away</div>
                </div>
              </>
            ) : (
              <div>
                <div className="text-3xl mb-2">📅</div>
                <h3 className="font-display font-semibold text-gray-700">Add Anniversary</h3>
                <p className="text-sm text-gray-500 mt-1">Set your date in Profile</p>
              </div>
            )}
            <Link to="/quiz" className="btn-primary text-center text-sm mt-4 block">
              💕 Start Quiz
            </Link>
          </motion.div>
        </div>

        {/* History Chart */}
        {chartData.length > 1 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="card">
            <h3 className="font-display font-semibold text-gray-700 mb-4">💹 Progress Over Time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 250]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => [`${val} pts`, 'Score']} contentStyle={{ borderRadius: '12px', border: '1px solid #fecdd3' }} />
                <Line type="monotone" dataKey="score" stroke="#e11d48" strokeWidth={2.5} dot={{ fill: '#e11d48', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Category scores from latest */}
        {latestScore?.category_scores?.scores && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }} className="card">
            <h3 className="font-display font-semibold text-gray-700 mb-4">📊 Category Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(latestScore.category_scores.scores).map(([cat, score]) => (
                <div key={cat} className="bg-rose-50/60 rounded-2xl p-4">
                  <div className="text-sm text-gray-500 font-medium">{cat}</div>
                  <div className="font-display text-2xl font-bold text-rose-600 mt-1">{score}</div>
                  <div className="w-full bg-rose-100 rounded-full h-1.5 mt-2">
                    <div className="bg-rose-400 h-1.5 rounded-full" style={{ width: `${(score/10)*100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!latestScore && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
            className="card text-center py-12">
            <div className="text-6xl mb-4">💝</div>
            <h2 className="font-display text-2xl font-bold text-rose-700 mb-2">Ready to check your heart?</h2>
            <p className="text-gray-500 mb-6">Take our 25-question relationship assessment and get personalized insights.</p>
            <Link to="/quiz" className="btn-primary inline-block">💕 Start Your First Quiz</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
