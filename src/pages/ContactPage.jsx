import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';

const ContactPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  useScrollReveal();

  const channels = [
    {
      icon: 'fa-headset',
      label: 'Support',
      value: 'support@greenpulseanalytics.com',
      href: 'mailto:support@greenpulseanalytics.com',
      note: 'Account, billing, and technical help.',
    },
    {
      icon: 'fa-envelope',
      label: 'General',
      value: 'info@greenpulseanalytics.com',
      href: 'mailto:info@greenpulseanalytics.com',
      note: 'Partnerships, press, and general enquiries.',
    },
    {
      icon: 'fa-phone',
      label: 'Phone',
      value: '07961 790837',
      href: 'tel:+447961790837',
      note: 'Mon – Fri, 9 AM – 5 PM (GMT)',
    },
    {
      icon: 'fa-location-dot',
      label: 'Location',
      value: 'Scotland, UK',
      href: null,
      note: 'Serving hospitality businesses across the UK.',
    },
  ];

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

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 text-center px-6">
        <h1 className="reveal text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
        <p className="reveal stagger-1 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          Whether you have a question about the product, want to sign up, or just want to say hello, we are happy to hear from you.
        </p>
      </section>

      {/* ── Contact cards ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {channels.map(({ icon, label, value, href, note }, i) => (
            <div key={label} className={`reveal stagger-${i + 1} bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-100 transition-all text-center`}>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <i className={`fa-solid ${icon} text-emerald-500 text-lg`}></i>
              </div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">{label}</p>
              {href ? (
                <a href={href} className="text-gray-900 font-semibold hover:text-emerald-600 transition-colors block mb-2 break-all">
                  {value}
                </a>
              ) : (
                <p className="text-gray-900 font-semibold mb-2">{value}</p>
              )}
              <p className="text-gray-400 text-sm">{note}</p>
            </div>
          ))}
        </div>

        {/* Quick note */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Ready to reduce your energy bills?</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-lg mx-auto">
            Connect your smart meter, import your data, and find your first energy saving in under 30 minutes. No credit card required for your first 30 days.
          </p>
          <a
            href="/register"
            className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Get Started
          </a>
        </div>
      </section>
      <Footer />

    </div>
  );
};

export default ContactPage;
