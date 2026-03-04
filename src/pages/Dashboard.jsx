import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
  PieChart, Pie, Cell, Label, Legend,
} from 'recharts';
import { dashboardAPI, insightsAPI, notificationsAPI, energyAPI } from '../services/api';
import NavBar from '../components/NavBar';
import { Skeleton } from '../components/Skeleton';

// ── Helpers ─────────────────────────────────────────────────────────────────
const streamColor = (name) => {
  const l = (name ?? '').toLowerCase();
  if (l.includes('recycl') || l.includes('compost') || l.includes('organic')) return '#10b981';
  if (l.includes('general') || l.includes('landfill') || l.includes('residual')) return '#f87171';
  return '#60a5fa';
};

const timeAgo = (dateStr) => {
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ── Custom Pie label (null-safe) ─────────────────────────────────────────────
const PieCenterLabel = ({ viewBox, totalKg }) => {
  const { cx, cy } = viewBox ?? {};
  if (!cx || !cy) return null;
  return (
    <>
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#1f2937"
        style={{ fontSize: 22, fontWeight: 700 }}>
        {`${(totalKg / 1000).toFixed(1)}T`}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#6b7280"
        style={{ fontSize: 10 }}>
        Total Waste
      </text>
    </>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats]             = useState(null);
  const [energyData, setEnergyData]   = useState(null);
  const [wasteData, setWasteData]     = useState(null);
  const [insights, setInsights]       = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [energyStats, setEnergyStats] = useState(null);
  const [wasteStats, setWasteStats]   = useState(null);
  const [zones, setZones]             = useState([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, energyResponse, wasteResponse, zoneResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentEnergy(24),
        dashboardAPI.getWasteBreakdown(30),
        energyAPI.getZones(),
      ]);

      setStats(statsData);
      setZones(zoneResponse?.zones ?? []);

      // ── Energy ──────────────────────────────────────────────────────────
      const normalizedEnergy = Array.isArray(energyResponse)
        ? { readings: energyResponse }
        : energyResponse?.readings
          ? energyResponse
          : { readings: energyResponse?.data ?? energyResponse?.energy ?? [] };
      setEnergyData(normalizedEnergy);

      if (normalizedEnergy.readings?.length) {
        const yVals   = normalizedEnergy.readings.map(r => r.consumption_kwh ?? r.kwh ?? r.value ?? r.energy_kwh ?? 0);
        const avg     = yVals.reduce((a, b) => a + b, 0) / yVals.length;
        const peak    = Math.max(...yVals);
        const peakIdx = yVals.indexOf(peak);
        const peakTs  = normalizedEnergy.readings[peakIdx]?.timestamp ?? normalizedEnergy.readings[peakIdx]?.time;
        const peakTime = peakTs ? new Date(peakTs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
        const n       = Math.max(1, Math.min(6, Math.floor(yVals.length / 4)));
        const oldAvg  = yVals.slice(0, n).reduce((a, b) => a + b, 0) / n;
        const newAvg  = yVals.slice(-n).reduce((a, b) => a + b, 0) / n;
        const trendPct = oldAvg > 0 ? Math.round(((newAvg - oldAvg) / oldAvg) * 100) : 0;
        setEnergyStats({ peak: peak.toFixed(0), peakTime, avg: avg.toFixed(0), trendPct });
      }

      // ── Waste ────────────────────────────────────────────────────────────
      const normalizedWaste = Array.isArray(wasteResponse)
        ? { breakdown: wasteResponse }
        : wasteResponse?.breakdown
          ? wasteResponse
          : { breakdown: wasteResponse?.data ?? wasteResponse?.waste ?? [] };
      setWasteData(normalizedWaste);

      if (normalizedWaste.breakdown?.length) {
        const bd       = normalizedWaste.breakdown;
        const totalKg  = bd.reduce((s, b) => s + (parseFloat(b.weight_kg ?? b.weight ?? b.amount_kg ?? 0) || 0), 0);
        const landfillKg = bd
          .filter(b => { const n = (b.stream ?? b.category ?? b.type ?? b.name ?? '').toLowerCase(); return n.includes('general') || n.includes('landfill') || n.includes('residual'); })
          .reduce((s, b) => s + (parseFloat(b.weight_kg ?? b.weight ?? b.amount_kg ?? 0) || 0), 0);
        setWasteStats({
          diversionRate: totalKg > 0 ? Math.round(((totalKg - landfillKg) / totalKg) * 100) : 0,
          totalTons: (totalKg / 1000).toFixed(1),
        });
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }

    // non-critical secondary fetches
    try {
      const insightsData = await insightsAPI.getList('pending');
      const list = Array.isArray(insightsData) ? insightsData : (insightsData?.items ?? insightsData?.data ?? []);
      setInsights(list.slice(0, 3));
    } catch { /* non-critical */ }

    try {
      const notifData = await notificationsAPI.getList();
      setRecentAlerts((notifData?.items ?? []).filter(n => n.type === 'alert' || n.type === 'warning').slice(0, 3));
    } catch { /* non-critical */ }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <NavBar />
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8"><Skeleton className="h-7 w-52 mb-2" /><Skeleton className="h-4 w-80" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4"><Skeleton className="w-10 h-10 rounded-lg" /><Skeleton className="w-14 h-6 rounded-full" /></div>
                <Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <Skeleton className="h-5 w-44 mb-2" /><Skeleton className="h-3 w-24 mb-6" /><Skeleton className="h-[280px] w-full rounded-lg" />
            </div>
            <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <Skeleton className="h-5 w-36 mb-2" /><Skeleton className="h-3 w-20 mb-4" /><Skeleton className="h-[220px] w-full rounded-full mb-4" />
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg mb-2" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Derived chart data ─────────────────────────────────────────────────────
  const energyChartData = (energyData?.readings ?? []).map(r => {
    const ts = r.timestamp ?? r.time ?? r.recorded_at ?? r.date;
    return {
      time: ts ? new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
      kwh: +(r.consumption_kwh ?? r.kwh ?? r.value ?? r.energy_kwh ?? 0),
    };
  });
  const avgKwh = energyStats ? +energyStats.avg : 0;

  const wasteChartData = (wasteData?.breakdown ?? []).map(b => {
    const name = b.stream ?? b.category ?? b.type ?? b.name ?? 'Unknown';
    return {
      name,
      value: parseFloat(b.weight_kg ?? b.weight ?? b.amount_kg ?? b.amount ?? 0) || 0,
      color: streamColor(name),
    };
  });
  const totalWasteKg = wasteChartData.reduce((s, d) => s + d.value, 0);

  const diversionColor = !wasteStats ? ''
    : wasteStats.diversionRate >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
    : wasteStats.diversionRate >= 50 ? 'bg-amber-50 text-amber-700 border-amber-100'
    : 'bg-red-50 text-red-700 border-red-100';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h1>
          <p className="text-gray-500">Your energy, costs and waste — updated live</p>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Current Usage',
              value: `${stats?.current_energy_kwh?.toFixed(0) ?? 0} kWh`,
              subtext: stats?.current_energy_kwh ? `≈ £${(stats.current_energy_kwh * 0.28).toFixed(2)} this hour` : null,
              icon: 'fa-bolt', color: 'blue', badge: 'Live',
            },
            { label: 'Total Savings', value: `£${stats?.total_savings?.toLocaleString() ?? 0}`, subtext: 'vs unoptimised baseline', icon: 'fa-piggy-bank', color: 'emerald', badge: '↑ 12%' },
            { label: 'Actions Taken', value: stats?.insights_applied ?? 0, subtext: 'recommendations applied', icon: 'fa-lightbulb', color: 'purple', badge: null },
            { label: 'CO₂ Saved', value: `${stats?.carbon_reduced_tons?.toFixed(1) ?? 0} T`, subtext: 'tonnes avoided this period', icon: 'fa-leaf', color: 'green', badge: null },
          ].map(({ label, value, subtext, icon, color, badge }) => (
            <div key={label} className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden hover:border-${color}-300 transition-all`}>
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-50 rounded-bl-full -mr-4 -mt-4`} />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center text-${color}-600`}>
                    <i className={`fa-solid ${icon} text-lg`}></i>
                  </div>
                  {badge && (
                    <span className={`text-xs font-bold text-${color}-600 bg-${color}-50 px-2 py-1 rounded-full border border-${color}-100`}>{badge}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

          {/* Energy Chart */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Energy Consumption</h3>
                <p className="text-xs text-gray-400 mt-0.5">Last 24 hours · UK rate ≈ £0.28/kWh</p>
              </div>
              {energyStats && (
                <div className="flex flex-wrap gap-2 justify-end">
                  {energyStats.peakTime && (
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-full">
                      ⚡ Peak {energyStats.peak} kWh · ≈ £{(+energyStats.peak * 0.28).toFixed(2)} at {energyStats.peakTime}
                    </span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                    energyStats.trendPct < -2 ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : energyStats.trendPct > 2 ? 'bg-red-50 text-red-700 border-red-100'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {energyStats.trendPct < -2 ? `↓ ${Math.abs(energyStats.trendPct)}% trending down`
                     : energyStats.trendPct > 2 ? `↑ ${energyStats.trendPct}% trending up`
                     : '→ Stable'}
                  </span>
                </div>
              )}
            </div>

            {energyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={energyChartData} margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} unit=" kWh" width={55} />
                  <Tooltip
                    formatter={(v) => [`${v} kWh  ·  ≈ £${(v * 0.28).toFixed(2)}`, 'Usage']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  {avgKwh > 0 && (
                    <ReferenceLine y={avgKwh} stroke="#f59e0b" strokeDasharray="5 4" strokeWidth={1.5} />
                  )}
                  <Area type="monotone" dataKey="kwh" stroke="#10b981" strokeWidth={2.5} fill="url(#energyGrad)" dot={false} name="Usage" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: 280 }}>
                <i className="fa-solid fa-chart-line text-gray-200 text-4xl mb-3"></i>
                <p className="text-sm font-medium text-gray-400">No energy readings yet</p>
                <p className="text-xs text-gray-400 mt-1">Connect your smart meter to start tracking</p>
              </div>
            )}
            {avgKwh > 0 && (
              <p className="text-xs text-gray-400 mt-2 italic">
                · Dashed line = your 24 h average ({energyStats.avg} kWh · ≈ £{(+energyStats.avg * 0.28).toFixed(2)})
              </p>
            )}
          </div>

          {/* Waste Breakdown */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-bold text-gray-900">Waste Breakdown</h3>
              {wasteStats && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full border whitespace-nowrap ${diversionColor}`}>
                  {wasteStats.diversionRate}% recycled / composted
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-4">Last 30 days</p>

            {wasteChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={wasteChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="52%"
                      outerRadius="78%"
                      dataKey="value"
                      stroke="white"
                      strokeWidth={2}
                    >
                      {wasteChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                      <Label content={({ viewBox }) => <PieCenterLabel viewBox={viewBox} totalKg={totalWasteKg} />} />
                    </Pie>
                    <Tooltip
                      formatter={(v, name) => [`${v.toFixed(1)} kg`, name]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-2 mt-2">
                  {wasteChartData.map((item, idx) => {
                    const pct = totalWasteKg > 0 ? Math.round((item.value / totalWasteKg) * 100) : 0;
                    const l   = item.name.toLowerCase();
                    const iconClass = l.includes('recycl') ? 'fa-recycle' : l.includes('organic') || l.includes('compost') ? 'fa-seedling' : 'fa-trash';
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded flex items-center justify-center text-white text-sm" style={{ background: item.color }}>
                            <i className={`fa-solid ${iconClass}`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.value.toFixed(1)} kg</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <i className="fa-solid fa-trash-can text-gray-200 text-4xl mb-3"></i>
                <p className="text-sm font-medium text-gray-400">No waste data yet</p>
                <p className="text-xs text-gray-400 mt-1">Log waste entries to see the breakdown</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Equipment Status + AI Recommendations ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

          {/* Equipment / Zone Status */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Equipment Status</h3>
              <button onClick={() => navigate('/energy')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Equipment / Zone', 'Status', 'Usage'].map(h => (
                      <th key={h} className={`text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 ${h === 'Load' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {zones.length === 0 ? (
                    <tr><td colSpan={3} className="py-6 text-center text-sm text-gray-400">No zone data available</td></tr>
                  ) : (() => {
                    const maxKwh = Math.max(...zones.map(z => z.consumption_kwh), 1);
                    const avgZ   = zones.reduce((s, z) => s + z.consumption_kwh, 0) / zones.length;
                    return zones.map(z => {
                      const warn = z.consumption_kwh > avgZ * 1.25;
                      const load = Math.round((z.consumption_kwh / maxKwh) * 100);
                      return (
                        <tr key={z.zone} className="hover:bg-gray-50">
                          <td className="py-3 text-sm font-medium text-gray-900">{z.zone}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${warn ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${warn ? 'bg-yellow-500' : 'bg-emerald-500'}`}></span>
                              {warn ? 'Above Average' : 'Normal'}
                            </span>
                          </td>
                          <td className="py-3 text-sm font-medium text-gray-900 text-right">{load}%</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Cost-Saving Ideas</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Your latest opportunities</h3>
              <p className="text-emerald-100 text-sm mb-6">
                {insights.length > 0
                  ? `${insights.length} cost-saving idea${insights.length > 1 ? 's' : ''} ready to review`
                  : "You're all caught up — no new suggestions right now."}
              </p>
              {insights.length > 0 && (
                <div className="space-y-3 mb-6">
                  {insights.slice(0, 2).map(insight => (
                    <div key={insight.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p className="text-sm font-medium mb-1">{insight.title}</p>
                      <p className="text-xs text-emerald-100">Est. savings: £{insight.estimated_savings?.toLocaleString() ?? '0'}/mo</p>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => navigate('/insights')}
                className="w-full bg-white text-emerald-700 font-bold py-3 px-4 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
              >
                See All Ideas <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* ── Recent Alerts ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Alerts</h3>
            <button onClick={() => navigate('/notifications')} className="text-sm text-gray-500 hover:text-gray-900">View All</button>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <i className="fa-solid fa-circle-check text-2xl text-emerald-400 mb-2 block"></i>
              <p className="text-sm">No active alerts — all systems normal</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map(alert => {
                const isAlert = alert.type === 'alert';
                return (
                  <div key={alert.id} className={`flex items-start gap-4 p-4 rounded-lg border ${isAlert ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isAlert ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      <i className={`fa-solid ${isAlert ? 'fa-triangle-exclamation' : 'fa-circle-exclamation'}`}></i>
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(alert.created_at)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
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
            <a href="#" className="hover:text-gray-900">Help Center</a>
            <a href="#" className="hover:text-gray-900">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
