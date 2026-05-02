import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const ANSWER_OPTIONS = [
  { label: 'Always', value: 10, emoji: '✅', color: 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
  { label: 'Sometimes', value: 5, emoji: '🤔', color: 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700' },
  { label: 'Never', value: 0, emoji: '❌', color: 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700' },
];

const CATEGORY_EMOJI = { Trust: '🤝', Communication: '💬', 'Emotional Safety': '💞', Effort: '💪', Support: '🌟', Toxic: '⚠️' };

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/questions').then(res => {
      setQuestions(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleAnswer = (value) => {
    const q = questions[current];
    setAnswers(prev => ({ ...prev, [q.id]: value }));
    if (current < questions.length - 1) {
      setDirection(1);
      setTimeout(() => setCurrent(c => c + 1), 300);
    }
  };

  const goBack = () => {
    if (current > 0) { setDirection(-1); setCurrent(c => c - 1); }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const answersArr = Object.entries(answers).map(([qid, val]) => ({
        question_id: parseInt(qid), answer_value: val
      }));
      await api.post('/submit-answers', { answers: answersArr });
      navigate('/results');
    } catch (err) {
      alert('Error submitting. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-heart-gradient">
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-5xl">💗</motion.div>
    </div>
  );

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;
  const answered = Object.keys(answers).length;
  const isLast = current === questions.length - 1;
  const currentAnswered = answers[q?.id] !== undefined;

  return (
    <div className="min-h-screen bg-heart-gradient pt-20 pb-10 px-4 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-rose-600">{answered}/{questions.length} answered</span>
            <span className="text-sm text-gray-500">Question {current + 1} of {questions.length}</span>
          </div>
          <div className="w-full bg-rose-100 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-rose-400 to-pink-400 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full flex-1 min-w-0 transition-all ${
                answers[questions[i]?.id] !== undefined ? 'bg-rose-400' : i === current ? 'bg-rose-300' : 'bg-rose-100'
              }`} />
            ))}
          </div>
        </motion.div>

        {/* Category Badge */}
        {q && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mb-4">
            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-sm font-medium">
              {CATEGORY_EMOJI[q.category]} {q.category}
            </span>
          </motion.div>
        )}

        {/* Question Card */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            {q && (
              <motion.div key={q.id}
                custom={direction}
                initial={{ x: direction * 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -direction * 80, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}>
                <div className="card mb-6">
                  <p className="font-display text-xl font-semibold text-gray-800 leading-relaxed">{q.text}</p>
                </div>

                <div className="space-y-3">
                  {ANSWER_OPTIONS.map(opt => (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(opt.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 font-medium transition-all
                        ${answers[q.id] === opt.value
                          ? opt.color + ' ring-2 ring-offset-1 ring-rose-300 scale-[1.02]'
                          : 'border-gray-200 bg-white hover:border-rose-200 text-gray-700 ' + opt.color
                        }`}>
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="text-lg">{opt.label}</span>
                      {answers[q.id] === opt.value && <span className="ml-auto text-sm">✓ Selected</span>}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          <button onClick={goBack} disabled={current === 0}
            className="btn-outline flex-1 disabled:opacity-40">
            ← Back
          </button>
          {isLast ? (
            <button onClick={handleSubmit} disabled={submitting || !currentAnswered}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting ? <><span className="animate-spin">⏳</span> Analyzing...</> : '✨ See Results'}
            </button>
          ) : (
            <button onClick={() => { setDirection(1); setCurrent(c => c + 1); }}
              disabled={!currentAnswered}
              className="btn-primary flex-1 disabled:opacity-40">
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
