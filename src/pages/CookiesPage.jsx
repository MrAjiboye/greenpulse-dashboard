import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const cookieTypes = [
  {
    name: 'Essential cookies',
    required: true,
    desc: 'These cookies are necessary for the platform to function. They keep you logged in and allow you to navigate between pages securely. You cannot opt out of essential cookies.',
    examples: ['Session token (keeps you signed in)', 'CSRF protection token (prevents cross site attacks)', 'User preferences (dark mode, language)'],
  },
  {
    name: 'Analytics cookies',
    required: false,
    desc: 'These help us understand how users interact with GreenPulse: which features are used most, where users get stuck, and how we can improve the platform. All analytics data is aggregated and not linked to individual users.',
    examples: ['Page views and navigation patterns', 'Feature usage frequency', 'Session duration and entry/exit points'],
  },
];

const CookiesPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white text-gray-700 antialiased">

      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
              <i className="fa-solid fa-leaf text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">GreenPulse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            <a href="/#features" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">Features</a>
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">About</Link>
            <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">Blog</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/signin')} className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200">Sign In</button>
            <button onClick={() => navigate('/register')} className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200">Get Started</button>
          </div>
          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Toggle menu">
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
            </div>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-100 shadow-lg px-6 py-4 flex flex-col gap-1">
            <a href="/#features" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-2.5 rounded-lg transition-all duration-200">Features</a>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-2.5 rounded-lg transition-all duration-200">About</Link>
            <Link to="/blog" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-2.5 rounded-lg transition-all duration-200">Blog</Link>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 mt-1">
              <button onClick={() => { setMenuOpen(false); navigate('/signin'); }} className="text-sm font-medium text-gray-700 hover:text-emerald-600 py-2 text-left rounded-lg transition-all duration-200">Sign In</button>
              <button onClick={() => { setMenuOpen(false); navigate('/register'); }} className="w-full text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg transition-all duration-200">Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-10">
          <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full">Legal</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">Cookies Policy</h1>
          <p className="text-sm text-gray-400">Last updated: November 2025</p>
        </div>

        <p className="text-lg text-gray-500 leading-relaxed mb-12">
          Cookies are small text files stored on your device when you visit a website. GreenPulse uses cookies to keep the platform working and to understand how it's being used. Here's exactly what we use and why.
        </p>

        {/* Cookie types */}
        <div className="space-y-8 mb-14">
          {cookieTypes.map(({ name, required, desc, examples }) => (
            <div key={name} className="border border-gray-100 rounded-2xl p-8 hover:border-emerald-100 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${required ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {required ? 'Always active' : 'Optional'}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-5">{desc}</p>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Examples:</p>
                <ul className="space-y-1.5">
                  {examples.map((ex, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* How to manage */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">How to manage cookies</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            You can control cookies through your browser settings. Most browsers allow you to block or delete cookies, though doing so may affect how GreenPulse works, particularly the essential cookies that keep you logged in.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Browser cookie settings can usually be found under: <span className="font-medium text-gray-700">Settings → Privacy → Cookies</span> (exact path varies by browser).
          </p>
          <p className="text-gray-600 leading-relaxed">
            If you have questions about our use of cookies, contact us at{' '}
            <a href="mailto:info@greenpulseanalytics.com" className="text-emerald-600 hover:underline">info@greenpulseanalytics.com</a>.
          </p>
        </div>
      </div>
      <Footer />

    </div>
  );
};

export default CookiesPage;
