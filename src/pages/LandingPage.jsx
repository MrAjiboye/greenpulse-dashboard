import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: 'fa-bolt', color: 'emerald',
    title: 'Energy Monitor',
    desc: 'Real time tracking of consumption across zones. Identify peak usage patterns and calculate costs instantly.',
    bullets: ['Hourly & Weekly breakdowns', 'Peak usage alerts'],
  },
  {
    icon: 'fa-recycle', color: 'orange',
    title: 'Waste Management',
    desc: 'Digitize your waste logging process. Track diversion rates and visualize trends by waste stream category.',
    bullets: ['Food vs Packaging breakdown', 'Manual logging forms'],
  },
  {
    icon: 'fa-brain', color: 'blue',
    title: 'AI Insights',
    desc: 'Smart recommendations tailored to your facility. Identify savings opportunities and act on them with one click.',
    bullets: ['Potential savings ranking', 'Automated anomaly detection'],
  },
  {
    icon: 'fa-chart-line', color: 'purple',
    title: 'Cost Predictions',
    desc: 'Know what your bill will be before it arrives. Plan ahead and avoid surprises with ML-powered forecasting.',
    bullets: ['7-day ahead forecasts', 'Confidence intervals included'],
  },
  {
    icon: 'fa-bell', color: 'rose',
    title: 'Smart Alerts',
    desc: 'Get notified the moment equipment runs inefficiently or usage spikes unexpectedly — straight to your inbox.',
    bullets: ['Real-time spike detection', 'Email alerts to managers'],
  },
  {
    icon: 'fa-plug', color: 'amber',
    title: 'Equipment Insights',
    desc: 'Equipment-level tracking shows your biggest energy drains so you know exactly where to act.',
    bullets: ['Zone-level breakdowns', 'Identify high-draw equipment'],
  },
];

