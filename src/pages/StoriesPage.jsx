import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const stories = [
  {
    business: 'The Amber Cup',
    location: 'Edinburgh, Scotland',
    type: 'Independent Café · 12 tables',
    challenge: 'Running three commercial fridges overnight, heating a space adjacent to cold storage, and doing all prep during peak energy rate hours, without realising any of it.',
    result: 'Identified and fixed three separate energy waste issues over two weeks. New monthly bill dropped from £1,800 to £1,240.',
    savings: '£560',
    period: 'per month',
    stat2: '31%',
    stat2label: 'Energy reduction',
    quote: 'We had no idea where the money was going. Now I can see exactly what\'s costing us and turn it off. Sounds obvious, but nobody had ever shown us the numbers before.',
    author: 'Owner, The Amber Cup',
    icon: 'fa-mug-hot',
    color: 'emerald',
    tags: ['Energy', 'HVAC', 'Peak rates'],
  },
  {
    business: 'Thistle & Grain',
    location: 'Glasgow, Scotland',
    type: 'Restaurant & Bar · 45 covers',
    challenge: 'Foot traffic varied dramatically. 80 customers Monday morning vs 240 Saturday, but energy usage was identical both days. Full heating, cooling, and lighting running regardless of how busy they were.',
    result: 'Adjusted HVAC schedules to mirror actual foot traffic patterns. Stopped heating and cooling empty spaces during slow periods.',
    savings: '£340',
    period: 'per month',
    stat2: '22%',
    stat2label: 'HVAC cost cut',
    quote: 'The foot traffic and energy comparison was the thing that changed everything for us. We could literally see we were spending the same on a Monday with 80 customers as a Saturday with 240. Once you see that, you can\'t unsee it.',
    author: 'General Manager, Thistle & Grain',
    icon: 'fa-utensils',
    color: 'blue',
    tags: ['Foot traffic', 'HVAC', 'Scheduling'],
  },
  {
    business: 'Cairn View Guest House',
    location: 'Perth, Scotland',
    type: 'Guest House · 15 rooms',
    challenge: 'Heating unoccupied rooms to full temperature, running laundry equipment during peak rate hours, and keeping lobby lights at full brightness around the clock.',
    result: 'Zoned heating to match occupancy, shifted laundry to off peak hours, installed motion sensors in common areas. Carbon footprint dropped 28% in 90 days.',
    savings: '28%',
    period: 'carbon reduction',
    stat2: '£340',
    stat2label: 'Setup cost total',
    quote: 'We\'re a small guest house trying to do the right thing for the environment without spending money we don\'t have. GreenPulse showed us what was actually possible. It turned out to be more than we expected.',
    author: 'Owner, Cairn View Guest House',
    icon: 'fa-bed',
    color: 'purple',
    tags: ['Sustainability', 'Occupancy', 'Carbon'],
  },
];

const stats = [
  { value: '£480', label: 'Average monthly savings per customer' },
  { value: '24%', label: 'Average energy reduction in 90 days' },
  { value: '200+', label: 'UK hospitality businesses analysed' },
  { value: '3 weeks', label: 'Average time to first clear insight' },
];

const StoriesPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const colorMap = {
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', tag: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-100' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-500', tag: 'bg-blue-100 text-blue-700', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-500', tag: 'bg-purple-100 text-purple-700', border: 'border-purple-100' },
  };

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
            <Link to="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">How it works</Link>
            <Link to="/stories" className="text-sm font-semibold text-emerald-600">Stories</Link>
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
            <Link to="/how-it-works" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-2.5 rounded-lg transition-all duration-200">How it works</Link>
            <Link to="/stories" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-emerald-600 py-2.5">Stories</Link>
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
          <i className="fa-solid fa-star text-[10px]"></i> Real results from real businesses
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Stories</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Independent restaurants, cafés, and hotels across Scotland that found out where their energy money was actually going, and stopped the waste.
        </p>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-gray-900 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-emerald-400 mb-1">{value}</p>
              <p className="text-gray-400 text-sm leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stories ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 space-y-16">
        {stories.map((s, idx) => {
          const c = colorMap[s.color];
          return (
            <div key={s.business} className={`rounded-3xl border ${c.border} overflow-hidden shadow-sm hover:shadow-lg transition-all`}>

              {/* Top bar */}
              <div className={`${c.bg} px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                    <i className={`fa-solid ${s.icon} ${c.icon} text-lg`}></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{s.business}</h2>
                    <p className="text-sm text-gray-500">{s.location} · {s.type}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.tags.map(tag => (
                    <span key={tag} className={`text-xs font-semibold px-3 py-1 rounded-full ${c.tag}`}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="bg-white px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">The challenge</p>
                    <p className="text-gray-600 leading-relaxed">{s.challenge}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">What changed</p>
                    <p className="text-gray-600 leading-relaxed">{s.result}</p>
                  </div>
                  <blockquote className="border-l-4 border-emerald-400 pl-5 py-1">
                    <p className="text-gray-700 italic leading-relaxed mb-2">"{s.quote}"</p>
                    <p className="text-sm text-gray-400 font-medium">{s.author}</p>
                  </blockquote>
                </div>

                <div className="flex flex-col gap-5">
                  <div className={`${c.bg} rounded-2xl p-6 text-center`}>
                    <p className="text-4xl font-extrabold text-gray-900 mb-1">{s.savings}</p>
                    <p className={`text-sm font-semibold ${c.icon}`}>{s.period}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 text-center">
                    <p className="text-4xl font-extrabold text-gray-900 mb-1">{s.stat2}</p>
                    <p className="text-sm font-semibold text-gray-500">{s.stat2label}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-500 py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Your business could be next</h2>
        <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          GreenPulse launches in Scotland in Spring 2026. Sign up and be first to know when we go live.
        </p>
        <a
          href="/register"
          className="inline-block px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
        >
          Get Started
        </a>
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

export default StoriesPage;
