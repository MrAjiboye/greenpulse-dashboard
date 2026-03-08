import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BlogPost1 = () => {
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
          <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full">Energy Savings</span>
          <span>5 min read</span>
          <span>November 12, 2025</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Your Restaurant is Bleeding Money. Here's Where.
        </h1>

        <p className="text-xl text-gray-500 leading-relaxed">
          Most independent restaurants waste 20-30% of their energy budget without knowing it. We found the three biggest culprits after analyzing hundreds of UK hospitality businesses.
        </p>
      </div>

      {/* ── Featured Image ── */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        <img
          src="https://i.postimg.cc/5NfgPVtc/6c667f38_c318_492c_9f17_d465887096e3.jpg"
          alt="Energy analytics dashboard"
          className="w-full rounded-2xl object-cover max-h-96"
          loading="lazy"
        />
      </div>

      {/* ── Article Body ── */}
      <div className="max-w-3xl mx-auto px-6 pb-24">

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Your energy bill arrived this morning. £2,400 for the month. You wince, pay it, and move on. That's the routine.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Here's what most restaurant owners don't realize. Between £500 and £700 of that bill is pure waste. Money spent on nothing. Energy consumed by equipment running when it shouldn't, cooling spaces that don't need it, heating empty rooms.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">After tracking energy usage across 200+ independent UK restaurants, we identified three patterns that show up again and again. Fix these, and you're looking at £400-800 back in your pocket every month.</p>

        {/* Section 1 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">1. Kitchen Equipment Running 24/7</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Walk into your kitchen at midnight. How many pieces of equipment are still on? Prep fridges? Display cases? Water heaters?</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Most kitchen equipment doesn't need to run overnight. But someone forgot to turn it off five years ago, and it's been running ever since. Nobody notices because nobody checks.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">The numbers:</span> A commercial fridge running unnecessarily for 12 hours costs about £45 per month. Most restaurants have 3-5 pieces of equipment in this situation. That's £135-225 wasted monthly.
        </p>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">Quick win:</span> Do a midnight walk-through this week. List everything that's on. Ask yourself what actually needs to be running. Turn off the rest. Set phone reminders if needed.
          </p>
        </div>

        {/* Section 2 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">2. HVAC Systems Fighting Themselves</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Your heating turns on at 6 AM to warm the dining room. Your walk-in freezer is working overtime to stay cold. They're in the same space, fighting each other.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Terrible placement of cooling and heating equipment creates invisible energy battles. Your AC cools the kitchen while your ovens pump out heat. Your heating system tries to warm a space right next to a massive cold storage unit.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">The numbers:</span> Poor HVAC coordination can inflate energy costs by 15-25%. For a restaurant spending £2,000 monthly on energy, that's £300-500 in waste.
        </p>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">Quick win:</span> Can't move equipment? Zone your HVAC differently. Don't heat spaces next to freezers. Don't cool spaces next to ovens. Adjust thermostats to reflect where equipment actually is.
          </p>
        </div>

        {/* Section 3 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">3. Peak Hour Energy Rates (That You're Ignoring)</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Most UK energy providers charge different rates throughout the day. Peak hours (typically 4-7 PM) can cost 3x more than off peak rates.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">When do most restaurants do their highest-energy activities? Exactly during peak hours. Prepping for dinner service, running all equipment at once, maxing out ventilation.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">The numbers:</span> Shifting just 30% of your energy-intensive tasks to off peak hours can cut £200-400 from your monthly bill.
        </p>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">Quick win:</span> Check your energy bill for time of use rates. If you have them, shift prep work earlier. Run dishwashers after 8 PM. Do deep cleaning overnight. The work is the same. The cost is not.
          </p>
        </div>

        {/* What this looks like */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">What This Actually Looks Like</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">A café in Edinburgh was spending £1,800 monthly on energy. After tracking their usage for two weeks, we found three fridges running 24/7 unnecessarily, HVAC heating a space adjacent to cold storage, and all equipment prep happening during peak rate hours.</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">Changes made:</p>
        <ul className="list-disc list-inside space-y-2 mb-5 text-lg text-gray-700 ml-2 leading-relaxed">
          <li>Turned off two display fridges from 11 PM to 6 AM (they're restocking at 6 anyway)</li>
          <li>Rezoned the heating to skip the cold storage wall</li>
          <li>Shifted equipment testing and deep cleaning to after 8 PM</li>
        </ul>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">New monthly bill: £1,240. Savings: £560 per month. No new equipment. No complicated changes. Just paying attention.</p>

        {/* The real problem */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">The Real Problem</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Most independent restaurants have no idea where their energy actually goes. You get a bill. You pay it. You assume it's correct.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">But energy companies don't break down your usage by equipment or time of day. The bill shows one number. That number includes both necessary costs and pure waste, and you can't tell them apart.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">That's why GreenPulse exists. We show you exactly where your money goes. Which equipment costs what. When you're paying peak rates. What's running when it shouldn't be.</p>

        <p className="text-lg text-gray-700 mb-10 leading-relaxed">Spring 2026, we're launching in Scotland. If you're tired of guessing why your energy bills are high, sign up.</p>

        <div className="text-center mt-12 mb-6">
          <a
            href="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-200"
          >
            Get Started
          </a>
        </div>
      </div>

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
                <li><a href="/register" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Pricing</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Sign Up</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-emerald-400 font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">About</Link></li>
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

export default BlogPost1;
