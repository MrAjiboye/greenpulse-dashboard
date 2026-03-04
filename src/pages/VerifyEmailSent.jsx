import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function VerifyEmailSent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer after resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    try {
      await authAPI.resendVerification(email);
      setResent(true);
      setCooldown(60);
    } catch {
      // fail silently — backend always returns 200
      setResent(true);
      setCooldown(60);
    } finally {
      setResending(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
          <p className="text-gray-500">One more step to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
          {/* Envelope icon */}
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          <p className="text-gray-600 mb-2 text-sm">We've sent a verification link to</p>
          <p className="font-semibold text-gray-900 mb-6 break-all">{email || 'your email address'}</p>

          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Click the link in the email to verify your account and access your dashboard.
            The link expires in <span className="font-medium text-gray-700">24 hours</span>.
          </p>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {resending
              ? 'Sending…'
              : resent && cooldown > 0
              ? `Email sent — resend in ${cooldown}s`
              : 'Resend verification email'}
          </button>

          {resent && cooldown > 0 && (
            <p className="text-xs text-emerald-600 mb-4">
              <i className="fa-solid fa-circle-check mr-1"></i>
              New verification email sent.
            </p>
          )}

          <p className="text-sm text-gray-400">
            Already verified?{' '}
            <button
              onClick={() => navigate('/signin')}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Sign in →
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Wrong email?{' '}
            <button onClick={() => navigate('/register')} className="text-gray-500 hover:text-gray-700 underline">
              Go back and register again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
