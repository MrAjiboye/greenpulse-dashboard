import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-cookie-bite text-emerald-600 text-lg"></i>
          </div>
          <h2 className="text-lg font-bold text-gray-900">We use cookies</h2>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-2">
          GreenPulse uses cookies to keep you signed in, remember your preferences, and understand how the platform is used — so we can keep improving it.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          You can accept all cookies or decline non-essential ones. Either way, the core features work.{' '}
          <Link to="/cookies" className="text-emerald-600 hover:underline font-medium">
            Read our cookie policy
          </Link>
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={accept}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            Accept all cookies
          </button>
          <button
            onClick={decline}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            Decline non-essential
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
