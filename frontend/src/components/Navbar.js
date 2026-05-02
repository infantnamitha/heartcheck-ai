import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/quiz', label: 'Take Quiz', icon: '💕' },
    { to: '/results', label: 'Results', icon: '📊' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">💗</span>
          <span className="font-display font-bold text-xl text-rose-600">HeartCheck AI</span>
        </Link>

        {user && (
          <>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? 'bg-rose-100 text-rose-700'
                      : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                Sign Out
              </button>
            </div>
            <button className="md:hidden text-rose-600 text-xl" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </>
        )}
      </div>

      {menuOpen && user && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden border-t border-rose-100 bg-white"
        >
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3 text-gray-600 hover:bg-rose-50 hover:text-rose-600"
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="block w-full text-left px-6 py-3 text-red-500 hover:bg-red-50">
            Sign Out
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}
