import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const BlogPost4 = () => {
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
          <span>7 min read</span>
          <span>March 24, 2026</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Why Your Smart Meter Isn't Actually Saving You Money
        </h1>

        <p className="text-xl text-gray-500 leading-relaxed">
          The UK rolled out 32 million smart meters. Energy bills barely moved. Here's the gap between what smart meters promise and what hospitality businesses actually need.
        </p>
      </div>

      {/* ── Featured Image ── */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        <img
          src="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=900&auto=format&fit=crop&q=80"
          alt="Energy meter and data"
          className="w-full rounded-2xl object-cover max-h-96"
          loading="lazy"
        />
      </div>

      {/* ── Article Body ── */}
      <div className="max-w-3xl mx-auto px-6 pb-24">

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">You got the smart meter. The engineer came out, swapped your old meter, and left you with a little in-home display that shows your usage in real time. You watched it for a week. Then it sat on a shelf.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">This is the story for most UK hospitality businesses. Smart meters collect data. But data sitting in a device, or in your supplier's system, doesn't reduce your bill.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">After working with dozens of independent restaurants and hotels, we've identified exactly why smart meters fall short — and what it actually takes to turn data into savings.</p>

        {/* Section 1 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">What Smart Meters Actually Do</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Smart meters do one thing well: they record how much electricity or gas you use, and send that reading automatically to your supplier. No more estimated bills. No more manual meter readings.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">That's it. That's the entire function.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">They don't tell you which piece of equipment is using energy. They don't flag unusual patterns. They don't compare you to similar businesses. They don't send alerts when something looks wrong. They measure your total consumption and report it.</p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 my-8">
          <p className="text-gray-700 text-lg font-medium mb-3">The analogy:</p>
          <p className="text-gray-600 leading-relaxed">A smart meter is like a scale that tells you your total weight. Useful to know. But it doesn't tell you what you ate, when you exercised, or what specifically to change. Without that context, the number is just a number.</p>
        </div>

        {/* Section 2 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">The Three Things Smart Meters Can't Tell You</h2>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">1. Which equipment is the problem.</span> Your smart meter sees total consumption across your entire premises. Kitchen, dining room, bar, storage — all combined into one number. A spike in usage could be your HVAC, a fridge malfunction, or a staff member leaving heating on. You can't tell which.
        </p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">2. Whether your usage is normal for your business type.</span> Is 1,200 kWh a month high for a 40-seat restaurant? Low? Average? Smart meters give you raw numbers with no context. Without a benchmark, you don't know if you have a problem.
        </p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">3. What to do differently.</span> Even if you notice your usage is high on Tuesday evenings, the smart meter can't tell you why or what to change. You're left guessing.
        </p>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">The result:</span> Businesses with smart meters still overpay. They just get accurate bills for their overpayment instead of estimated bills.
          </p>
        </div>

        {/* Section 3 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">What the Research Actually Shows</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">The UK government's own evaluation of the smart meter rollout found that households and small businesses saved an average of 2-3% on their energy bills after getting a smart meter. That's roughly £40-60 per year for a typical small business.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Contrast that with businesses that use active energy monitoring software: average savings of 15-25%, driven by identifying specific waste and taking action on it.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">The difference isn't the meter. It's what happens after the data is collected.</p>

        {/* Section 4 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">The Missing Layer: Analytics and Action</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Smart meters are infrastructure. They enable things. But saving money requires a layer on top that actually uses that data.</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">That layer needs to do three things:</p>

        <ul className="list-disc list-inside space-y-3 mb-5 text-lg text-gray-700 ml-2 leading-relaxed">
          <li><span className="font-semibold">Break usage down by zone and time.</span> Not just total daily consumption, but which areas used what, when — so you can see patterns that actually mean something.</li>
          <li><span className="font-semibold">Flag anomalies automatically.</span> Alert you when overnight consumption spikes, when weekend usage is higher than expected, or when specific equipment starts drawing more power than usual.</li>
          <li><span className="font-semibold">Translate data into actions.</span> Not just charts, but specific recommendations: shift this task, turn off that equipment, check this zone — with an estimated saving attached.</li>
        </ul>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">Real example:</span> A hotel in Inverness had a smart meter for three years. Their bills were accurate but still high. When they added monitoring software, it found a heating system running at full capacity every weekday night from midnight to 5 AM — heating empty conference rooms. Annual waste: £3,200. Fix: a £40 timer switch.
          </p>
        </div>

        {/* Conclusion */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">Smart Meters Are a Start, Not a Solution</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">If you have a smart meter, you've done the easy part. You have the data pipe. Now you need something that actually reads what's flowing through it and tells you what it means.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">The businesses cutting 20% from their energy bills aren't doing anything exotic. They're just connecting their smart meter data to software that explains it.</p>

        <p className="text-lg text-gray-700 mb-10 leading-relaxed">GreenPulse connects directly to your smart meter data — through your energy supplier or via direct API — and does exactly this. Zone-level analysis, automatic anomaly detection, and specific savings recommendations, all from data you're already generating.</p>

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

export default BlogPost4;
