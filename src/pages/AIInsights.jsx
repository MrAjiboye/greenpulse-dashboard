import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { insightsAPI } from '../services/api';
import useScrollReveal from '../hooks/useScrollReveal';

const CATEGORY_CONFIG = {
  energy:      { icon: 'fa-bolt',               color: 'blue',    label: 'Energy',      tabIcon: 'fa-bolt'    },
  waste:       { icon: 'fa-recycle',             color: 'emerald', label: 'Waste',       tabIcon: 'fa-recycle' },
  operations:  { icon: 'fa-gears',               color: 'orange',  label: 'Operations',  tabIcon: 'fa-gears'   },
  sustainability: { icon: 'fa-leaf',             color: 'emerald', label: 'Sustainability', tabIcon: 'fa-leaf'  },
  cost:        { icon: 'fa-dollar-sign',          color: 'blue',    label: 'Cost',        tabIcon: 'fa-dollar-sign' },
  default:     { icon: 'fa-wand-magic-sparkles',  color: 'gray',    label: 'Other',       tabIcon: 'fa-layer-group' },
};

const CONFIDENCE_CONFIG = {
  high:   { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'High Confidence',   bar: 'bg-emerald-500' },
  medium: { bg: 'bg-orange-100',  text: 'text-orange-700',  dot: 'bg-orange-400',  label: 'Medium Confidence', bar: 'bg-orange-400'  },
  low:    { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400',    label: 'Low Confidence',    bar: 'bg-gray-400'    },
};

const COLOR_BAR = {
  blue: 'bg-blue-500', emerald: 'bg-emerald-500', orange: 'bg-orange-400', gray: 'bg-gray-400',
};
const COLOR_ICON_BG = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  orange: 'bg-orange-50 text-orange-500 border-orange-100',
  gray: 'bg-gray-50 text-gray-500 border-gray-100',
};

function catConfig(category) {
  return CATEGORY_CONFIG[category?.toLowerCase()] ?? CATEGORY_CONFIG.default;
}
function confConfig(confidence) {
  return CONFIDENCE_CONFIG[confidence?.toLowerCase()] ?? CONFIDENCE_CONFIG.medium;
}

const DISMISS_REASONS = ['Already implemented', 'Not feasible right now', 'Inaccurate data', 'Other'];

