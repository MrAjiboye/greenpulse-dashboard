import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.173 0 7.5482 0 9s.3477 2.827.9573 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4627.8918 11.4255 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}


// ---------- password strength helpers ----------
const CHECKS = [
  { key: 'len',     label: '8+ characters',    test: v => v.length >= 8 },
  { key: 'upper',   label: 'Uppercase letter', test: v => /[A-Z]/.test(v) },
  { key: 'lower',   label: 'Lowercase letter', test: v => /[a-z]/.test(v) },
  { key: 'digit',   label: 'Number',           test: v => /\d/.test(v) },
  { key: 'special', label: 'Special character',test: v => /[^A-Za-z0-9]/.test(v) },
];

function getStrength(pw) {
  if (!pw) return 0;
  return CHECKS.filter(c => c.test(pw)).length;
}

const STRENGTH_LABEL = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
const STRENGTH_COLOR = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981'];

function PasswordStrengthBar({ password }) {
  const score = getStrength(password);
  if (!password) return null;
  const color = STRENGTH_COLOR[score];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
            style={{ background: i <= score ? color : '#e5e7eb' }} />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color }}>{STRENGTH_LABEL[score]}</p>
    </div>
  );
}

function PasswordChecklist({ password }) {
  if (!password) return null;
  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
      {CHECKS.map(c => {
        const ok = c.test(password);
        return (
          <li key={c.key} className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? 'text-emerald-600' : 'text-gray-400'}`}>
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {ok
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                : <circle cx="12" cy="12" r="9" />
              }
            </svg>
            {c.label}
          </li>
        );
      })}
    </ul>
  );
}
// -----------------------------------------------

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm]             = useState({ fullName: '', orgName: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError]           = useState('');

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  // --- Email registration ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (getStrength(form.password) < 5) { setError('Please choose a stronger password. All 5 requirements must be met.'); return; }
    setLoading(true);
    setError('');
    try {
      await authAPI.register({ email: form.email, password: form.password, full_name: form.fullName, organization_name: form.orgName });
      navigate(`/verify-email-sent?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      const data = err.response?.data;
      // FastAPI validation error (422) → data.error.details[0].msg
      const validationMsg = data?.error?.details?.[0]?.msg?.replace(/^Value error, /, '');
      setError(validationMsg || data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- OAuth sign-up ---
  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    setError('');
    try {
      const { authorization_url } = await authAPI.getOAuthUrl(provider);
      window.location.href = authorization_url;
    } catch {
      setError(`${provider === 'google' ? 'Google' : 'Microsoft'} sign-up is not configured yet. Use the form below.`);
      setOauthLoading(null);
    }
  };

  const busy = loading || oauthLoading != null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-leaf text-2xl"></i>
            </div>
            <span className="text-3xl font-bold text-gray-900">GreenPulse</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500">Start your sustainability journey today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* SSO Buttons */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={busy}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading === 'google'
                ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                : <GoogleIcon />}
              Sign up with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={form.fullName}
                onChange={update('fullName')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Alex Johnson"
                required
              />
            </div>

            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
                Organisation Name
              </label>
              <input
                type="text"
                id="orgName"
                value={form.orgName}
                onChange={update('orgName')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Acme Corp"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={update('email')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  id="password"
                  value={form.password}
                  onChange={update('password')}
                  className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Min. 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={`fa-regular ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <PasswordStrengthBar password={form.password} />
              <PasswordChecklist password={form.password} />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  id="confirm"
                  value={form.confirm}
                  onChange={update('confirm')}
                  className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={`fa-regular ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <button onClick={() => navigate('/signin')} className="text-emerald-600 hover:text-emerald-700 font-medium">
                Sign in
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
