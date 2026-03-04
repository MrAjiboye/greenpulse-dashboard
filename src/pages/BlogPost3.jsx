import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BlogPost3 = () => {
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
          <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full">Sustainability</span>
          <span>4 min read</span>
          <span>November 12, 2025</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Scotland's 2030 Net-Zero Target: What Small Hotels Need to Do
        </h1>

        <p className="text-xl text-gray-500 leading-relaxed">
          The deadline is closer than you think. Here's what compliance looks like for independent hospitality businesses, without the corporate jargon.
        </p>
      </div>

      {/* ── Featured Image ── */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        <img
          src="https://i.postimg.cc/pd9Mp8Nc/graph.jpg"
          alt="Data visualization"
          className="w-full rounded-2xl object-cover max-h-96"
          loading="lazy"
        />
      </div>

      {/* ── Article Body ── */}
      <div className="max-w-3xl mx-auto px-6 pb-24">

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Scotland wants to hit net-zero emissions by 2045. The interim target for 2030 is a 75% reduction from 1990 levels. That's five years away.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">For large hotel chains, that means hiring sustainability consultants, carbon offset programs, and multi-million-pound equipment upgrades. For a 12-room bed and breakfast in the Highlands, it means something different.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Here's what compliance looks like for small hospitality operators, and what you can do now without breaking the bank.</p>

        {/* What the Law Requires */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">What the Law Requires</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Scotland's net-zero target includes all sectors, including hospitality. But enforcement varies by business size.</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">Large businesses (250+ employees):</span> Mandatory carbon reporting, emissions reduction plans, annual audits.
        </p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">Small businesses (under 50 employees):</span> No mandatory reporting yet. But there are three things coming that will affect you:
        </p>

        <ul className="list-disc list-inside space-y-3 mb-5 text-lg text-gray-700 ml-2 leading-relaxed">
          <li><span className="font-semibold">Energy Performance Certificates (EPCs):</span> Already required for commercial properties. Standards are tightening. By 2030, buildings must meet higher efficiency ratings or face restrictions.</li>
          <li><span className="font-semibold">Carbon tracking requirements:</span> Some business rate relief and grants already require proof of carbon reduction efforts. This will expand.</li>
          <li><span className="font-semibold">Customer expectations:</span> More guests ask about sustainability practices. Hotels without good answers lose bookings to competitors who have them.</li>
        </ul>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">The bottom line:</span> You won't face fines in 2030 for missing net-zero. But you might lose access to grants, pay higher energy costs, and watch customers choose greener competitors.
          </p>
        </div>

        {/* What Compliance Costs */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">What Compliance Costs</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">The corporate approach to net-zero involves consultants, audits, and expensive retrofits. That doesn't work for a 10-room hotel running on thin margins.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">The practical approach for small hotels focuses on three things, in order:</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">1. Track your baseline (Free to £50/month)</span>
        </p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">You can't reduce what you don't measure. Most small hotels have no idea how much energy they use per guest night, what their carbon footprint is, or where waste happens.</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">Start by tracking:</p>
        <ul className="list-disc list-inside space-y-2 mb-5 text-lg text-gray-700 ml-2 leading-relaxed">
          <li>Total monthly energy consumption</li>
          <li>Energy per occupied room</li>
          <li>Heating vs cooling vs hot water breakdown</li>
          <li>Peak usage times</li>
        </ul>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">This costs nothing if you do it manually with your energy bills. Or £40-80/month if you use an energy monitoring platform like GreenPulse.</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">2. Cut obvious waste (£0 to £500)</span>
        </p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">Once you know where energy goes, fix the obvious problems. Most small hotels waste 20-30% of their energy budget on things that don't serve guests.</p>

        <ul className="list-disc list-inside space-y-2 mb-5 text-lg text-gray-700 ml-2 leading-relaxed">
          <li>Heating unoccupied rooms to full temperature</li>
          <li>Running hot water systems 24/7 when guests need them 8 hours a day</li>
          <li>Cooling spaces that don't need it</li>
          <li>Using old, inefficient appliances when modern ones pay for themselves in savings</li>
        </ul>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Fixing these issues costs little to nothing. Adjusting heating schedules is free. Smart thermostats cost £50-150 per zone. LED bulbs pay for themselves in six months.</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">3. Document and report (Free)</span>
        </p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Keep records of what you've done. Energy bills from 2024 vs 2026. Equipment upgrades. Operational changes. Carbon reduction estimates.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">When grant applications or business rates relief require proof of sustainability efforts, you have it ready. When guests ask about your green practices, you have numbers to show them.</p>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 px-6 py-5 rounded-r-lg my-8">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold text-emerald-700">Real example:</span> A 15-room hotel in Perth tracked their energy usage for three months. They found they were heating empty rooms, running laundry equipment during peak rate hours, and keeping lobby lights at full brightness 24/7. Simple fixes: zone heating to match occupancy, shift laundry to off-peak hours, install motion sensors in public areas. Carbon footprint dropped 28%. Cost: £340.
          </p>
        </div>

        {/* 2030 Checklist */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">The 2030 Checklist for Small Hotels</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">If you want to be ahead of requirements and attract sustainability-minded guests, aim for these benchmarks by 2030:</p>

        <ul className="list-disc list-inside space-y-3 mb-5 text-lg text-gray-700 ml-2 leading-relaxed">
          <li><span className="font-semibold">Energy tracking:</span> Know your consumption per guest night and per square meter</li>
          <li><span className="font-semibold">EPC rating:</span> Minimum Band C (most small hotels sit at D or E)</li>
          <li><span className="font-semibold">Waste reduction:</span> 30% less energy waste than your 2024 baseline</li>
          <li><span className="font-semibold">Hot water efficiency:</span> On-demand or smart systems, not 24/7 heating</li>
          <li><span className="font-semibold">Documentation:</span> Records showing year-over-year carbon reduction</li>
        </ul>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">This isn't corporate net-zero. It's practical sustainability for businesses with limited budgets. The goal is to cut costs, stay competitive, and prepare for tightening standards without massive capital investment.</p>

        {/* What happens if you do nothing */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">What Happens If You Do Nothing</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Realistically, a small hotel that ignores sustainability until 2030 will not face immediate legal consequences. But three things will hurt:</p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">1. Higher costs.</span> Energy prices keep rising. Inefficient buildings pay more. The gap between efficient and inefficient operations grows every year.
        </p>

        <p className="text-lg text-gray-700 mb-3 leading-relaxed">
          <span className="text-emerald-600 font-semibold">2. Lost business.</span> Booking platforms add sustainability filters. Guests choose greener options when prices are equal. Hotels without good environmental practices lose bookings.
        </p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">
          <span className="text-emerald-600 font-semibold">3. No grant access.</span> Government support for small businesses increasingly requires proof of carbon reduction efforts. Hotels without that proof get left out.
        </p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">The businesses preparing now won't just avoid penalties. They'll save money, attract customers, and position themselves for future support programs.</p>

        {/* Start here */}
        <h2 className="text-3xl font-bold text-gray-900 mt-14 mb-5">Start Here</h2>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">You don't need a sustainability consultant or a £50,000 equipment overhaul. Start with visibility.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">Track your energy usage for one month. Calculate energy per occupied room. Find the biggest waste. Fix it. Repeat.</p>

        <p className="text-lg text-gray-700 mb-5 leading-relaxed">GreenPulse makes this simple for hospitality businesses. We show you exactly where your energy goes, what it costs, and how to cut waste without complicated analysis.</p>

        <p className="text-lg text-gray-700 mb-10 leading-relaxed">Spring 2026, we're launching in Scotland. If you want to prepare for 2030 without breaking your budget, sign up.</p>

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

export default BlogPost3;