function InsightCard({ insight, canAct, onDismiss, dismissing }) {
  const navigate = useNavigate();
  const cat = catConfig(insight.category);
  const conf = confConfig(insight.confidence ?? insight.confidence_level);
  const [showFeedback, setShowFeedback] = useState(false);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const savings = insight.estimated_savings ?? insight.potential_savings_monthly ?? insight.potential_savings ?? insight.savings_monthly;
  const savingsPct = insight.savings_pct ?? insight.cost_reduction_pct ?? insight.efficiency_gain_pct;
  const metrics = insight.metrics ?? [];

  const handleDismiss = () => {
    const finalReason = reason === 'Other' ? customReason : reason;
    onDismiss(insight.id, finalReason || null);
    setShowFeedback(false);
  };

  return (
    <div className={`reveal card-hover bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden hover:border-emerald-300 transition-all ${dismissing ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full ${COLOR_BAR[cat.color] ?? 'bg-gray-400'}`}></div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl border shadow-sm ${COLOR_ICON_BG[cat.color]}`}>
            <i className={`fa-solid ${cat.icon}`}></i>
          </div>
          <div className="mt-3">
            <div className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded-md ${conf.bg} ${conf.text}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${conf.dot} ${conf.dot === 'bg-emerald-500' ? 'animate-pulse' : ''}`}></div>
              <span className="text-[10px] font-bold uppercase tracking-wide">{conf.label}</span>
            </div>
          </div>
        </div>

        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                  <i className={`fa-solid ${cat.tabIcon} text-gray-400`}></i> {cat.label}
                </span>
                {insight.subcategory && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-xs text-gray-400">{insight.subcategory}</span>
                  </>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{insight.title}</h3>
            </div>
            {savings != null && (
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-emerald-600">
                  £{savings >= 1000 ? `${(savings / 1000).toFixed(1)}k` : savings}
                </div>
                {savingsPct != null && (
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
                    {savingsPct}% {insight.savings_label ?? 'Cost Reduction'}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-4">{insight.description}</p>

          {metrics.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 rounded-xl p-3 border border-gray-100">
              {metrics.slice(0, 3).map((m, i) => (
                <div key={i} className={`text-center ${i < 2 ? 'border-r border-gray-200' : ''}`}>
                  <span className="block text-xs text-gray-400">{m.label}</span>
                  <span className={`block text-sm font-bold ${m.highlight ? 'text-emerald-600' : 'text-gray-800'}`}>{m.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {canAct && (
              <>
                <button onClick={() => navigate(`/recommendation/${insight.id}`)}
                  className="flex-1 min-w-[160px] bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <i className="fa-solid fa-bolt"></i> Apply Recommendation
                </button>
                <button onClick={() => setShowFeedback(v => !v)}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
                  Dismiss
                </button>
              </>
            )}
            <button onClick={() => navigate(`/recommendation/${insight.id}`)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {showFeedback && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Why are you dismissing this insight?</p>
              <div className="space-y-2">
                {DISMISS_REASONS.map(r => (
                  <label key={r} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="radio" name={`reason-${insight.id}`} value={r}
                      checked={reason === r} onChange={() => setReason(r)}
                      className="text-emerald-500 focus:ring-emerald-500" />
                    {r}
                  </label>
                ))}
                {reason === 'Other' && (
                  <input type="text" value={customReason} onChange={e => setCustomReason(e.target.value)}
                    placeholder="Describe your reason..."
                    className="w-full mt-1 text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none" />
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setShowFeedback(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleDismiss} disabled={!reason}
                  className="px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded hover:bg-gray-700 disabled:opacity-40">
                  Confirm Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { key: 'all',        label: 'All Insights',  icon: 'fa-layer-group' },
  { key: 'energy',     label: 'Energy',         icon: 'fa-bolt'        },
  { key: 'waste',      label: 'Waste',          icon: 'fa-recycle'     },
  { key: 'operations', label: 'Operations',     icon: 'fa-gears'       },
];

const AIInsights = () => {
  const { hasRole } = useAuth();
  const canAct = hasRole?.('manager', 'admin') ?? true;

  const [loading, setLoading] = useState(true);
  useScrollReveal(undefined, undefined, !loading);
  const [insights, setInsights] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [dismissingIds, setDismissingIds] = useState(new Set());

  const fetchInsights = useCallback(async () => {
    try {
      const data = await insightsAPI.getList('PENDING');
      setInsights(Array.isArray(data) ? data : (data?.items ?? []));
    } catch {
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  useEffect(() => {
    if (loading || insights.length === 0 || !window.Plotly) return;
    const purge = (id) => { const el = document.getElementById(id); if (el && window.Plotly) { window.Plotly.purge(el); el.innerHTML = ''; } };
    purge('savingsChart');
    const top = [...insights]
      .sort((a, b) => (b.estimated_savings ?? 0) - (a.estimated_savings ?? 0))
      .slice(0, 5);
    const colorMap = { energy: '#3b82f6', waste: '#10b981', operations: '#f97316' };
    window.Plotly.newPlot('savingsChart', [{
      x: top.map(i => i.estimated_savings ?? 0),
      y: top.map(i => i.title?.length > 22 ? i.title.slice(0, 22) + '…' : i.title),
      type: 'bar', orientation: 'h',
      marker: { color: top.map(i => colorMap[(i.category ?? '').toLowerCase()] ?? '#6b7280') },
      hovertemplate: '<b>%{y}</b><br>£%{x:,.0f}/mo<extra></extra>',
    }], {
      font: { family: 'Inter, sans-serif', size: 10 },
      margin: { t: 4, r: 12, b: 28, l: 8 },
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: { showgrid: true, gridcolor: '#f3f4f6', tickprefix: '£', color: '#9ca3af' },
      yaxis: { showgrid: false, color: '#374151', automargin: true },
      height: 192,
    }, { responsive: true, displayModeBar: false });
    return () => { if (window.Plotly) purge('savingsChart'); };
  }, [loading, insights]);

  const handleDismiss = async (id, reason) => {
    setDismissingIds(s => new Set(s).add(id));
    try {
      await insightsAPI.dismiss(id, reason);
      setInsights(prev => prev.filter(i => i.id !== id));
    } finally {
      setDismissingIds(s => { const n = new Set(s); n.delete(id); return n; });
    }
  };

  const filtered = activeFilter === 'all'
    ? insights
    : insights.filter(i => (i.category ?? '').toLowerCase() === activeFilter);

  const totalSavings = insights.reduce((sum, i) => sum + (i.potential_savings_monthly ?? i.potential_savings ?? 0), 0);

  // Category counts for sidebar
  const categoryCounts = insights.reduce((acc, i) => {
    const cat = (i.category ?? 'other').toLowerCase();
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <NavBar />
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-7 w-72 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-14 w-full rounded-2xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex gap-6">
                    <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-5/6 mb-4" />
                      <Skeleton className="h-16 w-full rounded-xl mb-4" />
                      <div className="flex gap-3">
                        <Skeleton className="h-10 flex-1 rounded-lg" />
                        <Skeleton className="h-10 w-24 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600 uppercase tracking-wider border border-purple-100">AI Powered</span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Analysis
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Insights & Recommendations</h1>
            <p className="text-gray-500 mt-1 max-w-2xl">Personalized optimization strategies ranked by potential impact.</p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <i className="fa-solid fa-sack-dollar"></i>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Potential Savings</p>
                <p className="text-lg font-bold text-gray-900">
                  {totalSavings > 0 ? `£${totalSavings >= 1000 ? `${(totalSavings / 1000).toFixed(1)}k` : totalSavings}` : '—'}
                  <span className="text-xs font-normal text-gray-400">/mo</span>
                </p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Open Insights</p>
                <p className="text-lg font-bold text-gray-900">{insights.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="sticky top-20 z-30 bg-gray-50/95 backdrop-blur-sm pt-2 pb-4 mb-2">
          <div className="flex items-center gap-1 p-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
            {FILTERS.map(f => {
              const count = f.key === 'all' ? insights.length : (categoryCounts[f.key] ?? 0);
              return (
                <button key={f.key} onClick={() => setActiveFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeFilter === f.key ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                  <i className={`fa-solid ${f.icon} ${activeFilter === f.key ? 'text-emerald-500' : ''}`}></i>
                  {f.label}
                  {count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFilter === f.key ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <i className="fa-solid fa-wand-magic-sparkles text-5xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  {activeFilter === 'all' ? 'No pending insights' : `No ${activeFilter} insights`}
                </h3>
                <p className="text-sm text-gray-400">
                  {activeFilter === 'all'
                    ? 'All recommendations have been applied or dismissed. Check back after the next AI analysis.'
                    : `No pending insights in the ${activeFilter} category.`}
                </p>
              </div>
            ) : (
              filtered.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  canAct={canAct}
                  onDismiss={handleDismiss}
                  dismissing={dismissingIds.has(insight.id)}
                />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Savings Projection — static chart for now */}
            <div className="reveal bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900">Savings Projection</h3>
              </div>
              <div className="relative h-48 w-full">
                <div id="savingsChart" className="w-full h-full"></div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="reveal stagger-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Insight Categories</h3>
              {Object.keys(categoryCounts).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No insights available</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(categoryCounts).map(([cat, count]) => {
                    const cfg = catConfig(cat);
                    const colorMap = { blue: 'bg-blue-100 text-blue-600', emerald: 'bg-emerald-100 text-emerald-600', orange: 'bg-orange-100 text-orange-600', gray: 'bg-gray-100 text-gray-500' };
                    return (
                      <button key={cat} onClick={() => setActiveFilter(cat)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer ${activeFilter === cat ? 'bg-gray-100' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${colorMap[cfg.color] ?? 'bg-gray-100 text-gray-500'}`}>
                            <i className={`fa-solid ${cfg.icon}`}></i>
                          </div>
                          <span className="text-sm font-medium text-gray-700 capitalize">{cfg.label}</span>
                        </div>
                        <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Status Panel */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-sm p-5 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">System Status</span>
                </div>
                <h3 className="text-lg font-bold mb-1">AI Model Active</h3>
                <p className="text-gray-400 text-xs mb-4">Continuously analyzing your facility data</p>
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">Data Processing</span>
                      <span className="text-emerald-400">99.8%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '99.8%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">Anomaly Detection</span>
                      <span className="text-blue-400">Active</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-white text-xs">
              <i className="fa-solid fa-leaf"></i>
            </div>
            <span className="text-sm font-semibold text-gray-700">GreenPulse</span>
            <span className="text-xs text-gray-400 ml-2">© 2026 GreenPulse Inc.</span>
          </div>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <Link to="/contact" className="hover:text-gray-900">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AIInsights;
