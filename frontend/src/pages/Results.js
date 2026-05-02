import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api/axios';

const STATUS_CONFIG = {
  'Healthy': { emoji: '❤️', color: 'text-emerald-600', bg: 'bg-score-healthy', border: 'border-emerald-200', message: "Your relationship is flourishing! You've built a strong foundation of trust, love, and mutual respect." },
  'Needs Improvement': { emoji: '😊', color: 'text-amber-600', bg: 'bg-score-improve', border: 'border-amber-200', message: "Your relationship has real potential. With focused attention and effort, you can create something beautiful together." },
  'Toxic Warning': { emoji: '⚠️', color: 'text-red-600', bg: 'bg-score-toxic', border: 'border-red-200', message: "Your responses suggest some concerning patterns. Please consider reaching out to a professional counselor for support." },
};

export default function Results() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/results').then(res => setData(res.data))
      .catch(() => setError('No results found. Please take the quiz first.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-heart-gradient gap-4">
      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-5xl">💗</motion.div>
      <p className="text-rose-400 font-display text-lg">Analyzing your relationship...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-heart-gradient p-4">
      <div className="card text-center py-12 max-w-md">
        <div className="text-5xl mb-4">💫</div>
        <h2 className="font-display text-2xl font-bold text-rose-700 mb-3">{error}</h2>
        <Link to="/quiz" className="btn-primary">Take Quiz</Link>
      </div>
    </div>
  );

  const { score, advice, gifts } = data;
  const config = STATUS_CONFIG[score.status] || STATUS_CONFIG['Needs Improvement'];
  const catScores = score.category_scores?.scores || {};
  const radarData = Object.entries(catScores).map(([cat, val]) => ({ category: cat, score: val, fullMark: 10 }));
  const scorePercent = Math.round((score.total_score / 250) * 100);

  return (
    <div className="min-h-screen bg-heart-gradient pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Score Hero */}
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
          className={`card ${config.bg} border-2 ${config.border} text-center py-10`}>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            className="text-6xl mb-4">{config.emoji}</motion.div>
          <div className="font-display text-6xl font-bold text-gray-800 mb-1">{score.total_score}</div>
          <div className="text-gray-500 mb-2">out of 250 points</div>
          <div className={`font-display text-2xl font-bold ${config.color} mb-4`}>{score.status}</div>

          {/* Progress arc */}
          <div className="flex justify-center my-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                <path className="text-rose-100" stroke="currentColor" strokeWidth="3.8" fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <motion.path stroke="#e11d48" strokeWidth="3.8" fill="none" strokeLinecap="round"
                  strokeDasharray={`${scorePercent}, 100`}
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${scorePercent}, 100` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-rose-600 text-lg">{scorePercent}%</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">{config.message}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Radar Chart */}
          {radarData.length > 0 && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="card">
              <h3 className="font-display font-bold text-gray-700 mb-4">💫 Category Overview</h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#fecdd3" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Radar name="Score" dataKey="score" stroke="#e11d48" fill="#e11d48" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip formatter={(val) => [`${val}/10`, 'Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Category Scores */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="card">
            <h3 className="font-display font-bold text-gray-700 mb-4">📊 Score Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(catScores).map(([cat, val]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-600">{cat}</span>
                    <span className="font-bold text-rose-600">{val}/10</span>
                  </div>
                  <div className="w-full bg-rose-100 rounded-full h-2.5">
                    <motion.div className={`h-2.5 rounded-full ${val >= 7 ? 'bg-emerald-400' : val >= 4 ? 'bg-amber-400' : 'bg-red-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(val/10)*100}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Advice Cards */}
        {advice && advice.length > 0 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}>
            <h3 className="font-display font-bold text-gray-700 mb-4 text-xl">💡 Personalized Advice</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {advice.map((a, i) => (
                <motion.div key={i} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="card border-l-4 border-rose-400">
                  <div className="font-semibold text-rose-600 mb-2">{a.category}</div>
                  <p className="text-gray-600 text-sm leading-relaxed">{a.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Gift Suggestions */}
        {gifts && gifts.length > 0 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
            <h3 className="font-display font-bold text-gray-700 mb-4 text-xl">🎁 Gift Suggestions For You</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {gifts.map((g, i) => (
                <motion.div key={g.id} whileHover={{ y: -3, shadow: '0 20px 40px rgba(225,29,72,0.15)' }}
                  className="card border border-rose-100 hover:border-rose-300 cursor-pointer transition-all">
                  <div className="text-2xl mb-2">🎁</div>
                  <h4 className="font-display font-bold text-gray-800 mb-1">{g.title}</h4>
                  <p className="text-gray-500 text-sm">{g.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
          className="flex gap-3 justify-center flex-wrap">
          <Link to="/quiz" className="btn-primary">🔄 Retake Quiz</Link>
          <Link to="/dashboard" className="btn-outline">🏠 Dashboard</Link>
        </motion.div>
      </div>
    </div>
  );
}
