import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { Skeleton } from '../components/Skeleton';
import { energyAPI } from '../services/api';
import useScrollReveal from '../hooks/useScrollReveal';

const severityConfig = {
  high:   { bg: 'bg-red-50',    border: 'border-red-100',    text: 'text-red-500',    badge: 'bg-red-50 text-red-600 border border-red-100',     label: 'Needs attention now',  icon: 'fa-arrow-trend-up' },
  medium: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-500', badge: 'bg-orange-50 text-orange-600 border border-orange-100', label: 'Worth investigating',  icon: 'fa-plug-circle-exclamation' },
  low:    { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-500', badge: 'bg-yellow-50 text-yellow-600 border border-yellow-100', label: 'Minor irregularity',   icon: 'fa-circle-info' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

const EnergyMonitor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  useScrollReveal(undefined, undefined, !loading);
  const [current, setCurrent] = useState(null);
  const [trends, setTrends] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [zones, setZones] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [cur, trendData, anomalyData, zoneData] = await Promise.allSettled([
        energyAPI.getCurrent(),
        energyAPI.getTrends(24),
        energyAPI.getAnomalies(),
        energyAPI.getZones(),
      ]);
      if (cur.status === 'fulfilled') setCurrent(cur.value);
      if (trendData.status === 'fulfilled') setTrends(trendData.value?.trends ?? []);
      if (anomalyData.status === 'fulfilled') setAnomalies(anomalyData.value?.anomalies ?? []);
      if (zoneData.status === 'fulfilled') setZones(zoneData.value?.zones ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!compareMode) { setCompareData(null); return; }
    setCompareLoading(true);
    energyAPI.compare('this_month', 'last_month')
      .then(setCompareData)
      .catch(() => setCompareData(null))
      .finally(() => setCompareLoading(false));
  }, [compareMode]);

  useEffect(() => {
    const purge = (id) => { const el = document.getElementById(id); if (el && window.Plotly) { window.Plotly.purge(el); el.innerHTML = ''; } };
    if (!loading && trends.length > 0 && window.Plotly) {
      purge('energyTrendChart');
      renderChart();
    }
    return () => { if (window.Plotly) purge('energyTrendChart'); };
  }, [loading, trends, compareData, compareMode]);

  const renderChart = () => {
    try {
      const labels = trends.map(t => {
        const d = new Date(t.timestamp || t.time || t.recorded_at);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      });
      const usageData = trends.map(t => t.consumption_kwh ?? t.power_kw ?? t.value ?? 0);
      const costData = usageData.map(v => (v * 0.28).toFixed(2));
      const baselineData = trends.map(t => t.baseline_kw ?? t.baseline ?? null).filter(Boolean);

      const maxUsage = Math.max(...usageData);
      const peakIndex = usageData.indexOf(maxUsage);
      const threshold = current?.peak_limit_kw ?? 500;

      const traces = [
        {
          x: labels, y: usageData, customdata: costData, type: 'scatter', mode: 'lines',
          name: 'Your Usage', fill: 'tozeroy', fillcolor: 'rgba(52,152,219,0.1)',
          line: { color: '#3498db', width: 3, shape: 'spline' },
          hovertemplate: '<b>%{x}</b><br>Usage: %{y} kWh · ≈ £%{customdata}<extra></extra>'
        },
        {
          x: labels, y: Array(labels.length).fill(threshold), type: 'scatter',
          mode: 'lines', name: 'Your Limit',
          line: { color: '#ef4444', width: 1, dash: 'dot' }, hoverinfo: 'none'
        },
      ];

      if (baselineData.length === labels.length) {
        traces.splice(1, 0, {
          x: labels, y: baselineData, type: 'scatter', mode: 'lines',
          name: 'Baseline', line: { color: '#9ca3af', width: 2, dash: 'dash' },
          hovertemplate: '<b>%{x}</b><br>Baseline: %{y} kW<extra></extra>'
        });
      }

      if (compareMode && compareData?.previous) {
        const prevAvgHourly = (compareData.previous.avg_daily_kwh ?? 0) / 24;
        traces.push({
          x: labels, y: Array(labels.length).fill(parseFloat(prevAvgHourly.toFixed(1))),
          type: 'scatter', mode: 'lines',
          name: compareData.previous.label ?? 'Previous',
          line: { color: '#f59e0b', width: 2, dash: 'dash' },
          hovertemplate: `<b>%{x}</b><br>${compareData.previous.label ?? 'Prev'} avg: %{y} kWh<extra></extra>`
        });
      }

      const annotations = peakIndex >= 0 ? [{
        x: labels[peakIndex], y: maxUsage, xref: 'x', yref: 'y',
        text: `Peak: ${maxUsage} kWh`, showarrow: true, arrowhead: 2,
        ax: 0, ay: -40, bgcolor: '#fff7ed', bordercolor: '#fdba74',
        borderwidth: 1, borderpad: 4,
        font: { size: 11, color: '#c2410c' }, arrowcolor: '#fdba74'
      }] : [];

      window.Plotly.newPlot('energyTrendChart', traces, {
        font: { family: 'Inter, sans-serif' },
        margin: { t: compareMode ? 40 : 20, r: 20, b: 40, l: 50 },
        showlegend: compareMode,
        legend: { orientation: 'h', y: 1.1, x: 0 },
        plot_bgcolor: 'rgba(0,0,0,0)', paper_bgcolor: 'rgba(0,0,0,0)',
        hovermode: 'x unified',
        xaxis: { showgrid: false, color: '#6b7280', tickfont: { size: 12 } },
        yaxis: { title: 'Power (kW)', showgrid: true, gridcolor: '#f3f4f6', color: '#6b7280', zeroline: false, tickfont: { size: 12 } },
        annotations,
      }, { responsive: true, displayModeBar: false });
    } catch (e) {
      console.error('Chart generation failed:', e);
    }
  };

  const currentLoad = current?.current_load_kw ?? current?.power_kw;
  const peakDemand  = current?.peak_demand_kw ?? current?.peak_kw;
  const projectedCost = current?.projected_cost_monthly ?? current?.projected_cost;
  const peakLimit   = current?.peak_limit_kw ?? 500;
  const peakPct     = peakDemand != null ? Math.round((peakDemand / peakLimit) * 100) : null;
  const peakTime    = current?.peak_time;
  const baselineDelta = current?.baseline_deviation_pct ?? current?.vs_baseline_pct;

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <NavBar />
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
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
                <Skeleton className="h-5 w-52 mb-6" />
                <Skeleton className="h-[400px] w-full" />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <Skeleton className="h-5 w-40 mb-4" />
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-4 mb-4">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-72 w-full rounded-2xl" />
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
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase tracking-wider border border-blue-100">Live Monitor</span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {current ? 'System Status: Optimal' : 'Connecting...'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Energy Monitor</h1>
            <p className="text-gray-500 mt-1">Live view of how much energy your facility is using and where.</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="reveal stagger-1 card-hover bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-500">Current Usage</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">LIVE</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <h2 className="text-3xl font-bold text-gray-900">{currentLoad ?? '—'}</h2>
              {currentLoad != null && <span className="text-sm font-medium text-gray-500">kW</span>}
            </div>
            <div className="flex items-center gap-2 text-xs">
              {baselineDelta != null ? (
                <>
                  <span className={`font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${baselineDelta <= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                    <i className={`fa-solid ${baselineDelta <= 0 ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                    {Math.abs(baselineDelta)}%
                  </span>
                  <span className="text-gray-400">vs your usual</span>
                </>
              ) : <span className="text-gray-400">No baseline data</span>}
            </div>
            {currentLoad != null && (
              <p className="text-xs text-gray-400 mt-1">≈ £{(currentLoad * 0.28).toFixed(2)} per hour at this rate</p>
            )}
          </div>

          <div className="reveal stagger-2 card-hover bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-500">Today's Highest Usage</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <h2 className="text-3xl font-bold text-gray-900">{peakDemand ?? '—'}</h2>
              {peakDemand != null && <span className="text-sm font-medium text-gray-500">kW</span>}
            </div>
            <div className="flex items-center gap-2 text-xs">
              {peakTime && <span className="text-gray-400">At {peakTime}</span>}
              {peakPct != null && (
                <span className={`font-semibold px-1.5 py-0.5 rounded ${peakPct >= 90 ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50'}`}>
                  {peakPct}% of your limit
                </span>
              )}
            </div>
            {peakDemand != null && (
              <p className="text-xs text-gray-400 mt-1">≈ £{(peakDemand * 0.28).toFixed(2)} at this peak</p>
            )}
          </div>

          <div className="reveal stagger-3 card-hover bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-500">Estimated Cost / hr</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <h2 className="text-3xl font-bold text-gray-900">
                {currentLoad != null ? `£${(currentLoad * 0.28).toFixed(2)}` : '—'}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">at £0.28/kWh · UK average rate</span>
            </div>
          </div>

          <div className="reveal stagger-4 card-hover bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-500">Projected Bill</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200">THIS MONTH</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <h2 className="text-3xl font-bold text-gray-900">
                {projectedCost != null ? `£${(projectedCost / 1000).toFixed(1)}k` : '—'}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {current?.estimated_savings != null ? (
                <>
                  <span className="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <i className="fa-solid fa-arrow-down"></i> £{current.estimated_savings.toLocaleString()}
                  </span>
                  <span className="text-gray-400">you could save</span>
                </>
              ) : <span className="text-gray-400">No savings data yet</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Trend Chart */}
            <div className="reveal bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    Your Usage: Last 24 Hours
                    <i className="fa-regular fa-circle-question text-gray-400 text-sm" title="Shows hourly consumption vs baseline"></i>
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span> Your Usage
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-3 h-3 rounded-full bg-red-400 opacity-50"></span> Your Limit
                    </div>
                    {compareMode && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-full bg-amber-400"></span> Previous period avg
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setCompareMode(m => !m)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                    compareMode
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <i className="fa-solid fa-code-compare"></i>
                  {compareLoading ? 'Loading…' : compareMode ? 'Comparing' : 'Compare period'}
                </button>
              </div>

              {/* Comparison summary strip */}
              {compareMode && compareData && (
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 text-sm ${
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
                        vs {compareData.previous.label} · {Math.abs(compareData.current.total_kwh - compareData.previous.total_kwh).toFixed(0)} kWh {compareData.change_pct > 0 ? 'more' : 'less'} this month
                      </span>
                    </>
                  ) : (
                    <span>No previous period data to compare</span>
                  )}
                </div>
              )}
              {trends.length > 0 ? (
                <div id="energyTrendChart" className="h-[400px] w-full"></div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <i className="fa-solid fa-chart-line text-4xl mb-3 opacity-30"></i>
                    <p className="text-sm">No trend data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Anomalies */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  <h3 className="text-lg font-bold text-gray-900">Unusual Energy Spikes</h3>
                  {anomalies.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-100">{anomalies.length}</span>
                  )}
                </div>
              </div>

              {anomalies.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <i className="fa-solid fa-circle-check text-4xl mb-3 text-emerald-400"></i>
                  <p className="font-medium text-gray-600">No anomalies detected</p>
                  <p className="text-sm mt-1">All energy systems are running normally.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {anomalies.map((a) => {
                    const sev = severityConfig[a.severity?.toLowerCase()] ?? severityConfig.medium;
                    return (
                      <div key={a.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4 group cursor-pointer">
                        <div className={`mt-1 w-10 h-10 rounded-full ${sev.bg} flex items-center justify-center ${sev.text} shrink-0 border ${sev.border} group-hover:opacity-80 transition-colors`}>
                          <i className={`fa-solid ${sev.icon}`}></i>
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-gray-900">{a.title ?? a.description ?? 'Anomaly detected'}</h4>
                            <span className="text-xs text-gray-400 shrink-0 ml-2">{timeAgo(a.detected_at ?? a.created_at)}</span>
                          </div>
                          {a.details && <p className="text-sm text-gray-600 mt-1">{a.details}</p>}
                          <div className="mt-2 flex items-center gap-3">
                            {a.zone && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                <i className="fa-solid fa-building"></i> {a.zone}
                              </span>
                            )}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${sev.badge}`}>
                              {sev.label}
                            </span>
                          </div>
                        </div>
                        <button className="self-center px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors shrink-0">
                          View Details
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {anomalies.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                  <button className="text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 w-full">
                    View All Anomalies <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* AI Prompt Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full filter blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    Recommended
                  </span>
                  <i className="fa-solid fa-wand-magic-sparkles text-emerald-400"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Energy Optimisation</h3>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  Based on your current usage patterns, our AI has identified actionable insights specifically for energy reduction.
                </p>
                <button onClick={() => navigate('/insights')} className="block w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-center rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  See Saving Ideas
                </button>
              </div>
            </div>

            {/* Zone Status — live from /energy/zones */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Zone Status</h3>
              {zones.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No zone data available</p>
              ) : (
                <div className="space-y-3">
                  {zones.map(z => {
                    const name = z.zone ?? '';
                    const kwh = z.consumption_kwh ?? 0;
                    const avg = zones.reduce((s, z) => s + (z.consumption_kwh ?? 0), 0) / zones.length;
                    const warn = kwh > avg * 1.25;
                    const lower = name.toLowerCase();
                    const icon = lower.includes('hvac') || lower.includes('air') ? 'fa-fan'
                      : lower.includes('production') || lower.includes('floor') ? 'fa-industry'
                      : lower.includes('server') || lower.includes('data') ? 'fa-server'
                      : 'fa-building';
                    return (
                      <div key={name} className={`flex items-center justify-between p-3 rounded-xl border ${warn ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center ${warn ? 'text-orange-500' : 'text-gray-500'}`}>
                            <i className={`fa-solid ${icon}`}></i>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{name}</h4>
                            <span className={`text-[10px] ${warn ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                              {kwh.toFixed(0)} kWh{warn ? ', above average' : ''}
                            </span>
                          </div>
                        </div>
                        <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${warn ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      </div>
                    );
                  })}
                </div>
              )}
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

export default EnergyMonitor;
