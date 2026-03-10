import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
      // Small delay so the slide-in transition fires after mount
      requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    }
  }, []);

  const dismiss = (choice) => {
    setEntered(false);
    setTimeout(() => {
      localStorage.setItem('cookie_consent', choice);
      setVisible(false);
    }, 400);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop — fades in/out */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-400 pointer-events-auto"
        style={{ opacity: entered ? 1 : 0 }}
        onClick={() => {}}
      />

      {/* Panel — slides in from the left, positioned in upper-left quadrant */}
      <div
        className="absolute top-24 left-6 sm:left-10 max-w-sm w-full pointer-events-auto
                   bg-white rounded-2xl shadow-2xl p-8
                   transition-all duration-500 ease-out"
        style={{
          transform: entered ? 'translateX(0)' : 'translateX(-110%)',
          opacity: entered ? 1 : 0,
        }}
      >
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
            onClick={() => dismiss('accepted')}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            Accept all cookies
          </button>
          <button
            onClick={() => dismiss('declined')}
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
