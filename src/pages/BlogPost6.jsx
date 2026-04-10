import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const BlogPost6 = () => {
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
          <span className="bg-purple-50 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full">Sustainability</span>
          <span>6 min read</span>
          <span>April 10, 2026</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          What Does "Net Zero" Actually Mean for a 20-Room Hotel?
        </h1>

        <p className="text-xl text-gray-500 leading-relaxed">
          The term gets thrown around by large corporations with carbon offset budgets. Here's what it actually looks like for an independent hotel with thin margins and no sustainability team.
        </p>
      </div>

      {/* ── Featured Image ── */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        <img
          src="https://images.unsplash.com/photo-1467987506553-8f3916508521?w=900&auto=format&fit=crop&q=80"
          alt="Small hotel exterior with green surroundings"
          className="w-full rounded-2xl object-cover max-h-96"
          loading="lazy"
        />
      </div>

      {/* ── Article Body ── */}
      <div className="max-w-3xl mx-auto px-6 pb-24">

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Net zero has become one of those terms that sounds important and means different things depending on who's saying it. For a FTSE 100 company, it means buying carbon credits, publishing sustainability reports, and appointing a Chief Sustainability Officer.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">For a 20-room hotel in the Scottish Highlands, it means something entirely different. And more achievable than you might think.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">This article strips out the corporate language and explains what net zero actually means in practical terms for an independent hospitality business — what you need to measure, what you need to reduce, and what "good enough" realistically looks like.</p>

        {/* What it means */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">Net Zero in Plain English</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Net zero means your business is responsible for emitting as much carbon as it offsets or avoids. It's not about emitting zero carbon — that's essentially impossible for a functioning hotel. It's about the balance.</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">For a small hotel, carbon comes from three main places:</p>

        <ul className="list-disc list-inside space-y-3 mb-8 text-lg text-gray-700 ml-2 leading-relaxed">
          <li><span className="font-semibold">Electricity consumption</span> — powering rooms, kitchen, heating, lighting. Approx. 0.233 kg CO₂ per kWh on the UK grid (and falling as renewables grow).</li>
          <li><span className="font-semibold">Gas heating</span> — boilers, hot water systems. Natural gas emits approximately 0.202 kg CO₂ per kWh.</li>
          <li><span className="font-semibold">Waste</span> — food waste and packaging going to landfill produces methane, a potent greenhouse gas. Recycling and composting offset a portion of this.</li>
        </ul>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 my-8">
          <p className="text-gray-700 font-semibold mb-3">Example calculation for a 20-room hotel:</p>
          <ul className="space-y-2 text-gray-600">
            <li>Monthly electricity: 3,500 kWh × 0.233 kg = <span className="font-semibold text-gray-800">815 kg CO₂</span></li>
            <li>Monthly gas: 2,800 kWh × 0.202 kg = <span className="font-semibold text-gray-800">566 kg CO₂</span></li>
            <li>Recycling offset (50% diversion): <span className="font-semibold text-emerald-700">−120 kg CO₂</span></li>
            <li className="pt-2 border-t border-gray-200 font-semibold text-gray-800">Net monthly footprint: approx. 1,261 kg CO₂ (1.26 tonnes)</li>
          </ul>
        </div>

        {/* Reduce first */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">Step 1: Reduce Before You Offset</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">The biggest mistake small businesses make is jumping straight to carbon credits or renewable energy certificates before addressing the basics. Offsets cost money. Reduced consumption saves money. Do the second one first.</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">For a 20-room hotel, the highest-impact reduction areas, in order:</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">1. Heating scheduling (biggest impact).</span> Hotels overheat empty rooms constantly. Proper zone scheduling — lower temperatures in unoccupied rooms, matching heat-up times to actual checkin patterns — typically reduces gas consumption by 20-30%.
        </p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">2. Switching to LED lighting.</span> If you haven't already, this is the simplest win. A full LED switchover for a 20-room hotel typically reduces lighting energy by 60-70% and pays back in under 18 months.
        </p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">3. Waste diversion.</span> Separating food waste for composting instead of landfill removes a meaningful chunk of your carbon footprint at close to zero cost. Most Scottish councils now offer food waste collection for commercial premises.
        </p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">4. Kitchen equipment efficiency.</span> Older commercial fridges, dishwashers, and ovens can use 40-60% more energy than modern equivalents. When equipment reaches end of life, the energy-efficient replacement often pays back within 3-4 years purely through savings.
        </p>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">Realistic target:</span> Most independent hotels can reduce their carbon footprint by 25-40% through operational changes alone, with no capital investment beyond better monitoring. That's before any renewable energy or offset activity.
          </p>
        </div>

        {/* Green tariff */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">Step 2: Switch to a Green Electricity Tariff</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Once you've reduced what you can, a green electricity tariff effectively zeroes out your electricity-related carbon footprint at no additional cost — and sometimes at lower cost than standard tariffs, depending on market conditions.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Green tariffs mean your supplier matches your usage with renewable generation — wind, solar, hydro. You still use grid electricity, but the carbon intensity of your consumption drops to near zero on paper.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">For our example hotel, this eliminates 815 kg CO₂ per month from the electricity column, leaving gas and residual waste as the main footprint.</p>

        {/* What net zero looks like */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">What "Achieved" Actually Looks Like</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">A 20-room hotel that has:</p>

        <ul className="list-disc list-inside space-y-2 mb-5 text-lg text-gray-700 ml-2 leading-relaxed">
          <li>Switched to LED throughout</li>
          <li>Optimised HVAC scheduling by zone and occupancy</li>
          <li>Moved to a green electricity tariff</li>
          <li>Achieving 60%+ waste diversion to recycling/composting</li>
          <li>Monitored and managed energy monthly to catch drift</li>
        </ul>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">...is running a genuinely low-carbon operation. Residual gas emissions can be addressed over time through heat pump installation as equipment reaches end of life, and any remaining footprint can be offset through verified forestry or renewable projects for roughly £10-20 per tonne.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">For our example hotel with a 1.26 tonne monthly footprint reduced by 35% through operations and electricity: approximately 0.82 tonnes remaining. At £15 per tonne offset, that's £12.30 per month to claim net zero status with integrity.</p>

        {/* Start */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">Where to Start</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">You can't manage what you don't measure. The first step is calculating your actual baseline — not an estimate, not an industry average, but your specific consumption across electricity, gas, and waste.</p>

        <p className="text-lg text-gray-700 mb-10 leading-relaxed">GreenPulse gives you this baseline automatically, tracks your carbon footprint month by month, and shows you which actions will have the biggest impact for your specific operation. Most hotels know their room occupancy rate to the decimal. They should know their carbon intensity per occupied room just as precisely.</p>

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

export default BlogPost6;