const COLOR_MAP = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  orange:  { bg: 'bg-orange-100',  text: 'text-orange-600'  },
  blue:    { bg: 'bg-blue-100',    text: 'text-blue-600'    },
  purple:  { bg: 'bg-purple-100',  text: 'text-purple-600'  },
  rose:    { bg: 'bg-rose-100',    text: 'text-rose-600'    },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-600'   },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  const [featurePage, setFeaturePage] = useState(0);
  const [mobileIdx, setMobileIdx] = useState(0);
  const PER_PAGE = 3;
  const totalPages = Math.ceil(FEATURES.length / PER_PAGE);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    const MAILCHIMP_URL = 'https://slowfoodglasgow.us19.list-manage.com/subscribe/post-json?u=0db25962120ceda5272370437&id=0310e47181&f_id=00fb8ae3f0';
    const callbackName = 'mc_' + Date.now();
    const url = `${MAILCHIMP_URL}&EMAIL=${encodeURIComponent(newsletterEmail)}&b_0db25962120ceda5272370437_0310e47181=&c=${callbackName}`;

    const script = document.createElement('script');
    script.src = url;

    window[callbackName] = (data) => {
      delete window[callbackName];
      if (document.body.contains(script)) document.body.removeChild(script);
      if (data.result === 'success') {
        setNewsletterDone(true);
        setNewsletterError('');
      } else {
        const msg = data.msg || '';
        setNewsletterError(msg.toLowerCase().includes('already subscribed')
          ? "You're already subscribed!"
          : 'Something went wrong. Please try again.');
      }
    };

    document.body.appendChild(script);
  };

  useEffect(() => {
    if (window.Plotly) {
      initializeChart();
    }
    return () => {
      const el = document.getElementById('reporting-chart');
      if (el && window.Plotly) { window.Plotly.purge(el); el.innerHTML = ''; }
    };
  }, []);

  const initializeChart = () => {
    try {
      const trace1 = {
        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        y: [15, 18, 14, 0, 0, 0],
        name: 'Baseline',
        type: 'bar',
        marker: { color: '#e5e7eb' },
        hoverinfo: 'none'
      };

      const trace2 = {
        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        y: [0, 0, 0, 12, 10, 8],
        name: 'Optimized',
        type: 'bar',
        marker: { color: '#34d399' }
      };

      const layout = {
        barmode: 'stack',
        margin: { t: 20, r: 20, b: 40, l: 40 },
        showlegend: false,
        xaxis: { showgrid: false, tickfont: { size: 10, color: '#6b7280' } },
        yaxis: { showgrid: true, gridcolor: '#f3f4f6', range: [0, 20], tickfont: { size: 10, color: '#6b7280' } },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        height: 300
      };

      window.Plotly.newPlot('reporting-chart', [trace1, trace2], layout, {responsive: true, displayModeBar: false});
    } catch(e) {
      console.error("Chart generation failed:", e);
    }
  };

  return (
    <div className="bg-white text-gray-700 antialiased">
      <style>{`
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #f0fdf4 1px, transparent 1px),
          linear-gradient(to bottom, #f0fdf4 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-leaf"></i>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">GreenPulse</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">Features</a>
            <a href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">How it works</a>
            <a href="/stories" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">Stories</a>
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">About</Link>
          </nav>

          <div className="flex items-center gap-6">
            <div className="hidden md:block h-4 w-px bg-gray-200"></div>
            <button onClick={() => navigate('/signin')} className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200">Sign In</button>
            <button onClick={() => navigate('/register')} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5">
              Create Account
            </button>
          </div>
        </div>
      </header>

      <section className="pt-28 pb-12 md:pt-32 md:pb-20 relative overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-50 to-transparent -z-10"></div>
        
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          
          <div className="flex justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <i className="fa-solid fa-bolt text-[10px]"></i> Energy
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200">
              <i className="fa-solid fa-recycle text-[10px]"></i> Waste
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200">
              <i className="fa-solid fa-brain text-[10px]"></i> Insights
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight max-w-5xl mx-auto">
            Sustainability Intelligence for <br/>
            <span className="text-emerald-500 inline-block relative">
              Modern Enterprises
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-200 -z-10" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7201 5.20404 24.9603 4.38926 54.9038 4.09066C105.908 3.58197 148.694 1.25898 194.006 4.99997" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Track energy consumption, manage waste streams, and receive AI driven insights to reduce your carbon footprint and operational costs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-20">
            <button onClick={() => navigate('/signin')} className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 min-w-[200px]">
              Sign In to Dashboard
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </button>
            <button className="px-8 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 min-w-[200px]">
              <i className="fa-solid fa-user-plus text-emerald-500"></i>
              Create Free Account
            </button>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative z-10">
              <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              
              <div className="p-6 md:p-10 bg-gray-50/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <i className="fa-solid fa-bolt"></i>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100">-12% vs last week</span>
                  </div>
                  <div className="h-24 w-full relative mb-2">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path d="M0 30 L20 25 L40 15 L60 20 L80 10 L100 18" fill="none" stroke="#2ecc71" strokeWidth="2" />
                      <path d="M0 30 L20 25 L40 15 L60 20 L80 10 L100 18 V 40 H 0 Z" fill="rgba(46, 204, 113, 0.1)" stroke="none" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Energy Usage</p>
                    <p className="text-2xl font-bold text-gray-900">1,240 kWh</p>
                  </div>
                  <div className="absolute top-20 -left-6 bg-white p-2 pr-4 rounded-lg shadow-lg border border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <i className="fa-solid fa-leaf"></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Carbon Saved</p>
                      <p className="text-xs font-bold text-gray-800">2.4 Tons</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                      <i className="fa-solid fa-trash-alt"></i>
                    </div>
                    <span className="text-[10px] text-gray-400">Updated 2h ago</span>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">Recycled</span>
                        <span className="font-bold text-gray-900">65%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{width: '65%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">Landfill</span>
                        <span className="font-bold text-gray-900">35%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-400 rounded-full" style={{width: '35%'}}></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center border-t border-gray-50 pt-4">
                    <p className="text-xs text-gray-500 mb-1">Total Waste</p>
                    <p className="text-2xl font-bold text-gray-900">842 kg</p>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-xl shadow-sm border border-blue-100 relative">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm mb-3 border border-blue-50">
                    <p className="text-[10px] font-bold text-blue-600 mb-1">Recommendation</p>
                    <p className="text-xs text-gray-600 leading-tight">Switch HVAC to eco-mode during off peak hours to save ~£450/mo.</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-red-50 opacity-80">
                    <p className="text-[10px] font-bold text-red-500 mb-1">Alert</p>
                    <p className="text-xs text-gray-600 leading-tight">Zone B usage spike detected.</p>
                  </div>

                  <div className="absolute bottom-4 -right-6 bg-white p-2 pl-3 rounded-lg shadow-lg border border-gray-100 flex items-center gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400 text-right">Waste Diverted</p>
                      <p className="text-xs font-bold text-gray-800 text-right">85%</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                      <i className="fa-solid fa-chart-pie"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-emerald-400/10 blur-[80px] -z-10 rounded-full"></div>
          </div>
        </div>
      </section>

      <section id="features" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-14 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comprehensive Environmental Monitoring</h2>
            <p className="text-gray-600 text-lg">Everything you need to track, analyze, and improve your organization's sustainability performance in one unified platform.</p>
          </div>

          {/* Mobile: 1 card at a time */}
          <div className="md:hidden overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${mobileIdx * 100}%)` }}
            >
              {FEATURES.map((f) => {
                const c = COLOR_MAP[f.color];
                return (
                  <div key={f.title} className="w-full flex-shrink-0 p-8 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className={`w-14 h-14 ${c.bg} rounded-xl flex items-center justify-center mb-6`}>
                      <i className={`fa-solid ${f.icon} ${c.text} text-2xl`}></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{f.desc}</p>
                    <ul className="space-y-3">
                      {f.bullets.map(b => (
                        <li key={b} className="flex items-center gap-3 text-sm text-gray-700">
                          <i className="fa-solid fa-check text-emerald-500 text-xs"></i> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setMobileIdx(i => Math.max(0, i - 1))}
                disabled={mobileIdx === 0}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="fa-solid fa-chevron-left text-xs"></i>
              </button>
              {FEATURES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMobileIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${mobileIdx === i ? 'bg-emerald-500 scale-125' : 'bg-gray-200 hover:bg-gray-300'}`}
                />
              ))}
              <button
                onClick={() => setMobileIdx(i => Math.min(FEATURES.length - 1, i + 1))}
                disabled={mobileIdx === FEATURES.length - 1}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
            </div>
          </div>

          {/* Desktop: 3 cards at a time */}
          <div className="hidden md:block overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${featurePage * 100}%)` }}
            >
              {Array.from({ length: totalPages }).map((_, pageIdx) => (
                <div key={pageIdx} className="w-full flex-shrink-0 grid grid-cols-3 gap-8">
                  {FEATURES.slice(pageIdx * PER_PAGE, pageIdx * PER_PAGE + PER_PAGE).map((f) => {
                    const c = COLOR_MAP[f.color];
                    return (
                      <div key={f.title} className="p-8 rounded-2xl bg-gray-50 hover:bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className={`w-14 h-14 ${c.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                          <i className={`fa-solid ${f.icon} ${c.text} text-2xl`}></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">{f.desc}</p>
                        <ul className="space-y-3">
                          {f.bullets.map(b => (
                            <li key={b} className="flex items-center gap-3 text-sm text-gray-700">
                              <i className="fa-solid fa-check text-emerald-500 text-xs"></i> {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => setFeaturePage(p => Math.max(0, p - 1))}
                disabled={featurePage === 0}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="fa-solid fa-chevron-left text-xs"></i>
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeaturePage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${featurePage === i ? 'bg-emerald-500 scale-125' : 'bg-gray-200 hover:bg-gray-300'}`}
                />
              ))}
              <button
                onClick={() => setFeaturePage(p => Math.min(totalPages - 1, p + 1))}
                disabled={featurePage === totalPages - 1}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-30"></div>
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-lg text-gray-900">Monthly Report</h3>
                  <button className="text-xs flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <i className="fa-solid fa-download text-gray-400"></i> Export PDF
                  </button>
                </div>
                
                <div id="reporting-chart" className="h-[300px] w-full"></div>
                
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Total Carbon</p>
                    <p className="text-xl font-bold text-gray-900">12.5 T</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl">
                    <p className="text-xs text-emerald-600 mb-1">Net Savings</p>
                    <p className="text-xl font-bold text-emerald-700">£2,450</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-grid-pattern opacity-50"></div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold mb-4 uppercase tracking-wider">
                <i className="fa-solid fa-file-alt mr-1"></i> Reporting
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Automated Sustainability Reporting</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Generate comprehensive monthly reports with a single click. Compare performance against previous periods and industry benchmarks.
              </p>
              
              <ul className="space-y-5 mb-10">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
                  </div>
                  <span className="text-gray-700">Standardized formats compliant with ESG regulations</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
                  </div>
                  <span className="text-gray-700">Historical data comparison and trend analysis</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
                  </div>
                  <span className="text-gray-700">Shareable links for stakeholders and team members</span>
                </li>
              </ul>

              <a href="/signin" className="text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-2 group">
                Learn more about reports
                <i className="fa-solid fa-arrow-right text-sm group-hover:translate-x-1 transition-transform"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 py-10 md:py-16 border-t border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-800">
            <div className="px-4">
              <p className="text-4xl font-bold text-emerald-500 mb-2">500+</p>
              <p className="text-sm text-gray-400">Facilities Monitored</p>
            </div>
            <div className="px-4">
              <p className="text-4xl font-bold text-emerald-500 mb-2">12k</p>
              <p className="text-sm text-gray-400">Tons CO2 Saved</p>
            </div>
            <div className="px-4">
              <p className="text-4xl font-bold text-emerald-500 mb-2">24/7</p>
              <p className="text-sm text-gray-400">Real time Monitoring</p>
            </div>
            <div className="px-4">
              <p className="text-4xl font-bold text-emerald-500 mb-2">£2M+</p>
              <p className="text-sm text-gray-400">Client Savings</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-emerald-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-100/50 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to optimize your environmental impact?</h2>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Join forward-thinking organizations using GreenPulse to reduce waste, save energy, and cut costs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button onClick={() => navigate('/register')} className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 w-full sm:w-auto">
              Get Started for Free
            </button>
            <button onClick={() => navigate('/register')} className="px-8 py-3.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 font-bold rounded-lg shadow-sm transition-all w-full sm:w-auto">
              Schedule a Demo
            </button>
          </div>
          <p className="text-xs text-gray-500">No credit card required for 14-day trial.</p>
        </div>
      </section>

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
                Empowering organizations to build a sustainable future through data driven insights and intelligent resource management.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li><Link to="/register" className="hover:text-emerald-600 transition-all duration-200">Energy Monitor</Link></li>
                <li><Link to="/register" className="hover:text-emerald-600 transition-all duration-200">Waste Management</Link></li>
                <li><Link to="/register" className="hover:text-emerald-600 transition-all duration-200">AI Insights</Link></li>
                <li><Link to="/register" className="hover:text-emerald-600 transition-all duration-200">Reporting</Link></li>
                <li><Link to="/register" className="hover:text-emerald-600 transition-all duration-200">Carbon Footprint</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li><a href="/about" className="hover:text-emerald-600 transition-all duration-200">About Us</a></li>
                <li><a href="/careers" className="hover:text-emerald-600 transition-all duration-200">Careers</a></li>
                <li><a href="/blog" className="hover:text-emerald-600 transition-all duration-200">Blog</a></li>
                <li><a href="/contact" className="hover:text-emerald-600 transition-all duration-200">Contact</a></li>
                <li><a href="/privacy" className="hover:text-emerald-600 transition-all duration-200">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Stay Updated</h4>
              <p className="text-sm text-gray-500 mb-4">Subscribe to our newsletter for the latest sustainability tips.</p>
              {newsletterDone ? (
                <p className="text-sm text-emerald-600 font-medium"><i className="fa-solid fa-circle-check mr-1.5"></i>Thanks! You're subscribed.</p>
              ) : (
                <>
                  <form onSubmit={handleNewsletter} className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={newsletterEmail}
                      onChange={e => { setNewsletterEmail(e.target.value); setNewsletterError(''); }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                    <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-semibold">Subscribe</button>
                  </form>
                  {newsletterError && <p className="text-xs text-red-500 mt-2">{newsletterError}</p>}
                </>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">© 2026 GreenPulse Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://linkedin.com/greenpulse-analytics-uk" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-600 transition-colors" aria-label="LinkedIn">
                <i className="fa-brands fa-linkedin-in text-sm"></i>
              </a>
              <a href="https://x.com/GreenPulseUK?s=20" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-600 transition-colors" aria-label="X (Twitter)">
                <i className="fa-brands fa-x-twitter text-sm"></i>
              </a>
            </div>
            <div className="flex gap-6">
              <a href="/terms" className="text-xs text-gray-400 hover:text-gray-600">Terms</a>
              <a href="/privacy" className="text-xs text-gray-400 hover:text-gray-600">Privacy</a>
              <a href="/cookies" className="text-xs text-gray-400 hover:text-gray-600">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;