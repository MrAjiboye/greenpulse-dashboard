import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token found in the link.');
      return;
    }

    authAPI.verifyEmail(token)
      .then(async (data) => {
        localStorage.setItem('token', data.access_token);
        const user = await authAPI.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setStatus('success');
        // Brief pause so the user sees the success state before redirecting
        setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
      })
      .catch((err) => {
        const detail = err.response?.data?.detail || '';
        setErrorMsg(
          detail.includes('expired') || detail.includes('Invalid')
            ? 'This verification link has expired or is invalid.'
            : 'Verification failed. Please request a new link.'
        );
        setStatus('error');
      });
  }, []); // run once on mount

  const emailParam = searchParams.get('email') || '';

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
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your email…</h2>
              <p className="text-sm text-gray-500">Just a moment</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email verified!</h2>
              <p className="text-sm text-gray-500">Taking you to your dashboard…</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verification failed</h2>
              <p className="text-sm text-gray-500 mb-8">{errorMsg}</p>

              <button
                onClick={() => navigate(`/verify-email-sent${emailParam ? `?email=${encodeURIComponent(emailParam)}` : ''}`)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-all mb-3"
              >
                Request a new link
              </button>
              <button
                onClick={() => navigate('/signin')}
                className="w-full text-sm text-gray-500 hover:text-gray-900 py-2"
              >
                ← Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
