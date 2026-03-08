import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white text-gray-700 antialiased">

      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

          {/* Logo — always navigates home */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-leaf"></i>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">GreenPulse</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            <a href="/#features" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">Features</a>
            <Link to="/about" className="text-sm font-medium text-emerald-600 font-semibold">About</Link>
            <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">Blog</Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-6">
            <div className="h-4 w-px bg-gray-200"></div>
            <Link to="/signin" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
            >
              Create Account
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
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

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3">
            <a href="/#features" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 py-2">Features</a>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-emerald-600 py-2">About</Link>
            <Link to="/blog" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 py-2">Blog</Link>
            <hr className="border-gray-100" />
            <Link to="/signin" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-gray-900 py-2">Sign In</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg text-center">
              Create Account
            </Link>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="pt-40 pb-20 relative overflow-hidden bg-gradient-to-b from-emerald-50/60 to-white">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, #f0fdf4 1px, transparent 1px), linear-gradient(to bottom, #f0fdf4 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.4,
          }}
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 mb-6">
            <i className="fa-solid fa-leaf text-[10px]"></i> Our Story
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
            Built for Hospitality,{' '}
            <span className="text-emerald-500 relative inline-block">
              Focused on Savings
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-200 -z-10" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 7C26 5.2 25 4.4 55 4.1C106 3.6 149 1.3 194 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            GreenPulse Analytics was founded to help UK hospitality businesses take control of their energy costs while supporting Scotland's net zero targets.
          </p>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold mb-5 uppercase tracking-wider">
            <i className="fa-solid fa-book-open mr-1"></i> Our Story
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Where it all started</h2>

          <div className="prose prose-lg text-gray-600 leading-relaxed space-y-6">
            <p>
              The idea for GreenPulse came from a simple observation. Small restaurants and cafés were struggling with rising energy costs but had no affordable way to understand where their money was going.
            </p>
            <p>
              Enterprise energy management systems cost tens of thousands of pounds. Manual monitoring took hours and provided no insights. Smart meters showed total usage but couldn't tell you which equipment was the problem.
            </p>
            <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl p-6 my-8">
              <p className="text-gray-800 font-semibold text-lg leading-relaxed">
                We saw a gap. Hospitality businesses needed professional-grade energy intelligence at a price they could afford. That's why we built GreenPulse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Mission ── */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-50/60 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold mb-5 uppercase tracking-wider">
              <i className="fa-solid fa-bullseye mr-1"></i> Mission
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Help 1,000 UK hospitality businesses reduce their energy costs by 20% while cutting carbon emissions by 10,000 tonnes annually.
            </p>
            <p className="text-gray-600 mt-4 leading-relaxed">
              We do this by making enterprise-level energy analytics accessible to independent restaurants, cafés, and small hotels who deserve the same tools as big chains.
            </p>
          </div>

          {/* Values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: 'fa-lightbulb',
                color: 'yellow',
                emoji: '💡',
                title: 'Simplicity',
                desc: 'Complex problems deserve simple solutions. No jargon, no complexity — just clear, actionable data.',
              },
              {
                icon: 'fa-bullseye',
                color: 'red',
                emoji: '🎯',
                title: 'Impact',
                desc: 'Every pound saved helps independent businesses thrive and their communities flourish.',
              },
              {
                icon: 'fa-earth-europe',
                color: 'emerald',
                emoji: '🌍',
                title: 'Sustainability',
                desc: "Saving money and protecting the planet go hand in hand — and we're proving it every day.",
              },
              {
                icon: 'fa-handshake',
                color: 'blue',
                emoji: '🤝',
                title: 'Partnership',
                desc: 'We succeed when our customers succeed. Their goals are our goals, full stop.',
              },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="text-4xl mb-5">{emoji}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar (matches LandingPage) ── */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-800">
            {[
              { value: '1,000+', label: 'Target Businesses' },
              { value: '10k T',  label: 'CO₂ Reduction Goal' },
              { value: '20%',    label: 'Avg Energy Savings' },
              { value: 'Scotland', label: 'Based in the UK' },
            ].map(({ value, label }) => (
              <div key={label} className="px-4">
                <p className="text-4xl font-bold text-emerald-500 mb-2">{value}</p>
                <p className="text-sm text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-emerald-50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, #f0fdf4 1px, transparent 1px), linear-gradient(to bottom, #f0fdf4 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.2,
          }}
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to take control of your energy costs?
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Join forward-thinking hospitality businesses using GreenPulse to reduce waste, save energy, and cut costs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Get Started for Free
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="px-8 py-3.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 font-bold rounded-lg shadow-sm transition-all w-full sm:w-auto"
            >
              Sign In
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">No credit card required for 14-day trial.</p>
        </div>
      </section>

      {/* ── Footer (matches LandingPage exactly) ── */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                  <i className="fa-solid fa-leaf"></i>
                </div>
                <span className="text-xl font-bold text-gray-900">GreenPulse</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Empowering organisations to build a sustainable future through data driven insights and intelligent resource management.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li><a href="/#features" className="hover:text-emerald-600 transition-colors">Features</a></li>
                <li><a href="/#features" className="hover:text-emerald-600 transition-colors">Energy Monitor</a></li>
                <li><a href="/#features" className="hover:text-emerald-600 transition-colors">Waste Management</a></li>
                <li><a href="/#features" className="hover:text-emerald-600 transition-colors">AI Insights</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li><Link to="/about" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
                <li><a href="mailto:info@greenpulseanalytics.com" className="hover:text-emerald-600 transition-colors">Contact</a></li>
                <li><Link to="/blog" className="hover:text-emerald-600 transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-emerald-600 transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <a href="mailto:info@greenpulseanalytics.com" className="hover:text-emerald-600 transition-colors flex items-center gap-2">
                    <i className="fa-solid fa-envelope text-gray-400 text-xs"></i>
                    info@greenpulseanalytics.com
                  </a>
                </li>
                <li>
                  <a href="tel:+447961790837" className="hover:text-emerald-600 transition-colors flex items-center gap-2">
                    <i className="fa-solid fa-phone text-gray-400 text-xs"></i>
                    07961 790837
                  </a>
                </li>
                <li className="flex items-center gap-2 text-gray-500 mt-2">
                  <i className="fa-solid fa-location-dot text-gray-400 text-xs"></i>
                  Based in Scotland, UK
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">© 2025 GreenPulse Analytics. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/terms" className="text-xs text-gray-400 hover:text-gray-600">Terms</Link>
              <Link to="/privacy" className="text-xs text-gray-400 hover:text-gray-600">Privacy</Link>
              <Link to="/cookies" className="text-xs text-gray-400 hover:text-gray-600">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
