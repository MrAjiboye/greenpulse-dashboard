import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationsAPI } from '../services/api';

const navLinks = [
  { label: 'Dashboard',        path: '/dashboard' },
  { label: 'Energy Monitor',   path: '/energy'    },
  { label: 'Waste Management', path: '/waste'     },
  { label: 'AI Insights',      path: '/insights'  },
  { label: 'Carbon',           path: '/carbon'    },
  { label: 'Reports',          path: '/reports'   },
  { label: 'Settings',         path: '/settings'  },
];

export default function NavBar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, logout } = useAuth();
  const { dark, toggle: toggleDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationsAPI.getList()
      .then(data => setUnreadCount(data.unread_count ?? 0))
      .catch(() => {});
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  // Support both {first_name, last_name} and {full_name} from the backend
  const displayName = user
    ? (user.first_name
        ? `${user.first_name} ${user.last_name || ''}`.trim()
        : (user.full_name || user.email || 'User'))
    : '';
  const avatarName = displayName.replace(/\s+/g, '+') || 'U';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">

          {/* ── Left: logo + desktop links ── */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-shrink-0 flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <i className="fa-solid fa-leaf"></i>
              </div>
              <span className="text-xl font-bold text-gray-900">GreenPulse</span>
            </button>

            <div className="hidden xl:flex items-center space-x-1">
              {navLinks.map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={
                    isActive(path)
                      ? 'px-5 py-2 bg-gray-900 text-white rounded-full font-medium text-sm'
                      : 'px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm'
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Right: bell + avatar + hamburger ── */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Toggle dark mode"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </button>

            <button
              onClick={() => navigate('/notifications')}
              className={`relative p-2 transition-colors ${isActive('/notifications') ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <i className="fa-regular fa-bell text-lg"></i>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {displayName.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                <button onClick={logout} className="text-xs text-gray-500 hover:text-red-600">
                  Logout
                </button>
              </div>
            </div>

            {/* Hamburger — only on < xl */}
            <button
              onClick={() => setOpen(o => !o)}
              className="xl:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors ml-1"
              aria-label="Toggle menu"
            >
              {open ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="xl:hidden border-t border-gray-100 bg-white mobile-nav-open">
          <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => { navigate(path); setOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-3 px-4 pb-1 flex items-center justify-between">
              <span className="text-sm text-gray-600">{displayName}</span>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="text-sm font-medium text-red-500 hover:text-red-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
