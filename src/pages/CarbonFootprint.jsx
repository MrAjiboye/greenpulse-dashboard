import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import NavBar from '../components/NavBar';
import { carbonAPI } from '../services/api';
import useScrollReveal from '../hooks/useScrollReveal';

const FLIGHT_TCO2  = 0.255;  // tCO2 per London–NY flight
const TREE_TCO2_YR = 0.021;  // tCO2 absorbed per tree per year

function KpiCard({ label, value, unit, sub, subColor = 'text-gray-500', icon, iconBg }) {
  return (
    <div className="reveal card-hover bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <i className={`${icon} text-sm`}></i>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">
        {value !== null && value !== undefined ? Number(value).toFixed(2) : '—'}
        <span className="text-base font-medium text-gray-400 ml-1">{unit}</span>
      </p>
      {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {Number(p.value).toFixed(3)} tCO₂
        </p>
      ))}
    </div>
  );
};

export default function CarbonFootprint() {
  useScrollReveal();
  const [summary, setSummary]     = useState(null);
  const [trends, setTrends]       = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.allSettled([
      carbonAPI.getSummary(),
      carbonAPI.getTrends(12),
      carbonAPI.getBreakdown(),
    ]).then(([s, t, b]) => {
      if (s.status === 'fulfilled') setSummary(s.value);
      if (t.status === 'fulfilled') setTrends(t.value.trends ?? []);
      if (b.status === 'fulfilled') setBreakdown(b.value.breakdown ?? []);
      setLoading(false);
    });
  }, []);

  const changePct   = summary?.change_pct ?? 0;
  const changeUp    = changePct > 0;
  const flights     = summary ? Math.round(summary.net_tco2 / FLIGHT_TCO2) : 0;
  const trees       = summary ? Math.round(summary.net_tco2 / TREE_TCO2_YR) : 0;

  const energyBreakdown  = breakdown.filter(b => b.category === 'energy');
  const offsetBreakdown  = breakdown.filter(b => b.category === 'offset');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 h-32 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 h-72 animate-pulse"></div>
            <div className="bg-white rounded-2xl border border-gray-200 h-72 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Carbon Footprint</h1>
          <p className="text-gray-500 mt-1">Track your organisation's CO₂ emissions and recycling offsets</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            label="This Month"
            value={summary?.this_month_tco2}
            unit="tCO₂"
            sub={`${changeUp ? '▲' : '▼'} ${Math.abs(changePct)}% vs last month`}
            subColor={changeUp ? 'text-red-500' : 'text-emerald-600'}
            icon="fa-solid fa-calendar-day text-blue-600"
            iconBg="bg-blue-50"
          />
          <KpiCard
            label="YTD Total"
            value={summary?.ytd_tco2}
            unit="tCO₂"
            sub="Jan–present"
            icon="fa-solid fa-chart-line text-orange-600"
            iconBg="bg-orange-50"
          />
          <KpiCard
            label="Recycling Offset"
            value={summary?.recycling_offset_tco2}
            unit="tCO₂"
            sub="Saved through recycling & composting"
            subColor="text-emerald-600"
            icon="fa-solid fa-recycle text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <KpiCard
            label="Net Carbon"
            value={summary?.net_tco2}
            unit="tCO₂"
            sub="YTD emissions minus offsets"
            icon="fa-solid fa-leaf text-gray-600"
            iconBg="bg-gray-100"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Trend chart */}
          <div className="reveal lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Monthly Carbon Trend</h2>
            {trends.length === 0 ? (
              <div className="flex items-center justify-center h-52 text-gray-400 text-sm">No trend data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trends} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="offsetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit=" t" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="energy_tco2" name="Emissions" stroke="#f97316" fill="url(#energyGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="offset_tco2" name="Offset"    stroke="#10b981" fill="url(#offsetGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Equivalents card */}
          <div className="reveal stagger-2 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="font-semibold mb-1">What does this mean?</h2>
              <p className="text-emerald-100 text-sm mb-6">Your net YTD carbon footprint is equivalent to:</p>
            </div>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-plane text-white text-xl"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold">{flights.toLocaleString()}</p>
                  <p className="text-emerald-100 text-xs">London → New York flights</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-tree text-white text-xl"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold">{trees.toLocaleString()}</p>
                  <p className="text-emerald-100 text-xs">trees needed for 1 year to offset</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Emissions by zone */}
          <div className="reveal bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Emissions by Zone (YTD)</h2>
            {energyBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-44 text-gray-400 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={energyBreakdown} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit=" t" />
                  <Tooltip formatter={(v) => [`${Number(v).toFixed(3)} tCO₂`, 'Emissions']} />
                  <Bar dataKey="tco2" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Offsets by stream */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Recycling Offsets by Stream (YTD)</h2>
            {offsetBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-44 text-gray-400 text-sm">No recyclable waste data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={offsetBreakdown} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit=" t" />
                  <Tooltip formatter={(v) => [`${Number(v).toFixed(3)} tCO₂`, 'Offset']} />
                  <Bar dataKey="tco2" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
              <i className="fa-solid fa-leaf text-white text-xs"></i>
            </div>
            <span className="text-sm font-semibold text-gray-700">GreenPulse</span>
            <span className="text-xs text-gray-400 ml-2">© 2026 GreenPulse Inc.</span>
          </div>
          <p className="text-xs text-gray-400">
            Carbon intensity: 0.233 kgCO₂/kWh · Waste offset: 0.8 kgCO₂/kg recycled
          </p>
        </div>
      </div>
    </div>
  );
}
