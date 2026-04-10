import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const BlogPost2 = () => {
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
          <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full">Analytics</span>
          <span>6 min read</span>
          <span>February 3, 2026</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Foot Traffic Data is Useless Without This
        </h1>

        <p className="text-xl text-gray-500 leading-relaxed">
          Counting customers is easy. Knowing what to do with that data is hard. How smart hospitality operators turn foot traffic patterns into profit.
        </p>
      </div>

      {/* ── Featured Image ── */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        <img
          src="https://i.postimg.cc/0NLRmQPq/pexels_anna_nekrashevich_6801648.jpg"
          alt="Business analytics charts"
          className="w-full rounded-2xl object-cover max-h-96"
          loading="lazy"
        />
      </div>

      {/* ── Article Body ── */}
      <div className="max-w-3xl mx-auto px-6 pb-24">

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">You installed a door counter. Now you know exactly how many people walk in each day. Monday: 147 visitors. Tuesday: 132. Wednesday: 168.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Great. Now what?</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Most small hospitality businesses collect foot traffic data and do nothing with it. The numbers sit in a spreadsheet or dashboard, ignored. Because knowing how many people walked through your door tells you almost nothing useful by itself.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">The businesses making money from foot traffic data aren't just counting. They're connecting that data to three other metrics that turn visitor numbers into actionable decisions.</p>

        {/* Section 1 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">1. Foot Traffic + Energy Usage = Efficiency Score</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Here's what nobody talks about. Your energy costs should move with your foot traffic. More customers means more lights on, more equipment running, more HVAC needed.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">But most restaurants run the same equipment whether they have 50 customers or 200. Full heating. Full cooling. Full lighting. All day.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">The smart play:</span> Track energy usage per customer. If you're spending the same on energy during slow hours as busy hours, you're wasting money.
        </p>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">Real example:</span> A Glasgow café had 80 customers on Monday mornings and 240 on Saturday mornings. Energy usage was identical. They were heating, cooling, and lighting an empty space for hours. Adjusting HVAC schedules to match actual traffic saved £340/month.
          </p>
        </div>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Foot traffic alone tells you when you're busy. Foot traffic plus energy shows you when you're inefficient.</p>

        {/* Section 2 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">2. Foot Traffic + Conversion Rate = Revenue Reality</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">How many people who walk in actually buy something? That's your conversion rate. Without it, foot traffic data is worthless.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">You might have 200 people walk through the door on Saturday. Sounds great until you realize only 60 made a purchase. That's a 30% conversion rate. The other 140 people just browsed and left.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">Why this matters:</span> If foot traffic drops but conversion rises, you're fine. If foot traffic rises but conversion drops, you have a problem.
        </p>

        <ul className="list-disc list-inside space-y-2 mb-5 text-lg text-gray-700 ml-2 leading-relaxed">
          <li>Monday: 100 visitors, 70 conversions = 70% conversion</li>
          <li>Saturday: 250 visitors, 75 conversions = 30% conversion</li>
        </ul>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Which day performed better? Monday. Fewer people, but they came to buy. Saturday had lots of browsers.</p>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">What to do with this:</span> Low conversion on busy days? You're understaffed or your layout is confusing. High conversion on slow days? You're attracting the right customers. Don't chase foot traffic. Chase conversion.
          </p>
        </div>

        {/* Section 3 */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">3. Foot Traffic + Staff Hours = Labor Efficiency</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">You're paying staff to serve customers. How many customers per staff hour are you getting?</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">If you have three staff working a Tuesday lunch shift that serves 45 customers, that's 15 customers per staff hour. If you have two staff on Thursday lunch serving 50 customers, that's 25 customers per staff hour.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Thursday is more efficient. You're serving more people with less labor cost.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">The pattern:</span> Most restaurants overstaff slow periods and understaff busy ones. They schedule based on tradition, not data.
        </p>

        <ul className="list-disc list-inside space-y-2 mb-5 text-lg text-gray-700 ml-2 leading-relaxed">
          <li>Tuesday morning: 4 staff, 60 customers = 15 per staff hour</li>
          <li>Friday evening: 5 staff, 180 customers = 36 per staff hour</li>
        </ul>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Friday is packed but efficient. Tuesday is costing you money. Cut one person from Tuesday shifts. Add one to Friday evening.</p>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">Real numbers:</span> An Edinburgh restaurant tracked foot traffic against staff schedules for a month. They found they were overstaffed Monday through Wednesday by one person, and understaffed Friday through Sunday by one person. Reallocating those hours saved £480/month without changing total labor hours.
          </p>
        </div>

        {/* Combined section */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">The Missing Link: Combining All Three</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Foot traffic data becomes powerful when you layer it with energy usage, conversion rates, and staff efficiency.</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">Here's what that looks like in practice:</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">Scenario:</span> Your Saturday afternoon shows 180 visitors, 50 conversions (28%), 4 staff working, and £85 in energy costs.
        </p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed"><span className="text-emerald-600 font-semibold">Analysis:</span></p>
        <ul className="list-disc list-inside space-y-2 mb-5 text-lg text-gray-700 ml-2 leading-relaxed">
          <li>Low conversion (28%) suggests layout or service issues</li>
          <li>45 customers per staff hour is good but could be better with one more person</li>
          <li>£85 energy cost for 180 visitors = 47p per visitor (high for a café)</li>
        </ul>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed"><span className="text-emerald-600 font-semibold">Actions:</span></p>
        <ul className="list-disc list-inside space-y-2 mb-5 text-lg text-gray-700 ml-2 leading-relaxed">
          <li>Add one more staff member to Saturday afternoon to improve service and lift conversion to 35-40%</li>
          <li>Review which equipment is running unnecessarily during peak hours</li>
          <li>Test menu placement or staff prompts to increase conversion rate</li>
        </ul>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">One month later, you have 185 visitors (slight increase), 70 conversions (38%, huge increase), 5 staff working (better service), and £72 in energy costs (equipment optimization).</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Revenue is up. Energy costs are down. Staff are less stressed. All because you stopped just counting people and started connecting the data.</p>

        {/* Why GreenPulse */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">Why GreenPulse Includes Foot Traffic</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Energy analytics make more sense when you know how many people you're serving. That's why GreenPulse packages include foot traffic tracking alongside energy monitoring.</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">We show you:</p>
        <ul className="list-disc list-inside space-y-2 mb-5 text-lg text-gray-700 ml-2 leading-relaxed">
          <li>Energy cost per customer</li>
          <li>Peak traffic times vs peak energy times</li>
          <li>When you're running equipment for empty rooms</li>
          <li>How traffic patterns match your actual costs</li>
        </ul>

        <p className="text-lg text-gray-700 mb-10 leading-relaxed">Foot traffic data alone is just numbers. Foot traffic connected to energy, conversion, and labor efficiency is a business strategy.</p>

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

export default BlogPost2;
