import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const steps = [
  {
    number: '01',
    icon: 'fa-plug',
    title: 'Connect your data',
    desc: 'Sign up and connect GreenPulse to your energy meters, point-of-sale system, or manually import your billing data. We work with what you have — no specialist hardware required to get started.',
    details: [
      'Works with standard smart meters',
      'Manual CSV import for any billing format',
      'Connect to existing POS for foot traffic data',
      'Setup takes under 30 minutes',
    ],
    color: 'emerald',
  },
  {
    number: '02',
    icon: 'fa-chart-line',
    title: 'Monitor in real time',
    desc: 'Your dashboard shows live energy usage by zone, time of day, and equipment. See exactly what\'s consuming power at any given moment — not just the monthly total on your bill.',
    details: [
      'Real time consumption by zone and equipment',
      'Automatic peak vs off peak rate tracking',
      'Foot traffic overlay for efficiency scoring',
      'Weekly and monthly trend reports',
    ],
    color: 'blue',
  },
  {
    number: '03',
    icon: 'fa-brain',
    title: 'Get AI powered insights',
    desc: 'GreenPulse analyses your usage patterns and surfaces specific, actionable problems — not generic tips. It finds the three to five things actually costing you money and tells you exactly what to do.',
    details: [
      'Automatic anomaly detection',
      'Equipment-level cost breakdown',
      'Waste identified with estimated savings',
      'Prioritised by financial impact',
    ],
    color: 'purple',
  },
  {
    number: '04',
    icon: 'fa-circle-check',
    title: 'Act and track your savings',
    desc: 'Apply the recommendations — most require no new equipment. Track the savings over time in real money. Build a record of your sustainability improvements for grants, guests, and compliance.',
    details: [
      'Step-by-step implementation guides',
      'Before/after cost comparison',
      'Carbon reduction tracking for compliance',
      'Shareable reports for stakeholders',
    ],
    color: 'orange',
  },
];

const faqs = [
  {
    q: 'Do I need to install any hardware?',
    a: 'Not to get started. GreenPulse works with your existing energy bills and smart meter data. For real time monitoring, a standard smart meter is all you need — most UK commercial properties already have one.',
  },
  {
    q: 'How quickly will I see results?',
    a: 'Most customers identify their first meaningful insight within two weeks of connecting data. Significant savings typically appear within 30-60 days of applying the first set of recommendations.',
  },
  {
    q: 'Do I need a technical background to use GreenPulse?',
    a: 'No. GreenPulse is designed for hospitality operators, not engineers. If you can read a spreadsheet, you can use GreenPulse. The platform tells you what the data means and what to do about it.',
  },
  {
    q: 'What size businesses does GreenPulse work for?',
    a: 'GreenPulse is built specifically for independent and small chain hospitality businesses — restaurants, cafés, pubs, and hotels with 1 to 30 locations. We\'re not designed for large enterprise operations.',
  },
  {
    q: 'How does pricing work?',
    a: 'GreenPulse offers flexible plans to suit businesses of all sizes. Register today and our team will be in touch to discuss the right plan for your needs.',
  },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', border: 'border-emerald-200', num: 'text-emerald-400', dot: 'bg-emerald-400' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-500', border: 'border-blue-200', num: 'text-blue-400', dot: 'bg-blue-400' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-500', border: 'border-purple-200', num: 'text-purple-400', dot: 'bg-purple-400' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-500', border: 'border-orange-200', num: 'text-orange-400', dot: 'bg-orange-400' },
};

const HowItWorksPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

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
            <Link to="/how-it-works" className="text-sm font-semibold text-emerald-600">How it works</Link>
            <Link to="/stories" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">Stories</Link>
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
            <Link to="/how-it-works" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-emerald-600 py-2.5">How it works</Link>
            <Link to="/stories" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-2.5 rounded-lg transition-all duration-200">Stories</Link>
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 mb-5">
          <i className="fa-solid fa-bolt text-[10px]"></i> Simple. Fast. No jargon.
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How GreenPulse Works</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          From messy energy bills to clear, actionable insights — in four steps. No engineering degree required.
        </p>
      </section>

      {/* ── Steps ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="space-y-8">
          {steps.map((step, idx) => {
            const c = colorMap[step.color];
            const isEven = idx % 2 === 1;
            return (
              <div
                key={step.number}
                className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-stretch`}
              >
                {/* Icon panel */}
                <div className={`md:w-64 flex-shrink-0 ${c.bg} border ${c.border} rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4`}>
                  <p className={`text-6xl font-black ${c.num} leading-none`}>{step.number}</p>
                  <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm`}>
                    <i className={`fa-solid ${step.icon} ${c.icon} text-2xl`}></i>
                  </div>
                </div>

                {/* Content panel */}
                <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h2>
                  <p className="text-gray-500 leading-relaxed mb-6">{step.desc}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {step.details.map(d => (
                      <li key={d} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`}></span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">Common questions</h2>
          <p className="text-gray-500 text-center mb-12">Everything you need to know before you get started.</p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <i className={`fa-solid fa-chevron-down text-gray-400 text-sm transition-transform duration-200 flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}></i>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-500 py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to see where your money goes?</h2>
        <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          GreenPulse launches in Scotland in Spring 2026. Sign up for early access and founding member pricing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register"
            className="inline-block px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Get Started
          </a>
          <Link
            to="/stories"
            className="inline-block px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition-colors"
          >
            See Customer Stories
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <i className="fa-solid fa-leaf text-white text-xs"></i>
                </div>
                <span className="text-lg font-bold text-white">GreenPulse</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">Sustainability analytics for modern hospitality businesses.</p>
            </div>
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="/#features" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Features</a></li>
                <li><Link to="/how-it-works" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">How it works</Link></li>
                <li><a href="/register" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Sign Up</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">About</Link></li>
                <li><Link to="/stories" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Stories</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Blog</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4">Contact</h4>
              <ul className="space-y-3">
                <li><a href="mailto:info@greenpulseanalytics.com" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">info@greenpulseanalytics.com</a></li>
                <li><a href="tel:+447961790837" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">07961 790837</a></li>
                <li><p className="text-gray-500 text-sm">Based in Scotland, UK</p></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; 2025 GreenPulse Analytics. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/terms" className="text-xs text-gray-500 hover:text-emerald-400 transition-all duration-200">Terms</Link>
              <Link to="/privacy" className="text-xs text-gray-500 hover:text-emerald-400 transition-all duration-200">Privacy</Link>
              <Link to="/cookies" className="text-xs text-gray-500 hover:text-emerald-400 transition-all duration-200">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HowItWorksPage;
