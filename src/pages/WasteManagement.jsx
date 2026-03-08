import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { wasteAPI } from '../services/api';

const EMPTY_FORM = { stream: 'Recycling', weight_kg: '', location: '', contamination_detected: false };

const STREAM_STYLES = {
  Recycling: { bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500',    icon: 'fa-recycle',    iconBg: 'bg-blue-500',    pct: 'text-blue-600'   },
  Compost:   { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: 'fa-apple-whole', iconBg: 'bg-emerald-500', pct: 'text-emerald-600' },
  Landfill:  { bg: 'bg-gray-50',    border: 'border-gray-100',    text: 'text-gray-700',    dot: 'bg-gray-500',    icon: 'fa-dumpster',   iconBg: 'bg-gray-500',    pct: 'text-gray-500'   },
  Hazardous: { bg: 'bg-purple-50',  border: 'border-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-500',  icon: 'fa-biohazard',  iconBg: 'bg-purple-500',  pct: 'text-purple-600' },
};
const DEFAULT_STYLE = { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', icon: 'fa-box', iconBg: 'bg-amber-500', pct: 'text-amber-600' };

const STREAM_COLORS = { Recycling: '#3b82f6', Compost: '#10b981', Landfill: '#6b7280', Hazardous: '#a855f7' };

function streamStyle(name) { return STREAM_STYLES[name] ?? DEFAULT_STYLE; }
function streamColor(name) { return STREAM_COLORS[name] ?? '#f59e0b'; }

function fmtTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const WasteManagement = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canLog = hasRole?.('manager', 'admin') ?? true;

  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState(null);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    const [bdRes, logRes, alertRes] = await Promise.allSettled([
      wasteAPI.getBreakdown(30),
      wasteAPI.getLogs(10, 0),
      wasteAPI.getContaminationAlerts(),
    ]);
    if (bdRes.status === 'fulfilled')    setBreakdown(bdRes.value);
    if (logRes.status === 'fulfilled')   setLogs(Array.isArray(logRes.value) ? logRes.value : (logRes.value?.items ?? []));
    if (alertRes.status === 'fulfilled') setAlerts(alertRes.value?.alerts ?? (Array.isArray(alertRes.value) ? alertRes.value : []));
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!compareMode) { setCompareData(null); return; }
    setCompareLoading(true);
    wasteAPI.compare('this_month', 'last_month')
      .then(setCompareData)
      .catch(() => setCompareData(null))
      .finally(() => setCompareLoading(false));
  }, [compareMode]);

  useEffect(() => {
    const purge = (id) => { const el = document.getElementById(id); if (el && window.Plotly) { window.Plotly.purge(el); el.innerHTML = ''; } };
    if (!loading && window.Plotly) { purge('wasteDonutChart'); renderChart(); }
    return () => { if (window.Plotly) purge('wasteDonutChart'); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, breakdown]);

  const renderChart = () => {
    const streams = breakdown?.streams ?? [];
    if (!streams.length) return;
    const values = streams.map(s => s.total_kg ?? s.weight_kg ?? 0);
    const labels = streams.map(s => s.stream ?? s.category ?? s.name ?? 'Other');
    try {
      window.Plotly.newPlot('wasteDonutChart', [{
        values, labels, type: 'pie', hole: 0.7,
        marker: { colors: labels.map(streamColor) },
        textinfo: 'none', hoverinfo: 'label+value+percent', sort: false,
      }], {
        font: { family: 'Inter, sans-serif' },
        margin: { t: 10, r: 10, b: 10, l: 10 },
        showlegend: false, height: 220, paper_bgcolor: 'rgba(0,0,0,0)',
      }, { responsive: true, displayModeBar: false });
    } catch (e) { console.error('Chart error:', e); }
  };

  const handleResolve = async (alertId) => {
    try {
      await wasteAPI.resolveAlert(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch {
      // silently ignore — user can retry
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await wasteAPI.createLog({
        ...logForm,
        weight_kg: parseFloat(logForm.weight_kg),
        timestamp: new Date().toISOString(),
      });
      setSubmitSuccess(true);
      setLogForm(EMPTY_FORM);
      await fetchData();
      setTimeout(() => { setShowLogModal(false); setSubmitSuccess(false); }, 1500);
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Failed to log entry');
    } finally { setSubmitting(false); }
  };

  const diversionRate = breakdown?.diversion_rate ?? breakdown?.diversion_rate_pct;
  const totalTons     = breakdown?.total_kg != null ? (breakdown.total_kg / 1000).toFixed(1) : null;
  const vsLastMonth   = breakdown?.vs_last_month_kg;
  const carbonOffset  = breakdown?.carbon_offset_mtco2e ?? breakdown?.carbon_offset;
  const openAlerts    = alerts.filter(a => !a.resolved);
  const streams       = breakdown?.streams ?? [];
  const totalKg       = breakdown?.total_kg ?? streams.reduce((s, x) => s + (x.total_kg ?? 0), 0);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <NavBar />
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-7 w-52 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <Skeleton className="h-4 w-28 mb-3" />
                <Skeleton className="h-9 w-24 mb-2" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <Skeleton className="h-5 w-48 mb-4" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-[220px] rounded-xl" />
                  <div className="col-span-2 space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                  </div>
                </div>
              </div>
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-52 w-full rounded-2xl" />
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
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-wider border border-emerald-100">Waste Tracking</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Waste Management</h1>
            <p className="text-gray-500 mt-1">Track diversion rates, contamination alerts, and collection logs.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCompareMode(m => !m)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                compareMode
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <i className="fa-solid fa-code-compare"></i>
              {compareLoading ? 'Loading…' : compareMode ? 'Comparing' : 'Compare period'}
            </button>
            {canLog && (
              <button onClick={() => setShowLogModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
                <i className="fa-solid fa-plus"></i> Log Manual Entry
              </button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-500">Diversion Rate</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">GOAL: 75%</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <h2 className="text-3xl font-bold text-gray-900">{diversionRate != null ? `${diversionRate.toFixed(1)}%` : '—'}</h2>
            </div>
            {diversionRate != null && (
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(diversionRate, 100)}%` }}></div>
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-500">Total Waste (MTD)</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <h2 className="text-3xl font-bold text-gray-900">{totalTons ?? '—'}</h2>
              {totalTons && <span className="text-sm font-medium text-gray-500">Tons</span>}
            </div>
            {vsLastMonth != null && (
              <div className="flex items-center gap-2 text-xs">
                <span className={`font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${vsLastMonth <= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                  <i className={`fa-solid ${vsLastMonth <= 0 ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                  {Math.abs(vsLastMonth / 1000).toFixed(1)} T
                </span>
                <span className="text-gray-400">vs last month</span>
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-500">Contamination Alerts</span>
              {openAlerts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">ACTION REQ</span>
              )}
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <h2 className="text-3xl font-bold text-gray-900">{openAlerts.length}</h2>
              <span className="text-sm font-medium text-gray-500">Flags</span>
            </div>
            {openAlerts.length === 0 && <p className="text-xs text-emerald-600">All clear</p>}
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-500">Carbon Offset</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <h2 className="text-3xl font-bold text-gray-900">{carbonOffset != null ? carbonOffset.toFixed(1) : '—'}</h2>
              {carbonOffset != null && <span className="text-sm font-medium text-gray-500">MTCO2e</span>}
            </div>
          </div>
        </div>

        {/* Comparison strip */}
        {compareMode && compareData && (
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl mb-6 text-sm ${
            compareData.change_pct == null ? 'bg-gray-50 text-gray-500' :
            compareData.change_pct <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
          }`}>
            {compareData.change_pct != null && (
              <i className={`fa-solid ${compareData.change_pct <= 0 ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up'}`}></i>
            )}
            {compareData.change_pct != null ? (
              <>
                <span className="font-semibold">
                  {compareData.change_pct > 0 ? '+' : ''}{compareData.change_pct}%
                </span>
                <span className="text-xs opacity-75">
                  vs {compareData.previous.label} · {Math.abs(compareData.current.total_kg - compareData.previous.total_kg).toFixed(0)} kg {compareData.change_pct > 0 ? 'more' : 'less'} waste this month
                </span>
              </>
            ) : (
              <span>No previous period data to compare</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Breakdown Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Waste Stream Breakdown</h3>
              <p className="text-sm text-gray-500 mb-6">Monthly generation by category</p>

              {streams.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <i className="fa-solid fa-chart-pie text-4xl mb-2 opacity-30"></i>
                    <p className="text-sm">No breakdown data available</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 flex flex-col items-center justify-center relative">
                    <div id="wasteDonutChart" className="h-[220px] w-full"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                      <span className="text-2xl font-bold text-gray-900">
                        {totalKg ? `${(totalKg / 1000).toFixed(1)}T` : '—'}
                      </span>
                      <span className="text-xs text-gray-500">Total</span>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex flex-col justify-center space-y-3">
                    {streams.map(s => {
                      const name = s.stream ?? s.category ?? s.name ?? 'Other';
                      const kg = s.total_kg ?? s.weight_kg ?? 0;
                      const pct = s.percentage ?? (totalKg ? Math.round((kg / totalKg) * 100) : 0);
                      const st = streamStyle(name);
                      return (
                        <div key={name} className={`flex items-center justify-between p-3 rounded-xl ${st.bg} border ${st.border}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${st.iconBg} text-white flex items-center justify-center text-lg`}>
                              <i className={`fa-solid ${st.icon}`}></i>
                            </div>
                            <h4 className="text-sm font-bold text-gray-900">{name}</h4>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{(kg / 1000).toFixed(1)} T</div>
                            <div className={`text-xs font-medium ${st.pct}`}>{pct}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Recent Collection Logs</h3>
              </div>

              {logs.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <i className="fa-solid fa-clipboard-list text-4xl mb-3 opacity-30"></i>
                  <p className="font-medium text-gray-600">No logs recorded yet</p>
                  {canLog && <p className="text-sm mt-1">Use "Log Manual Entry" to add the first entry.</p>}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-3 font-medium">Date & Time</th>
                          <th className="px-6 py-3 font-medium">Stream</th>
                          <th className="px-6 py-3 font-medium">Weight</th>
                          <th className="px-6 py-3 font-medium">Location</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {logs.map(log => {
                          const name = log.stream ?? log.category ?? 'Other';
                          const st = streamStyle(name);
                          const flagged = log.contamination_detected || log.flagged;
                          return (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-gray-900 font-medium">{fmtTime(log.timestamp ?? log.created_at)}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text} border ${st.border}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span> {name}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{log.weight_kg} kg</td>
                              <td className="px-6 py-4 text-gray-600">{log.location ?? '—'}</td>
                              <td className="px-6 py-4">
                                {flagged ? (
                                  <span className="text-red-600 font-medium text-xs flex items-center gap-1">
                                    <i className="fa-solid fa-triangle-exclamation"></i> Flagged
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 font-medium text-xs flex items-center gap-1">
                                    <i className="fa-solid fa-check-circle"></i> Completed
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                    <button className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                      View All Logs <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* AI Prompt */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-3xl group-hover:opacity-10 transition-opacity duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <i className="fa-solid fa-wand-magic-sparkles text-emerald-300"></i>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">AI Recommendation</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Reduce Contamination</h3>
                <p className="text-emerald-100 text-sm mb-4 leading-relaxed">
                  AI has identified patterns in your waste streams. View insights to reduce contamination and improve diversion rates.
                </p>
                <button onClick={() => navigate('/insights')} className="flex items-center justify-center w-full py-2.5 bg-white text-emerald-900 text-sm font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-lg">
                  View Waste Insights <i className="fa-solid fa-arrow-right ml-2 text-xs"></i>
                </button>
              </div>
            </div>

            {/* Contamination Alerts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-red-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-red-500"></i> Active Flags
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${openAlerts.length > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {openAlerts.length} OPEN
                </span>
              </div>

              {openAlerts.length === 0 ? (
                <div className="p-8 text-center">
                  <i className="fa-solid fa-circle-check text-3xl mb-2 text-emerald-400"></i>
                  <p className="text-sm text-gray-600">No active contamination flags</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {openAlerts.map(a => (
                    <div key={a.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-gray-800">{a.bin ?? a.title ?? 'Unknown bin'}</span>
                        <span className="text-[10px] text-gray-400">{timeAgo(a.created_at ?? a.detected_at)}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{a.description ?? a.details ?? 'Contamination detected.'}</p>
                      <div className="flex items-center justify-between">
                        {a.location && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">{a.location}</span>}
                        <button onClick={() => handleResolve(a.id)} className="text-[10px] font-medium text-emerald-600 hover:underline ml-auto">Resolve</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Log Entry Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Log Waste Entry</h2>
              <button onClick={() => { setShowLogModal(false); setSubmitError(''); setLogForm(EMPTY_FORM); }} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleLogSubmit} className="p-6 space-y-4">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <i className="fa-solid fa-circle-check text-5xl text-emerald-500 mb-3"></i>
                  <p className="font-bold text-gray-900">Entry logged successfully!</p>
                </div>
              ) : (
                <>
                  {submitError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{submitError}</p>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Waste Stream</label>
                    <select value={logForm.stream} onChange={e => setLogForm(f => ({...f, stream: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                      {['Recycling','Compost','Landfill','Hazardous'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input type="number" min="0" step="0.1" required value={logForm.weight_kg}
                      onChange={e => setLogForm(f => ({...f, weight_kg: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. 120" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" value={logForm.location}
                      onChange={e => setLogForm(f => ({...f, location: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. Loading Dock A" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={logForm.contamination_detected}
                      onChange={e => setLogForm(f => ({...f, contamination_detected: e.target.checked}))}
                      className="rounded accent-red-500" />
                    Contamination detected
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => { setShowLogModal(false); setSubmitError(''); setLogForm(EMPTY_FORM); }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                      {submitting ? 'Saving...' : 'Save Entry'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

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

export default WasteManagement;
