import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const BlogPost5 = () => {
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
            <Link to="/blog" className="text-sm font-semibold text-emerald-600">Blog</Link>
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
            <Link to="/blog" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-emerald-600 py-2.5">Blog</Link>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 mt-1">
              <button onClick={() => { setMenuOpen(false); navigate('/signin'); }} className="text-sm font-medium text-gray-700 hover:text-emerald-600 py-2 text-left rounded-lg transition-all duration-200">Sign In</button>
              <button onClick={() => { setMenuOpen(false); navigate('/register'); }} className="w-full text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg transition-all duration-200">Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* ── Article Header ── */}
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-8">
        <Link to="/blog" className="text-emerald-600 font-medium hover:underline inline-flex items-center gap-1 mb-10">
          ← Back to Blog
        </Link>

        <div className="flex flex-wrap items-center gap-4 mb-5 text-sm text-gray-500">
          <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">Operations</span>
          <span>5 min read</span>
          <span>April 1, 2026</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          The Hidden Cost of "We've Always Done It That Way"
        </h1>

        <p className="text-xl text-gray-500 leading-relaxed">
          Most energy waste in hospitality isn't caused by broken equipment or bad luck. It's caused by habits that made sense five years ago and nobody ever changed.
        </p>
      </div>

      {/* ── Featured Image ── */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&auto=format&fit=crop&q=80"
          alt="Restaurant kitchen operations"
          className="w-full rounded-2xl object-cover max-h-96"
          loading="lazy"
        />
      </div>

      {/* ── Article Body ── */}
      <div className="max-w-3xl mx-auto px-6 pb-24">

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Ask any chef why the kitchen runs a certain way and you'll often get the same answer: "That's just how we do it." Prep starts at the same time every day. Equipment goes on when the first person arrives. The heating timer was set by the previous owner.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">These habits form for good reasons. Consistency matters in hospitality. Routines keep service running smoothly. But they also calcify. And energy habits from 2018 — when prices were different, when the team was different, when the building was configured differently — quietly drain money in 2026.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Here are the most common "we've always done it that way" patterns we find when we start monitoring hospitality businesses, and what each one actually costs.</p>

        {/* Pattern 1 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">1. Equipment On Before Staff Arrive</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Many kitchens run a standard pre-shift power-up routine. Everything goes on at the same time, an hour before service, regardless of what's actually needed or how busy the day will be.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">A quiet Monday doesn't need the same warm-up as a Saturday with a full booking sheet. But nobody ever changed the routine, because nobody ever thought to.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">What it costs:</span> Running a commercial oven, a six-burner range, and a fryer for an extra 45 minutes every quiet day adds up to roughly £1,800 per year for a typical restaurant, based on current UK rates.
        </p>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">What to try:</span> Check your booking data on Monday and Tuesday mornings. If you're regularly at 30% capacity, stagger your power-up by 30 minutes. The food quality won't suffer. The bill will.
          </p>
        </div>

        {/* Pattern 2 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">2. The Heating Timer Nobody Touches</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Hotel heating systems often run on schedules set during installation. Those schedules were designed for a specific occupancy pattern that no longer applies — or were set by the engineer as a default and never customised.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Heating starts at 6 AM for a hotel that doesn't have checkout until 11 AM and checkin from 3 PM. The gap in the middle — midday, when rooms are empty and being cleaned — runs at full heat. Nobody adjusted it because the guests weren't complaining.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">What it costs:</span> Running hotel heating at full capacity during a 4-hour turnover window in winter adds an estimated £3,000-5,000 per year for a 20-room property. The fix is a two-minute timer adjustment.
        </p>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">What to try:</span> Pull up your HVAC control panel. Find the current schedule. Compare it to your actual occupancy pattern. If they don't match, they're costing you money.
          </p>
        </div>

        {/* Pattern 3 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">3. Waste Management at Peak Rate Times</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Industrial dishwashers, waste compactors, and cleaning equipment draw significant power. In many hospitality businesses, these run during or just after service — exactly when energy rates are at their highest.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">The logic made sense once: clean up right after service so the kitchen is ready for the next day. But if you're on a time-of-use tariff, running heavy equipment from 4-7 PM can cost 2-3x what it would cost at 10 PM.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">What it costs:</span> A commercial dishwasher running 3 hours during peak rate hours versus off-peak costs roughly £900 extra per year for a busy restaurant.
        </p>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">What to try:</span> Check your energy tariff for peak and off-peak hours. Most UK suppliers have time-of-use pricing even if it isn't prominently displayed. Moving dishwasher runs to after 9 PM is often the single highest-impact operational change a restaurant can make.
          </p>
        </div>

        {/* Pattern 4 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">4. The Lights That Run Until Close</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Dining room lighting set by the previous refurbishment, bar lighting on a single switch that covers the whole floor, outdoor signage that nobody turned off when a supplier changed their hours.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Lighting typically accounts for 25-35% of a restaurant's energy bill, yet most businesses have never audited what's actually on and when. The default is: everything on from open to close.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">What it costs:</span> A restaurant running full lighting in an empty dining room for 2 hours before and after service every day adds roughly £600-1,200 per year in unnecessary lighting costs, depending on size and bulb type.
        </p>

        {/* Closing */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">The Pattern Behind the Patterns</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Every business on this list is doing something that once made sense. The problem is that "it made sense in 2019" and "it makes sense now" aren't the same thing. Energy prices changed. Occupancy patterns changed. Menus changed. But the habits didn't.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">The businesses that catch this aren't doing complex analysis. They're simply looking at their energy usage over time, noticing patterns that don't make sense, and asking why. That's all it takes.</p>

        <p className="text-lg text-gray-700 mb-10 leading-relaxed">GreenPulse automates this process. We look at your usage patterns, flag the ones that look wrong, and surface the specific habits worth changing. Most businesses find their first quick win within two weeks of connecting their data.</p>

        <div className="text-center mt-12 mb-6">
          <a
            href="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-200"
          >
            Get Started
          </a>
        </div>
      </div>
      <Footer />

    </div>
  );
};

export default BlogPost5;
