import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { Skeleton } from '../components/Skeleton';
import { reportsAPI, dashboardAPI, wasteAPI } from '../services/api';
import { generateReport } from '../utils/generateReport';
import { useAuth } from '../context/AuthContext';

const CAT_STYLES = {
  energy:      { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'fa-bolt',      iconBg: 'bg-blue-50 text-blue-600',   label: 'Energy'     },
  waste:       { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'fa-recycle',   iconBg: 'bg-gray-100 text-gray-600',  label: 'Waste'      },
  operations:  { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'fa-gears',     iconBg: 'bg-purple-50 text-purple-600', label: 'Operations' },
  default:     { bg: 'bg-gray-50',   text: 'text-gray-700',   icon: 'fa-lightbulb', iconBg: 'bg-gray-100 text-gray-500',  label: 'Other'      },
};

const STATUS_STYLES = {
  applied:   { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Applied'   },
  dismissed: { dot: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-600 border-gray-200',         label: 'Dismissed' },
  pending:   { dot: 'bg-yellow-500',  badge: 'bg-yellow-50 text-yellow-700 border-yellow-100',    label: 'Pending'   },
};

function catStyle(cat)    { return CAT_STYLES[(cat ?? '').toLowerCase()]    ?? CAT_STYLES.default;    }
function statusStyle(s)   { return STATUS_STYLES[(s ?? '').toLowerCase()]   ?? STATUS_STYLES.pending; }

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtSavings(val) {
  if (val == null) return '—';
  if (val >= 1000) return `£${(val / 1000).toFixed(1)}k`;
  return `£${val}`;
}

const Reports = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [loading, setLoading]         = useState(true);
  const [performance, setPerformance] = useState(null);
  const [insightsLog, setInsightsLog] = useState([]);
  const [dashStats, setDashStats]     = useState(null);
  const [wasteBreakdown, setWasteBreakdown] = useState([]);
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(0);
  const [downloading, setDownloading] = useState(false);
  const PAGE_SIZE = 10;

  const fetchData = useCallback(async () => {
    const [perfRes, logRes, statsRes, wasteRes] = await Promise.allSettled([
      reportsAPI.getPerformance(6),
      reportsAPI.getInsightsLog(50, 0),
      dashboardAPI.getStats(),
      wasteAPI.getBreakdown(30),
    ]);
    if (perfRes.status === 'fulfilled')  setPerformance(perfRes.value);
    if (logRes.status === 'fulfilled')   setInsightsLog(Array.isArray(logRes.value) ? logRes.value : (logRes.value?.items ?? []));
    if (statsRes.status === 'fulfilled') setDashStats(statsRes.value);
    if (wasteRes.status === 'fulfilled') {
      const raw = wasteRes.value;
      setWasteBreakdown(Array.isArray(raw) ? raw : (raw?.breakdown ?? raw?.data ?? []));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      generateReport({ performance, insightsLog, dashStats, wasteBreakdown, user });
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const purge = (id) => { const el = document.getElementById(id); if (el && window.Plotly) { window.Plotly.purge(el); el.innerHTML = ''; } };
    if (!loading && window.Plotly) {
      purge('savingsChart');
      purge('categoryChart');
      renderCharts();
    }
    return () => { if (window.Plotly) { purge('savingsChart'); purge('categoryChart'); } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, performance]);

  const renderCharts = () => {
    try {
      const trend = performance?.savings_trend ?? [];
      if (trend.length > 0) {
        const months   = trend.map(t => t.month ?? t.period);
        const realized = trend.map(t => t.realized ?? t.realized_savings ?? 0);
        const potential = trend.map(t => t.potential ?? t.potential_savings ?? 0);

        window.Plotly.newPlot('savingsChart', [
          { x: months, y: realized,  type: 'bar',  name: 'Realized Savings',  marker: { color: '#2ecc71', opacity: 0.9 }, hovertemplate: '£%{y:,.0f}<extra></extra>' },
          { x: months, y: potential, type: 'scatter', mode: 'lines+markers', name: 'Potential', line: { color: '#9ca3af', width: 2, dash: 'dot' }, marker: { color: '#6b7280', size: 6 }, hovertemplate: 'Potential: £%{y:,.0f}<extra></extra>' },
        ], {
          font: { family: 'Inter, sans-serif', color: '#6b7280' },
          margin: { t: 20, r: 20, b: 40, l: 50 },
          showlegend: false,
          plot_bgcolor: 'rgba(0,0,0,0)', paper_bgcolor: 'rgba(0,0,0,0)',
          xaxis: { showgrid: false, zeroline: false },
          yaxis: { showgrid: true, gridcolor: '#f3f4f6', zeroline: false, tickprefix: '£' },
          bargap: 0.4
        }, { responsive: true, displayModeBar: false });
      }

      const cats = performance?.category_breakdown ?? [];
      if (cats.length > 0) {
        window.Plotly.newPlot('categoryChart', [{
          values: cats.map(c => c.percentage ?? c.value ?? 0),
          labels: cats.map(c => c.category ?? c.label ?? 'Other'),
          type: 'pie', hole: 0.65,
          marker: { colors: cats.map(c => c.color ?? '#9ca3af') },
          textinfo: 'none', hoverinfo: 'label+percent', sort: false,
        }], {
          font: { family: 'Inter, sans-serif' },
          margin: { t: 0, r: 0, b: 0, l: 0 },
          showlegend: false, paper_bgcolor: 'rgba(0,0,0,0)', height: 220,
          annotations: [{ font: { size: 12, color: '#9ca3af' }, showarrow: false, text: 'Total Impact', x: 0.5, y: 0.5 }],
        }, { responsive: true, displayModeBar: false });
      }
    } catch (e) { console.error('Chart error:', e); }
  };

  // KPIs
  const totalRealized   = performance?.total_realized_savings ?? performance?.realized_savings;
  const totalPotential  = performance?.total_potential_savings ?? performance?.potential_savings ?? performance?.pending_savings;
  const appliedCount    = performance?.insights_applied ?? performance?.applied_count;
  const _insightsSum    = (performance?.insights_applied ?? 0) + (performance?.insights_pending ?? 0);
  const totalCount      = performance?.insights_total ?? (_insightsSum > 0 ? _insightsSum : null);
  const co2Reduced      = performance?.co2e_reduced_tons ?? performance?.co2_reduced;
  const appliedPct      = appliedCount != null && totalCount ? Math.round((appliedCount / totalCount) * 100) : null;
  const cats            = performance?.category_breakdown ?? [];

  // Log table
  const filtered = insightsLog.filter(r => !search || (r.title ?? '').toLowerCase().includes(search.toLowerCase()) || (r.category ?? '').toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <NavBar />
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <Skeleton className="w-10 h-10 rounded-lg mb-4" />
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-8 w-36" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <Skeleton className="h-5 w-40 mb-4" />
              <Skeleton className="h-[320px] w-full" />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <Skeleton className="h-5 w-36 mb-4" />
              <Skeleton className="h-[220px] w-full mb-4" />
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full mb-2 rounded-lg" />)}
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Impact Reports</h1>
            <p className="text-sm text-gray-500">Track realized savings and operational improvements across your facilities.</p>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            {downloading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Generating PDF…
              </>
            ) : (
              <>
                <i className="fa-solid fa-file-pdf"></i>
                Download PDF Report
              </>
            )}
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden hover:border-emerald-300 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <i className="fa-solid fa-piggy-bank text-lg"></i>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Realized Savings</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {totalRealized != null ? `£${totalRealized.toLocaleString()}` : '—'}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden hover:border-blue-300 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <i className="fa-solid fa-chart-line text-lg"></i>
                </div>
                <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">Pending</span>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Potential Savings</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {totalPotential != null ? `£${totalPotential.toLocaleString()}` : '—'}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden hover:border-gray-300 transition-all">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  <i className="fa-solid fa-check-double text-lg"></i>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Insights Applied</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900">{appliedCount ?? '—'}</h3>
                {totalCount != null && <span className="text-sm text-gray-400">/ {totalCount} total</span>}
              </div>
              {appliedPct != null && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${appliedPct}%` }}></div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden hover:border-emerald-300 transition-all">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <i className="fa-solid fa-leaf text-lg"></i>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">CO2e Reduced</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {co2Reduced != null ? `${co2Reduced.toFixed(1)} Tons` : '—'}
              </h3>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Savings Performance</h3>
                <p className="text-xs text-gray-500">Realized vs. Potential savings over time</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> Realized
                </span>
                <span className="flex items-center text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-gray-300 mr-1"></span> Potential
                </span>
              </div>
            </div>
            {(performance?.savings_trend ?? []).length > 0 ? (
              <div id="savingsChart" className="w-full h-[320px]"></div>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <i className="fa-solid fa-chart-bar text-5xl mb-3 opacity-30"></i>
                  <p className="text-sm">No trend data available</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Impact by Category</h3>
            <p className="text-xs text-gray-500 mb-4">Distribution of savings across sectors</p>
            {cats.length > 0 ? (
              <>
                <div id="categoryChart" className="w-full h-[220px] mb-4"></div>
                <div className="space-y-2">
                  {cats.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color ?? '#9ca3af' }}></div>
                        <span className="text-sm font-medium text-gray-700">{c.category ?? c.label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{c.percentage ?? c.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <i className="fa-solid fa-chart-pie text-5xl mb-3 opacity-30"></i>
                  <p className="text-sm">No category data</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insights Log Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Applied vs Dismissed Insights</h3>
              <p className="text-sm text-gray-500">Detailed log of AI recommendation actions</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                  placeholder="Search insights..."
                  className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white w-48 transition-all outline-none" />
              </div>
            </div>
          </div>

          {insightsLog.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <i className="fa-solid fa-clipboard-check text-4xl mb-3 opacity-30"></i>
              <p className="font-medium text-gray-600">No insights actioned yet</p>
              <p className="text-sm mt-1">Apply or dismiss insights from the AI Insights page to see them here.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">
                      <th className="px-6 py-4">Insight Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Est. Savings</th>
                      <th className="px-6 py-4">Date Actioned</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {pageItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No results for "{search}"
                        </td>
                      </tr>
                    ) : pageItems.map(r => {
                      const cs = catStyle(r.category);
                      const ss = statusStyle(r.status);
                      return (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${cs.iconBg}`}>
                                <i className={`fa-solid ${cs.icon} text-xs`}></i>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{r.title ?? r.name ?? 'Untitled'}</p>
                                {r.location && <p className="text-xs text-gray-500">{r.location}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cs.bg} ${cs.text}`}>
                              {cs.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${ss.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`}></span> {ss.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">
                            {fmtSavings(r.potential_savings_monthly ?? r.savings_monthly ?? r.savings)}
                            {(r.potential_savings_monthly ?? r.savings_monthly) && <span className="text-xs text-gray-400 font-normal"> /mo</span>}
                          </td>
                          <td className="px-6 py-4 text-gray-500">{fmtDate(r.actioned_at ?? r.updated_at)}</td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => navigate(`/recommendation/${r.id}`)}
                              className="text-blue-500 hover:text-blue-700 font-medium text-xs hover:underline">
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <span className="text-xs text-gray-500">
                  Showing <strong>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> results
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                    className="px-3 py-1 border border-gray-300 rounded bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                    Previous
                  </button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                    className="px-3 py-1 border border-gray-300 rounded bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl shadow-lg p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl font-bold mb-2">Want to increase your savings?</h3>
            <p className="text-emerald-100">Explore AI-generated recommendations waiting for your review.</p>
          </div>
          <div className="relative z-10 flex-shrink-0">
            <button onClick={() => navigate('/insights')} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-bold rounded-lg shadow-md hover:bg-emerald-50 transition-colors">
              View AI Insights <i className="fa-solid fa-arrow-right"></i>
            </button>
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

export default Reports;
