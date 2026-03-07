import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { teamAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [info, setInfo]           = useState(null);   // { email, role, org_name }
  const [infoError, setInfoError] = useState('');
  const [checking, setChecking]   = useState(true);

  const [firstName, setFirstName]           = useState('');
  const [lastName, setLastName]             = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw]                 = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [formError, setFormError]           = useState('');

  useEffect(() => {
    if (!token) {
      setInfoError('No invitation token found in the URL.');
      setChecking(false);
      return;
    }
    teamAPI.getInviteInfo(token)
      .then(setInfo)
      .catch(() => setInfoError('This invitation is invalid or has expired. Ask your manager to resend it.'))
      .finally(() => setChecking(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await teamAPI.acceptInvite({ token, first_name: firstName, last_name: lastName, password });
      localStorage.setItem('token', data.access_token);
      const user = await authAPI.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to accept invite. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-leaf text-2xl"></i>
            </div>
            <span className="text-3xl font-bold text-gray-900">GreenPulse</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">

          {checking ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <span className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
              <p className="text-sm text-gray-500">Validating your invitation…</p>
            </div>
          ) : infoError ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-triangle-exclamation text-red-500 text-xl"></i>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Invitation not found</h2>
              <p className="text-sm text-gray-500 mb-6">{infoError}</p>
              <button
                onClick={() => navigate('/signin')}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Go to sign in →
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                  <i className="fa-solid fa-envelope-open-text text-emerald-600 text-xl"></i>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  You've been invited to join
                </h1>
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-gray-800">{info.org_name}</span> on GreenPulse
                  {' '}as a <span className="font-semibold text-gray-800">{info.role.charAt(0) + info.role.slice(1).toLowerCase()}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">{info.email}</p>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder="Alex"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-3 py-2.5 pr-9 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      tabIndex={-1}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={`fa-regular ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 pr-9 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      tabIndex={-1}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={`fa-regular ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Setting up account…</>
                    : 'Accept invitation'}
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-4">
                Already have an account?{' '}
                <button onClick={() => navigate('/signin')} className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Sign in
                </button>
              </p>
            </>
          )}
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
