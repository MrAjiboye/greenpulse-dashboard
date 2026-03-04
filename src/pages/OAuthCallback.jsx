import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Handles the redirect from the backend after OAuth (Google / Microsoft).
 *
 * Expected query params from backend:
 *   ?token=<jwt>              — access token
 *   ?is_new=true              — first-time OAuth user (needs to complete profile)
 *   ?error=<message>          — OAuth failure
 *
 * Flow:
 *  1. Store token
 *  2. Fetch /auth/me
 *  3a. is_new=true  → /complete-profile
 *  3b. otherwise    → /dashboard (or the page the user originally tried to visit)
 */
const OAuthCallback = () => {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [params]        = useSearchParams();
  const { setUser }     = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'error'
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    const token  = params.get('token');
    const isNew  = params.get('is_new') === 'true';
    const errParam = params.get('error');

    if (errParam) {
      setErrMsg(decodeURIComponent(errParam));
      setStatus('error');
      return;
    }

    if (!token) {
      setErrMsg('No authentication token received. Please try again.');
      setStatus('error');
      return;
    }

    (async () => {
      try {
        localStorage.setItem('token', token);
        const user = await authAPI.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        // If new user or profile is incomplete, send to CompleteProfile
        const profileIncomplete = !user.full_name && !user.first_name;
        if (isNew || profileIncomplete) {
          navigate('/complete-profile', { replace: true });
        } else {
          // Redirect to where they were trying to go, default dashboard
          const from = location.state?.from || '/dashboard';
          navigate(from, { replace: true });
        }
      } catch {
        localStorage.removeItem('token');
        setErrMsg('Failed to retrieve your account. Please sign in manually.');
        setStatus('error');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-circle-xmark text-3xl text-red-500"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign-in failed</h2>
          <p className="text-sm text-gray-500 mb-6">{errMsg}</p>
          <button
            onClick={() => navigate('/signin')}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Completing sign-in…</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
