import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import NavBar from '../components/NavBar';
import { mlAPI, energyAPI, carbonAPI, goalsAPI } from '../services/api';

// ── Constants ────────────────────────────────────────────────────────────────

const DAY_LABELS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const GHOST_HOURS = new Set([22, 23, 0, 1, 2, 3, 4, 5]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusColor(s) {
  return s === 'green' ? '#10b981' : s === 'amber' ? '#f59e0b' : '#ef4444';
}

function statusDotClass(s) {
  return s === 'green' ? 'bg-emerald-500' : s === 'amber' ? 'bg-amber-500' : 'bg-red-500';
}

function statusBadgeClass(s) {
  return s === 'green'
    ? 'bg-emerald-50 text-emerald-700'
    : s === 'amber'
    ? 'bg-amber-50 text-amber-700'
    : 'bg-red-50 text-red-700';
}

function heatColor(kwh, maxKwh, isGhost) {
  if (maxKwh === 0) return isGhost ? '#fef2f2' : '#f9fafb';
  const t = Math.min(kwh / maxKwh, 1);
  if (isGhost) {
    const r = Math.round(254 + (185 - 254) * t);
    const g = Math.round(242 + (28  - 242) * t);
    const b = Math.round(242 + (28  - 242) * t);
    return `rgb(${r},${g},${b})`;
  }
  const r = Math.round(240 + (22  - 240) * t);
  const g = Math.round(253 + (101 - 253) * t);
  const b = Math.round(244 + (52  - 244) * t);
  return `rgb(${r},${g},${b})`;
}

function fmt(v, dec = 1) {
  return v == null ? '—' : Number(v).toFixed(dec);
}

function fmtTs(ts) {
  const d = new Date(ts);
  return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:00`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, accent }) {
  const colors = {
    red:     'bg-red-50 text-red-600',
    amber:   'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue:    'bg-blue-50 text-blue-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[accent]}`}>
          <i className={`fa-solid ${icon} text-sm`} />
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, subtitle, children, badge }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon, message, hint }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <i className={`fa-solid ${icon} text-2xl text-gray-300 mb-2`} />
      <p className="text-sm text-gray-400">{message}</p>
      {hint && <p className="text-xs text-gray-300 mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}

// ── Chart 1: Waste Heatmap ────────────────────────────────────────────────────

function WasteHeatmap({ heatmap }) {
  if (!heatmap?.length) {
    return <EmptyState icon="fa-table-cells" message="No consumption data available" hint="Import energy readings via Data Import or connect your smart meter in Settings → Data Connections." />;
  }

  // Build lookup: day_of_week -> hour -> cell
  const lookup = {};
  let maxKwh = 0;
  for (const cell of heatmap) {
    if (!lookup[cell.day_of_week]) lookup[cell.day_of_week] = {};
    lookup[cell.day_of_week][cell.hour] = cell;
    if (cell.avg_kwh > maxKwh) maxKwh = cell.avg_kwh;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[420px]">
        {/* Day headers */}
        <div className="grid mb-1" style={{ gridTemplateColumns: '32px repeat(7, 1fr)', gap: '2px' }}>
          <div />
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-400">{d}</div>
          ))}
        </div>

        {/* Hour rows */}
        {Array.from({ length: 24 }, (_, hour) => {
          const isGhostRow = GHOST_HOURS.has(hour);
          return (
            <div
              key={hour}
              className="grid"
              style={{ gridTemplateColumns: '32px repeat(7, 1fr)', gap: '2px', marginBottom: '2px' }}
            >
              <div className="text-right text-[9px] text-gray-400 pr-1 leading-none self-center">
                {hour % 4 === 0 ? `${hour}:00` : ''}
              </div>
              {Array.from({ length: 7 }, (_, day) => {
                const cell = lookup[day]?.[hour];
                const kwh  = cell?.avg_kwh ?? 0;
                return (
                  <div
                    key={day}
                    title={cell ? `${DAY_LABELS[day]} ${hour}:00 - ${kwh.toFixed(2)} kWh${isGhostRow ? ' (ghost hour)' : ''}` : ''}
                    style={{
                      backgroundColor: heatColor(kwh, maxKwh, isGhostRow),
                      height: '11px',
                      borderRadius: '2px',
                    }}
                  />
                );
              })}
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#dc2626' }} />
            <span className="text-[10px] text-gray-400">Ghost hours (22:00–06:00)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#15803d' }} />
            <span className="text-[10px] text-gray-400">Operational hours</span>
          </div>
          <span className="text-[10px] text-gray-300 ml-auto">Darker = higher consumption</span>
        </div>
      </div>
    </div>
  );
}

// ── Chart 2: Zone Health Gauges ───────────────────────────────────────────────

function ZoneHealthGauges({ zones }) {
  if (!zones?.length) {
    return <EmptyState icon="fa-circle-nodes" message="Train the ML model to enable zone health scoring" hint="Go to Admin Panel → ML Engine, select your organisation, and click Train." />;
  }

  const gaugeData = zones.map(z => ({
    name:  z.zone.charAt(0).toUpperCase() + z.zone.slice(1),
    value: z.health_score,
    fill:  statusColor(z.status),
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart
          cx="50%" cy="100%"
          innerRadius="40%"
          outerRadius="100%"
          startAngle={180}
          endAngle={0}
          data={gaugeData}
        >
          <RadialBar
            minAngle={5}
            dataKey="value"
            background={{ fill: '#f3f4f6' }}
            cornerRadius={3}
          />
          <Tooltip formatter={v => [`${v}/100`, 'Health score']} />
        </RadialBarChart>
      </ResponsiveContainer>

      <div className="space-y-2 mt-2">
        {zones.map(z => (
          <div key={z.zone} className="flex items-start gap-2 py-2 border-t border-gray-100 first:border-0">
            <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${statusDotClass(z.status)}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-gray-800 capitalize">{z.zone}</p>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${statusBadgeClass(z.status)}`}>
                  {z.status}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 truncate">{z.recommendation}</p>
            </div>
            <span className="text-xs font-bold text-gray-700 flex-shrink-0">{z.health_score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Chart 3: Ghost Load Waterfall ─────────────────────────────────────────────

function GhostLoadWaterfall({ ghostData }) {
  if (!ghostData || ghostData.total_kwh === 0) {
    return <EmptyState icon="fa-chart-column" message="No consumption data for this period" />;
  }

  const waterfallData = [
    { category: 'Base Load',    kwh: ghostData.base_load_kwh,    fill: '#6b7280' },
    { category: 'Operational',  kwh: ghostData.operational_kwh,  fill: '#10b981' },
    { category: 'Ghost Load',   kwh: ghostData.ghost_load_kwh,   fill: '#ef4444' },
  ];

  const CustomLabel = ({ x, y, width, value }) => (
    <text x={x + width / 2} y={y - 6} fill="#6b7280" fontSize={10} textAnchor="middle">
      {value.toFixed(1)} kWh
    </text>
  );

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={waterfallData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={v => `${v.toFixed(0)} kWh`}
            width={65}
          />
          <Tooltip
            formatter={(v, name, props) => [`${v.toFixed(1)} kWh`, props.payload.category]}
          />
          <Bar dataKey="kwh" radius={[4, 4, 0, 0]} label={<CustomLabel />}>
            {waterfallData.map((entry, idx) => (
              <Cell key={idx} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {ghostData.ghost_load_kwh > 0 && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-xs font-semibold text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1.5" />
            Eliminating ghost load could save approximately{' '}
            <span className="font-extrabold">
              £{ghostData.estimated_monthly_waste_cost.toFixed(0)}/month
            </span>
          </p>
          <p className="text-[10px] text-red-500 mt-0.5">
            Based on £{ghostData.ghost_cost_per_hr.toFixed(2)}/hr during off-hours
          </p>
        </div>
      )}
    </div>
  );
}

// ── Chart 4: Predictive Forecast ──────────────────────────────────────────────

function PredictiveForecast({ forecastData, trendsData }) {
  if (!forecastData?.forecast?.length && !trendsData?.length) {
    return <EmptyState icon="fa-chart-line" message="Train the ML model to enable forecasting" hint="Go to Admin Panel → ML Engine, select your organisation, and click Train." />;
  }

  // Merge actuals and forecast into one dataset
  const actuals = (Array.isArray(trendsData) ? trendsData : []).map(t => ({
    ts:        t.timestamp ?? t.time ?? t.recorded_at,
    actual:    t.consumption_kwh ?? t.power_kw ?? null,
    projected: null,
    upper:     null,
    lower:     null,
  }));

  const projected = (forecastData?.forecast ?? []).map(f => ({
    ts:        f.timestamp,
    actual:    null,
    projected: f.predicted_kwh,
    upper:     f.upper_kwh,
    lower:     f.lower_kwh,
  }));

  const merged = [...actuals, ...projected].sort((a, b) => new Date(a.ts) - new Date(b.ts));

  // Downsample to max 120 points to keep the chart readable
  const step    = Math.max(1, Math.floor(merged.length / 120));
  const sampled = merged.filter((_, i) => i % step === 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={sampled} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="ts"
            tick={{ fontSize: 9 }}
            tickFormatter={fmtTs}
            interval={Math.floor(sampled.length / 6)}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={v => `${v.toFixed(1)}`}
            width={40}
          />
          <Tooltip
            labelFormatter={fmtTs}
            formatter={(v, name) => v != null ? [`${v.toFixed(2)} kWh`, name] : [null, name]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {/* CI band */}
          <Area dataKey="upper"     name="CI Upper" stroke="none" fill="url(#ciGrad)"     fillOpacity={1} legendType="none" connectNulls />
          <Area dataKey="lower"     name="CI Lower" stroke="none" fill="#ffffff"          fillOpacity={1} legendType="none" connectNulls />
          {/* Actual history */}
          <Area dataKey="actual"    name="Actual"   stroke="#10b981" fill="url(#actualGrad)" strokeWidth={2} dot={false} connectNulls={false} />
          {/* Dotted projection */}
          <Area dataKey="projected" name="Projected" stroke="#ef4444" fill="none" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-gray-400 mt-2 text-center">
        Solid green = actual readings  ·  Dashed red = ML forecast  ·  Shaded band = 90% confidence interval
      </p>
    </div>
  );
}

// ── Chart 5: Net Zero Ring ────────────────────────────────────────────────────

function NetZeroRing({ carbonData, goals }) {
  const carbonGoal = goals?.find(g => g.category === 'CARBON');
  const target     = carbonGoal?.target_value ?? 50;
  const emitted    = carbonData?.net_tco2   ?? 0;
  const offset     = carbonData?.recycling_offset_tco2 ?? 0;
  const remaining  = Math.max(0, target - emitted);
  const progressPct = target > 0 ? Math.min(100, Math.round((1 - emitted / target) * 100)) : 0;

  if (!carbonData) {
    return <EmptyState icon="fa-circle-half-stroke" message="No carbon data available" />;
  }

  const ringData = [
    { name: 'Emitted',   value: Math.max(0, parseFloat(emitted.toFixed(3))),   fill: '#ef4444' },
    { name: 'Offset',    value: Math.max(0, parseFloat(offset.toFixed(3))),    fill: '#10b981' },
    { name: 'Remaining', value: Math.max(0, parseFloat(remaining.toFixed(3))), fill: '#e5e7eb' },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="relative" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ringData}
              cx="50%" cy="50%"
              innerRadius="52%"
              outerRadius="78%"
              paddingAngle={2}
              dataKey="value"
            >
              {ringData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, name) => [`${v.toFixed(3)} tCO2`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xl font-extrabold text-gray-900">{progressPct}%</p>
          <p className="text-[10px] text-gray-400">of goal</p>
        </div>
      </div>

      <div className="space-y-1.5 mt-2">
        {ringData.map(d => (
          <div key={d.name} className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
            <span>{d.name}</span>
            <span className="ml-auto font-semibold text-gray-800">{d.value.toFixed(3)} tCO2</span>
          </div>
        ))}
      </div>

      {carbonGoal && (
        <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5">
          <p className="text-[10px] text-emerald-700 font-semibold">
            <i className="fa-solid fa-bullseye mr-1" />
            Goal: {target} tCO2 — {carbonGoal.title ?? 'Net zero target'}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EnergySignatures() {
  const [ghostData,    setGhostData]    = useState(null);
  const [healthData,   setHealthData]   = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [trendsData,   setTrendsData]   = useState(null);
  const [carbonData,   setCarbonData]   = useState(null);
  const [goals,        setGoals]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    Promise.allSettled([
      mlAPI.ghostLoad(30),
      mlAPI.zoneHealth(14),
      mlAPI.publicForecast(336),
      energyAPI.getTrends(168),
      carbonAPI.getSummary(),
      goalsAPI.getList(),
    ]).then(([ghost, health, forecast, trends, carbon, goalsRes]) => {
      if (ghost.status    === 'fulfilled') setGhostData(ghost.value);
      if (health.status   === 'fulfilled') setHealthData(health.value);
      if (forecast.status === 'fulfilled') setForecastData(forecast.value);
      if (trends.status   === 'fulfilled') setTrendsData(trends.value?.trends ?? trends.value ?? []);
      if (carbon.status   === 'fulfilled') setCarbonData(carbon.value);
      if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value ?? []);
      if (ghost.status === 'rejected' && health.status === 'rejected') {
        setError('Failed to load energy signature data.');
      }
      setLoading(false);
    });
  }, []);

  // KPI values
  const ghostCostPerHr      = ghostData?.ghost_cost_per_hr ?? null;
  const monthlyWasteCost    = ghostData?.estimated_monthly_waste_cost ?? null;
  const savingsPct          = ghostData?.savings_potential_pct ?? null;
  const avgHealthScore      = healthData?.zones?.length
    ? Math.round(healthData.zones.reduce((s, z) => s + z.health_score, 0) / healthData.zones.length)
    : null;
  const avgStatus = avgHealthScore == null ? null
    : avgHealthScore >= 70 ? 'green'
    : avgHealthScore >= 40 ? 'amber'
    : 'red';

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">Energy Signatures</h1>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">
                ML-powered
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Ghost load identification, zone health scoring, and predictive consumption analysis
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <i className="fa-solid fa-circle-notch fa-spin text-2xl text-emerald-500" />
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-6">
            <i className="fa-solid fa-triangle-exclamation mr-2" />
            {error}
          </div>
        )}

        {!loading && !error && ghostData?.total_kwh === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6 flex items-start gap-3">
            <i className="fa-solid fa-circle-info mt-0.5 text-amber-500" />
            <div>
              <p className="font-semibold mb-0.5">No energy data found for your organisation</p>
              <p className="text-amber-700">
                Import readings via <a href="/import" className="underline font-medium">Data Import</a> or connect your smart meter in{' '}
                <a href="/settings" className="underline font-medium">Settings → Data Connections</a>. Once data is ingested, train the ML model from the Admin Panel.
              </p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard
                label="Ghost cost / hr"
                value={ghostCostPerHr != null ? `£${fmt(ghostCostPerHr, 2)}` : '—'}
                sub="off-hours wasted burn rate"
                icon="fa-ghost"
                accent="red"
              />
              <KpiCard
                label="Monthly waste cost"
                value={monthlyWasteCost != null ? `£${fmt(monthlyWasteCost, 0)}` : '—'}
                sub="estimated from ghost load"
                icon="fa-sterling-sign"
                accent="amber"
              />
              <KpiCard
                label="Avg zone health"
                value={avgHealthScore != null ? `${avgHealthScore}/100` : '—'}
                sub={avgStatus ? `Overall ${avgStatus}` : 'Train model to score'}
                icon="fa-heart-pulse"
                accent={avgStatus === 'green' ? 'emerald' : avgStatus === 'amber' ? 'amber' : 'red'}
              />
              <KpiCard
                label="Savings potential"
                value={savingsPct != null ? `${fmt(savingsPct, 1)}%` : '—'}
                sub="of total consumption is ghost load"
                icon="fa-bolt"
                accent="emerald"
              />
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left column — wide charts */}
              <div className="lg:col-span-2 space-y-6">

                {/* Chart 1: Waste Heatmap */}
                <ChartCard
                  title="Ghost Hour Heatmap"
                  subtitle="Average consumption by hour and day — red = off-hours, hover for exact kWh"
                >
                  <WasteHeatmap heatmap={ghostData?.hourly_heatmap} />
                </ChartCard>

                {/* Chart 3: Ghost Load Waterfall */}
                <ChartCard
                  title="Energy Decomposition"
                  subtitle="Base load vs useful operations vs ghost load — last 30 days"
                >
                  <GhostLoadWaterfall ghostData={ghostData} />
                </ChartCard>

                {/* Chart 4: Predictive Forecast */}
                <ChartCard
                  title="Predictive Forecast"
                  subtitle="Actual (last 7 days) + ML projection (next 14 days)"
                  badge="ML"
                >
                  <PredictiveForecast forecastData={forecastData} trendsData={trendsData} />
                </ChartCard>

              </div>

              {/* Right column — tall cards */}
              <div className="space-y-6">

                {/* Chart 2: Zone Health Gauges */}
                <ChartCard
                  title="Zone Health Scores"
                  subtitle="Anomaly rate, variance, and trend per zone"
                  badge="ML"
                >
                  <ZoneHealthGauges zones={healthData?.zones} />
                </ChartCard>

                {/* Chart 5: Net Zero Ring */}
                <ChartCard
                  title="Net Zero Progress"
                  subtitle="Carbon emitted vs offset vs goal"
                >
                  <NetZeroRing carbonData={carbonData} goals={goals} />
                </ChartCard>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
